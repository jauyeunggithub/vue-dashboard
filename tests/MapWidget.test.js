import { mount } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import MapComponent from "../src/components/MapWidget.vue"; // Adjust path as needed
import L from "leaflet"; // Import L for type checking, though it's mocked

// Mock the global fetch function
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("MapComponent", () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks(); // This clears all `vi.fn()` calls, including those on L.map, L.tileLayer, L.marker methods.

    // If you need to specifically clear the mock call history for Leaflet methods,
    // you should access the mock functions directly if they were defined globally
    // or as part of the L object in your setup file.

    // A better way to ensure Leaflet mocks are reset is to re-mock or clear the calls
    // directly on the functions that are assigned to L in your vitest.setup.js.
    // Given your setup, `vi.clearAllMocks()` should actually cover these.
    // However, if you're seeing issues, ensure the mocked `L` object's methods are being reset.

    // Based on your `vitest.setup.js`:
    // L.map, L.tileLayer, L.marker are assigned vi.fn() directly.
    // And mockMap, mockTileLayer, mockMarker methods are vi.fn().
    // So, vi.clearAllMocks() should handle clearing calls on these.

    // The error suggests that `L.map()` itself, when called to access its methods for clearing,
    // might be encountering an issue with its internal Leaflet logic (even though mocked).
    // The simplest and most robust fix is to rely on `vi.clearAllMocks()` and
    // ensure your Leaflet mock setup correctly returns the same mock instances.

    // Let's ensure the Leaflet mocks are reset by clearing the mock calls on the
    // specific methods of the mocked objects.
    // This assumes the `mockMap`, `mockTileLayer`, `mockMarker` instances are consistent.
    // Your `vitest.setup.js` correctly defines them once.
    // `vi.clearAllMocks()` *should* be sufficient if all mocks are `vi.fn()`.

    // The core issue might be that `L.map()` when called in beforeEach *itself*
    // is triggering the `_initContainer` logic inside the mocked Leaflet, which then
    // expects a valid DOM element, even though it's mocked.
    // To avoid this, we shouldn't call L.map() to clear its methods.
    // Instead, we directly clear the mock of the `setView` function that `L.map()` returns.

    // Corrected way to clear mock calls on the methods of the mocked Leaflet objects:
    L.map.mock.results[0]?.value?.setView.mockClear(); // Access the returned mockMap instance's setView
    L.tileLayer.mock.results[0]?.value?.addTo.mockClear(); // Access the returned mockTileLayer instance's addTo
    L.marker.mock.results[0]?.value?.addTo.mockClear(); // Access the returned mockMarker instance's addTo
    L.marker.mock.results[0]?.value?.bindPopup.mockClear();
    L.marker.mock.results[0]?.value?.openPopup.mockClear();
    // This is more robust as it clears the mock calls on the *actual* mock instances returned by L.map, etc.
    // The `mock.results[0]?.value` accesses the first instance returned by the top-level mock function.
  });

  it("renders the map container div", () => {
    const wrapper = mount(MapComponent);
    expect(wrapper.find("#map").exists()).toBe(true);
  });

  it("initializes the Leaflet map with default view and tile layer", async () => {
    // Mock successful fetch for initial rendering, then verify default setup
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
    await vi.nextTick(); // Wait for onMounted to run

    // Check if L.map was called with the correct element
    expect(L.map).toHaveBeenCalledWith(wrapper.vm.$refs.mapContainer);

    // Check initial setView
    // Access the mock instance returned by L.map
    const mapInstance = L.map.mock.results[0].value;
    expect(mapInstance.setView).toHaveBeenCalledWith([51.505, -0.09], 13);

    // Check if tileLayer was created and added
    expect(L.tileLayer).toHaveBeenCalledWith(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution: "&copy; OpenStreetMap contributors",
      }
    );
    // Access the mock instance returned by L.tileLayer
    const tileLayerInstance = L.tileLayer.mock.results[0].value;
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
    await vi.nextTick(); // Wait for onMounted and fetchLocation to complete

    // Expect fetch to have been called
    expect(mockFetch).toHaveBeenCalledWith(
      "https://ipinfo.io/json?token=test_token"
    );

    const mapInstance = L.map.mock.results[0].value;
    // Expect setView to be called with fetched coordinates
    expect(mapInstance.setView).toHaveBeenCalledWith([34.0522, -118.2437], 13);

    const markerInstance = L.marker.mock.results[0].value;
    // Expect marker to be added at fetched coordinates
    expect(L.marker).toHaveBeenCalledWith([34.0522, -118.2437]);
    expect(markerInstance.addTo).toHaveBeenCalledWith(mapInstance);

    // Expect popup content
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
    await vi.nextTick();

    const mapInstance = L.map.mock.results[0].value;
    const markerInstance = L.marker.mock.results[0].value;

    // Expect setView to remain at default (not called again with new coords)
    expect(mapInstance.setView).toHaveBeenCalledWith([51.505, -0.09], 13); // Called initially
    // Check that marker is at default location
    expect(L.marker).toHaveBeenCalledWith([51.505, -0.09]);
    expect(markerInstance.addTo).toHaveBeenCalledWith(mapInstance);
    expect(markerInstance.bindPopup).toHaveBeenCalledWith(
      "Default location - unable to fetch your IP info."
    );
    expect(markerInstance.openPopup).toHaveBeenCalled();

    wrapper.unmount(); // Clean up

    // Scenario 2: Fetch succeeds but loc is missing
    vi.clearAllMocks(); // Clear mocks for the new test run
    // Re-clear the specific mock methods using the correct access pattern
    L.map.mock.results[0]?.value?.setView.mockClear();
    L.tileLayer.mock.results[0]?.value?.addTo.mockClear();
    L.marker.mock.results[0]?.value?.addTo.mockClear();
    L.marker.mock.results[0]?.value?.bindPopup.mockClear();
    L.marker.mock.results[0]?.value?.openPopup.mockClear();

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ city: "Unknown" }), // No 'loc' field
    });

    wrapper = mount(MapComponent);
    await vi.nextTick();

    // Re-get the instance after remounting if necessary, or just use the cleared mocks
    const newMapInstance = L.map.mock.results[0].value;
    const newMarkerInstance = L.marker.mock.results[0].value;

    // Expect setView to remain at default
    expect(newMapInstance.setView).toHaveBeenCalledWith([51.505, -0.09], 13);
    // Check that marker is at default location
    expect(L.marker).toHaveBeenCalledWith([51.505, -0.09]);
    expect(newMarkerInstance.addTo).toHaveBeenCalledWith(newMapInstance);
    expect(newMarkerInstance.bindPopup).toHaveBeenCalledWith(
      "Default location - unable to fetch your IP info."
    );
    expect(newMarkerInstance.openPopup).toHaveBeenCalled();
  });

  it("handles error in fetchLocation gracefully", async () => {
    // Mock a network error
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    const wrapper = mount(MapComponent);
    await vi.nextTick();

    // Expect the console.error to have been called (optional, but good for debugging)
    const consoleErrorSpy = vi.spyOn(console, "error");
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error fetching IP info:",
      expect.any(Error)
    );

    // Ensure default marker is still placed
    const markerInstance = L.marker.mock.results[0].value;
    expect(L.marker).toHaveBeenCalledWith([51.505, -0.09]);
    expect(markerInstance.bindPopup).toHaveBeenCalledWith(
      "Default location - unable to fetch your IP info."
    );

    consoleErrorSpy.mockRestore(); // Clean up spy
  });
});
