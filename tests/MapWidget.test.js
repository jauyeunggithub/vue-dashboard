// tests/MapWidget.test.js
import { mount } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { nextTick } from "vue"; // <--- ADD THIS IMPORT

// --- Mocks defined directly in the test file ---

vi.stubEnv("VITE_IPINFO_TOKEN", "test_token");

// 2. Define Leaflet mock objects
const mockMap = {
  setView: vi.fn().mockReturnThis(),
  addLayer: vi.fn().mockReturnThis(),
  remove: vi.fn().mockReturnThis(),
  invalidateSize: vi.fn().mockReturnThis(),
};

const mockTileLayer = {
  addTo: vi.fn().mockReturnThis(),
};

const mockMarker = {
  addTo: vi.fn().mockReturnThis(),
  bindPopup: vi.fn().mockReturnThis(),
  openPopup: vi.fn().mockReturnThis(),
};

// 3. Mock the 'leaflet' module
vi.mock("leaflet", () => {
  const mockedL = {
    map: vi.fn(() => mockMap),
    tileLayer: vi.fn(() => mockTileLayer),
    marker: vi.fn(() => mockMarker),

    Icon: {
      Default: {
        imagePath: "",
        mergeOptions: vi.fn(),
        call: vi.fn(),
        prototype: {
          options: {},
          _getIconUrl: vi.fn(() => ""),
        },
      },
      Icon: vi.fn(() => ({ options: {}, _getIconUrl: vi.fn(() => "") })),
    },
    latLng: vi.fn((lat, lng) => ({ lat, lng })),
  };

  return {
    default: mockedL,
  };
});

// 4. Mock the global fetch function
const mockFetch = vi.fn();
global.fetch = mockFetch;

// --- Now import the component (after all global mocks are set up) ---
import MapComponent from "../src/components/MapWidget.vue";
import L from "leaflet";

