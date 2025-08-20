// -----------------------------
// Initialize the map
// -----------------------------
const map = L.map('map').setView([20, 0], 2); // Centered roughly on Africa

// Add a minimalist tile layer (no country borders)
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
  subdomains: 'abcd',
  maxZoom: 19
}).addTo(map);


// -----------------------------
// List of countries you have visited
// -----------------------------
const visitedCountries = [
  "Botswana",
  "South Africa",
  "Namibia"
  "Zambia"
  // add more countries as needed
];


// -----------------------------
// Add town markers
// -----------------------------
const towns = [
  { name: "Maun, Botswana", coords: [-19.983, 23.431], date: "2023-06-15" },
  { name: "Cape Town, South Africa", coords: [-33.918, 18.423], date: "2022-12-05" }
];

towns.forEach(town => {
  L.marker(town.coords)
    .addTo(map)
    .bindPopup(`📍 ${town.name} <br>📅 ${town.date}`);
});


// -----------------------------
// Load and display countries
// -----------------------------
fetch('data/world_countries.geo.json')  // Make sure this path matches your file
  .then(res => res.json())
  .then(geojson => {
    L.geoJSON(geojson, {
      style: function(feature) {
        const countryName = feature.properties.name.toLowerCase().trim();
        const isVisited = visitedCountries.some(c => c.toLowerCase().trim() === countryName);

        return {
          fillColor: isVisited ? 'lightblue' : 'transparent', // Fill only visited countries
          fillOpacity: isVisited ? 0.4 : 0,
          stroke: false,      // Remove polygon borders completely
          interactive: false  // Optional: disable hover effects
        };
      }
    }).addTo(map);
  })
  .catch(err => console.error("Error loading GeoJSON:", err));
