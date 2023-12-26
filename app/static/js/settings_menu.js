// Add click event to 'close' icon
document.getElementById('close-settings-menu-button').addEventListener('click', function(){
    display.switch_to('default');
})


// Add click event to log out button.
document.getElementById('log-out-button').addEventListener('click', function(){
    // Call the 'logout' function in the flask API.
    fetch('/auth/logout', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    console.log('User logged out.')
})