import { getCookie, getCurrentUserInfo } from "../utils.js";
import { checkTournament, getTournament } from "./fetch_tournament.js";
import { loadText } from "../utils.js";



var errorMessage = document.createElement('p');
errorMessage.style.color = 'red';
errorMessage.style.display = 'none';
document.getElementById('contestant').appendChild(errorMessage);

var passwordField = document.getElementById('password');
var usernameField = document.getElementById('username');
var loginButton = document.getElementById('loginButton');
var inputAlias = document.getElementById('alias');
var contestantNumber = document.getElementById('contestantNumber'); // Get contestant number element

///setup
const tournamentNameElem = document.getElementById("tournament-name");
const ownerAliasElem = document.getElementById("owner-alias");
const confirmButtonElem = document.getElementById("confirmButton");
const errorFieldElem = document.getElementById("error-field");

const currentUser = await getCurrentUserInfo();
ownerAliasElem.value = currentUser.username;
///


let contestant_number = 2;

// Array to store registered usernames
let registeredUsernames = [];

let registeredAlias = [];

let tournamentName;


 
 // Check the fields initially

loadText();
tournamentNameElem.placeholder = i18next.t('tournament-name');

/// SETUP

confirmButtonElem.addEventListener('click', confirmFields);

if (await checkTournament(currentUser.id)) {
    let tournament = await getTournament(currentUser.id);
    // check if the tournament has ended
    if (!tournament.ended)
            navigate('/tournament');
}

var error_tour = i18next.t("error_tour");
var error_alias = i18next.t("error_alias");


async function confirmFields () {


    if (await checkTournament(currentUser.id)) 
    {
        let tournament = await getTournament(currentUser.id);
        // check if the tournament has ended
        if (!tournament.ended)
                navigate('/tournament');
    }
    tournamentName = tournamentNameElem.value;
    const ownerAlias = ownerAliasElem.value;
    if (tournamentName.length < 3 || tournamentName.length > 30) {
        errorFieldElem.innerText = error_tour
        return;
    }
    else if (ownerAlias.length < 1 || ownerAlias.length > 30) {
        errorFieldElem.innerText = error_alias
        return;
    }
    document.getElementById('setup').style.display = 'none';
    document.getElementById('containders').style.display = 'block';
    initRegistering(ownerAlias);

}

/////

function initRegistering(ownerAlias)
{

    registeredUsernames.push(currentUser.username);
    registeredAlias.push(ownerAlias);
}

// TODO: improve (replace whitespace and more)
// !elem.value.replace(/\s/g, '')
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

// Check the fields whenever they change
passwordField.addEventListener('input', checkFields);
usernameField.addEventListener('input', checkFields);

// Get the CSRF token from the cookie
const csrftoken = getCookie('csrftoken');

document.getElementById("user").addEventListener("click", function () {
    document.getElementById("loginForm").style.display = "block";
});

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

var error_alias_long = i18next.t("error_alias_long");
var alias_taken = i18next.t("alias_taken");
var already_registered = i18next.t("already_registered");


// Login form submit event
document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    var data = {
        username: usernameField.value,
        password: passwordField.value
    };

    // Check if username already exists
    if (registeredUsernames.includes(data.username)) {
        errorMessage.style.display = 'block';
        errorMessage.textContent = already_registered;
        return; // Stop further execution
    }

    inputAlias.value = inputAlias.value.trim();

    // Check alias field
    if (!inputAlias.value || inputAlias.value.length > 15) {
        errorMessage.style.display = 'block';
        errorMessage.textContent = error_alias_long;
        inputAlias.value = '';
        return; // Stop further execution
    }
    if (registeredAlias.includes(inputAlias.valuez)) {
        errorMessage.style.display = 'block';
        errorMessage.textContent = alias_taken;
        inputAlias.value = '';
        return; // Stop further execution
    }

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
            registeredUsernames.push(data.username); // Add username to the list of registered usernames
            registeredAlias.push(inputAlias.value);
            contestant_number ++;
            if (contestant_number >= 9){
                contestant_number --;
                shuffleArray(registeredAlias);
                navigate('/tournament', [tournamentName, registeredAlias, registeredUsernames]);
            }
            document.getElementById('next_contestant').textContent = `${inputAlias.value} is now in the tournament`;

            document.getElementById('loginForm').style.display = 'none';

            var nextContestantElement = document.getElementById('next_contestant');
            if (nextContestantElement) {
                nextContestantElement.style.display = 'block';
            }
            reload();
            setTimeout(validated, 3000);



            document.getElementById('next_contestant').style.display = 'block';
            errorMessage.textContent = ''; // Clear error message
            passwordField.value='';
            usernameField.value='';
        }
        else {
            errorMessage.style.display = 'block';
            errorMessage.textContent = data.message;
        }
    })  
    .catch(error => {
        console.error('Error:', error);
        errorMessage.style.display = 'block';
        errorMessage.textContent = error.message;
    });
});

document.getElementById('guest').addEventListener('click', function () {
    // Check alias field for guest login
    document.getElementById('loginForm').style.display = 'none';

    inputAlias.value = inputAlias.value.trim();

    if (!inputAlias.value || inputAlias.value.length > 15) {
        errorMessage.style.display = 'block';
        errorMessage.textContent = error_alias_long;
        inputAlias.value = '';
        return; // Stop further execution
    }

    if (registeredAlias.includes(inputAlias.value)) {
        errorMessage.style.display = 'block';
        errorMessage.textContent = alias_taken;
        inputAlias.value = '';
        return; // Stop further execution
    }

    registeredAlias.push(inputAlias.value);

    let trad = i18next.t("now_in_tournament");


    document.getElementById('next_contestant').textContent = inputAlias.value + trad;
    contestant_number ++;

    if (contestant_number >= 9){
        contestant_number --;
        shuffleArray(registeredAlias);
        navigate('/tournament', [tournamentName, registeredAlias, registeredUsernames]);
    }

    // document.getElementById('contestant').classList.add("blurred");
    // document.getElementById('next_contestant').textContent = `${inputAlias.value} is now in the tournament`;
    var nextContestantElement = document.getElementById('next_contestant');
    if (nextContestantElement) {
        nextContestantElement.style.display = 'block';
    }
    reload();
    setTimeout(validated, 3000);
});

function reload()
{
    passwordField.value='';
    usernameField.value='';
    errorMessage.textContent = ''; // Clear error message
    inputAlias.value = '';
    var trad2 = i18next.t("number");
    contestantNumber.textContent = trad2 + contestant_number + " / 8"; // Update contestant number text
}

function validated()
{
    var nextContestantElement = document.getElementById('next_contestant');
    if (nextContestantElement) {
        nextContestantElement.style.display = 'none';
    }
}   
