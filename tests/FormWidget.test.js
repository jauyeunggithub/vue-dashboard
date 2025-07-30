// tests/FormWidget.spec.js
import { mount } from "@vue/test-utils";
import FormWidget from "../src/components/FormWidget.vue";

describe("FormWidget.vue", () => {
  it("renders form inputs and submit button", () => {
    const wrapper = mount(FormWidget);

    expect(wrapper.find('input[type="text"]').exists()).toBe(true);
    expect(wrapper.find('input[type="email"]').exists()).toBe(true);
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true);
  });

  it("updates input values via v-model", async () => {
    const wrapper = mount(FormWidget);

    const nameInput = wrapper.find('input[type="text"]');
    const emailInput = wrapper.find('input[type="email"]');

    await nameInput.setValue("John Doe");
    await emailInput.setValue("john@example.com");

    expect(nameInput.element.value).toBe("John Doe");
    expect(emailInput.element.value).toBe("john@example.com");
  });

  it("emits submit event with form data on submit", async () => {
    const wrapper = mount(FormWidget);

    await wrapper.find('input[type="text"]').setValue("Alice");
    await wrapper.find('input[type="email"]').setValue("alice@example.com");
    await wrapper.find("form").trigger("submit.prevent");

    expect(wrapper.emitted().submit).toBeTruthy();
    expect(wrapper.emitted().submit[0][0]).toEqual({
      name: "Alice",
      email: "alice@example.com",
    });
  });

  it("clears the form after submit", async () => {
    const wrapper = mount(FormWidget);

    await wrapper.find('input[type="text"]').setValue("Alice");
    await wrapper.find('input[type="email"]').setValue("alice@example.com");
    await wrapper.find("form").trigger("submit.prevent");

    expect(wrapper.find('input[type="text"]').element.value).toBe("");
    expect(wrapper.find('input[type="email"]').element.value).toBe("");
  });
});
