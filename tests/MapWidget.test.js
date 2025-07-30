import { mount } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { nextTick } from "vue";
import MapComponent from "../src/components/MapWidget.vue";
import L from "leaflet";

// Stub env token for fetch
vi.stubEnv("VITE_IPINFO_TOKEN", "test_token");

// Leaflet mocks
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

// Mock leaflet module
vi.mock("leaflet", () => ({
  default: {
    map: vi.fn(() => mockMap),
    tileLayer: vi.fn(() => mockTileLayer),
    marker: vi.fn(() => mockMarker),
    Icon: {
      Default: {
        imagePath: "",
        mergeOptions: vi.fn(),
        call: vi.fn(),
        prototype: { options: {}, _getIconUrl: vi.fn(() => "") },
      },
      Icon: vi.fn(() => ({ options: {}, _getIconUrl: vi.fn(() => "") })),
    },
    latLng: vi.fn((lat, lng) => ({ lat, lng })),
  },
}));

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("MapComponent", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    mockFetch.mockReset();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  // Helper to flush timers and Vue updates
  async function advanceTimersAndNextTick() {
    vi.runAllTimers();
    // Sometimes multiple ticks needed to fully flush async updates
    await nextTick();
    await nextTick();
  }

  it("renders the map container div", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ loc: "0,0" }),
    });

    const wrapper = mount(MapComponent);
    await advanceTimersAndNextTick();

    expect(wrapper.find("#map").exists()).toBe(true);
    expect(L.map).toHaveBeenCalled();
  });

  it("initializes the Leaflet map with default view and tile layer", async () => {
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
    await advanceTimersAndNextTick();

    expect(L.map).toHaveBeenCalledWith(wrapper.vm.$refs.mapContainer);

    const mapInstance = L.map.mock.results[0].value;
    const tileLayerInstance = L.tileLayer.mock.results[0].value;

    expect(mapInstance.setView).toHaveBeenCalledWith([51.505, -0.09], 13);
    expect(L.tileLayer).toHaveBeenCalledWith(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      { attribution: "&copy; OpenStreetMap contributors" }
    );
    expect(tileLayerInstance.addTo).toHaveBeenCalledWith(mapInstance);

    expect(L.marker).toHaveBeenCalled();
  });

  it("fetches location and updates map view and marker on success", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          loc: "34.0522,-118.2437",
          city: "Los Angeles",
          region: "CA",
          country: "US",
        }),
    });

    const wrapper = mount(MapComponent);
    await advanceTimersAndNextTick();

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
      "Your approximate location:<br>Los Angeles, CA, US"
    );
    expect(markerInstance.openPopup).toHaveBeenCalled();
  });

  it("uses default location and marker when fetchLocation fails or returns no location", async () => {
    // Fetch failure scenario
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: () => Promise.resolve({}),
    });

    let wrapper = mount(MapComponent);
    await advanceTimersAndNextTick();

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

    // Fetch returns no location scenario
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ city: "Unknown" }),
    });

    wrapper = mount(MapComponent);
    await advanceTimersAndNextTick();

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

    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const wrapper = mount(MapComponent);
    await advanceTimersAndNextTick();

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
