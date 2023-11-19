var map = L.map('map').fitWorld();
var blokkages_wfs = 'http://localhost:8181/geoserver/fietsmeister/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=fietsmeister%3Ablokkages&outputFormat=application%2Fjson'

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
}).addTo(map);

var blokkages = L.tileLayer.wfs(blokkages_wfs, {
    // Add any additional options here
  }).addTo(map);

map.locate({setView: true, maxZoom: 16});
