import { getCurrentUserInfo, setupNavigationEventListeners} from "../utils.js";
import { createGameTournamentBackend, createPlayerTournamentBackend, createTournamentBackend, getCurrentGameTournament,
    getTournament, checkTournament, patchTournament, updatePlayersGameTournament } from "./fetch_tournament.js";
import { sendScoreToBlockchain } from "./blockchain.js";
import { loadText } from "../utils.js";

const currentUser = await getCurrentUserInfo();

const confirmNicknameBannerElem = document.getElementById('confirmNickname');
const confirmButtonElem = document.getElementById('confirmButton');
const errorFieldElem = document.getElementById('errorField');

const startGameBannerElem = document.getElementById('startGame');
const startGameButtonElem = document.getElementById('startGameButton');
const startGameInfoFieldElem = document.getElementById('infoFieldStartGame');

const endGameBannerElem = document.getElementById('endGame');
const endGameButtonElem = document.getElementById('endGameButton');
const endGameWinnerFieldElem = document.getElementById('winnerTournament');

const player1semifinals = document.getElementById('player1semifinals');
const player2semifinals = document.getElementById('player2semifinals');
const player3semifinals = document.getElementById('player3semifinals');
const player4semifinals = document.getElementById('player4semifinals');
const player1final = document.getElementById('player1final');
const player2final = document.getElementById('player2final');

const playerElemArray = [
    document.getElementById('player1'),
    document.getElementById('player2'),
    document.getElementById('player3'),
    document.getElementById('player4'),
    document.getElementById('player5'),
    document.getElementById('player6'),
    document.getElementById('player7'),
    document.getElementById('player8'),
];

loadText();

export async function init(additionalInfo) {
    initTournament(additionalInfo);
}

async function initTournament(additionalInfo) {
    let tournamentExist = await checkTournament(currentUser.id);

    if (!tournamentExist) {
        if (!additionalInfo) 
            navigate('/login_tournament')
        else {
            await initNewPage(additionalInfo);
            return;
        }
    }
    else if (tournamentExist) {
        let tournament = await getTournament(currentUser.id);
        // check if the tournament has ended
        if (tournament.ended)
        {
            if (!additionalInfo) 
                navigate('/login_tournament')
            else {
                await initNewPage(additionalInfo);
                return;
            }
        }
        else
            await initExistingPage(tournament);
    }
}

async function initExistingPage(tournament) {
    //console.log('initExistingPage');

    // set and lock the players' nickname
    tournament.users.forEach((users, index) => {
        setUserNick(playerElemArray[index], users.nickname);
    });
    updatePlayerNicknameOnWinnerGames(tournament);

    // Update the gameRoundElement with the current stage of the tournament
    const gameRoundElement = document.getElementById('gameRound');
    gameRoundElement.textContent = determineTournamentStage(tournament);
    
    // if ongoing game is 7, the last game has been played
    if (tournament.ongoingGame === 7)
        await handleFinishedTournament(tournament);
    else {
        await createWinnerGame(tournament);
        await configureGame(tournament);
    }
}


async function initNewPage(additionalInfo) {
    let aliasArray = additionalInfo[1];

    for (let i = 0; i < 8; i++) {
        setUserNick(playerElemArray[i], aliasArray[i]);
    }
    confirmTournament(additionalInfo);
}

function setUserNick(playerElem, username) {
    playerElem.value = username;
    lockPlayerNick(playerElem);
    // playerElem.style.backgroundColor = 'lightgrey';
}

// perform checks on player's nickname
// modify the dom for better readability if valid or not
async function confirmTournament(additionalInfo) {
    let isValid = true;

    // check the array for dup with hash map
    const seenNicknames = {};
    playerElemArray.forEach((elem) => {
        // OR operator to set the value to 0 if it's undefined, +1 if it's defined
        seenNicknames[elem.value] = (seenNicknames[elem.value] || 0) + 1;
        // if > 1 -> duplicate, checkPlayerNick for rule
        if (seenNicknames[elem.value] > 1 || !checkPlayerNick(elem.value) || !elem.value.replace(/\s/g, '')) {
            rejectNickElem(elem);
            isValid = false;
        } else {
            elem.value = elem.value.replace(/\s/g, '');
            validateNickElem(elem)
        }
    })

    //console.log(`isValid: ${isValid}`)
    if (!isValid) {
        errorFieldElem.textContent = 'Error(s) in nicks';
    } else {
        errorFieldElem.textContent = '';
        confirmButtonElem.removeEventListener('click', confirmTournament);
        confirmNicknameBannerElem.style.display = 'none';

        // create in db the tournament
        // if it fails, redirect to login_tournament to restart
        let tournament;
        try {
            let playersIdArray = await createPlayersTournament();
            let gamesIdArray = await createGamesTournament(playersIdArray);
            tournament = await createTournamentBackend(additionalInfo[0], currentUser.id, playersIdArray, gamesIdArray);
        }
        catch (error) {
            console.error('Error:', error);
            navigate('/login_tournament');
            return;
        }

        // now the db has the tournament, fetch it and show infos
        await configureGame(tournament);
    }
    return isValid;
}

function validateNickElem (nickElem) {
    lockPlayerNick(nickElem);
    // nickElem.backgroundColor = 'lightgrey';
}

