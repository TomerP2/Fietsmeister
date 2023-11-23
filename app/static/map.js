function main(){
  // Initialize the map
  const map = L.map("map").setView([51.6951, 5.333135], 16);

  // Add OpenStreetMap tile layer
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap",
  }).addTo(map);

  // Create BlokkeringIconGroot icon
  const BlokkeringIconGroot = createBlokkeringIcon();

  // Set up event listener for map location
  map.locate({ setView: true });

  // Fetch and add GeoJSON data to the map
  const wfsUrl = "http://localhost:8181/geoserver/fietsmeister/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=fietsmeister%3Ablokkages&outputFormat=application%2Fjson";
  addGeoJSONToMap(map, wfsUrl, BlokkeringIconGroot);
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