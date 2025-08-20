// -----------------------------
// Initialize the map
// -----------------------------
const map = L.map('map').setView([20, 0], 2);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// -----------------------------
// Year filter dropdown
// -----------------------------
const yearFilter = document.getElementById('yearFilter');

// -----------------------------
// Local data for towns
// -----------------------------
const towns = [
  { City: 'Maun', Country: 'Botswana', Latitude: -19.983, Longitude: 23.431, Date: '2021-06-15', Years: ['2021', '2022'] },
  { City: 'Cape Town', Country: 'South Africa', Latitude: -33.918, Longitude: 18.423, Date: '2022-12-05', Years: ['2022'] }
];

// Local data for countries visited (derived from towns)
const visitedCountries = [
  { name: 'Botswana', year: 2021 },
  { name: 'Botswana', year: 2022 },
  { name: 'South Africa', year: 2022 }
];

// -----------------------------
// Store markers and country layers
// -----------------------------
let townMarkers = [];
let countryLayers = [];

// -----------------------------
// Add town markers
// -----------------------------
function addTownMarkers() {
  townMarkers = towns.map(town => {
    const marker = L.marker([town.Latitude, town.Longitude])
      .bindPopup(`📍 ${town.City}, ${town.Country} <br>📅 ${town.Date}`);
    marker.years = town.Years;
    marker.addTo(map);
    return marker;
  });
}

// -----------------------------
// Add countries from GeoJSON
// -----------------------------
function addCountries(geojsonData) {
  L.geoJSON(geojsonData, {
    style: function(feature) {
      const countryName = feature.properties.name.trim();
      const countryData = visitedCountries.find(c => c.name === countryName);
      const isVisited = !!countryData;

      countryLayers.push({
        feature: feature,
        layer: null,
        year: isVisited ? countryData.year : null
      });

      return {
        color: 'transparent',                 // remove borders
        fillColor: isVisited ? 'lightblue' : 'transparent',
        fillOpacity: isVisited ? 0.4 : 0,
        weight: 0.5
      };
    },
    onEachFeature: function(feature, layer) {
      const countryName = feature.properties.name.trim();
      const countryData = visitedCountries.find(c => c.name === countryName);
      if (countryData) layer.addTo(map);

      const layerObj = countryLayers.find(l => l.feature === feature);
      if (layerObj) layerObj.layer = layer;
    }
  }).addTo(map);
}

// -----------------------------
// Populate year filter dropdown
// -----------------------------
function populateYearFilter() {
  const allYears = Array.from(new Set([
    ...towns.flatMap(t => t.Years),
    ...visitedCountries.map(c => c.year.toString())
  ])).sort();

  allYears.forEach(y => {
    const option = document.createElement('option');
    option.value = y;
    option.textContent = y;
    yearFilter.appendChild(option);
  });
}

// -----------------------------
// Year filter functionality
// -----------------------------
function addYearFilter() {
  yearFilter.addEventListener('change', () => {
    const selectedYear = yearFilter.value;

    townMarkers.forEach(marker => {
      if (selectedYear === 'all' || marker.years.includes(selectedYear)) {
        marker.addTo(map);
      } else {
        map.removeLayer(marker);
      }
    });

    countryLayers.forEach(obj => {
      if (!obj.layer) return;
      if (selectedYear === 'all' || obj.year == selectedYear) {
        obj.layer.addTo(map);
      } else {
        map.removeLayer(obj.layer);
      }
    });
  });
}

// -----------------------------
// Initialize everything
// -----------------------------
function initMap() {
  addTownMarkers();
  populateYearFilter();
  addYearFilter();

  // Load GeoJSON countries
  fetch('data/world_countries.geo.json')
    .then(res => res.json())
    .then(geojson => addCountries(geojson))
    .catch(err => console.error("Error loading GeoJSON:", err));
}

// Call the initializer
initMap();
