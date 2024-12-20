// Set some variables used by different parts of the code
let map = null;
let userInfo = null;
let blokkagesLayer = null;
const display = new Display();
const minZoom = 7;
const maxZoom = 17;

async function main(){
  // Create map
  map = L.map("map").setView([51.6951, 5.333135], 16);
  
  // Restrict map boundaries
  var bounds = [
    [50.7500, 3.2000], // Southwest corner
    [53.7000, 7.2000]  // Northeast corner
  ];
  map.setMaxBounds(bounds);
  map.setMaxZoom(maxZoom); 
  map.setMinZoom(minZoom); 
  
  // Create basemap and add to map
 L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    minZoom: minZoom - 1,
    maxZoom: maxZoom + 1,
    bounds: bounds,
    attribution: '© OpenStreetMap'
  }).addTo(map);

  // Fetch user info from flask API
  userInfo = await getCurrentUserInfo();

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

    // If user is in info menu or the settings menu, bring them back to the home page if they click on the map.
    else if (display.state == 'info-menu' || display.state == 'settings') {
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
    // fetch data from flask
    const response = await fetch("/api/getblokkagesgeojson");
    const data = await response.json();
    
    // Remove blokkageslayer if already exists
    if (blokkagesLayer) {
      map.removeLayer(blokkagesLayer);
    }
    
    // add updated blokkkageslayer
    blokkagesLayer = L.geoJSON(data, {
      pointToLayer: function (feature, latlng) {
        const marker = L.marker(latlng, { icon: getBlokkeringIcon() });
        const point_id = feature.properties.id
        
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