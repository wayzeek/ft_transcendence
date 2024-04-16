import { setupNavigationEventListeners } from "./utils.js";
import { setStatus } from "./utils.js";
import { handleLogout } from "./utils.js";
import { loadText } from "./utils.js";
import { updateLanguageBackend } from "./utils.js";

// now that the user is connected if language is set, send it to the backend
if (localStorage.getItem('username') && localStorage.getItem('i18nextLng')) {
    const username = localStorage.getItem('username');
    const language = localStorage.getItem('i18nextLng');
    await updateLanguageBackend(username, language);
}

if (localStorage.getItem('i18nextLng')) {
    i18next.changeLanguage(localStorage.getItem('i18nextLng'), async function (err, t) {
        if (err) return console.log('something went wrong loading', err);
       
                });
    loadText();
}

var logoutButton = document.getElementById('logoutButton');

async function setTitle() {
    const usernameFromStorage = localStorage.getItem('username');
    if (usernameFromStorage) {
        const titleElement = document.querySelector('.connection-title');
        if (titleElement)
        {
            var trad = i18next.t('welcome');
            titleElement.textContent = trad + usernameFromStorage;
        }
    } else {
        console.error('No username found in local storage');
        handleLogout();
    }
    setStatus('online');
}

logoutButton.addEventListener('click', handleLogout);

export async function init() {
    setupNavigationEventListeners(setTitle);
}
	
loadText();

// update language for the user on click
document.getElementById('french').addEventListener('click', function() {
    i18next.changeLanguage('fr', async function (err, t) {
        if (err) return console.log('something went wrong loading', err);
        localStorage.setItem('i18nextLng', 'fr');

        const username = localStorage.getItem('username');
        if (username) {
            await updateLanguageBackend(username, 'fr');
        } else {
            console.error('No username found in local storage');
            handleLogout();
        }

        loadText();
        await setTitle();
    });
});

document.getElementById('italian').addEventListener('click', function() {
    i18next.changeLanguage('it', async function (err, t) {
        if (err) return console.log('something went wrong loading', err);
        localStorage.setItem('i18nextLng', 'it');

        const username = localStorage.getItem('username');
        if (username) {
            await updateLanguageBackend(username, 'it');
        } else {
            console.error('No username found in local storage');
            handleLogout();
        }

        loadText();
        await setTitle();
    });
});

document.getElementById('english').addEventListener('click', function() {
    i18next.changeLanguage('en', async function (err, t) {
        if (err) return console.log('something went wrong loading', err);
        localStorage.setItem('i18nextLng', 'en');

        const username = localStorage.getItem('username');
        if (username) {
            await updateLanguageBackend(username, 'en');
        } else {
            console.error('No username found in local storage');
            handleLogout();
        }

        loadText();
        setTitle();
    });
});