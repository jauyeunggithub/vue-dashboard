import { mount } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { nextTick } from "vue"; // Import nextTick from 'vue'

// --- Mocks defined directly in the test file ---

// 1. Mock import.meta.env for VITE_IPINFO_TOKEN using vi.stubEnv
// This is the most reliable way to mock environment variables in Vitest.
// It should be called before the component that uses the env variable is imported.
vi.stubEnv("VITE_IPINFO_TOKEN", "test_token");

// 2. Define Leaflet mock objects (these remain the same)
const mockMap = {
  setView: vi.fn().mockReturnThis(),
  addLayer: vi.fn().mockReturnThis(),
  remove: vi.fn().mockReturnThis(),
  invalidateSize: vi.fn().mockReturnThis(),
};

const mockTileLayer = {
  addTo: vi.fn(() => mockMap), // addTo returns the map instance
};

const mockMarker = {
  addTo: vi.fn(() => mockMap), // addTo returns the map instance
  bindPopup: vi.fn().mockReturnThis(),
  openPopup: vi.fn().mockReturnThis(),
};

// 3. FIX: Mock the 'leaflet' module to explicitly define L and its methods as spies.
// The key is to return an object where the 'default' property is our mocked L object,
// and that mocked L object contains our spies.
vi.mock("leaflet", () => {
  // Define the mocked L object directly.
  // This ensures map, tileLayer, marker are ALWAYS vi.fn() instances.
  const mockedL = {
    map: vi.fn(() => mockMap),
    tileLayer: vi.fn(() => mockTileLayer),
    marker: vi.fn(() => mockMarker),

    // Crucial for Leaflet's default marker icons in JSDOM:
    Icon: {
      Default: {
        imagePath: "", // Prevent it from trying to load images
        mergeOptions: vi.fn(), // If mergeOptions is called
        call: vi.fn(), // If used as a constructor (e.g., new L.Icon.Default())
        prototype: {
          // Often needed if internal methods are called on instances
          options: {},
          _getIconUrl: vi.fn(() => ""),
        },
      },
      // If L.Icon is used directly (e.g., `new L.Icon(...)`)
      Icon: vi.fn(() => ({ options: {}, _getIconUrl: vi.fn(() => "") })),
    },
    // If your component explicitly uses L.latLng:
    latLng: vi.fn((lat, lng) => ({ lat, lng })),

    // Add other Leaflet top-level properties if your component uses them,
    // otherwise, omitting them is fine if they are not directly accessed.
    // E.g., L.Control, L.Util, etc.
  };

  // Return an object where `default` is our `mockedL` object.
  // This correctly simulates `import L from 'leaflet';`
  return {
    default: mockedL,
    // If Leaflet also had named exports that your component imports (e.g., `import { Map } from 'leaflet';`),
    // you would also need to export them here, like `Map: mockedL.map` or `...mockedL` if all properties are named exports.
    // For `import L from 'leaflet'`, `default` is the primary concern.
  };
});

// 4. Mock the global fetch function
const mockFetch = vi.fn();
global.fetch = mockFetch;

// --- Now import the component (after all global mocks are set up) ---
import MapComponent from "../src/components/MapWidget.vue";
// We import L here, but it will be the mocked L object from vi.mock
import L from "leaflet";

// --- Begin Tests ---
describe("MapComponent", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();

    // Ensure mockFetch is reset for each test
    mockFetch.mockReset(); // Use mockReset to clear mock implementation and call history
  });

  it("renders the map container div", async () => {
    // Provide a default mock for fetch, as onMounted will call it
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ loc: "0,0" }), // Minimal valid response
    });

    const wrapper = mount(MapComponent);
    await nextTick(); // Wait for onMounted to complete

    expect(wrapper.find("#map").exists()).toBe(true);
    // Optionally, you can assert that map initialization happened
    expect(L.map).toHaveBeenCalled();
  });

  it("initializes the Leaflet map with default view and tile layer", async () => {
    // Mock successful fetch for initial rendering
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
    await nextTick();

    // Now L.map should unequivocally be a spy
    expect(L.map).toHaveBeenCalledWith(wrapper.vm.$refs.mapContainer);

    // L.map.mock.results[0].value should now be safely accessible
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
    await nextTick();

    expect(mockFetch).toHaveBeenCalledWith(
      "https://ipinfo.io/json?token=test_token"
    );

    const mapInstance = L.map.mock.results[0].value;
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
    });

    let wrapper = mount(MapComponent);
    await nextTick();

    const mapInstance = L.map.mock.results[0].value;
    const markerInstance = L.marker.mock.results[0].value;

    expect(mapInstance.setView).toHaveBeenCalledWith([51.505, -0.09], 13);
    expect(L.marker).toHaveBeenCalledWith([51.505, -0.09]);
    expect(markerInstance.addTo).toHaveBeenCalledWith(mapInstance);
    expect(markerInstance.bindPopup).toHaveBeenCalledWith(
      "Default location - unable to fetch your IP info."
    );
    expect(markerInstance.openPopup).toHaveBeenCalled();

    wrapper.unmount();

    vi.clearAllMocks(); // Clear mocks for the new test run

    // vi.stubEnv is global, no need to re-stub usually, but explicitly calling
    // mockFetch.mockReset() above handles potential residual mock implementations.

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ city: "Unknown" }), // No 'loc' field
    });

    wrapper = mount(MapComponent);
    await nextTick();

    const newMapInstance = L.map.mock.results[0].value;
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
    consoleErrorSpy.mockImplementation(() => {}); // Suppress actual console output

    const wrapper = mount(MapComponent);
    await nextTick();

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error fetching IP info:",
      expect.any(Error)
    );

    const mapInstance = L.map.mock.results[0].value;
    const markerInstance = L.marker.mock.results[0].value;

    expect(L.marker).toHaveBeenCalledWith([51.505, -0.09]);
    expect(markerInstance.addTo).toHaveBeenCalledWith(mapInstance);
    expect(markerInstance.bindPopup).toHaveBeenCalledWith(
      "Default location - unable to fetch your IP info."
    );

    consoleErrorSpy.mockRestore();
  });
});
