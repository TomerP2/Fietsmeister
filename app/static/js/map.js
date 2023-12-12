// Set some global variables
let editModeEnabled = false;
let blokkagesLayer = null;
let map = null;
let userInfo = null;
const wfsUrl = "http://localhost:8181/geoserver/fietsmeister/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=fietsmeister%3Ablokkages&outputFormat=application%2Fjson";
const basemapUrl = 'https://service.pdok.nl/brt/achtergrondkaart/wmts/v2_0/pastel/EPSG:3857/{z}/{x}/{y}.png'
const BlokkeringIconGroot = createBlokkeringIcon();
const reportButtonElement = document.getElementById('report-button');
const reportTextElement = document.getElementById('report-text');


async function main(){
  map = L.map("map").setView([51.6951, 5.333135], 16);
  
  userInfo = await getCurrentUserInfo();
  
  getBasemap().addTo(map);
  
  reportButtonElement.addEventListener('click', function(){
    toggleEditMode(true)
  })
  
  map.locate({ setView: true });
  
  addOrUpdateBlokkagesLayer();
  
  map.on("click", function (e) {
    createBlokkage(e.latlng, editModeEnabled)
  });
}

function getBasemap() {
  return L.tileLayer(basemapUrl, {
    minZoom: 6,
    maxZoom: 19,
    bounds: [[50.5, 3.25], [54, 7.6]],
    attribution: 'Kaartgegevens &copy; <a href="https://www.kadaster.nl">Kadaster</a>'
  });
};

function createBlokkeringIcon() {
  return L.icon({
    iconUrl: "/static/png/blokkering_icon_groot.png",
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
}

async function addOrUpdateBlokkagesLayer() {
  try {
    const response = await fetch(wfsUrl);
    const data = await response.json();
    
    if (blokkagesLayer) {
      map.removeLayer(blokkagesLayer);
    }
    
    blokkagesLayer = createLayerFromJson(data);
    blokkagesLayer.addTo(map);
  } catch (error) {
    console.error("Error fetching or processing GeoJSON:", error);
  }
}

function createLayerFromJson(data) {
  return L.geoJSON(data, {
    pointToLayer: function (feature, latlng) {
      const marker = L.marker(latlng, { icon: BlokkeringIconGroot });
      const point_id = feature.id.split('.')[1]
      
      marker.on('click', function () {
        displayPointInfo(point_id, userInfo, latlng, map);
      });
      
      return marker;
    },
  });
}

main();
