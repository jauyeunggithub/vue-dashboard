<template>
  <div class="dashboard">
    <h1>Vue 3 Dashboard</h1>
    <div class="widgets">
      <TableWidget :headers="tableHeaders" :rows="tableRows" />
      <ChartWidget :chartData="chartData" :chartOptions="chartOptions" />

      <FormWidget @submit="handleFormSubmit" />
      <MapWidget />
    </div>
  </div>
</template>

<script setup>
import TableWidget from "./components/TableWidget.vue";
import ChartWidget from "./components/ChartWidget.vue";
import FormWidget from "./components/FormWidget.vue";
import MapWidget from "./components/MapWidget.vue";
import { ref, computed } from "vue";

const tableHeaders = ["Name", "Age", "Country"];
const tableRows = [
  { Name: "John", Age: 25, Country: "USA" },
  { Name: "Anna", Age: 30, Country: "Canada" },
  { Name: "Peter", Age: 28, Country: "UK" },
];

const chartData = {
  labels: ["January", "February", "March", "April", "May"],
  datasets: [
    {
      label: "Sales",
      data: [40, 20, 12, 39, 10],
      backgroundColor: "#42b983",
    },
  ],
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
};

// This computed property is in the parent, and it correctly accesses the local chartData
const isChartDataValid = computed(() => {
  return (
    chartData &&
    Array.isArray(chartData.labels) &&
    chartData.labels.length > 0 &&
    Array.isArray(chartData.datasets) &&
    chartData.datasets.length > 0
  );
});

function handleFormSubmit(data) {
  alert(`Form submitted with: Name=${data.name}, Email=${data.email}`);
}
</script>

<style>
.dashboard {
  max-width: 1200px;
  margin: auto;
  padding: 2rem;
  font-family: Arial, sans-serif;
}

.widgets {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  justify-content: center;
}

/* Each widget gets a flex basis and max width */
.widgets > * {
  flex: 1 1 300px; /* grow, shrink, basis */
  max-width: 600px; /* optional max width */
  box-sizing: border-box;
  background: #f9f9f9;
  padding: 1rem;
  border-radius: 6px;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.1);
}
</style>
