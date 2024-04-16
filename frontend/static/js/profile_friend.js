import { setupNavigationEventListeners } from "./utils.js";
import { searchedHistory } from "./utils.js";
import { searchUser } from "./utils.js";
import { getCookie } from "./utils.js";
import { handleLogout } from "./utils.js";
import { loadText } from "./utils.js";
const csrftoken = getCookie('csrftoken');


function getFriendInfo() {
	loadText();
	var friend_username = localStorage.getItem('friend_username');
	if (!friend_username)
	{
		console.error("Friend username not found in local storage");
		handleLogout();
	}
	searchUser(friend_username)
	.then(user => {
		var translation = i18next.t('profile-title');
		if (translation === "'S PROFILE")
			document.querySelector('.profile-title').textContent = user.username + translation;
		else
			document.querySelector('.profile-title').textContent = translation + user.username;
		translation = i18next.t('username');
		document.querySelector('.name').textContent = translation + ': ' + user.username;
		translation = i18next.t('played');
		document.querySelector('.played').textContent = translation + user.games_played;
		translation = i18next.t('won');
		document.querySelector('.won').textContent = translation + user.games_won;
		translation = i18next.t('lost');
		document.querySelector('.lost').textContent = translation + user.games_lost;
	})
	.catch(error => {
		console.error('No user found', error);
	});
	

	const profile_img = document.getElementById('profile_img');
	fetch(`/api/getFriendImg/${friend_username}`)
	.then(response => {
    	if (!response.ok) {
     	   throw new Error('Response has a problem');
    	}
		return response.blob();
	})
	.then(blob => {
	    const url = URL.createObjectURL(blob);
		profile_img.src = url;
	})
	.catch(error => {
	    console.error('Error while accessing image: ', error);
	});
}

const historyButton = document.getElementById('history_button');
historyButton.addEventListener('click', function() {
	var friend_username = localStorage.getItem('friend_username');
	if (!friend_username)
	{
		console.error("Friend username not found in local storage");
		handleLogout();
	}
	searchedHistory(friend_username);
});

export async function init() {
    setupNavigationEventListeners(getFriendInfo);
}
