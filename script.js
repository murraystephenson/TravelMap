// -----------------------------
// Initialize the map
// -----------------------------
const map = L.map('map').setView([20, 0], 2); // Centered roughly on Africa

// Add OpenStreetMap tiles (background map)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);


// -----------------------------
// List of countries visited with year
// -----------------------------
const visitedCountries = [
  { name: "Botswana", year: 2023 },
  { name: "South Africa", year: 2022 },
  { name: "Namibia", year: 2021 }
];


// -----------------------------
// List of towns with year
// -----------------------------
const towns = [
  { name: "Maun, Botswana", coords: [-19.983, 23.431], date: "2023-06-15", year: 2023 },
  { name: "Cape Town, South Africa", coords: [-33.918, 18.423], date: "2022-12-05", year: 2022 }
];


// -----------------------------
// Populate the year filter dropdown
// -----------------------------
const yearFilter = document.getElementById('yearFilter');

// Get unique years from towns and countries
const allYears = Array.from(new Set([
  ...towns.map(t => t.year),
  ...visitedCountries.map(c => c.year)
])).sort();

// Add years to the dropdown
allYears.forEach(y => {
  const option = document.createElement('option');
  option.value = y;
  option.textContent = y;
  yearFilter.appendChild(option);
});


// -----------------------------
// Add town markers and store them
// -----------------------------
const townMarkers = towns.map(town => {
  const marker = L.marker(town.coords)
    .bindPopup(`📍 ${town.name} <br>📅 ${town.date}`);
  marker.year = town.year; // store the year
  marker.addTo(map);
  return marker;
});


// -----------------------------
// Load and display countries
// -----------------------------
let countryLayers = []; // store each country layer

fetch('data/world_countries.geo.json')
  .then(res => res.json())
  .then(geojson => {
    L.geoJSON(geojson, {
      style: function(feature) {
        const countryName = feature.properties.name.toLowerCase().trim();
        const countryData = visitedCountries.find(c => c.name.toLowerCase() === countryName);
        const isVisited = !!countryData;

        // Store layer info for filtering
        countryLayers.push({
          feature: feature,
          layer: null, // placeholder, will set later
          year: isVisited ? countryData.year : null
        });

        return {
          color: 'blue',                          // borders
          fillColor: isVisited ? 'lightblue' : 'transparent',
          fillOpacity: isVisited ? 0.4 : 0,
          weight: 1,
          fill: true
        };
      },
      onEachFeature: function(feature, layer) {
        const countryName = feature.properties.name;
        const countryData = visitedCountries.find(c => c.name.toLowerCase() === countryName.toLowerCase());
        if (countryData) layer.addTo(map);

        const layerObj = countryLayers.find(l => l.feature === feature);
        if (layerObj) layerObj.layer = layer;
      }
    }).addTo(map);
  })
  .catch(err => console.error("Error loading GeoJSON:", err));


// -----------------------------
// Filter functionality
// -----------------------------
yearFilter.addEventListener('change', () => {
  const selectedYear = yearFilter.value;

  // Filter town markers
  townMarkers.forEach(marker => {
    if (selectedYear === 'all' || marker.year == selectedYear) {
      marker.addTo(map);
    } else {
      map.removeLayer(marker);
    }
  });

  // Filter countries
  countryLayers.forEach(obj => {
    if (!obj.layer) return;
    if (selectedYear === 'all' || obj.year == selectedYear) {
      obj.layer.addTo(map);
    } else {
      map.removeLayer(obj.layer);
    }
  });
});