// --- Begin Tests ---
describe("MapComponent", () => {
  // Use fake timers to control asynchronous operations like setTimeout and Promises
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers(); // Restore real timers after each test
  });

  // Helper to advance timers and flush Vue's nextTick
  async function advanceTimersAndNextTick() {
    vi.runAllTimers(); // Run all pending timers (including promise resolutions)
    await nextTick(); // Flush Vue's DOM updates (now 'nextTick' is defined)
  }

  it("renders the map container div", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ loc: "0,0" }),
    });

    const wrapper = mount(MapComponent);
    await advanceTimersAndNextTick(); // Advance timers and nextTick

    expect(wrapper.find("#map").exists()).toBe(true);
    expect(L.map).toHaveBeenCalled();
  });

  it("initializes the Leaflet map with default view and tile layer", async () => {
    // This test now explicitly provides location data that will trigger L.marker
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          loc: "40.7128,-74.0060",
          city: "New York",
          region: "NY",
          country: "US",
        }),
    });

    const wrapper = mount(MapComponent);
    await advanceTimersAndNextTick(); // Advance timers and nextTick

    expect(L.map).toHaveBeenCalledWith(wrapper.vm.$refs.mapContainer);

    const mapInstance = L.map.mock.results[0].value;
    const tileLayerInstance = L.tileLayer.mock.results[0].value;

    expect(mapInstance.setView).toHaveBeenCalledWith([51.505, -0.09], 13);

    expect(L.tileLayer).toHaveBeenCalledWith(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution: "&copy; OpenStreetMap contributors",
      }
    );
    expect(tileLayerInstance.addTo).toHaveBeenCalledWith(mapInstance);

    // With vi.runAllTimers(), L.marker should have been called if the fetch resolved.
    expect(L.marker).toHaveBeenCalled();
  });

  it("fetches location and updates map view and marker on success", async () => {
    const mockLocationData = {
      loc: "34.0522,-118.2437",
      city: "Los Angeles",
      region: "CA",
      country: "US",
    };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockLocationData),
    });

    const wrapper = mount(MapComponent);
    await advanceTimersAndNextTick(); // Advance timers and nextTick

    expect(mockFetch).toHaveBeenCalledWith(
      "https://ipinfo.io/json?token=test_token"
    );

    expect(L.map).toHaveBeenCalledTimes(1);
    const mapInstance = L.map.mock.results[0].value;

    expect(L.marker).toHaveBeenCalledTimes(1);
    const markerInstance = L.marker.mock.results[0].value;

    expect(mapInstance.setView).toHaveBeenCalledWith([34.0522, -118.2437], 13);
    expect(L.marker).toHaveBeenCalledWith([34.0522, -118.2437]);
    expect(markerInstance.addTo).toHaveBeenCalledWith(mapInstance);
    expect(markerInstance.bindPopup).toHaveBeenCalledWith(
      `Your approximate location:<br>${mockLocationData.city}, ${mockLocationData.region}, ${mockLocationData.country}`
    );
    expect(markerInstance.openPopup).toHaveBeenCalled();
  });

  it("uses default location and marker when fetchLocation fails or returns no location", async () => {
    // Scenario 1: Fetch fails
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: () => Promise.resolve({}), // Ensure json is callable even on error
    });

    let wrapper = mount(MapComponent);
    await advanceTimersAndNextTick(); // Advance timers and nextTick

    expect(L.map).toHaveBeenCalledTimes(1);
    const mapInstance = L.map.mock.results[0].value;

    expect(L.marker).toHaveBeenCalledTimes(1);
    const markerInstance = L.marker.mock.results[0].value;

    expect(mapInstance.setView).toHaveBeenCalledWith([51.505, -0.09], 13);
    expect(L.marker).toHaveBeenCalledWith([51.505, -0.09]);
    expect(markerInstance.addTo).toHaveBeenCalledWith(mapInstance);
    expect(markerInstance.bindPopup).toHaveBeenCalledWith(
      "Default location - unable to fetch your IP info."
    );
    expect(markerInstance.openPopup).toHaveBeenCalled();

    wrapper.unmount();

    vi.clearAllMocks();
    vi.stubEnv("VITE_IPINFO_TOKEN", "test_token");

    // Scenario 2: Fetch returns no 'loc'
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ city: "Unknown" }), // No 'loc' field
    });

    wrapper = mount(MapComponent);
    await advanceTimersAndNextTick(); // Advance timers and nextTick

    expect(L.map).toHaveBeenCalledTimes(1);
    const newMapInstance = L.map.mock.results[0].value;

    expect(L.marker).toHaveBeenCalledTimes(1);
    const newMarkerInstance = L.marker.mock.results[0].value;

    expect(newMapInstance.setView).toHaveBeenCalledWith([51.505, -0.09], 13);
    expect(L.marker).toHaveBeenCalledWith([51.505, -0.09]);
    expect(newMarkerInstance.addTo).toHaveBeenCalledWith(newMapInstance);
    expect(newMarkerInstance.bindPopup).toHaveBeenCalledWith(
      "Default location - unable to fetch your IP info."
    );
    expect(newMarkerInstance.openPopup).toHaveBeenCalled();
  });

  it("handles error in fetchLocation gracefully", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    const consoleErrorSpy = vi.spyOn(console, "error");
    consoleErrorSpy.mockImplementation(() => {});

    const wrapper = mount(MapComponent);
    await advanceTimersAndNextTick(); // Advance timers and nextTick

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error fetching IP info:",
      expect.any(Error)
    );

    expect(L.map).toHaveBeenCalledTimes(1);
    const mapInstance = L.map.mock.results[0].value;

    expect(L.marker).toHaveBeenCalledTimes(1);
    const markerInstance = L.marker.mock.results[0].value;

    expect(L.marker).toHaveBeenCalledWith([51.505, -0.09]);
    expect(markerInstance.addTo).toHaveBeenCalledWith(mapInstance);
    expect(markerInstance.bindPopup).toHaveBeenCalledWith(
      "Default location - unable to fetch your IP info."
    );

    consoleErrorSpy.mockRestore();
  });
});
