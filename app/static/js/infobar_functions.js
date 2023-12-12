const closeButtonElement = document.getElementById("close-info-button");
const postedByTextElement = document.getElementById("posted-by-text");
const markedTrueTextElement = document.getElementById("marked-true-text");
const markedFalseTextElement = document.getElementById("marked-false-text");
const buttonsContainerElement = document.getElementById('mark-true-false-buttons-container');
const alreadyMarkedTextElement = document.getElementById('already-marked-text');
const markTrueElement = document.getElementById('mark-true');
const markFalseElement = document.getElementById('mark-false');


async function displayPointInfo(point_id, latlng) {
  changeMapSize();

  // Center the map on the clicked marker and zoom in
  map.setView(latlng, 18);

  // Add event listener to 'close' button
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
    postedByTextElement.textContent = `${featureInfo.days_ago} dagen geleden gepost door ${featureInfo.username}`;
    markedTrueTextElement.textContent = `${featureInfo.marked_true} keer gemarkeerd als kloppend`;
    markedFalseTextElement.textContent = `${featureInfo.marked_false} keer gemarkeerd als niet kloppend`;

    userAlreadyMarkedFeature = await hasUserAlreadyMarkedFeature(point_id)
    if (userAlreadyMarkedFeature) {
      alreadyMarkedTextElement.style.display = "inline";
      buttonsContainerElement.style.display = "none";
    } else {
      alreadyMarkedTextElement.style.display = "none";
      buttonsContainerElement.style.display = "flex";

      addButtonEventListener(markTrueElement, point_id, latlng, true);
      addButtonEventListener(markFalseElement, point_id, latlng, false);
    }

    // Display info div
    const infoElement = document.getElementById("info");
    infoElement.classList.add('move-up'); // Play animation
  } catch (error) {
    console.error("Error fetching or processing feature info:", error);
  }
}

function changeMapSize() {
  const newHeight = window.innerHeight * 0.75;
  map.getContainer().style.height = `${newHeight}px`;
  map.invalidateSize();
}

async function hasUserAlreadyMarkedFeature(point_id) {
  userInfo = await getCurrentUserInfo() // Update current user info
  return userInfo.marked_points.includes(parseInt(point_id));
}

async function addButtonEventListener(Button, point_id, latlng, markedTrue) {  
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
        hidePointInfo();
        displayPointInfo(point_id, latlng);
      })
      .catch(error => {
        console.error('Error in point marking', error);
      });
  });
}

// Function to hide the information about the clicked point
function hidePointInfo() {
  // Adjust the height of the map container back to 100%
  map.getContainer().style.height = `100%`;
  map.invalidateSize();

  // Hide info div
  const infoElement = document.getElementById("info");
  infoElement.classList.remove("move-up");
}