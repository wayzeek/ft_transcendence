// Assuming i18next is correctly imported at the beginning of your script
// import i18next from './i18n.js';

var titleElement = document.querySelector('.connection-title');

let state = { page: "/html/index.html", js_file: "/js/index.js"};

async function redirectReload() {
    const token = localStorage.getItem('auth_token');
    const urlParams = new URLSearchParams(window.location.search);
    // If user not logged in, give him access to public pages
    if (token) {
        navigate_to('/menu');
    }
    // Check if the URL contains the specified query parameters
    else if (urlParams.has('token') && urlParams.has('username') && urlParams.has('language')) {
        // Retrieve the data from the query string
        const token = urlParams.get('token');
        const username = urlParams.get('username');
        const language = urlParams.get('language');

        // Store the data in local storage
        localStorage.setItem('auth_token', token);
        localStorage.setItem('username', username);
        localStorage.setItem('i18nextLng', language);

        // Redirect to the menu page
        navigate_to('/menu');
    }
}

window.addEventListener('load', redirectReload);

document.querySelectorAll('.connection-option').forEach(function(option) {
    option.addEventListener('mouseover', function() {
        titleElement.textContent = option.textContent;
    });
    option.addEventListener('mouseout', function() {
        titleElement.textContent = i18next.t('connectionTitle');
    });
});

function redirectWithDomain() {
    // Capture the current domain name
    var domainName = window.location.hostname;
    
    // Append the domain name to the URL of the next page
    var nextPageUrl = "/api/authorize?domain=" + encodeURIComponent(domainName);
    
    // Redirect to the next page
    window.location.href = nextPageUrl;
}

