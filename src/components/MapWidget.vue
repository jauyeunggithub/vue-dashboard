<template>
  <div id="map" ref="mapContainer" style="height: 300px"></div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const mapContainer = ref(null);
let map = null;

onMounted(() => {
  map = L.map(mapContainer.value).setView([51.505, -0.09], 13);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map);

  L.marker([51.505, -0.09])
    .addTo(map)
    .bindPopup("A pretty CSS3 popup.<br> Easily customizable.");
});
</script>

<style scoped>
#map {
  width: 100%;
}
</style>
