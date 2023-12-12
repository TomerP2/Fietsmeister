const newPointConfirmationMenuElement = document.getElementById('new-point-confirmation-menu');
const addPointButtonElement = document.getElementById('add-point-button');
const dontAddPointButtonElement = document.getElementById('dont-add-point-button');
let tempMarker = null;
const newBlokkeringIcon = createNewBlokkeringIcon();

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
}

function createBlokkage(latlng) {
  tempMarker = L.marker(latlng, { icon: newBlokkeringIcon }).addTo(map);
  map.setView(latlng, 18);
  showConfirmationMenu(latlng);
}

function showConfirmationMenu(latlng) {
  addPointButtonElement.addEventListener('click', function () {
    addPointToDatabase(latlng);
    closeEditMode();
  });

  dontAddPointButtonElement.addEventListener('click', function () {
    closeEditMode();
  });

  newPointConfirmationMenuElement.classList.add('move-up');
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
  newPointConfirmationMenuElement.classList.remove('move-up');
  toggleEditMode(false);
  addOrUpdateBlokkagesLayer();
}
