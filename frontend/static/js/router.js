let isPopstateEvent = false;

const routes = {
    '/index': async () => {
        await loadPage('/html/index.html', ['/js/index.js'], );
    },
    '/login': async () => {
        await loadPage('/html/login.html', ['/js/login.js'], );
    },
    '/register': async () => {
        await loadPage('/html/register.html', ['/js/register.js'], );
    },
    '/menu': async () => {
        await loadPage('/html/menu.html', ['/js/menu.js'], );
    },
    '/profile': async () => {
        await loadPage('/html/profile.html', ['/js/profile.js'], );
    },
    '/quick_play': async (additionalInfo) => {
        await loadPage('/html/pong.html', ['/js/pong/pong.js'], additionalInfo);
    },
    '/two_players': async () => {
        await loadPage('/html/login_game.html', ['/js/login_game.js'], );
    },
    '/launch_game': async (additionalInfo) => {
        await loadPage('/html/pong.html', ['/js/pong/pong.js'], additionalInfo);
    },
    '/tournament': async (additionalInfo) => {
        await loadPage('/html/tournament.html', ['/js/tournament/tournament.js'], additionalInfo);
    },
    '/login_tournament' : async () => {
        await loadPage('/html/login_tournament.html', ['/js/tournament/login_tournament.js'], );
    },
    '/social': async () => {
        await loadPage('/html/social.html', ['/js/social.js'], );
    },
    '/profile_friend': async () => {
        await loadPage('/html/profile_friend.html', ['/js/profile_friend.js']);
    },
    '/history': async () => {
        await loadPage('/html/history.html', ['/js/history.js']);
    },
    '/tournament_history': async () => {
        await loadPage('/html/tournament_history.html', ['/js/tournament_history.js']);
    },
};


async function navigate(path, additionalInfo) {
    // Define an array of paths that do not require token validation
    const publicPages = ['/index', '/login', '/register'];
    const csrftoken = getCookie('csrftoken');

    // Only check the token if the path is not a public page
    if (!publicPages.includes(path)) {
        // Check if the token is valid
        const isValidToken = await checkValidToken();
	username = localStorage.getItem('username');
        // Redirect based on the validation result
        if (!isValidToken) {
            // Token is invalid or expired, remove it and redirect to the login page
            fetch(`api/set_offline/${username}/`, {
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
            localStorage.removeItem('auth_token');
            navigate_to('/index');
        } else {
            navigate_to(path, additionalInfo);
        }
    }
    else {
        const token = localStorage.getItem('auth_token');
        // If user not logged in, give him access to public pages
        if (!token)
        {
            navigate_to(path);
        }
        // If user is already logged in, redirect him to the menu
        else
        {
            navigate_to('/menu');
        }
    }
}

function getCookie(name) {
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

async function navigate_to(path, additionalInfo) {
    const routeHandler = routes[path];
    if (routeHandler) {
        // Dispatch a custom event to remove the event listener from the current page
        const removeListenerEvent = new CustomEvent('removeNavigateListener');
        window.dispatchEvent(removeListenerEvent);

        // Push the state to the history stack
        if (!isPopstateEvent) {
            history.pushState({ path: path }, "", path);
        }

        // Await the completion of the routeHandler
        await routeHandler(additionalInfo);

        // Create a custom event for navigating
        const navEvent = new CustomEvent('navigate', { detail: { path: path } });

        // Dispatch the event once the page is loaded
        window.dispatchEvent(navEvent);

        // Reset the flag after handling the navigation
        isPopstateEvent = false;
    } else {
        console.error('Route not found:', path);
    }
}


window.addEventListener('popstate', function(event) {
    isPopstateEvent = true;
    // Check if the event has state associated with it
    if (event.state) {
        // Retrieve the path from the state object
        const path = event.state.path;
        // Call navigate_to with the retrieved path
        navigate(path);
    } else {
        // If there's no state, it's possible the user landed on the page directly
        window.location.reload();
    }
});

async function loadPage(page, jsModulePaths, additionalInfo) {
    try {
        const response = await fetch(page);
        const html = await response.text();
        document.body.innerHTML = html;

        if (jsModulePaths && jsModulePaths.length >  0) {
            // Load all modules concurrently
            const modules = await Promise.all(jsModulePaths.map(async (path) => {
                // Append a cache-busting query parameter
                const cacheBustingParam = `?t=${Date.now()}`;
                const modulePath = path + cacheBustingParam;
                return import(modulePath);
            }));
            // Execute init functions if they are defined, passing additionalInfo
            modules.forEach(module => {
                if (typeof module.init === 'function') {
                    module.init(additionalInfo);
                }
            });
        }
    } catch (error) {
        console.error('Error fetching page:', error);
    }
}

async function checkValidToken() {
    var token = localStorage.getItem('auth_token');
    if (token) {
        var response = await fetch('/api/verify_token', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token,
            },
        });

        // Return true if the token is valid, false otherwise
        return response.ok;
    }
    return false;
}