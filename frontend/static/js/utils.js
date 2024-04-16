// Get a cookie from the browser
export function getCookie(name) {
	let cookieValue = null;
	if (document.cookie && document.cookie !== '') {
		const cookies = document.cookie.split(';');
		for (let i = 0; i < cookies.length; i++) {
			const cookie = cookies[i].trim();
			if (cookie.substring(0, name.length + 1) === (name + '=')) {
				cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
				break;
			}
		}
	}
	return cookieValue;
}

// Return the current user's details in a JSON object
export async function getCurrentUserInfo() {
	var token = localStorage.getItem('auth_token');
	if (token) {
		var responseUser = await fetch('/api/getCurrentUser', {
			method: 'GET',
			headers: {
				'Authorization': 'Bearer ' + token,
			},
		});
		if (responseUser.ok) {
			var userDetails = await responseUser.json();
			return userDetails;
		}
		else {
			console.error("Error getting user details");
			localStorage.removeItem('auth_token');
			navigate('/index');
		}
	}
}


// Search for a user by username
export function searchUser(username) {
	return fetch(`/api/getUserByUsername/${username}`)
		.then(response => {
			if (!response.ok) {
				throw new Error(`Error looking for user ${username}`);
			}
			return response.json();
		})
		.then(data => {
			return data;
		})
		.catch(error => {
			console.error(`Error looking for user ${username}:`, error);
			throw error;
		});
}

export function setupNavigationEventListeners(callbackFunction) {
    // Add event listener to the navigate event
    window.addEventListener('navigate', callbackFunction);

	window.addEventListener('popstate', function() {
		window.addEventListener('navigate', callbackFunction);
	});
		
    // Listen for a custom event to remove the event listener
    window.addEventListener('removeNavigateListener', function() {
        window.removeEventListener('navigate', callbackFunction);
    });

	window.addEventListener('beforeunload', function(e) {
		if (!window.location.href.includes('index')) {
			e.preventDefault();
			e.returnValue = '';
			setStatus('offline');
		}
	});
}

export function searchedHistory(username) {
	localStorage.setItem('searched_user', username);
	navigate('/history');
}

export async function setStatus(status) {
	const csrftoken = getCookie('csrftoken');
	const response = await fetch(`api/update_status/${status}/`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': csrftoken,
        },
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Error during update");
        }
            return response.json();
    })
    .then(data => {
        if (data.status === 'error') {
        	//console.log(data.message);
        }
    })
    .catch(error => {
        console.error('Error updating status:', error);
    });
}

export function handleLogout() {
    localStorage.removeItem('username');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('isSentToBlockchain');
	localStorage.removeItem('searched_user');
	localStorage.removeItem('friend_username');
    setStatus('offline');
    navigate('/index');
}

export function loadText() {
    var i18nList = document.querySelectorAll('[data-i18n]');
    i18nList.forEach(function(element) {
        var key = element.dataset.i18n;
        var translation = i18next.t(key);
        element.textContent = translation;
    });
}

export async function updateLanguageBackend(username, language) {
	const data = {
		username: username,
		language: language
	};

	const csrftoken = getCookie('csrftoken');
	try {
		const response = await fetch(`api/update_user_language/`, {
			method: 'PATCH',
			headers: {
				'X-CSRFToken': csrftoken,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(data),
		});
		// Handle the response here
	}
	catch (error) {
		console.error('Error updating language:', error);
	}
}

export function navigateAndReplace(url) {
    // Replace the current history entry with the new URL
	navigate(url);
    history.replaceState(null, '', url);
    // Optionally, navigate to the new URL if you need to update the content
}
