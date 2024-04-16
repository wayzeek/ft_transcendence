import { setupNavigationEventListeners, navigateAndReplace } from "./utils.js";
import { searchedHistory } from "./utils.js";
import { getCookie } from "./utils.js";
import { handleLogout } from "./utils.js";
import { searchUser } from "./utils.js";
import { loadText } from "./utils.js";

const csrftoken = getCookie('csrftoken');
const backButtonElem = document.getElementById('backButton');

loadText();
localStorage.removeItem('friend_username');

backButtonElem.addEventListener('click',() => {
	navigateAndReplace('/menu')
});

function getUserInfo() {
	// Get the username from local storage
	var username = localStorage.getItem('username');
	if (username) {
		fetch('/api/user_42/')
		.then(response => response.json())
		.then(data => {
			if (data.is_42 == true)
			{
				document.getElementById('username_42').innerHTML = '<p id="user42" class="data username_42"></p>';
				document.getElementById('user42').textContent = i18next.t('username');
				document.querySelector('.username_42').textContent += ': ' + username;
				document.getElementById('password_button').style.display = 'none';
			} else {
				var translation = i18next.t('username');
				document.querySelector('.name').textContent = translation + ': ';
				document.getElementById('username').value = username;
			}
		})
  	} else {
  		console.error("Username not found in local storage");
        handleLogout();
	}
	searchUser(username)
	.then(user => {
		var translation = i18next.t('played');
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
    if (profile_img) {
        fetch('/api/getProfileImg/')
        .then(response => {
            if (!response.ok) {
                throw new Error('Response not ok');
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
}

var errorPdp = document.createElement('p');
errorPdp.style.color = 'red';
errorPdp.style.display = 'none';
document.getElementById('pdpForm').appendChild(errorPdp);

document.getElementById('pdpForm').addEventListener('submit', function(e) {
	e.preventDefault();

	const pdp_field = document.getElementById('select-pdp');
	if (pdp_field.files[0].type != 'image/jpeg' && pdp_field.files[0].type != 'image/png')
	{
		errorPdp.style.display = 'block';
		errorPdp.style.color = 'red';
		errorPdp.textContent = i18next.t('pdp-type');
	}
	else if (pdp_field.files[0].size >= 1048576)
	{
		errorPdp.style.display = 'block';
		errorPdp.style.color = 'red';
		errorPdp.textContent = i18next.t('pdp-size');
	}
	else
	{
		const formData = new FormData();
		//console.log(pdp_field.files[0]);
		formData.append('new_pdp', pdp_field.files[0]);
		fetch('/api/update_pdp/', {
	      	method: 'POST',
			headers: {
				'X-CSRFToken': csrftoken,
	       		},
	       		body: formData
	   	})
		.then(response => response.json())
	   	.then(data => {
			if (data.status === 'error') {
				errorPdp.style.display = 'block';
				errorPdp.style.color = 'red';
				if (i18next.exists(data.message))
					var msg = i18next.t(data.message);
				else
					var msg = data.message;
				errorPdp.textContent = msg;
			} else {
				errorPdp.style.display = 'none';
				getUserInfo();
			}
	  	 })
	}
});


var errorMessage = document.createElement('p');
errorMessage.style.color = 'red';
errorMessage.style.display = 'none';
document.getElementById('infoForm').appendChild(errorMessage);

document.getElementById('infoForm').addEventListener('submit', function(e) {
	e.preventDefault();
	var username_field = document.getElementById('username').value;
	var str = username_field;
	if (str.length >= 3 && str.charAt(str.length - 3) == '@' && str.charAt(str.length - 2) == '4' && str.charAt(str.length - 1) == '2') {
		errorMessage.style.display = 'block';
		errorMessage.style.color = 'red';
		errorMessage.textContent = i18next.t("user-42");
	}
	else if (str.length >= 30)
	{
		errorMessage.style.display = 'block';
		errorMessage.style.color = 'red';
		errorMessage.textContent = i18next.t("user-too-long");
	} else {
		fetch('/api/updateUser/', {
	        	method: 'POST',
	        	headers: {
				'Content-Type': 'application/json',
				'X-CSRFToken': csrftoken,
	        	},
	        	body: JSON.stringify({
				username: username_field,
				password: "null",
	   	 	})
	   	 })
		.then(response => response.json())
	   	.then(data => {
			if (data.status === 'error') {
				errorMessage.style.display = 'block';
				errorMessage.style.color = 'red';
				if (i18next.exists(data.message))
					var msg = i18next.t(data.message);
				else
					var msg = data.message;
				errorMessage.textContent = msg;
			} else {
				//console.log('User info updated:', data);
	        	localStorage.setItem('username', data.username);
				errorMessage.style.display = 'block';
				errorMessage.style.color = 'green';
				errorMessage.textContent = i18next.t("user-updated");
				getUserInfo();
			}
	   	 })
	   	 .catch(error => {
			console.error('Error updating user info:', error);
			errorMessage.style.display = 'block';
			errorMessage.style.color = 'red';
			if (i18next.exists(data.message))
				var msg = i18next.t(data.message);
			else
				var msg = data.message;
			errorMessage.textContent = msg;
	   	});
	}
});


const deletePdPButton = document.getElementById('delete-pdp');
deletePdPButton.addEventListener('click', function() {
	fetch(`api/deleteProfileImg`)
	.then(response => response.json())
	.then(data => {
		if (data.status === 'success') {
			errorPdp.style.display = 'none';
			//console.log(data.message);
			getUserInfo();
			getUserInfo();
			document.getElementById('select-pdp').value = "";
		} else {
			errorPdp.style.display = 'block';
			if (i18next.exists(data.message))
				var msg = i18next.t(data.message);
			else
				var msg = data.message;
			errorPdp.textContent = msg;
		}
	})
	.catch(error => {
		console.error('Error: ', error);
	});
});


const historyButton = document.getElementById('history_button');
historyButton.addEventListener('click', function() {
	var username = localStorage.getItem('username');
	if (!username)
	{
  		console.error("Username not found in local storage");
        handleLogout();
	}
	if (localStorage.getItem('friend_username'))
	{
		localStorage.removeItem('friend_username');
	}
	searchedHistory(username);
});

const blockchainButton = document.getElementById('blockchain_button');
blockchainButton.addEventListener('click', function() {
	var username = localStorage.getItem('username');
	if (!username)
	{
  		console.error("Username not found in local storage");
        handleLogout();
	}

	navigate('/tournament_history');
});


const passwordButton = document.getElementById('password_button');
passwordButton.addEventListener('click', function() {	
	errorMessage.style.display = 'none';
	errorPass.style.display = 'none';
	document.getElementById('base_info').style.display = "none";
	document.getElementById('backButton').style.display = "none";
	document.getElementById('pass_info').style.display = "block";
});

const returnButton = document.getElementById('returnButton');
returnButton.addEventListener('click', function() {
	document.getElementById('old_pass').value = "";
	document.getElementById('new_pass').value = "";
	document.getElementById('conf_pass').value = "";
	errorPass.style.display = 'none';
	document.getElementById('base_info').style.display = "block";
	document.getElementById('backButton').style.display = "block";
	document.getElementById('pass_info').style.display = "none";
	getUserInfo();
});


var errorPass = document.createElement('p');
errorPass.style.color = 'red';
errorPass.style.display = 'none';
document.getElementById('passForm').appendChild(errorPass);


document.getElementById('passForm').addEventListener('submit', function(e) {
	e.preventDefault();
	const csrftoken = getCookie('csrftoken');
	const old_pass = document.getElementById('old_pass').value;
	const new_pass = document.getElementById('new_pass').value;
	const conf_pass = document.getElementById('conf_pass').value;
	if (!new_pass || !old_pass || !conf_pass)
	{
		errorPass.style.display = 'block';
		errorPass.style.color = 'red';
		errorPass.textContent = i18next.t('pass_no');
	}
	else if (new_pass != conf_pass)
	{
		errorPass.style.display = 'block';
		errorPass.style.color = 'red';
		errorPass.textContent = i18next.t('pass_not_match');
	}
	else if (new_pass == old_pass)
	{
		errorPass.style.display = 'block';
		errorPass.style.color = 'red';
		errorPass.textContent = i18next.t('pass_same');
	}
	else if (new_pass.length < 6)
	{
		errorPass.style.display = 'block';
		errorPass.style.color = 'red';
		errorPass.textContent = i18next.t('pass_too_small');
	}
	else
	{
		var data = {
	        username: localStorage.getItem('username'),
	        password: old_pass
	    };
		if (!data.username)
		{
  			console.error("Username not found in local storage");
        	handleLogout();
		}
	    fetch('/api/check_password/', {
	        method: 'POST',
	        headers: {
	            'Content-Type': 'application/json',
	            'X-CSRFToken': csrftoken,
	        },
	        body: JSON.stringify(data),
	    })
		.then(response => response.json())
		.then(data => {
			if (data.status === 'success') {
				var data_bis = {
					old_pass: old_pass,
					conf_pass: conf_pass,
					password: new_pass
				}
				fetch('/api/change_password/', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'X-CSRFToken': csrftoken,
					},
					body: JSON.stringify(data_bis),
				})
				.then(response => response.json())
				.then(data => {
					errorPass.style.color = 'green';
					errorPass.style.display = 'block';
					errorPass.textContent = i18next.t('pass_updated');
				})
			} else {
				errorPass.style.display = 'block';
				errorPass.style.color = 'red';
				errorPass.textContent = i18next.t('pass_old_incorrect');
			}
		})
	}
});


export async function init() {
    setupNavigationEventListeners(getUserInfo);
}
