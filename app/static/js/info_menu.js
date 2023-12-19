// Get some needed HTML Elements.
const markTrueButton = document.getElementById('mark-true');
const markFalseButton = document.getElementById('mark-false');

// Set some global click handler pointers.
let buttonHandlers = {
  markTrue: null,
  markFalse: null
};


async function displayInfoMenu(point_id, latlng) {

  // Add event listener to 'close' button.
  document.getElementById("close-info-button").addEventListener('click', function () {
    display.switch_to('default');
  });
  
  try {
    // Fetch feature info from Flask api.
    const blokkageInfoAPI = `http://127.0.0.1:8080/api/blokkageinfo/${point_id}`;
    const response = await fetch(blokkageInfoAPI);
    if (!response.ok) {
      throw new Error(`Failed to fetch data. Status: ${response.status}`);
    }
    const featureInfo = await response.json();
    
    // Set text inside info-menu to info fetched from API.
    document.getElementById("posted-by-text").textContent = `${featureInfo.days_ago} dagen geleden gepost door ${featureInfo.username}`;
    document.getElementById("marked-true-text").textContent = `${featureInfo.marked_true} keer gemarkeerd als kloppend`;
    document.getElementById("marked-false-text").textContent = `${featureInfo.marked_false} keer gemarkeerd als niet kloppend`;
    
    // Get elements for buttons to mark button true/false and text telling user they already marked point.
    const alreadyMarkedTextElement = document.getElementById('already-marked-text');
    const buttonsContainerElement = document.getElementById('mark-true-false-buttons-container');

    // Refresh user info. This is done to check if user marked this point just now.
    userInfo = await getCurrentUserInfo();

    // Check if ID of current point is already in user's marked point. Meaning user already marked point.
    if (userInfo.marked_points.includes(parseInt(point_id))) {
      // If true, user is not allowed to mark point. Hide mark buttons and display text to inform user they already marked point.
      alreadyMarkedTextElement.style.display = "inline";
      buttonsContainerElement.style.display = "none";
    } else {
      // If false, show mark buttons.
      alreadyMarkedTextElement.style.display = "none";
      buttonsContainerElement.style.display = "flex";

      // Remove old event listeners from mark buttons and add new event listeners.
      await updateButtonEventListener(markTrueButton, 'markTrue', point_id, latlng, true);
      await updateButtonEventListener(markFalseButton, 'markFalse', point_id, latlng, false);
    }

    // Display info div.
    display.switch_to('info-menu');
    // Center the selected marker
    map.setView(latlng, 18);

  } catch (error) {
    console.error("Error fetching or processing feature info:", error);
  }

  async function updateButtonEventListener(buttonElement, handlerKey, point_id, latlng, markedTrue) {  

    // Remove old listener if it exists.
    if (buttonHandlers[handlerKey]) {
      buttonElement.removeEventListener('click', buttonHandlers[handlerKey]);
      buttonHandlers[handlerKey] = null;
    }

    // Get API url.
    let apiURL = 'http://127.0.0.1:8080/api/';

    // Check if button is to mark true or mark false. update API accordingly.
    if (markedTrue) {
      apiURL += 'marktrue';
    } else {
      apiURL += 'markfalse';
    }
  
    // Create the click Handler.
    buttonHandlers[handlerKey] = function () {
      // Prepare the information about the new marking to be posted to the API.
      let markingInfo = {
          'blokkage_id': point_id,
          'user_id': userInfo.id,
      }

      // Post the prepared data to the API.
      fetch(apiURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(markingInfo)
      })
        .then(response => response.json())
        .then(data => {
          console.log('Point successfully marked', data);

          // Close and re-open the info-menu after user marked point. 
          // This is done so that the user sees the updated marked true/false counters and that the buttons to review get correctly removed.
          display.switch_to('default');
          displayInfoMenu(point_id, latlng);
        })
        .catch(error => {
          console.error('Error in point marking', error);
        });
    };
  
    // Add event listener to button and return the click handler for future removal.
    buttonElement.addEventListener('click', buttonHandlers[handlerKey]);
  }
}
