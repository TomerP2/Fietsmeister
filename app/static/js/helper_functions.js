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
function createBlokkeringIcon() {
  return createIcon("/static/png/blokkering_icon_groot.png");
}

function createNewBlokkeringIcon() {
  return createIcon("/static/png/new_blokkering_icon.png");
}

function createIcon(iconURL) {
  return L.icon({
    iconUrl: iconURL,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
}