function loadText() {
    // Retrieve the saved language preference from localStorage
    const savedLanguage = localStorage.getItem('i18nextLng') || 'en';
    if (!i18next.language){
        i18next.init({
            lng: savedLanguage, // Use the saved language preference
            debug: true,
            resources: {
                en: {
                    translation: {
                        "title": "ARCADE PONG",
                        "connectionTitle": "CONNECTION",
                        "connectionOption42Login": "42 LOGIN",
                        "connectionOptionLogin": "LOGIN",
                        "connectionOptionRegister": "REGISTER",
                        "confitourrm": "CONFIRM",
						"welcome": "WELCOME ",
                        "quick-play": "QUICK PLAY",
                        "two-player": "TWO PLAYERS",
                        "tournament": "TOURNAMENT",
                        "friends" : "FRIENDS",
                        "logout" : "LOGOUT",
                        "profile" : "PROFILE",
                        "banner": "Press any key to start !",
                        "play-again": "Play again",
                        "quit": "Quit",
                        "wonpong": " won !",
                        "username": "USERNAME",
                        "password": "PASSWORD",
                        "confirm-password": "CONFIRM PASSWORD",
                        "my-profile": "MY PROFILE",
                        "change-avatar": "CHANGE AVATAR",
                        "delete": "DELETE AVATAR",
                        "save": "SAVE",
                        "played": "GAMES PLAYED: ",
                        "won": "GAMES WON: ",
                        "lost": "GAMES LOST: ",
                        "back": "BACK",
                        "game-history": "GAME HISTORY",
                        "change-password": "CHANGE PASSWORD",
                        "old-password": "OLD PASSWORD: ",
                        "new-password": "NEW PASSWORD: ",
                        "confirm-password-bis": "CONFIRM PASSWORD: ",
                        "profile-title": "'S PROFILE",
                        "tournament": "Tournament",
                        "confirmNicknamePrompt": "Enter every nickname to start !",
                        "confirmButton": "Confirm",
                        "homeButton": "Home",
                        "gameRoundQuarterfinals": "QUARTER FINALS",
                        "gameRoundSemifinals": "SEMI FINALS",
                        "gameRoundFinals": "FINALS",
                        "playerVsPlayer": "player vs player",
                        "startGameButton": "Play",
                        "infoFieldStartGame": "",
                        "endGameMessage": "Tournament finished !",
                        "winnerTournament": "Winner: not defined",
                        "endGameButton": "Play again",
                        "tournament-name": "TOURNAMENT NAME",
                        "owner-alias": "OWNER ALIAS",
                        "confirmButton": "CONFIRM",
                        "choose_alias": "Choose your alias",
                        "alias": "ALIAS",
                        "guest": "PLAY AS GUEST",
                        "userplay": "PLAY AS USER",
                        "loginButton": "CONFIRM",
                        "setup": "SETUP",

                        "see-tournament": "TOURNAMENT HISTORY",
                        "no-game": "NO GAME PLAYED YET",
                        "my-history": "MY GAME HISTORY",
                        "other-history": "'S HISTORY",
                        "fetch": "Fetching records",
                        "guest": "PLAY AS GUEST",
                        "login-p2": "LOGIN PLAYER 2",
                        "friends": "FRIENDS",
                        "search": "SEARCH",
                        "user": "USER",
                        "no-friends": "YOU HAVE NO FRIENDS",
			            "no-request": "YOU HAVE NO PENDING REQUEST",
                        "now_in_tournament": "  is now in the tournament",
                        "number" : "Contestant number : ",
                        "number2" : "Contestant number : 2 / 8 ",
                        "block1" : "Sending score to blockchain ",
                        "block2" : "Score sent to the blockchain! See the transaction: ",

                        "error_tour" : "Error in tournament name",
                        "error_alias" : "Error in owner alias",
                        "error_alias_long" : "Alias must be between 1 and 15 characters long.",
                        "alias_taken" : "This alias is already taken",
                        "already_registered" : "User already registered." ,

                        "pass_not_match" : 'Passwords do not match',
                        "pass_too_small" : 'Passwords is too small',
                        "pass_too_long" : 'Passwords is too long',
                        "pass_no" : "Passwords can't be empty",
                        "pass_same" : "Old and new passwords can't be the same",
                        "pass_updated" : "Password updated successfully",
                        "pass_old_incorrect" : "Old password is incorrect",
                        "cant_42" : "Error: Username can't end with '@42'",
                        "username_exist" : "user with this username already exists.",

                        "already_registered" : "User already registered." , 
                        "pdp-incorrect": 'File is incorrect',
                        "pdp-no": "You don't have a profile picture",
                        "pdp-size": "Image too big",
                        "pdp-type": "Image must be .jpeg or .png",
                        "user-42": "Username can't end with '@42'",
                        "user-too-long": "Username send is too long",
                        "user-updated": "Username updated successfully",
                        "user-taken": "Username is already taken",
                        "friend_send": "Friend request sent",
                        "friend_send": "Friend request already sent",
                        "add_me": "You can't add yourself",
                        "not_found": "User not found",
                        "P2_not_found": "Invalid username or password",
                        "P2_me": "Player 2 must be another user",
                        "invalid_login" : "Error: Invalid username or password",
                        "tournament-history" : "TOURNAMENT HISTORY",
                        "fetch-block" : "Fetching blockchain",
                
                    }
                },
                fr: {
                    translation: {
                        "error_tour" : "Erreur dans le nom du tournoi",
                        "title": "ARCADE PONG",
                        "connectionTitle": "CONNEXION",
                        "connectionOption42Login": "CONNEXION 42",
                        "connectionOptionLogin": "CONNEXION",
                        "connectionOptionRegister": "INSCRIPTION",
                        "confirm": "CONFIRMER",
						"welcome": "BIENVENUE ",
                        "quick-play": "PARTIE RAPIDE",
                        "two-player": "DEUX JOUEURS",
                        "tournament": "TOURNOI",
                        "friends" : "AMIS",
                        "logout" : "DECONNEXION",
                        "profile" : "PROFIL",
                        "banner": "Appuyez sur n'importe quelle touche pour commencer !",
                        "play-again": "Rejouer",
                        "quit": "Quitter",
                        "wonpong": " a gagne !",
                        "username": "NOM D'UTILISATEUR",
                        "password": "MOT DE PASSE",
                        "confirm-password": "CONFIRMER MOT DE PASSE",
                        "my-profile": "MON PROFIL",
                        "change-avatar": "CHANGER LA PDP",
                        "delete": "SUPPRIMER PDP",
                        "save": "SAUVEGARDER",
                        "played": "PARTIES JOUEES: ",
                        "won": "PARTIES GAGNEES: ",
                        "lost": "PARTIES PERDUES: ",
                        "back": "RETOUR",
                        "game-history": "HISTORIQUE DE PARTIES",
                        "change-password": "CHANGER MDP",
                        "old-password": "ANCIEN MDP: ",
                        "new-password": "NOUVEAU MDP: ",
                        "confirm-password-bis": "CONFIRMER MDP: ",
                        "profile-title": "PROFIL DE ",
                        "tournament": "Tournoi",
                        "confirmNicknamePrompt": "Entrez chaque surnom pour commencer !",
                        "confirmButton": "Confirmer",
                        "homeButton": "Accueil",
                        "gameRoundQuarterfinals": "QUARTS DE FINALE",
                        "gameRoundSemifinals": "DEMI FINALES",
                        "gameRoundFinals": "FINALES",
                        "playerVsPlayer": "joueur contre joueur",
                        "startGameButton": "Jouer",
                        "infoFieldStartGame": "",
                        "endGameMessage": "Tournoi termine !",
                        "winnerTournament": "Vainqueur : non defini",
                        "endGameButton": "Rejouer",
                        "tournament-name": "NOM DU TOURNOI",
                        "owner-alias": "ALIAS DU PROPRIÉTAIRE",
                        "confirmButton": "CONFIRMER",
                        "choose_alias": "Choisissez votre alias",
                        "alias": "ALIAS",
                        "guest": "JOUER EN TANT QU'INVITE",
                        "userplay": "JOUER EN TANT QU'UTILISATEUR",

                        "loginButton": "CONFIRMER",
                        "setup": "CONFIGURATION",
                        "see-tournament": "HISTORIQUE DE TOURNOI",
                        "no-game": "AUCUNE PARTIE JOUEE",
                        "my-history": "MON HISTORIQUE",
                        "other-history": "HISTORIQUE DE ",
                        "fetch": "recherche de parties",
                        "guest": "JOUER EN INVITE",
                        "login-p2": "CONNEXION JOUEUR 2",
                        "friends": "AMIS",
                        "search": "RECHERCHER",
                        "user": "UTILISATEUR",
                        "no-friends": "VOUS N'AVEZ PAS D'AMIS",
			            "no-request": "VOUS N'AVEZ PAS DE DEMANDE EN ATTENTE",
                        "now_in_tournament": " est maintenant dans le tournoi",
                        "number": "Numero du participant : ",
                        "number2" : "Numero du participant : 2 / 8 ",
                        "block1": "Envoi du score a la blockchain ",
                        "block2": "Score envoye a la blockchain ! Voir la transaction : ",

                        "erroe_tour": "Erreur dans le nom du tournoi",
                        "error_alias": "Erreur dans l'alias du proprietaire",
                        "error_alias_long": "L'alias doit comporter entre 1 et 15 caracteres.",
                        "alias_taken": "Cet alias est deja pris",
                        "already_registered": "Utilisateur deja enregistre.",

                        "pass_not_match": "Les mots de passe ne correspondent pas",
                        "pass_too_small": "Le mot de passe est trop court",
                        "pass_too_long": "Le mot de passe est trop long",
                        "pass_no" : "Les mots de passe ne peuvent etre vides",
                        "pass_same" : "L'ancien et le nouveau mot de passe ne peuvent pas etre pareil",
                        "pass_updated" : "Mot de passe mis a jour",
                        "pass_old_incorrect" : "Ancien mot de passe incorrect",
                        "cant_42": "Erreur : le nom d'utilisateur ne peut pas se terminer par '@42'",
                        "username_exist": "Un utilisateur avec ce nom d'utilisateur existe deja.",


                        "already_registered": "Utilisateur deja enregistre.", 
                        "pdp-incorrect": 'Le fichier est incorrect',
                        "pdp-no": "Vous n'avez pas de photo de profil",
                        "pdp-size": "Image trop grosse",
                        "pdp-type": "Le type de l'image doit etre .jpeg ou .png",
                        "user-42": "Le nom d'utilisateur ne peut pas finir par '@42'",
                        "user-too-long": "Nom d'utilisateur trop long",
                        "user-updated": "Nom d'utilisateur mis a jour",
                        "user-taken": "Nom d'utilisateur deja pris",
                        "friend_send": "Requete d'ami envoyee",
                        "friend_already_send": "Requete d'ami deja envoyee",
                        "add_me": "Vous ne pouvez pas vous ajouter vous meme",
                        "not_found": "Utilisateur non trouve",
                        "P2_not_found": "Mauvais nom d'utilisateur ou mot de passe",
                        "P2_me": "Le joueur 2 ne peux pas etre vous meme",
                        "invalid_login": "Erreur : Nom d'utilisateur ou mot de passe invalide",
                        "tournament-history" : "HISTORIQUE DE TOURNOI",
                        "fetch-block" : "Recuperation de la blockchain",

                    }
                },
                it: {
                    translation: {
                        "title": "ARCADO PONG",
                        "connectionTitle": "CONNEXIONE",
                        "connectionOption42Login": "CONNEXIONE 42",
                        "connectionOptionLogin": "CONNEXIONE",
                        "connectionOptionRegister": "INSCRIPTIONNE",
                        "confirm": "CONFERMARE",
						"welcome": "BENVENUTO ",
                        "quick-play": "PARDITO RAPIDO",
                        "two-player": "DUO GIOCATORE",
                        "tournament": "TOURNAMENTE",
                        "friends" : "AMICI",
                        "logout" : "DECONNECCIONE",
                        "profile" : "PROFILO",
                        "banner": "Premere un tasto qualsiasi per iniziare!",
                        "play-again": "Gioca di nuovo",
                        "quit": "Lasciare",
                        "wonpong": " vinto !",
                        "username": "NOME UTENTE",
                        "password": "PASSWORD",
                        "confirm-password": "CONFERMA PASSWORD",
                        "my-profile": "MIO PROFILO",
                        "change-avatar": "CAMBIA AVATAR",
                        "delete": "CANCELLARE AVATAR",
                        "save": "SALVA",
                        "played": "PARTITE GIOCATE: ",
                        "won": "PARTITE VINTE: ",
                        "lost": "PARTITE PERSE: ",
                        "back": "INDIETRO",
                        "game-history": "STORIA DEL PARTITE",
                        "change-password": "CAMBIAR PASSWORD",
                        "old-password": "VECCHIA PASSWORD: ",
                        "new-password": "NUOVA PASSWORD: ",
                        "confirm-password-bis": "CONFERMA PASSWORD: ",
                        "profile-title": "PROFILO DI ",
                        "tournament": "Torneo",
                        "confirmNicknamePrompt": "Inserisci ogni soprannome per iniziare!",
                        "confirmButton": "Conferma",
                        "homeButton": "Home",
                        "gameRoundQuarterfinals": "QUARTI DI FINALE",
                        "gameRoundSemifinals": "SEMI FINALI",
                        "gameRoundFinals": "FINALI",
                        "playerVsPlayer": "giocatore contro giocatore",
                        "startGameButton": "Gioca",
                        "infoFieldStartGame": "",
                        "endGameMessage": "Torneo finito!",
                        "winnerTournament": "Vincitore: non definito",
                        "endGameButton": "Gioca di nuovo",
                        "tournament-name": "NOME DEL TORNEO",
                        "owner-alias": "ALIAS DEL PROPRIETARIO",
                        "confirmButton": "CONFERMA",
                        "choose_alias": "Scegli il tuo alias",
                        "alias": "ALIAS",
                        "guest": "GIOCA COME OSPITE",
                        "userplay": "GIOCA COME UTENTE",
                        "loginButton": "CONFERMA",
                        "setup": "IMPOSTAZIONE",
                        "see-tournament": "TORNEI STORIA",
                        "no-game": "NESSUNA PARTIDA GIOCATA",
                        "my-history": "LA MIA STORIA",
                        "other-history": "STORIA DI ",
                        "fetch": "recuperare record",
                        "guest": "GIOCARE COME OSPITE",
                        "login-p2": "CONNEXION LETTORE 2",
                        "friends": "AMIGOS",
                        "search": "BUSQUE",
                        "user": "USUARIO",
                        "no-friends": "NON HAI AMICI",
			            "no-request": "NON AVETE RICHIESTE IN SOSPESO",
                        "now_in_tournament": " ora e nel torneo",
                        "number": "Numero concorrente : ",
                        "number2" : "Numero concorrente : 2 / 8 ",
                        "block1": "Invio del punteggio alla blockchain ",
                        "block2": "Punteggio inviato alla blockchain! Vedere la transazione: ",

                        "error_tour": "Errore nel nome del torneo",
                        "error_alias": "Errore nell'alias del proprietario",
                        "error_alias_long": "L'alias deve essere lungo da 1 a 15 caratteri.",
                        "alias_taken": "Questo alias e gia stato preso",
                        "already_registered": "Utente gia registrato.",

                        "pass_not_match": "Le password non corrispondono",
                        "pass_too_small": "La password e troppo corta",
                        "pass_too_long": "La password e troppo lunga",
                        "pass_no" : "La password non può essere vuota",
                        "pass_same" : "Le vecchie e le nuove password non possono essere le stesse",
                        "pass_updated" : "Password aggiornata con successo",
                        "pass_old_incorrect" : "La vecchia password non e corretta",
                        "cant_42": "Errore: il nome utente non puo terminare con '@42'",
                        "username_exist": "Utente con questo nome utente gia esistente.",

                        "pdp-incorrect": 'file non e corretto',
                        "pdp-no": "Non avete una foto profilo",
                        "pdp-size": "Immagine troppo grande",
                        "pdp-type": "Immagine deve essere .jpeg o .png",
                        "user-42": "Nome utente non puo terminare con '@42'",
                        "user-too-long": "Invio del nome utente e troppo lungo",
                        "user-updated": "Nome utente aggiornato",
                        "user-taken": "Nome utente e gia stato preso",
                        "friend_send": "Invio della richiesta di amicizia",
                        "friend_already_send": "Richiesta di amicizia già inviata",
                        "add_me": "Non e possibile aggiungere se stessi",
                        "not_found": "Utente non trovato",
                        "P2_not_found": "Nome utente o password non validi",
                        "P2_me": "Il giocatore 2 deve essere un altro utente",
                        "invalid_login": "Errore: Nome utente o password non validi",
                        "tournament-history" : "STORIA DEL TORNEO",
                        "fetch-block" : "Recuperare la blockchain",


                    }
                }
            },
            useDataAttr: true,
        });
    }
    var i18nList = document.querySelectorAll('[data-i18n]');
    i18nList.forEach(function(element) {
        var key = element.dataset.i18n;
        var translation = i18next.t(key);
        element.textContent = translation;
    });
}


if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadText);
} else {
    loadText();
}

// Corrected event listener for changing the language
document.getElementById('french').addEventListener('click', function() {
    i18next.changeLanguage('fr', function(err, t) {
        if (err) return console.log('something went wrong loading', err);
        // Save the selected language to localStorage
        //localStorage.setItem('i18nextLng', 'fr');
        // reload the page to apply the language change
        loadText();
    });
});

document.getElementById('italian').addEventListener('click', function() {
    i18next.changeLanguage('it', function(err, t) {
        if (err) return console.log('something went wrong loading', err);
        // Save the selected language to localStorage
        //localStorage.setItem('i18nextLng', 'it');
        // reload the page to apply the language change
        loadText();
    });
});


document.getElementById('english').addEventListener('click', function() {
    i18next.changeLanguage('en', function(err, t) {
        if (err) return console.log('something went wrong loading', err);
        // Save the selected language to localStorage
        //localStorage.setItem('i18nextLng', 'en');
        // reload the page to apply the language change
        loadText();
    });
});