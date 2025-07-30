<template>
  <form @submit.prevent="handleSubmit">
    <label>
      Name:
      <input v-model="formData.name" type="text" required />
    </label>
    <label>
      Email:
      <input v-model="formData.email" type="email" required />
    </label>
    <button type="submit">Submit</button>
  </form>
</template>

<script setup>
import { reactive, defineEmits } from "vue";

const emit = defineEmits(["submit"]);

const formData = reactive({
  name: "",
  email: "",
});

function handleSubmit() {
  emit("submit", { ...formData });
  formData.name = "";
  formData.email = "";
}
</script>

<style scoped>
form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

label {
  display: flex;
  flex-direction: column;
}

button {
  width: 100px;
}
</style>
