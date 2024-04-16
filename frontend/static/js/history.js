import { setupNavigationEventListeners, navigateAndReplace } from "./utils.js";
import { getCookie } from "./utils.js";
import { handleLogout } from "./utils.js";
import { loadText } from "./utils.js";
const csrftoken = getCookie('csrftoken');

function getHistory() {
    var current_user = localStorage.getItem('username');
    var username = localStorage.getItem('searched_user');
    if (!current_user || !username) {
        console.error("Username not found in local storage");
        handleLogout();
        return;
    }
    const titleElement = document.getElementById('title');
    if (titleElement) {
        titleElement.innerHTML = username === current_user ? 'MY GAME HISTORY' : `${username}'S HISTORY`;
    }
    if (username === current_user)
    {
	    var translation = i18next.t('my-history');
        document.getElementById('title').innerHTML = translation;
    } else {
	    var translation = i18next.t('other-history');
        if (translation === "'S HISTORY")
            document.getElementById('title').innerHTML = username + translation;
        else
            document.getElementById('title').innerHTML = translation + username;
    }

    const games_list = document.getElementById('list');
    if (games_list) {
	    var translation = i18next.t('fetch');
        games_list.innerHTML = `<div class='loading'>${translation}<span>.</span><span>.</span><span>.</span></div>`;
    }

    fetch(`/api/getHistory/${username}`)
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        if (games_list) {
            games_list.innerHTML = ''; // Clear the loading message
        
            const games = data.games;
            if (games && games.length > 0) {
                games.forEach(game => {
                    let adversName = game.advers === '0' ? 'AI' : (game.advers === '-1' ? 'GUEST' : game.advers);
                    let gameOutcomeClass = game.win === 'True' ? 'win' : 'loose';
                    games_list.innerHTML += `<div id='game_div_${game.id}' class='games ${gameOutcomeClass}'><span class="game">&emsp;${game.date}&emsp;${game.player}&ensp;${game.score_player}-${game.score_advers}&ensp;${adversName}&emsp;</span></div>`;
                });
            } else {
	            var translation = i18next.t('no-game');
                games_list.innerHTML = `<div class='no-games'>${translation}</div>`;
            }
        }
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
        if (games_list) {
            games_list.innerHTML = "<div class='error'>Failed to fetch game history.</div>";
        }
    });
    loadText();
}

// Initialize the collapse feature
var collapseElementList = [].slice.call(document.querySelectorAll('.collapse'))
var collapseList = collapseElementList.map(function (collapseEl) {
    return new bootstrap.Collapse(collapseEl, {
        toggle: false
    })
})

// Add event listener to toggle arrow direction on collapse
document.querySelectorAll('.tournament').forEach(function(tournamentDiv) {
    var collapseTarget = document.querySelector(tournamentDiv.getAttribute('data-bs-target'));
    collapseTarget.addEventListener('show.bs.collapse', function() {
        tournamentDiv.classList.add('collapsed');
    });
    collapseTarget.addEventListener('hide.bs.collapse', function() {
        tournamentDiv.classList.remove('collapsed');
    });
});

const returnButton = document.getElementById('return');
returnButton.addEventListener('click', function() {
	if (localStorage.getItem('friend_username'))
        navigateAndReplace('/profile_friend');
	else
        navigateAndReplace('/profile');
});

export async function init() {
    setupNavigationEventListeners(getHistory);
}
