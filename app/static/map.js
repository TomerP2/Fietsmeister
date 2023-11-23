var map = L.map('map').setView([51.6951, 5.333135], 16);
var wfsUrl = 'http://localhost:8181/geoserver/fietsmeister/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=fietsmeister%3Ablokkages&outputFormat=application%2Fjson'

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
}).addTo(map);

var BlokkeringIconGroot = L.icon({
  iconUrl: "/static/blokkering_icon_groot.png",
  iconSize:     [30, 30], // size of the icon
  iconAnchor:   [15, 15], // point of the icon which will correspond to marker's location
});

fetch(wfsUrl)
  .then(response => response.json())
  .then(data => {
    L.geoJSON(data, {
      pointToLayer: function(feature, latlng) {
        return L.marker(latlng, { icon: BlokkeringIconGroot });
      }
    }).addTo(map)
  })
map.locate({setView: true});
