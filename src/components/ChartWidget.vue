<template>
  <div>
    <Bar
      v-if="isChartDataValid"
      :chart-data="props.chartData"
      :chart-options="props.chartOptions"
    />
    <p v-else>Loading chart data...</p>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { Bar } from "vue-chartjs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
);

const props = defineProps({
  chartData: {
    type: Object,
    required: true,
  },
  chartOptions: {
    type: Object,
    default: () => ({ responsive: true, maintainAspectRatio: false }),
  },
});

const isChartDataValid = computed(() => {
  return (
    props.chartData &&
    Array.isArray(props.chartData.labels) &&
    props.chartData.labels.length > 0 &&
    Array.isArray(props.chartData.datasets) &&
    props.chartData.datasets.length > 0
  );
});
</script>

<style scoped>
div {
  height: 300px;
}
</style>
