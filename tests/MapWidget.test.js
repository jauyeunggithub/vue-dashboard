import { mount } from "@vue/test-utils";
import MapWidget from "../src/components/MapWidget.vue";

vi.mock("leaflet", async () => {
  const L = {
    map: vi.fn(() => ({
      setView: vi.fn().mockReturnThis(),
      addLayer: vi.fn(),
    })),
    tileLayer: vi.fn(() => ({
      addTo: vi.fn(),
    })),
    marker: vi.fn(() => ({
      addTo: vi.fn().mockReturnThis(),
      bindPopup: vi.fn().mockReturnThis(),
    })),
  };
  return { default: L };
});

describe("MapWidget.vue", () => {
  it("renders the map container", () => {
    const wrapper = mount(MapWidget);
    const mapDiv = wrapper.find("#map");
    expect(mapDiv.exists()).toBe(true);
  });

  it("initializes Leaflet map on mount", async () => {
    const { default: L } = await import("leaflet");

    mount(MapWidget);

    expect(L.map).toHaveBeenCalled();
    expect(L.tileLayer).toHaveBeenCalled();
    expect(L.marker).toHaveBeenCalledWith([51.505, -0.09]);
  });
});
