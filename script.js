// Initialize map centered on the world
const map = L.map('map').setView([20, 0], 2);

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// ----- Dummy Towns -----
const towns = [
  { name: "Maun, Botswana", coords: [-19.983, 23.431], date: "2023-06-15" },
  { name: "Cape Town, South Africa", coords: [-33.918, 18.423], date: "2022-12-05" }
];

// Add towns as markers
towns.forEach(town => {
  L.marker(town.coords)
    .addTo(map)
    .bindPopup(`📍 ${town.name} <br>📅 ${town.date}`);
});

// ----- Dummy Countries -----
const countries = [
  { name: "Botswana", coords: [[[-25, 20], [-25, 30], [-15, 30], [-15, 20], [-25, 20]]], year: "2023" },
  { name: "South Africa", coords: [[[-35, 16], [-35, 32], [-28, 32], [-28, 16], [-35, 16]]], year: "2022" }
];

// Add countries as polygons
countries.forEach(country => {
  L.polygon(country.coords, { color: 'blue', fillColor: 'lightblue', fillOpacity: 0.4 })
    .addTo(map)
    .bindPopup(`🌐 ${country.name} <br>📅 First visited: ${country.year}`);
});
