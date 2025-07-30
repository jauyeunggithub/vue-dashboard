<template>
  <table class="table-widget">
    <thead>
      <tr>
        <th v-for="header in headers" :key="header">{{ header }}</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(row, idx) in rows" :key="idx">
        <td v-for="header in headers" :key="header">{{ row[header] }}</td>
      </tr>
    </tbody>
  </table>
</template>

<script setup>
const props = defineProps({
  headers: { type: Array, required: true },
  rows: { type: Array, required: true },
});
</script>

<style scoped>
.table-widget {
  width: 100%;
  border-collapse: collapse;
}
.table-widget th,
.table-widget td {
  border: 1px solid #ccc;
  padding: 8px;
}
</style>
