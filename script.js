// -----------------------------
// Initialize the map
// -----------------------------
const map = L.map('map').setView([20, 0], 2); // Centered roughly on Africa

// Add OpenStreetMap tiles (background map)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);


// -----------------------------
// List of countries you have visited
// -----------------------------
const visitedCountries = [
  "Botswana",
  "South Africa",
  "Namibia"
  // add more countries as needed
];


// -----------------------------
// Add dummy towns (markers)
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
        const isVisited = visitedCountries.includes(feature.properties.name);
        return {
          color: 'blue',                      // Country borders
          fillColor: isVisited ? 'lightblue' : 'transparent', // Fill only visited countries
          fillOpacity: isVisited ? 0.4 : 0,
          weight: 1,
          fill: true
        };
      }
    }).addTo(map);
  })
  .catch(err => console.error("Error loading GeoJSON:", err));
