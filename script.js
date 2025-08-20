// -----------------------------
// Initialize the map
// -----------------------------
const map = L.map('map').setView([20, 0], 2);

// OpenStreetMap base tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// -----------------------------
// Get year filter dropdown
// -----------------------------
const yearFilter = document.getElementById('yearFilter');

// -----------------------------
// Store markers and country layers
// -----------------------------
let townMarkers = [];
let countryLayers = [];

// -----------------------------
// Load towns and countries from Google Spreadsheet
// -----------------------------
async function loadData() {
  const response = await fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vRKUiBcIY-VXMjZ30sY48TAloeRBtSVCf0DZzSRmHivY9SndCmrXnC5XLpIOZQjeDmjKgZH7PH6MPVK/pub?gid=0&single=true&output=csv');
  const csvText = await response.text();
  const lines = csvText.split('\n');
  const headers = lines[0].split(',');

  const towns = [];
  const visitedCountries = [];

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const row = lines[i].split(',');

    const town = {};
    headers.forEach((h, idx) => {
      town[h.trim()] = row[idx] ? row[idx].trim() : '';
    });

    // Multiple years support
    town.years = town.Years.split(',').map(y => y.trim());

    towns.push(town);

    // Populate visited countries dynamically
    town.years.forEach(y => {
      if (!visitedCountries.some(c => c.name === town.Country && c.year == y)) {
        visitedCountries.push({ name: town.Country, year: parseInt(y) });
      }
    });
  }

  return { towns, visitedCountries };
}

// -----------------------------
// Add town markers
// -----------------------------
function addTownMarkers(towns) {
  townMarkers = towns.map(town => {
    const marker = L.marker([parseFloat(town.Latitude), parseFloat(town.Longitude)])
      .bindPopup(`📍 ${town.City}, ${town.Country} <br>📅 ${town.Date}`);
    marker.years = town.years;
    marker.addTo(map);
    return marker;
  });
}

// -----------------------------
// Add countries from GeoJSON
// -----------------------------
function addCountries(visitedCountries, geojsonData) {
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
        color: 'blue',
        fillColor: isVisited ? 'lightblue' : 'transparent',
        fillOpacity: isVisited ? 0.4 : 0,
        weight: 1,
        fill: true
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
function populateYearFilter(towns, visitedCountries) {
  const allYears = Array.from(new Set([
    ...towns.flatMap(t => t.years),
    ...visitedCountries.map(c => c.year)
  ])).sort();

  allYears.forEach(y => {
    const option = document.createElement('option');
    option.value = y;
    option.textContent = y;
    yearFilter.appendChild(option);
  });
}

// -----------------------------
// Filter towns and countries by selected year
// -----------------------------
function addYearFilter() {
  yearFilter.addEventListener('change', () => {
    const selectedYear = yearFilter.value;

    // Filter town markers
    townMarkers.forEach(marker => {
      if (selectedYear === 'all' || marker.years.includes(selectedYear)) {
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
}

// -----------------------------
// Initialize everything
// -----------------------------
async function initMap() {
  const { towns, visitedCountries } = await loadData();

  addTownMarkers(towns);
  populateYearFilter(towns, visitedCountries);
  addYearFilter();

  // Load GeoJSON for countries
  fetch('data/world_countries.geo.json')
    .then(res => res.json())
    .then(geojson => addCountries(visitedCountries, geojson))
    .catch(err => console.error("Error loading GeoJSON:", err));
}

// Call init
initMap();
