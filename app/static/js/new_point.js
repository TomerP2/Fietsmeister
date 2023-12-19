// Globals to deal with the 'add point' button and its onclick event handler
const addPointButtonElement = document.getElementById('add-point-button');
let addPointClickHandler = null;

// Globals to deal with the 'dont add point' button and its onclick event handler
const dontAddPointButtonElement = document.getElementById('dont-add-point-button');
let dontAddPointClickHandler = null;

// Function to maybe create a new blokkage if user confirms point placement.
async function maybeAddNewPoint(latlng) {
  
  // Create preview marker to show user where point would be added.
  let previewMarker = L.marker(latlng, { icon: getNewBlokkeringIcon() }).addTo(map);

  // Zoom in to new point location
  map.setView(latlng, 18);

  // Remove old event listeners from 'add point' and 'dont add point' buttons if the event listeners exist.
  if (addPointClickHandler) {
    addPointButtonElement.removeEventListener('click', addPointClickHandler);
  }
  if (dontAddPointClickHandler) {
    dontAddPointButtonElement.removeEventListener('click', dontAddPointClickHandler);
  }

  // Get user-info to send user-id to API
  let userInfo = await getCurrentUserInfo()

  // Create new click handler for 'add point' button.
  addPointClickHandler = function () {
    // Send information about the new point to the API.
    fetch('http://127.0.0.1:8080/api/createblokkage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // Create the json-object with info to send to the api
        lat: latlng.lat,
        lng: latlng.lng,
        user_id: userInfo.id
      }),
    })
      .then(response => response.json())
      .then(data => {
        console.log('Server response:', data);
        // Close the edit menu after user submitted new point
        closeEditMenu();
      })
      .catch(error => {
        console.error('Error:', error);
      });
  };

  // Create new click handler for 'dont add point' button.
  dontAddPointClickHandler = function () {
    // When user clicks the 'dont add point' button, close the edit menu.
    closeEditMenu();
  };

  // add event listeners to activate appropriate click-handler when user clicks button.
  addPointButtonElement.addEventListener('click', addPointClickHandler);
  dontAddPointButtonElement.addEventListener('click', dontAddPointClickHandler);

  // Display the 'add new point?' confirmation menu.
  display.switch_to('new-point-confirmation-menu');

  // Function for closing the edit menu
  function closeEditMenu() {
    // Remove the preview point created to display where real point would go.
    map.removeLayer(previewMarker);
  
    // Toggle report mode back off
    display.switch_to('default');
    
    // Update blokkages layer to include new point if it was added.
    addOrUpdateBlokkagesLayer();
  }
}
