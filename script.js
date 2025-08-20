// Initialize map
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

towns.forEach(town => {
  L.marker(town.coords)
    .addTo(map)
    .bindPopup(`📍 ${town.name} <br>📅 ${town.date}`);
});

// ----- Countries -----
fetch('data/countries.json')
  .then(res => res.json())
  .then(json => {
    L.JSON(json, {
      style: {
        color: 'blue',
        fillColor: 'lightblue',
        fillOpacity: 0.4,
        weight: 1
      }
    }).addTo(map);
  });
