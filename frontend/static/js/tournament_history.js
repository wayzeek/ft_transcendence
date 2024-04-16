import { setupNavigationEventListeners, navigateAndReplace } from "./utils.js";
import { getCookie } from "./utils.js";
import { handleLogout } from "./utils.js";
import { loadText } from "./utils.js";
const csrftoken = getCookie('csrftoken');

function getHistory() {
    var username = localStorage.getItem('username');
    if (!username) {
        console.error("Username not found in local storage");
        handleLogout();
        return; // Ensure function exits here to prevent further execution
    }
    const tournaments_list = document.getElementById('list');
    // Set the loading message with animated dots and specific color
    var trad = i18next.t('fetch-block');
    tournaments_list.innerHTML = `<div class='loading'>${trad}<span>.</span><span>.</span><span>.</span></div>`;

    fetch(`/api/getHistory/${username}`)
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        tournaments_list.innerHTML = ''; // Clear the loading message
        
        // Displaying tournaments
        const tournaments = data.tournaments;
        if (tournaments && tournaments.length > 0) {
            tournaments.reverse();
            tournaments.forEach((tournament, index) => {
                
                let tournamentHTML = `<div class='tournament-history' data-bs-toggle="collapse" data-bs-target="#collapse${index}" aria-expanded="false" aria-controls="collapse${index}">`;
                
                // Split the tournament string into lines
                let lines = tournament.split('\n');
                let name = lines[0].split("Tournament ")[1];
                // Use the first line as the tournament name
                tournamentHTML += `<p>Tournament ${name} <span class="arrow">&#8595;</span></p>`; // Add arrow icon
                // Wrap the remaining lines in a collapsible div
                tournamentHTML += `<div class="collapse" id="collapse${index}">`;
                // Iterate over the remaining lines, starting from the second line
                for (let i = 1; i < lines.length; i++) {
                    let line = lines[i];
                    if (line.trim() !== '') {
                        tournamentHTML += `<div>${line}</div>`;
                    }
                }
                tournamentHTML += "</div>"; // Close the collapsible div
                tournamentHTML += "</div>"; // Close the tournament div
                tournaments_list.innerHTML += tournamentHTML;
            });
        } else if (!tournaments) {
            tournaments_list.innerHTML += "<div class='no-tournaments'>NO TOURNAMENT RESULTS</div>";
        }
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
        tournaments_list.innerHTML = "<div class='error'>Failed to fetch tournament history.</div>";
    });
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

loadText();

export async function init() {
    setupNavigationEventListeners(getHistory);
}
