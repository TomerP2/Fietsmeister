// Set some variables used by different parts of the code
let map = null;
let userInfo = null;
let blokkagesLayer = null;
const display = new Display();

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

  // Asks user for location and zooms in if user gives location
  map.locate({ setView: true });

  // Adds blokkages layer to map
  addOrUpdateBlokkagesLayer();

  // Removes explanation about clicking on map after some time
  setTimeout(() => {
    document.getElementById('report-content-container').classList.remove('move-up');
  }, 5000); 


  // Adds click handler to settings-button.
  document.getElementById('settings-icon').addEventListener('click', function() {
    display.switch_to('settings');
  })

  // Adds click handler to map to maybe add new blokkage if user confirms.
  map.on("click", function (e) {

    // Check if the user is in the default view mode. If they are, try to add new point.
    if (display.state == 'default') {
      maybeAddNewPoint(e.latlng);
    } 

    // If user is in info menu , bring them back to the home page if they click on the map.
    else if (display.state == 'info-menu') {
      display.switch_to('default');
    }

    // If the user is in the 'new point confirmation' menu, remove the point and return back to the default menu.
    else if (display.state == 'new-point-confirmation-menu') {
      closeEditMenu();
    }

  });
}

async function addOrUpdateBlokkagesLayer() {
  try {
    // fetch data from geoserver WFS
    const wfsUrl = "http://localhost:8080/geoserver/fietsmeister/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=fietsmeister%3Ablokkages&outputFormat=application%2Fjson";
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
          if (display.state == 'default') {
            displayInfoMenu(point_id, latlng);
          };
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