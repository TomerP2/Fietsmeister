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
  const wfsUrl = "http://localhost:8181/geoserver/fietsmeister/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=fietsmeister%3Ablokkages&outputFormat=application%2Fjson";
  addGeoJSONToMap(map, wfsUrl, BlokkeringIconGroot);
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

    L.geoJSON(data, {
      pointToLayer: function (feature, latlng) {
        return L.marker(latlng, { icon: icon });
      },
    }).addTo(map);
  } catch (error) {
    console.error("Error fetching or processing GeoJSON:", error);
  }
}

main();