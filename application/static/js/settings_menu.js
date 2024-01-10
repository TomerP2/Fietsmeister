// Add click event to 'close' icon
document.getElementById('close-settings-menu-button').addEventListener('click', function(){
    display.switch_to('default');
})


// Add click event to log out button.
document.getElementById('log-out-button').addEventListener('click', async function() {
    try {
        const response = await fetch('/auth/logout', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            const result = await response.json();

            // Check the status in the JSON response.
            if (result.status === 'success') {
                // Redirect the user to the home page.
                window.location.href = '/';
            } else {
                console.error('Logout failed:', result.message);
            }
        } else {
            console.error('Logout failed:', response.status, response.statusText);
        }
    } catch (error) {
        console.error('Error during logout:', error);
    }
});