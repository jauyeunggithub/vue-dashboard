<template>
  <div class="dashboard-container">
    <h1 class="dashboard-title">Vue 3 Dashboard</h1>
    <div class="widgets-grid">
      <div class="widget-card">
        <h2 class="widget-title">Data Table</h2>
        <TableWidget :headers="tableHeaders" :rows="tableRows" />
      </div>

      <div class="widget-card">
        <h2 class="widget-title">Sales Chart</h2>
        <ChartWidget :chartData="chartData" :chartOptions="chartOptions" />
      </div>

      <div class="widget-card">
        <h2 class="widget-title">Submit Form</h2>
        <FormWidget @submit="handleFormSubmit" />
      </div>

      <div class="widget-card">
        <h2 class="widget-title">Interactive Map</h2>
        <MapWidget />
      </div>
    </div>
  </div>
</template>

<script setup>
import TableWidget from "./components/TableWidget.vue";
import ChartWidget from "./components/ChartWidget.vue";
import FormWidget from "./components/FormWidget.vue";
import MapWidget from "./components/MapWidget.vue";
import { ref, onMounted } from "vue";

// Table Data
const tableHeaders = ["Name", "Age", "Country"];
const tableRows = [
  { Name: "John", Age: 25, Country: "USA" },
  { Name: "Anna", Age: 30, Country: "Canada" },
  { Name: "Peter", Age: 28, Country: "UK" },
];

const chartData = {
  labels: ["Red", "Blue", "Yellow", "Green", "Purple"],
  datasets: [
    {
      label: "Votes",
      data: [12, 19, 3, 5, 2],
      backgroundColor: ["#f87171", "#60a5fa", "#facc15", "#4ade80", "#a78bfa"],
      borderWidth: 1,
    },
  ],
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: "top",
    },
    tooltip: {
      enabled: true,
    },
  },
  animation: {
    duration: 1000,
    easing: "easeOutQuart",
  },
};

// Form Submission Handler
function handleFormSubmit(data) {
  console.log(`Form submitted with: Name=${data.name}, Email=${data.email}`);
  alert(`Form submitted with: Name=${data.name}, Email=${data.email}`);
}
</script>

<style>
body {
  font-family: Arial, sans-serif; /* Default to Arial or another common sans-serif font */
  margin: 0;
  padding: 0;
  background-color: #f3f4f6; /* bg-gray-100 */
  color: #374151; /* text-gray-800 */
}

#app {
  min-height: 100vh;
}

.dashboard-container {
  max-width: 1200px;
  margin: auto;
  padding: 1rem; /* p-4 */
}

/* Responsive padding for sm, lg screens */
@media (min-width: 640px) {
  /* sm */
  .dashboard-container {
    padding: 1.5rem; /* sm:p-6 */
  }
}

@media (min-width: 1024px) {
  /* lg */
  .dashboard-container {
    padding: 2rem; /* lg:p-8 */
  }
}

.dashboard-title {
  font-size: 2.25rem; /* text-4xl */
  font-weight: 800; /* font-extrabold */
  text-align: center;
  color: #4f46e5; /* text-indigo-700 */
  margin-bottom: 2rem; /* mb-8 */
  padding-top: 1rem; /* py-4 */
  padding-bottom: 1rem; /* py-4 */
  border-radius: 0.5rem; /* rounded-lg */
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06); /* shadow-md */
  background-color: #ffffff; /* bg-white */
}

@media (min-width: 640px) {
  /* sm */
  .dashboard-title {
    margin-bottom: 3rem; /* sm:mb-12 */
  }
}

.widgets-grid {
  display: grid;
  grid-template-columns: 1fr; /* grid-cols-1 */
  gap: 1.5rem; /* gap-6 */
}

@media (min-width: 768px) {
  /* md */
  .widgets-grid {
    grid-template-columns: repeat(2, 1fr); /* md:grid-cols-2 */
  }
}

@media (min-width: 1024px) {
  /* lg */
  .widgets-grid {
    grid-template-columns: repeat(2, 1fr); /* lg:grid-cols-2 */
  }
}

@media (min-width: 1280px) {
  /* xl */
  .widgets-grid {
    grid-template-columns: repeat(3, 1fr); /* xl:grid-cols-3 */
  }
}

.widget-card {
  background-color: #ffffff; /* bg-white */
  padding: 1.5rem; /* p-6 */
  border-radius: 0.75rem; /* rounded-xl */
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05); /* shadow-lg */
  border: 1px solid #e5e7eb; /* border border-gray-200 */
  box-sizing: border-box; /* Ensure padding and border are included in element's total width and height */
}

.widget-title {
  font-size: 1.5rem; /* text-2xl */
  font-weight: 600; /* font-semibold */
  color: #4b5563; /* text-gray-700 */
  margin-bottom: 1rem; /* mb-4 */
}
</style>
