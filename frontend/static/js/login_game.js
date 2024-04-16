import { getCookie } from "./utils.js";
import { loadText } from "./utils.js";

var errorMessage = document.createElement('p');
errorMessage.style.color = 'red';
errorMessage.style.display = 'none';
document.getElementById('loginForm').appendChild(errorMessage);

var passwordField = document.getElementById('password');
var usernameField = document.getElementById('username');
var loginButton = document.getElementById('loginButton');


function checkFields() {
   if (passwordField.value == '' || usernameField.value == '') {
       loginButton.disabled = true;
       usernameField.placeholder = i18next.t('username');
       passwordField.placeholder = i18next.t('password');
   }
   else {
       loginButton.disabled = false;
   }
}

// Check the fields initially
checkFields();
loadText();

// Check the fields whenever they change
passwordField.addEventListener('input', checkFields);
usernameField.addEventListener('input', checkFields);

// Get the CSRF token from the cookie
const csrftoken = getCookie('csrftoken');

// Login form submit event
document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    var data = {
        username: usernameField.value,
        password: passwordField.value
    };
    fetch('/api/loginGame', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken,
        },
        body: JSON.stringify(data),
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            return response.json().then(errorData => {
                throw new Error("Error: " + (errorData.message));
            });
        }
    })
    .then(data => {
        if (data.status === 'success') {
            errorMessage.style.display = 'none';
            navigate('/launch_game', ['two_players', data.username]);
        }
        else {
            errorMessage.style.display = 'block';
			if (i18next.exists(data.message))
				var msg = i18next.t(data.message);
			else
                msg = data.message;
            errorMessage.textContent = msg;
        }
    })
    .catch(error => {
        console.error('Error:', error.message);
        errorMessage.style.display = 'block';
        if (error.message === 'Error: P2_not_found')
            var msg = i18next.t('P2_not_found');
        else if (error.message === 'Error: P2_me')
            var msg = i18next.t('P2_me');
        else
            msg = error.message;
        errorMessage.textContent = msg;
    });
});

var guestButton = document.getElementById('guest');

guestButton.addEventListener('click', function() {
    navigate('/launch_game', ['two_players', 'GUEST']);
});
