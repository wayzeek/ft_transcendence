// import { changeLanguage } from "i18next";
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
    fetch('/api/login', {
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
            //console.log('Login successful');
            localStorage.setItem('auth_token', data.token); // Store the token in LocalStorage
            localStorage.setItem('username', data.username); // Store the new user's username in LocalStorage
            localStorage.setItem('i18nextLng', data.language);
 
            i18next.changeLanguage(data.language);
             // Store the new user's language in LocalStorage
            errorMessage.style.display = 'none';
            navigate('/menu');
        }
        else {
            errorMessage.style.display = 'block';
            errorMessage.textContent = data.message;
        }
    })
    .catch(error => {
        console.error('Error:', error);
        errorMessage.style.display = 'block';
        if (error.message === "Error: Invalid username or password")
            errorMessage.textContent = i18next.t("invalid_login");
        else
        errorMessage.textContent = error.message;
    });
});







