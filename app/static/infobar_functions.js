// Function to display information about the clicked point
async function displayPointInfo(point_id, userInfo, latlng, map) {
  // Adjust the height of the map container to x% of the viewport height
  const newHeight = window.innerHeight * 0.75;
  map.getContainer().style.height = `${newHeight}px`;
  map.invalidateSize();

  // Center the map on the clicked marker and zoom in
  map.setView(latlng, 18);

  // Add event listener to 'close' button
  const closeButtonElement = document.getElementById("close-info-button");
  closeButtonElement.addEventListener('click', function () {
    hidePointInfo(map);
  });

  try {
    // Fetch feature info from Flask api
    const blokkageInfoAPI = `http://127.0.0.1:8080/api/blokkageinfo/${point_id}`;
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

    // Create the 'mark true or false' section
    const buttonsContainerElement = document.getElementById('mark-true-false-buttons-container');
    const alreadyMarkedTextElement = document.getElementById('already-marked-text');

    if (userInfo.marked_points.includes(parseInt(point_id))) {
      alreadyMarkedTextElement.style.display = "inline";
      buttonsContainerElement.style.display = "none";
    } else {
      alreadyMarkedTextElement.style.display = "none";
      buttonsContainerElement.style.display = "flex";

      const markTrueElement = document.getElementById('mark-true');
      addButtonEventListener(markTrueElement, point_id, true, map, latlng, userInfo);
      const markFalseElement = document.getElementById('mark-false');
      addButtonEventListener(markFalseElement, point_id, false, map, latlng);
    }

    // Display info div
    const infoElement = document.getElementById("info");
    infoElement.classList.add('move-up'); // Play animation
  } catch (error) {
    console.error("Error fetching or processing feature info:", error);
  }
}

async function addButtonEventListener(Button, point_id, markedTrue, map, latlng, userInfo) {
  let apiURL = 'http://127.0.0.1:8080/api/';
  if (markedTrue) {
    apiURL += 'marktrue';
  } else {
    apiURL += 'markfalse';
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
        'user_id': userInfo.id,
      })
    })
      .then(response => response.json())
      .then(data => {
        console.log('Point succesfully marked', data);
        hidePointInfo(map);
        displayPointInfo(point_id, latlng, map);
      })
      .catch(error => {
        console.error('Error in point marking', error);
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
  infoElement.classList.remove("move-up");
}
