import { getCookie, navigateAndReplace } from "./utils.js";
import { handleLogout } from "./utils.js";
import { setupNavigationEventListeners } from "./utils.js";
import { loadText } from "./utils.js";
const csrftoken = getCookie('csrftoken');

var userField = document.getElementById('user');
var searchButton = document.getElementById('searchButton');
const backButtonElem = document.getElementById('backButton');

backButtonElem.addEventListener('click',() => {
	navigateAndReplace('/menu')
});

export function navigate_to_friend(username) {
	localStorage.setItem('friend_username', username);
	navigate('/profile_friend');
}

function checkFields() {
   if (userField.value == '') {
       userField.placeholder = i18next.t('user');
       searchButton.disabled = true;
   }
   else {
       searchButton.disabled = false;
   }
}

checkFields();
loadText();

userField.addEventListener('input', checkFields);

function acceptRequest(request_id) {
  	var token = localStorage.getItem('auth_token');
 	if (token) {
		fetch(`api/accept_friend_request/${request_id}/`, {
        		method: 'POST',
        		headers: {
				'Content-Type': 'application/json',
        			'X-CSRFToken': csrftoken,
        		},
    		})
		.then(response => response.json())
		.then(data => {
			showFriends();
		})
	}
	else
	{
  		console.error("Token not found in local storage");
        	handleLogout();
	}
}

function refuseRequest(request_id) {
  	var token = localStorage.getItem('auth_token');
 	if (token) {
    		fetch(`api/refuse_friend_request/${request_id}/`, {
        		method: 'POST',
        		headers: {
				'Content-Type': 'application/json',
        			'X-CSRFToken': csrftoken,
        		},
    		})
		.then(response => response.json())
		.then(data => {
			showFriends();
		})
	}
	else
	{
  		console.error("Token not found in local storage");
        	handleLogout();
	}
}


function removeFriend(username) {
  	var token = localStorage.getItem('auth_token');
 	if (token) {
		fetch(`api/remove_friend/${username}/`, {
        		method: 'POST',
        		headers: {
				'Content-Type': 'application/json',
        			'X-CSRFToken': csrftoken,
        		},
    		})
		.then(response => response.json())
		.then(data => {
			showFriends();
		})
	}
	else
	{
  		console.error("Token not found in local storage");
        	handleLogout();
	}
}


function showFriends() {
	const friend_list = document.getElementById('friend_list');
	fetch('/api/friends/')
	.then(response => response.json())
	.then(data => {
		friend_list.innerHTML = "";
    	const friends = data.friends;
		if (friends.length > 0)
		{
    			friends.forEach(friend => {
				friend_list.innerHTML += `<div id='friend_div_${friend.username}' class='friends'></div>`
				const friend_div = document.getElementById(`friend_div_${friend.username}`);

				friend_div.innerHTML += `<span id='status' data-username='${friend.username}' class='status offline'></span>`;
				friend_div.innerHTML += `<span id='span_nav2' class="span_click" data-username='${friend.username}'>${friend.username}</span>`
				friend_div.innerHTML += `<button id='remove' class='friend_gestion remove' data-friend='${friend.username}'>X</button>`;
    			});

				document.querySelectorAll('.remove').forEach(element => {
    				element.addEventListener('click', function() {
        				removeFriend(this.dataset.friend);
    				});
				});
				document.querySelectorAll('#span_nav2').forEach(element => {
					element.addEventListener('click', function() {
	    				navigate_to_friend(this.dataset.username);
					});
				});
		}
		else
		{
			friend_list.className = 'no-friends';
	    	var translation = i18next.t('no-friends');
			friend_list.innerText = translation;
		}
	})
	.catch(error => {
		console.error('There was a problem with the fetch operation:', error);
	});

	const container = document.getElementById('requests_list');
	fetch('/api/requests_list/')
	.then(response => response.json())
	.then(data => {
    		const requests = data.requests;
    		requests.forEach(request => {
				//console.log(request.from_user);
    		});
		if (requests.length > 0)
		{
    		requests.forEach(request => {
			container.innerHTML += `<div id='request_div_${request.from_user}' class='requests'></div>`
			const request_div = document.getElementById(`request_div_${request.from_user}`);
			request_div.innerHTML += `<span id='span_nav2' class="span_click" data-username='${request.from_user}'>${request.from_user}</span>`
			request_div.innerHTML += `<button id='refuse' class='friend_gestion refuse' data-request_id='${request.id}'>N</button>`;
			request_div.innerHTML += `<button id='accept' class='friend_gestion accept' data-request_id='${request.id}'>Y</button>`
   			});

			document.querySelectorAll('#span_nav2').forEach(element => {
					element.addEventListener('click', function() {
	    				navigate_to_friend(this.dataset.username);
					});
			});
			document.querySelectorAll('.accept').forEach(element => {
    				element.addEventListener('click', function() {
        				acceptRequest(this.dataset.request_id);
    				});
			});
			document.querySelectorAll('.refuse').forEach(element => {
    				element.addEventListener('click', function() {
        				refuseRequest(this.dataset.request_id);
    				});
			});
		}
		else
		{
			container.className = 'no-friends';
	    	var translation = i18next.t('no-request');
			container.innerText = translation;
		}
	})
	.catch(error => {
		console.error('There was a problem with the fetch operation:', error);
	});
}


