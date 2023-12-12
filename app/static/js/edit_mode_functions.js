const newPointConfirmationMenuElement = document.getElementById('new-point-confirmation-menu');
const addPointButtonElement = document.getElementById('add-point-button');
const dontAddPointButtonElement = document.getElementById('dont-add-point-button');
let tempMarker = null;
const newBlokkeringIcon = createNewBlokkeringIcon();

function toggleReportMode(on) {
  console.log(`report mode toggled: ${on}`);
  if (on) {
    reportModeEnabled = true;
    displayMenuElement('report-mode')
  } else{
    reportModeEnabled = false;
    displayMenuElement('default')
  }
}

function createBlokkage(latlng) {
  tempMarker = L.marker(latlng, { icon: newBlokkeringIcon }).addTo(map);
  temporaryPointActive = true;
  map.setView(latlng, 18);
  showConfirmationMenu(latlng);
}

function showConfirmationMenu(latlng) {
  addPointButtonElement.addEventListener('click', function () {
    addPointToDatabase(latlng);
  });

  dontAddPointButtonElement.addEventListener('click', function () {
    closeEditMode();
  });

  displayMenuElement('new-point-confirmation-menu');
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
      closeEditMode();
    })
    .catch(error => {
      console.error('Error:', error);
    });
}

function closeEditMode() {
  map.removeLayer(tempMarker);
  toggleReportMode(false);
  temporaryPointActive = false;
  addOrUpdateBlokkagesLayer();
}
