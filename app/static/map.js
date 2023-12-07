// Set some global variables
let editModeEnabled = false

async function main(){
  // Get user info
  let userInfo = await getCurrentUserInfo()

  // Initialize the map
  const map = L.map("map").setView([51.6951, 5.333135], 16);

  // Add Basemap layer
  getBasemap().addTo(map);

  // Create BlokkeringIconGroot icon
  const BlokkeringIconGroot = createBlokkeringIcon();

  // Set up event listener for 'report' button
  const reportButtonElement = document.getElementById('report-button')
  const reportTextElement = document.getElementById('report-text')
  reportButtonElement.addEventListener('click', function(){
    console.log('report button clicked');
    editModeEnabled = true;
    reportButtonElement.style.display = 'none';
    reportTextElement.style.display = 'block'
  })

  // Set up event listener for map location
  map.locate({ setView: true });

  // Fetch and add GeoJSON data to the map
  const wfsUrl = "http://localhost:8181/geoserver/fietsmeister/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=fietsmeister%3Ablokkages&outputFormat=application%2Fjson";
  addGeoJSONToMap(map, wfsUrl, BlokkeringIconGroot, userInfo);

  // Add click event listener to the map
  map.on("click", function (e) {
    createBlokkage(e.latlng, userInfo)
  });
}

// Function to get the basemap layer
function getBasemap() {
  return L.tileLayer('https://service.pdok.nl/brt/achtergrondkaart/wmts/v2_0/pastel/EPSG:3857/{z}/{x}/{y}.png', {
    minZoom: 6,
    maxZoom: 19,
    bounds: [[50.5, 3.25], [54, 7.6]],
    attribution: 'Kaartgegevens &copy; <a href="https://www.kadaster.nl">Kadaster</a>'
  });
}

// Function to create the BlokkeringIconGroot icon
function createBlokkeringIcon() {
  return L.icon({
    iconUrl: "/static/blokkering_icon_groot.png",
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
}

// Function to fetch and add GeoJSON data to the map
async function addGeoJSONToMap(map, wfsUrl, icon, userInfo) {
  try {
    const response = await fetch(wfsUrl);
    const data = await response.json();

    createLayerFromJson(data, icon, map, userInfo).addTo(map);
  } catch (error) {
    console.error("Error fetching or processing GeoJSON:", error);
  }
}

// Function to create layer from the GeoJSON and add neccesary stuff to layer
function createLayerFromJson(data, icon, map, userInfo) {
  return L.geoJSON(data, {
    pointToLayer: function (feature, latlng) {
      const marker = L.marker(latlng, { icon: icon });
      const point_id = feature.id.split('.')[1]

      // Add click events to each marker
      marker.on('click', function () {
        // Display information about the clicked point
        displayPointInfo(point_id, userInfo, latlng, map);
      });

      return marker;
    },
  });
}

 // Function to create a new blokkage
 function createBlokkage(latlng, userInfo) {
  if (!(editModeEnabled)) {
    console.log('edit mode not enabled. Wont add a new blokkage')
    return
  }

  var url = 'http://127.0.0.1:8080/api/createblokkage';
  var data = {
    lat: latlng.lat,
    lng: latlng.lng,
    user_id: userInfo.id
  };

  // Using Fetch API to make a POST request
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

main();
