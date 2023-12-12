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
