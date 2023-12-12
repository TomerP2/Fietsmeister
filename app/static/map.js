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
  
  reportButtonElement.addEventListener('click', function(){toggleEditMode(true)})
  
  map.locate({ setView: true });
  
  addOrUpdateBlokkagesLayer();
  
  map.on("click", function (e) {
    createBlokkage(e.latlng, editModeEnabled, map, document)
  });
}

function getBasemap() {
  return L.tileLayer(basemapUrl, {
    minZoom: 6,
    maxZoom: 19,
    bounds: [[50.5, 3.25], [54, 7.6]],
    attribution: 'Kaartgegevens &copy; <a href="https://www.kadaster.nl">Kadaster</a>'
  });
}

function toggleEditMode(on) {
  console.log(`report mode toggled: ${on}`);
  if (on) {
    editModeEnabled = true;
    reportButtonElement.style.display = 'none';
    reportTextElement.style.display = 'block';
  } else{
    editModeEnabled = false;
    reportButtonElement.style.display = 'block';
    reportTextElement.style.display = 'none';
  }
};

function createBlokkeringIcon() {
  return L.icon({
    iconUrl: "/static/blokkering_icon_groot.png",
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

function createBlokkage(latlng, editModeEnabled, map, document) {
  const newPointConfirmationElement = document.getElementById('new-point-confirmation');
  const addPointButtonElement = document.getElementById('add-point-button');
  const dontAddPointButtonElement = document.getElementById('dont-add-point-button');
  const newBlokkeringIcon = createNewBlokkeringIcon();

  if (!(editModeEnabled)) {
    console.log('edit mode not enabled. Won\'t add a new blokkage');
    return;
  }
  
  var tempMarker = L.marker(latlng, { icon: newBlokkeringIcon }).addTo(map);
  map.setView(latlng, 18)
  
  var checkMarkerInterval = setInterval(function () {
    if (map.hasLayer(tempMarker)) {
      clearInterval(checkMarkerInterval);
      showConfirmation();
    }
  }, 200);
  
  function showConfirmation() {
    
    addPointButtonElement.addEventListener('click', function () {
      addPointToDatabase(latlng);
      closeEditMode();
    });
    
    dontAddPointButtonElement.addEventListener('click', function() {
      closeEditMode();
    })
    
    newPointConfirmationElement.classList.add('move-up');
  }
  
  function addPointToDatabase(latlng) {
    var url = 'http://127.0.0.1:8080/api/createblokkage';
    var data = {
      lat: latlng.lat,
      lng: latlng.lng,
      user_id: userInfo.id
    };
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(data => {
      console.log('Server response:', data);
    })
    .catch(error => {
      console.error('Error:', error);
    });
  }
  
  function closeEditMode() {
    map.removeLayer(tempMarker);
    newPointConfirmationElement.classList.remove('move-up');
    toggleEditMode(false);
    addOrUpdateBlokkagesLayer();
  }

  function createNewBlokkeringIcon() {
    return L.icon({
      iconUrl: "/static/new_blokkering_icon.png",
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });
  }
  
}

main();
