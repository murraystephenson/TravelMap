// Initialize map
const map = L.map('map').setView([20, 0], 2);

// Base map layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Layers
let activitiesLayer, townsLayer, countriesLayer;

// Load data files
Promise.all([
  fetch('data/activities.geojson').then(r => r.json()),
  fetch('data/towns.json').then(r => r.json()),
  fetch('data/countries.json').then(r => r.json())
]).then(([activities, towns, countries]) => {
  
  // Get all years
  const years = new Set();

  // Activities (Strava routes)
  activitiesLayer = L.geoJSON(activities, {
    style: { color: 'red', weight: 2 },
    onEachFeature: (feature, layer) => {
      const year = feature.properties.date.split('-')[0];
      years.add(year);
      layer.bindPopup(`🏃 ${feature.properties.type} <br>📅 ${feature.properties.date}`);
    }
  }).addTo(map);

  // Towns visited
  townsLayer = L.geoJSON(towns, {
    pointToLayer: (feature, latlng) => L.marker(latlng),
    onEachFeature: (feature, layer) => {
      const year = feature.properties.date.split('-')[0];
      years.add(year);
      layer.bindPopup(`📍 ${feature.properties.name} <br>📅 ${feature.properties.date}`);
    }
  }).addTo(map);

  // Countries visited
  countriesLayer = L.geoJSON(countries, {
    style: { color: 'blue', fillColor: 'lightblue', weight: 1, fillOpacity: 0.4 },
    onEachFeature: (feature, layer) => {
      years.add(feature.properties.year);
      layer.bindPopup(`🌐 ${feature.properties.name} <br>📅 First visited: ${feature.properties.year}`);
    }
  }).addTo(map);

  // Populate year filter dropdown
  const yearFilter = document.getElementById('yearFilter');
  Array.from(years).sort().forEach(y => {
    const option = document.createElement('option');
    option.value = y;
    option.textContent = y;
    yearFilter.appendChild(option);
  });

  // Filtering logic
  yearFilter.addEventListener('change', e => {
    const selected = e.target.value;

    // Activities
    activitiesLayer.eachLayer(layer => {
      const year = layer.feature.properties.date.split('-')[0];
      layer.setStyle({ opacity: (selected === 'all' || year === selected) ? 1 : 0 });
    });

    // Towns
    townsLayer.eachLayer(layer => {
      const year = layer.feature.properties.date.split('-')[0];
      if (selected === 'all' || year === selected) {
        layer.addTo(map);
      } else {
        map.removeLayer(layer);
      }
    });

    // Countries
    countriesLayer.eachLayer(layer => {
      const year = layer.feature.properties.year;
      if (selected === 'all' || year === selected) {
        layer.setStyle({ fillOpacity: 0.4 });
      } else {
        layer.setStyle({ fillOpacity: 0 });
      }
    });
  });

});