function rejectNickElem (nickElem) {

}

function checkPlayerNick(playerNick) {
    return playerNick.length >= 1; // todo: should be greater but need to update username policy as well
}

function lockPlayerNick(playerElem) {
    playerElem.disabled = true;
}

async function createGamesTournament(playersIdArray) {
    let game;
    let gamesIdArray = [];
    game = await createGameTournamentBackend(playersIdArray[0], playersIdArray[1], 1);
    gamesIdArray.push(game.id);
    game = await createGameTournamentBackend(playersIdArray[2], playersIdArray[3], 2);
    gamesIdArray.push(game.id);
    game = await createGameTournamentBackend(playersIdArray[4], playersIdArray[5], 3);
    gamesIdArray.push(game.id);
    game = await createGameTournamentBackend(playersIdArray[6], playersIdArray[7], 4);
    gamesIdArray.push(game.id);

    // create winners game, players are undefined for now but will be updated on wins
    game = await createGameTournamentBackend(null, null, 5);
    gamesIdArray.push(game.id);
    game = await createGameTournamentBackend(null, null, 6);
    gamesIdArray.push(game.id);
    game = await createGameTournamentBackend(null, null, 7);
    gamesIdArray.push(game.id);

    return gamesIdArray;
}

async function createPlayersTournament() {
    let idPlayerArray = [];

    // playerElemArray is global
    for (let player of playerElemArray) {
        try {
            let idPlayer = await createPlayerTournamentBackend(player);
            idPlayerArray.push(idPlayer);
        }
        catch (error) {
            console.error('Error:', error);
        }
    };
    return idPlayerArray;
}

function changeStartGameBanner (player1, player2) {
    // start at 1 instead of 0
    document.getElementById('playerVsPlayer').textContent = `${player1} vs ${player2}`;
}

// display the startGame banner and attach the event listener
async function configureGame(tournament) {
    let currGame = await getCurrentGameTournament(tournament.id)
    //console.log('current game', currGame);

    changeStartGameBanner(currGame.user1.nickname, currGame.user2.nickname);
    startGameBannerElem.style.display = 'block';
    startGameButtonElem.addEventListener('click', () => {
        startGame(tournament.id, currGame.id, currGame.user1.id, currGame.user2.id, currGame.user1.nickname, currGame.user2.nickname);
    });
}

async function createWinnerGame(tournament) {
    // games[index] is safe only because sorted in response
    tournament.games.sort((a, b) => a.game_number - b.game_number);
    switch (tournament.ongoingGame) {
        case 2:
            // top winner game
            await updatePlayersGameTournament(tournament.games[4].id, tournament.games[0].winner.id, tournament.games[1].winner.id);
            break;

        case 4:
            // bottom winner game
            await updatePlayersGameTournament(tournament.games[5].id, tournament.games[2].winner.id, tournament.games[3].winner.id);
            break;

        case 6:
            // final game
            await updatePlayersGameTournament(tournament.games[6].id, tournament.games[4].winner.id, tournament.games[5].winner.id);
            break;
    }
}

function determineTournamentStage(tournament) {
    if (tournament.ongoingGame < 4) {
        return i18next.t("gameRoundQuarterfinals");
    } else if (tournament.ongoingGame === 4 || tournament.ongoingGame === 5) {
        return i18next.t("gameRoundSemifinals");
    } else if (tournament.ongoingGame === 6) {
        return i18next.t("gameRoundFinals");
    } else {
        return 'Unknown Stage';
    }
}

async function startGame (tournamentId, gameId, playerId1, playerId2, player1, player2) {
    // ['tournament', tournamentId, gameIdTournament, player1, player2]
    await navigate('/launch_game', ['tournament', tournamentId, gameId, playerId1, playerId2, player1, player2]);
}

// Replace the direct assignment with localStorage.setItem
async function handleFinishedTournament(tournament) {
    // display winner and end button
    endGameBannerElem.style.display = 'block';
    endGameWinnerFieldElem.textContent = `Winner: ${tournament.winner.nickname}`;

    // Retrieve the value from local storage
    const isSentToBlockchain = tournament.is_sent_to_blockchain;
    if (!isSentToBlockchain) {
        // Store the value in local storage
        await sendScoreToBlockchain(endGameBannerElem);
    }
    // player decide to end the tournament
    endGameButtonElem.addEventListener('click', async () => {
        //console.log('endGameButton');
        await patchTournament(tournament.id, { ended: true });
        navigate('/tournament');    
    });
}


function updatePlayerNicknameOnWinnerGames (tournament) {
    tournament.games.sort((a, b) => a.game_number - b.game_number);
    if (tournament.games[0].ended)
        player1semifinals.textContent = tournament.games[0].winner.nickname;
    if (tournament.games[1].ended)
        player2semifinals.textContent = tournament.games[1].winner.nickname;
    if (tournament.games[2].ended)
        player3semifinals.textContent = tournament.games[2].winner.nickname;
    if (tournament.games[3].ended)
        player4semifinals.textContent = tournament.games[3].winner.nickname;

    if (tournament.games[4].ended)
        player1final.textContent = tournament.games[4].winner.nickname;
    if (tournament.games[5].ended)
        player2final.textContent = tournament.games[5].winner.nickname;
}