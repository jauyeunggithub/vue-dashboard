import { mount } from "@vue/test-utils";
import FormWidget from "../src/components/FormWidget.vue";

describe("FormWidget", () => {
  it("emits submit event with form data", async () => {
    const wrapper = mount(FormWidget);
    const nameInput = wrapper.find('input[type="text"]');
    const emailInput = wrapper.find('input[type="email"]');

    await nameInput.setValue("John");
    await emailInput.setValue("john@example.com");
    await wrapper.find("form").trigger("submit.prevent");

    expect(wrapper.emitted()).toHaveProperty("submit");
    expect(wrapper.emitted("submit")[0][0]).toEqual({
      name: "John",
      email: "john@example.com",
    });
  });
});
