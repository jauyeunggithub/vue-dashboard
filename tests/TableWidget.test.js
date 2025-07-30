import { mount } from "@vue/test-utils";
import TableWidget from "../src/components/TableWidget.vue";

describe("TableWidget.vue", () => {
  const headers = ["Name", "Age", "Country"];
  const rows = [
    { Name: "Alice", Age: 30, Country: "USA" },
    { Name: "Bob", Age: 25, Country: "UK" },
  ];

  it("renders a table with headers", () => {
    const wrapper = mount(TableWidget, {
      props: { headers, rows },
    });

    const ths = wrapper.findAll("thead th");
    expect(ths).toHaveLength(headers.length);
    expect(ths.map((th) => th.text())).toEqual(headers);
  });

  it("renders correct number of rows and cells", () => {
    const wrapper = mount(TableWidget, {
      props: { headers, rows },
    });

    const trs = wrapper.findAll("tbody tr");
    expect(trs).toHaveLength(rows.length);

    trs.forEach((tr, rowIndex) => {
      const cells = tr.findAll("td");
      expect(cells).toHaveLength(headers.length);
      expect(cells.map((td) => td.text())).toEqual([
        rows[rowIndex].Name.toString(),
        rows[rowIndex].Age.toString(),
        rows[rowIndex].Country.toString(),
      ]);
    });
  });

  it("renders correctly with empty rows", () => {
    const wrapper = mount(TableWidget, {
      props: { headers, rows: [] },
    });

    const trs = wrapper.findAll("tbody tr");
    expect(trs).toHaveLength(0);
  });

  it("reacts to changing props", async () => {
    const wrapper = mount(TableWidget, {
      props: { headers, rows },
    });

    await wrapper.setProps({
      rows: [{ Name: "Charlie", Age: 22, Country: "Canada" }],
    });

    const trs = wrapper.findAll("tbody tr");
    expect(trs).toHaveLength(1);
    expect(trs[0].findAll("td").map((td) => td.text())).toEqual([
      "Charlie",
      "22",
      "Canada",
    ]);
  });
});
