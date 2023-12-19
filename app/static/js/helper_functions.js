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

class Display {
  constructor() {
    // Get necessary HTML elements during instantiation.
    this.reportButtonElement = document.getElementById('report-button');
    this.reportTextElement = document.getElementById('report-text');
    this.cancelReportButtonElement = document.getElementById('cancel-report-button');
    this.infoElement = document.getElementById('info');
    this.newPointConfirmationMenuElement = document.getElementById('new-point-confirmation-menu');

    // Create a variable to keep track of what is being displayed
    this.state = 'default';
  }

  switch_to(menu) {
    // Hide all elements.
    this.reportButtonElement.style.display = 'none';
    this.reportTextElement.style.display = 'none';
    this.cancelReportButtonElement.style.display = 'none';
    this.infoElement.classList.remove('move-up');
    this.newPointConfirmationMenuElement.classList.remove('move-up');

    // Show only the elements belonging to the chosen menu.
    switch (menu) {
      case 'default':
        // Set map height to fullscreen.
        this._scale_map_container(100)

        // Show 'report' button.
        this.reportButtonElement.style.display = 'block';
        break;

      case 'report-mode':
        this.reportTextElement.style.display = 'block';
        this.cancelReportButtonElement.style.display = 'block';
        break;

      case 'info-menu':
        // Change map size so it fits the part above the info-window.
        // This is done so that the point is centered correctly in the remaining space.
        this._scale_map_container(75)

        // Show info window.
        this.infoElement.classList.add('move-up');
        break;

      case 'new-point-confirmation-menu':
        this.newPointConfirmationMenuElement.classList.add('move-up');
        break;
    }

    // Update the state variable.
    this.state = menu
  }

  // Function to change the map container size.
  _scale_map_container(percentage) {
    map.getContainer().style.height = `${percentage}%`;
    map.invalidateSize();
  }
}