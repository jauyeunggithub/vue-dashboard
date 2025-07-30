import { mount } from "@vue/test-utils";
import ChartWidget from "../src/components/ChartWidget.vue";

vi.mock("chart.js/auto", () => ({
  default: {},
}));

describe("ChartWidget.vue", () => {
  it("renders Bar chart when chartData has labels", () => {
    const chartData = {
      labels: ["Jan", "Feb"],
      datasets: [
        {
          label: "Sales",
          data: [10, 20],
          backgroundColor: "#42b983",
        },
      ],
    };

    const wrapper = mount(ChartWidget, {
      props: { chartData },
    });

    expect(wrapper.find("canvas").exists()).toBe(true);
  });

  it("does NOT render Bar chart when chartData.labels is empty", () => {
    const chartData = {
      labels: [],
      datasets: [],
    };

    const wrapper = mount(ChartWidget, {
      props: { chartData },
    });

    expect(wrapper.find("canvas").exists()).toBe(false);
  });

  it("does NOT render Bar chart when chartData is missing labels", () => {
    const chartData = {
      datasets: [],
    };

    const wrapper = mount(ChartWidget, {
      props: { chartData },
    });

    expect(wrapper.find("canvas").exists()).toBe(false);
  });
});
