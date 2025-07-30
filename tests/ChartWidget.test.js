import { mount } from "@vue/test-utils";
import ChartWidget from "../src/components/ChartWidget.vue";

describe("ChartWidget", () => {
  it("renders chart container", () => {
    const chartData = {
      labels: ["Jan", "Feb"],
      datasets: [{ label: "Test", data: [1, 2] }],
    };
    const wrapper = mount(ChartWidget, { props: { chartData } });
    expect(wrapper.html()).toContain("canvas");
  });
});
