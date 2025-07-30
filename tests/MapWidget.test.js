import { mount } from "@vue/test-utils";
import MapWidget from "../src/components/MapWidget.vue";

describe("MapWidget", () => {
  it("renders map container", () => {
    const wrapper = mount(MapWidget);
    expect(wrapper.find("#map").exists()).toBe(true);
  });
});
