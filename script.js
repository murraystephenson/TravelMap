// -----------------------------
// Initialize the map
// -----------------------------
const map = L.map('map').setView([-33.918, 18.423], 4); // centered on Cape Town

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// -----------------------------
// Year filter dropdown
// -----------------------------
const yearFilter = document.getElementById('yearFilter');

// -----------------------------
// Combined data for towns and countries
// -----------------------------
const locations = [
  {
    city: 'Cape Town',
    country: 'South Africa',
    lat: -33.918,
    lng: 18.423,
    years: Array.from({length: 2025 - 1987 + 1}, (_, i) => (1987 + i).toString())
  },
  {
    city: 'Maun',
    country: 'Botswana',
    lat: -19.983,
    lng: 23.431,
    years: Array.from({length: 2025 - 2020 + 1}, (_, i) => (2020 + i).toString())
  },
  {
    city: 'Gaborone',
    country: 'Botswana',
    lat: -24.628,
    lng: 25.923,
    years: ['2023', '2024', '2025']
  },
  {
    city: 'Boston',
    country: 'United States',
    lat: 42.3601,
    lng: -71.0589,
    years: ['2017']
  },
  {
    city: 'London',
    country: 'United Kingdom',
    lat: 51.5074,
    lng: -0.1278,
    years: ['2017']
  },
  {
    city: 'Brussels',
    country: 'Belgium',
    lat: 50.8503,
    lng: 4.3517,
    years: ['2017']
  },
  {
    city: 'Copenhagen',
    country: 'Denmark',
    lat: 55.6761,
    lng: 12.5683,
    years: ['2017']
  }
];

// Store markers and country layers
let markers = [];
let countryLayers = [];

// -----------------------------
// Add markers
// -----------------------------
function addMarkers() {
  markers = locations.map(loc => {
    const marker = L.marker([loc.lat, loc.lng])
      .bindPopup(`📍 ${loc.city}, ${loc.country}`);
    marker.years = loc.years;
    marker.addTo(map);
    return marker;
  });
}

// -----------------------------
// Add country from GeoJSON
// -----------------------------
function addCountries(geojsonData) {
  L.geoJSON(geojsonData, {
    style: function(feature) {
      const countryName = feature.properties.name.trim();
      const locData = locations.find(l => l.country === countryName);
      const isVisited = !!locData;

      countryLayers.push({
        feature: feature,
        layer: null,
        years: isVisited ? locData.years : []
      });

      return {
        color: 'transparent',
        fillColor: isVisited ? 'lightblue' : 'transparent',
        fillOpacity: isVisited ? 0.4 : 0,
        weight: 0.5
      };
    },
    onEachFeature: function(feature, layer) {
      const countryName = feature.properties.name.trim();
      const locData = locations.find(l => l.country === countryName);
      if (locData) layer.addTo(map);

      const layerObj = countryLayers.find(l => l.feature === feature);
      if (layerObj) layerObj.layer = layer;
    }
  }).addTo(map);
}

// -----------------------------
// Populate year filter dropdown
// -----------------------------
function populateYearFilter() {
  const allYears = Array.from(new Set(
    locations.flatMap(l => l.years)
  )).sort();

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

    markers.forEach(marker => {
      if (selectedYear === 'all' || marker.years.includes(selectedYear)) {
        marker.addTo(map);
      } else {
        map.removeLayer(marker);
      }
    });

    countryLayers.forEach(obj => {
      if (!obj.layer) return;
      if (selectedYear === 'all' || obj.years.includes(selectedYear)) {
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
  addMarkers();
  populateYearFilter();
  addYearFilter();

  fetch('data/world_countries.geo.json')
    .then(res => res.json())
    .then(geojson => addCountries(geojson))
    .catch(err => console.error("Error loading GeoJSON:", err));
}

// Call the initializer
initMap();
