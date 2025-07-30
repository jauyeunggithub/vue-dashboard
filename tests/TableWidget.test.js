import { mount } from "@vue/test-utils";
import TableWidget from "../src/components/TableWidget.vue";

describe("TableWidget", () => {
  it("renders headers and rows", () => {
    const headers = ["Name", "Age"];
    const rows = [
      { Name: "Alice", Age: 24 },
      { Name: "Bob", Age: 30 },
    ];
    const wrapper = mount(TableWidget, { props: { headers, rows } });

    headers.forEach((header) => {
      expect(wrapper.html()).toContain(header);
    });
    rows.forEach((row) => {
      Object.values(row).forEach((value) => {
        expect(wrapper.html()).toContain(value.toString());
      });
    });
  });
});
