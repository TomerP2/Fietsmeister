// Set some global variables
let reportModeEnabled = false;
let temporaryPointActive = false;
let blokkagesLayer = null;
let map = null;
let userInfo = null;
const wfsUrl = "http://localhost:8181/geoserver/fietsmeister/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=fietsmeister%3Ablokkages&outputFormat=application%2Fjson";
const basemapUrl = 'https://service.pdok.nl/brt/achtergrondkaart/wmts/v2_0/pastel/EPSG:3857/{z}/{x}/{y}.png'
const BlokkeringIconGroot = createBlokkeringIcon();
const reportButtonElement = document.getElementById('report-button');
const reportTextElement = document.getElementById('report-text');
const cancelReportButtonElement = document.getElementById('cancel-report-button');
const infoElement = document.getElementById('info')


async function main(){
  map = L.map("map").setView([51.6951, 5.333135], 16);
  
  userInfo = await getCurrentUserInfo();
  
  // Create basemap and add to map
  L.tileLayer(basemapUrl, {
    minZoom: 6,
    maxZoom: 19,
    bounds: [[50.5, 3.25], [54, 7.6]],
    attribution: 'Kaartgegevens &copy; <a href="https://www.kadaster.nl">Kadaster</a>'
  }).addTo(map);
  
  // Add event listeners to report/cancel report buttons
  reportButtonElement.addEventListener('click', function(){
    toggleReportMode(true);
  });

  cancelReportButtonElement.addEventListener('click', function() {
    toggleReportMode(false);
  });
  
  // Asks user for location and zooms in if user gives location
  map.locate({ setView: true });
  
  // Adds blokkages layer to map
  addOrUpdateBlokkagesLayer();
  
  // Adds click handler to map to create new blokkage
  map.on("click", function (e) {
    if (reportModeEnabled && !temporaryPointActive) {
      createBlokkage(e.latlng);
    }
  });
}


async function addOrUpdateBlokkagesLayer() {
  try {
    const response = await fetch(wfsUrl);
    const data = await response.json();
    
    if (blokkagesLayer) {
      map.removeLayer(blokkagesLayer);
    }
    
    blokkagesLayer = L.geoJSON(data, {
      pointToLayer: function (feature, latlng) {
        const marker = L.marker(latlng, { icon: BlokkeringIconGroot });
        const point_id = feature.id.split('.')[1]
        
        marker.on('click', function () {
          displayPointInfo(point_id, latlng);
        });
        return marker;
      },
    });

    blokkagesLayer.addTo(map);

  } catch (error) {
    console.error("Error fetching or processing GeoJSON:", error);
  }
}

main();
