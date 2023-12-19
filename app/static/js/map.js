// Set some variables used by different parts of the code
let map = null;
let userInfo = null;
let blokkagesLayer = null;
let display = new Display()

async function main(){
  // Create map
  map = L.map("map").setView([51.6951, 5.333135], 16);
  
  // Fetch user info from flask API
  userInfo = await getCurrentUserInfo();
  
  // Create basemap and add to map
  L.tileLayer('https://service.pdok.nl/brt/achtergrondkaart/wmts/v2_0/pastel/EPSG:3857/{z}/{x}/{y}.png', {
    minZoom: 6,
    maxZoom: 19,
    bounds: [[50.5, 3.25], [54, 7.6]],
    attribution: 'Kaartgegevens &copy; <a href="https://www.kadaster.nl">Kadaster</a>'
  }).addTo(map);

  // Add event listeners to report/cancel report buttons
  document.getElementById('report-button').addEventListener('click', function(){
    display.switch_to('report-mode');
  });

  document.getElementById('cancel-report-button').addEventListener('click', function() {
    display.switch_to('default');
  });

  // Asks user for location and zooms in if user gives location
  map.locate({ setView: true });

  // Adds blokkages layer to map
  addOrUpdateBlokkagesLayer();

  // Adds click handler to map to maybe add new blokkage if user confirms.
  map.on("click", function (e) {
    // Check if the user is in edit-mode before trying to add new point
    if (display.state == 'edit-mode') {
      maybeAddNewPoint(e.latlng);
    }
  });
}

async function addOrUpdateBlokkagesLayer() {
  try {
    // fetch data from geoserver WFS
    const wfsUrl = "http://localhost:8181/geoserver/fietsmeister/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=fietsmeister%3Ablokkages&outputFormat=application%2Fjson";
    const response = await fetch(wfsUrl);
    const data = await response.json();
    
    // Remove blokkageslayer if already exists
    if (blokkagesLayer) {
      map.removeLayer(blokkagesLayer);
    }
    
    // add updated blokkkageslayer
    blokkagesLayer = L.geoJSON(data, {
      pointToLayer: function (feature, latlng) {
        const marker = L.marker(latlng, { icon: getBlokkeringIcon() });
        const point_id = feature.id.split('.')[1]
        
        // Add click handler to display point info
        marker.on('click', function () {
          displayInfoMenu(point_id, latlng);
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