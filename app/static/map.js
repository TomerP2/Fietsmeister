function main(){
  // Initialize the map
  const map = L.map("map").setView([51.6951, 5.333135], 16);

  // Add Basemap layer
  getBasemap().addTo(map);

  // Create BlokkeringIconGroot icon
  const BlokkeringIconGroot = createBlokkeringIcon();

  // Set up event listener for map location
  map.locate({ setView: true });

  // Fetch and add GeoJSON data to the map
  const wfsUrl = "http://localhost:8080/geoserver/fietsmeister/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=fietsmeister%3Ablokkages&outputFormat=application%2Fjson";
  addGeoJSONToMap(map, wfsUrl, BlokkeringIconGroot);

  // Add click event listener to the map
  map.on("click", function () {
    hidePointInfo(map); // Hide the info element on map click
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
async function addGeoJSONToMap(map, wfsUrl, icon) {
  try {
    const response = await fetch(wfsUrl);
    const data = await response.json();

    createLayerFromJson(data, icon, map).addTo(map);
  } catch (error) {
    console.error("Error fetching or processing GeoJSON:", error);
  }
}

// Function to create layer from the GeoJSON and add neccesary stuff to layer
function createLayerFromJson(data, icon, map) {
  return L.geoJSON(data, {
    pointToLayer: function (feature, latlng) {
      const marker = L.marker(latlng, { icon: icon });
      const point_id = feature.id.split('.')[1]

      // Add click events to each marker
      marker.on('click', function () {
        // Display information about the clicked point
        displayPointInfo(point_id, latlng, map);
      });

      return marker;
    },
  });
}

// Function to display information about the clicked point
async function displayPointInfo(point_id, latlng, map) {
  // Adjust the height of the map container to x% of the viewport height
  const newHeight = window.innerHeight * 0.75;
  map.getContainer().style.height = `${newHeight}px`;
  map.invalidateSize();

  // Center the map on the clicked marker and zoom in
  map.setView(latlng, 18);

  try {
    // Fetch feature info from Flask api
    const blokkageInfoAPI = `http://127.0.0.1:5000/api/blokkageinfo/${point_id}`;
    const response = await fetch(blokkageInfoAPI);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch data. Status: ${response.status}`);
    }

    const featureInfo = await response.json();

    // Update info div based on fetched info
    const postedByTextElement = document.getElementById("posted-by-text");
    postedByTextElement.textContent = `${featureInfo.days_ago} dagen geleden gepost door ${featureInfo.username}`;

    const markedTrueTextElement = document.getElementById("marked-true-text");
    markedTrueTextElement.textContent = `${featureInfo.marked_true} keer gemarkeerd als kloppend`;

    const markedFalseTextElement = document.getElementById("marked-false-text");
    markedFalseTextElement.textContent = `${featureInfo.marked_false} keer gemarkeerd als niet kloppend`;

    // Get the button elements and add event listeners
    const markTrueElement = document.getElementById('mark-true');
    addButtonEventListener(markTrueElement, point_id, true);

    const markFalseElement = document.getElementById('mark-false');
    addButtonEventListener(markFalseElement, point_id, false);

    // Display info div
    const infoElement = document.getElementById("info");
    infoElement.style.display = "flex"; // Show the info element
  } catch (error) {
    console.error("Error fetching or processing feature info:", error);
  }
}

function addButtonEventListener(Button, point_id, markedTrue) {
  let apiURL = 'http://127.0.0.1:5000/api/'
  if (markedTrue) {
    apiURL += 'marktrue'
  } else {
    apiURL += 'markfalse'
  }

  Button.addEventListener('click', function () {
    // Send a POST request to API endpoint
    fetch(apiURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        'blokkage_id': point_id,
        'user_id': 1,
      })
    })
      .then(response => response.json())
      .then(data => {
        // Handle the success response if needed
        console.log('POST request successful', data);
      })
      .catch(error => {
        // Handle the error if the POST request fails
        console.error('Error in POST request', error);
      });
  });
}

// Function to hide the information about the clicked point
function hidePointInfo(map) {
  // Adjust the height of the map container back to 100%
  map.getContainer().style.height = `100%`;
  map.invalidateSize();

  // Hide info div
  const infoElement = document.getElementById("info");
  infoElement.style.display = "none"; // Hide the info element
}


main();
