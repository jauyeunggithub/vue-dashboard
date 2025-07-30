<template>
  <div id="map" ref="mapContainer" style="height: 300px"></div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const mapContainer = ref(null);
let map = null;

const token = import.meta.env.VITE_IPINFO_TOKEN;

async function fetchLocation() {
  try {
    const response = await fetch(`https://ipinfo.io/json?token=${token}`);
    if (!response.ok) {
      throw new Error("Failed to fetch IP info");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching IP info:", error);
    return null;
  }
}

onMounted(async () => {
  map = L.map(mapContainer.value).setView([51.505, -0.09], 13);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map);

  const locationData = await fetchLocation();

  if (locationData?.loc) {
    const [lat, lng] = locationData.loc.split(",").map(Number);
    map.setView([lat, lng], 13);

    L.marker([lat, lng])
      .addTo(map)
      .bindPopup(
        `Your approximate location:<br>${locationData.city}, ${locationData.region}, ${locationData.country}`
      )
      .openPopup();
  } else {
    L.marker([51.505, -0.09])
      .addTo(map)
      .bindPopup("Default location - unable to fetch your IP info.")
      .openPopup();
  }
});
</script>

<style scoped>
#map {
  width: 100%;
}
</style>
