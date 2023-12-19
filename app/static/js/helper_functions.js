// Function to get the ID of currently logged in user
async function getCurrentUserInfo() {
  try {
    const response = await fetch('/api/currentuserinfo/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (data.error) {
      console.error('Error:', data.error);
    } else {
      console.log('User Info:', data);
      return data;
    }
  } catch (error) {
    console.error('Error fetching current user info:', error);
  }
}

// Functions to get different blokkering icons
function getBlokkeringIcon() {
  return createIcon("/static/png/blokkering_icon_groot.png");
}

function getNewBlokkeringIcon() {
  return createIcon("/static/png/new_blokkering_icon.png");
}

function createIcon(iconURL) {
  return L.icon({
    iconUrl: iconURL,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
}

function displayMenuElement(menu) {
  // Get neccesary html-elements.
  const reportButtonElement = document.getElementById('report-button');
  const reportTextElement = document.getElementById('report-text');
  const cancelReportButtonElement = document.getElementById('cancel-report-button');
  const infoElement = document.getElementById('info');
  const newPointConfirmationMenuElement = document.getElementById('new-point-confirmation-menu');

  // Hide all elements. 
  reportButtonElement.style.display = 'none';
  reportTextElement.style.display = 'none';
  cancelReportButtonElement.style.display = 'none';
  infoElement.classList.remove('move-up');
  newPointConfirmationMenuElement.classList.remove('move-up');

  switch(menu){
    // Show only the elements belonging to the chosen menu.
    case 'default':
      reportButtonElement.style.display = 'block';
      break;
    
    case 'report-mode':
      reportTextElement.style.display = 'block';
      cancelReportButtonElement.style.display = 'block';
      break;
    
    case 'info-menu':
      infoElement.classList.add('move-up');
      break;
    
    case 'new-point-confirmation-menu':
      newPointConfirmationMenuElement.classList.add('move-up');
      break;
  }
}