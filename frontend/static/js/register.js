// import i18next from "i18next";
import {getCookie} from "./utils.js";
import { loadText } from "./utils.js";

var usernameField = document.getElementById('username');
var passwordField = document.getElementById('password');
var confirmPasswordField = document.getElementById('confirmPassword');
var registerButton = document.getElementById('registerButton');

var errorMessage = document.createElement('p');
errorMessage.style.color = 'red';
errorMessage.style.display = 'none';
document.getElementById('registrationForm').appendChild(errorMessage);

loadText();

usernameField.placeholder = i18next.t('username');
passwordField.placeholder = i18next.t('password');
confirmPasswordField.placeholder = i18next.t('confirm-password');

var pass_not_match = i18next.t('pass_not_match');
var pass_too_small = i18next.t('pass_too_small');
var pass_too_long = i18next.t('pass_too_long');
var cant_42 = i18next.t('cant_42');

passwordField.oninput = function() {
  if (passwordField.value != confirmPasswordField.value) {
    registerButton.disabled = true;
    errorMessage.style.display = 'block';
    errorMessage.textContent = pass_not_match;
  } else if (passwordField.value.length < 6){
    registerButton.disabled = true;
    errorMessage.style.display = 'block';
    errorMessage.textContent = pass_too_small;
  } else if (passwordField.value.length > 30){
    registerButton.disabled = true;
    errorMessage.style.display = 'block';
    errorMessage.textContent = pass_too_long;
  } else {
    registerButton.disabled = false;
    errorMessage.style.display = 'none';
  }
}

confirmPasswordField.oninput = function() {
 if (passwordField.value != confirmPasswordField.value) {
   registerButton.disabled = true;
   errorMessage.style.display = 'block';
   errorMessage.textContent = pass_not_match;
 } else {
   registerButton.disabled = false;
   errorMessage.style.display = 'none';
 }
}

// Get the CSRF token from the cookie
const csrftoken = getCookie('csrftoken');

document.getElementById('registrationForm').addEventListener('submit', function(event) {
  event.preventDefault();
  var data = {
      username: document.getElementById('username').value,
      password: document.getElementById('password').value,
  };
  var str = String(data.username);
  if (str.length >= 3 && str.charAt(str.length - 3) == '@' && str.charAt(str.length - 2) == '4' && str.charAt(str.length - 1) == '2') {
    errorMessage.style.display = 'block';
    errorMessage.textContent = cant_42;
    return ;
  }
  if (str.length >= 20) {
    errorMessage.style.display = 'block';
    errorMessage.textContent = "Error: Username can't be more than 20 characters";
    return ;
  }
  else {
    fetch('/api/register', {
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
        // If the response is not ok, assume it is JSON and parse it to extract the message
        return response.json().then(errorData => {
          // Throw an error with the message from the server
          if (errorData.message || errorData.detail) {
            if (errorData.message == "Password is too small" || errorData.detail == "Password is too small")
              throw new Error("Error: " + i18next.t("pass_too_small"));
            else if (errorData.message == "user with this username already exists." || errorData.detail == "user with this username already exists.")
              throw new Error("Error: " + i18next.t("username_exist"));
            else 
            throw new Error("Error: " + (errorData.message || errorData.detail));
          } else {
            throw new Error("Error: " + errorData.username[0]);
          }
        });
      }
    })
    .then(data => {
      if (data.status === 'success') {
        //console.log('Registration successful');
        // Hide the errorMessage element if the registration was successful
        errorMessage.style.display = 'none';
        localStorage.setItem('auth_token', data.token); // Store the token in LocalStorage
        localStorage.setItem('username', data.username); // Store the new user's username in LocalStorage
        var info = {
          username: document.getElementById('username').value,
          password: document.getElementById('password').value,
        };
        fetch('/api/login', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'X-CSRFToken': csrftoken,
          },
          body: JSON.stringify(info),
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
          if (data.status === 'success')
              navigate('/menu');
        })
      } else {
        // Update the errorMessage element with the error message
        errorMessage.style.display = 'block';
        errorMessage.textContent = data.message;
      }
    })
    .catch(error => {
      console.error('Error:', error);
      // Update the errorMessage element with the error message
      errorMessage.style.display = 'block';

      if (error.message === "Error: user with this username already exists.")
      errorMessage.textContent = i18next.t("username_exist");
      else if (error.message === "Error: Password is too long")
      errorMessage.textContent = i18next.t("pass_too_long");
      else
      errorMessage.textContent = error.message; // Display the server's error message
    });
  }
});
