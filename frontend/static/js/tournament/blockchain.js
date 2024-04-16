import { getCookie } from "../utils.js";

const csrftoken = getCookie('csrftoken');
const auth_token = localStorage.getItem('auth_token');

export async function sendScoreToBlockchain(endObject) {
    try {
        const endGame = document.getElementById('endGame');
        const winnerTournament = document.getElementById('winnerTournament');
        const endGameButton = document.getElementById('endGameButton');
        const infoFieldEndGame = document.getElementById('infoFieldEndGame');
        const homeButton = document.querySelector(".endGame span:last-child"); // Assuming the Home button is the last span in the endGame div

        // Hide elements and show animated loading message
        winnerTournament.style.display = 'none';
        endGameButton.style.display = 'none';
        homeButton.style.display = 'none'; // Hide the Home button

        var trad = i18next.t("block1");
        infoFieldEndGame.innerHTML = trad + '<span class="dot">.</span><span class="dot">.</span><span class="dot">.</span>';

        // Send the score to your backend
        const response = await fetch('/api/send_text_to_blockchain/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken,
                'Authorization': 'Bearer ' + auth_token,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to send score to blockchain');
        }

        if (endObject.value) {
            console.error('Page left before transaction was confirmed');
            return;
        }

        const data = await response.json();
        const explorerUrl = data.transaction_url;

        // Update info field with success message and styled transaction link
        var trad2 = i18next.t("block2");
        infoFieldEndGame.innerHTML = trad2 + `<a class="view-link" href="${explorerUrl}" target="_blank">View</a>`;

        // Append the 'Next' button
        const nextButton = document.createElement('span');
        nextButton.className = 'button';
        nextButton.textContent = 'Next';
        nextButton.onclick = () => {
            winnerTournament.style.display = '';
            endGameButton.style.display = '';
            homeButton.style.display = ''; // Show the Home button again
            infoFieldEndGame.innerHTML = '';
            endGame.removeChild(nextButton);
        };
        endGame.appendChild(nextButton);
    } catch (error) {
        console.error(error);
        infoFieldEndGame.innerHTML = 'Transaction failed!';
    }
}
