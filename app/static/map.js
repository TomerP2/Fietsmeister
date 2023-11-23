var map = L.map('map').setView([51.6951, 5.333135], 16);
var wfs_url = 'http://localhost:8181/geoserver/fietsmeister/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=fietsmeister%3Ablokkages&outputFormat=application%2Fjson'

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
}).addTo(map);

fetch(wfs_url)
  .then(response => response.json())
  .then(data => {
    var blokkages = L.geoJSON(data).addTo(map);
  })

map.locate({setView: true});