document.getElementById('searchUserForm').addEventListener('submit', function(e) {
	e.preventDefault();
	var username = document.getElementById('user').value;
	fetch(`/api/getOtherUser/${username}`)
	.then(response => response.json())
	.then(data => {
		if (data.status === 'error400')
			userFound(false, null, true);
		else if (data.status === 'success')
			userFound(true, data, false);
		else
			userFound(false, null, false);
	})
	.catch(error => {
		console.error('No user found', error);
		userFound(false, null, false);
	});
});


var errorMessage = document.createElement('p');
errorMessage.style.color = 'red';
errorMessage.style.display = 'none';
document.getElementById('searchUserForm').appendChild(errorMessage);

function userFound(userIsFound, user, current) {
	const container = document.getElementById('user-searched');
	container.innerHTML = "";
	if (userIsFound) {
		container.className = 'user-found';
		container.innerHTML += `<span id="span_nav" class="span_click">${user.username}</span>`;
		container.innerHTML += `<span id='status' data-username='${user.username}' class='status offline'></span>`;
		container.innerHTML += `<button type="button" id='add_friend' class='friend_gestion'>+</button>`;

		errorMessage.style.display = 'none';

		const navigateButton = document.getElementById('span_nav');
		navigateButton.addEventListener('click', function() {
    		navigate_to_friend(user.username);
		});

		const addFriendButton = document.getElementById('add_friend');
        addFriendButton.addEventListener('click', function() {
  			var token = localStorage.getItem('auth_token');
 			if (token) {
   				fetch(`api/send_friend_request/${user.id}/`, {
					method: 'POST',
   					headers: {
						'Content-Type': 'application/json',
  						'X-CSRFToken': csrftoken,
  					},
				})
				.then(response => response.json())
 				.then(data => {
					if (data.status === 'success') {
						errorMessage.style.display = 'block';
						errorMessage.style.color = 'green';
						errorMessage.textContent = i18next.t('friend_send');
   					} else {
						errorMessage.style.display = 'block';
						errorMessage.style.color = 'red';
						errorMessage.textContent = i18next.t('friend_already_send');
   					}
 				})
 				.catch(error => {
   					console.error('Error sending friend request:', error);
 				});
			}
			else
			{
  				console.error("Token not found in local storage");
        			handleLogout();
			}
		});

	} else if (current) {
		container.className = 'user-not-found';
		container.innerText = i18next.t('add_me');
	} else {
		container.className = 'user-not-found';
		container.innerText = i18next.t('not_found');
	}
}


export async function init() {
    setupNavigationEventListeners(showFriends);
}

function getStatus() {
	document.querySelectorAll('#status').forEach(element => {
		fetch(`/api/user_status/${element.dataset.username}/`)
		.then(response => response.json())
		.then(data => {
			element.className = `status ${data.status}`;
		})
		.catch(error => {
			console.error('Error fetching user status:', error);
		});
	});
}



setInterval(getStatus, 3000);
