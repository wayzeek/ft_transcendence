import {getCookie} from "../utils.js";

// use a player to create a playerTournament in the backend
// return an id
export async function createPlayerTournamentBackend(player) {
    const csrftoken = getCookie('csrftoken');

    const data = {
        nickname: player.value
    };

    try {
        const response = await fetch('api/create_player_tournament', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken,
            },
            body: JSON.stringify(data),
        });

        const responseData = await response.json();
        // Add the id to the array
        return responseData.id;
    } catch (error) {
        console.error('Error:', error);
        // return smthing?
    }
}

export async function createGameTournamentBackend(player1, player2, number) {
    const csrftoken = getCookie('csrftoken');

    const data = {
        user1: player1,
        user2: player2,
        game_number: number,
    };

    try {
        const response = await fetch('api/create_game_tournament', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken,
            },
            body: JSON.stringify(data),
        });

        const responseData = await response.json();
        //console.log('game created', responseData);
        return responseData;
    } catch (error) {
        console.error('Error:', error);
    }
}


export async function createTournamentBackend (tournamentName, creatorId, playersIdArray, gamesIdArray) {
    const csrftoken = getCookie('csrftoken');
    const data = {
        name: tournamentName,
        creator: creatorId,
        // spread operator used to get all values (not keys!) from the map
        users: playersIdArray,
        games: gamesIdArray,
    }

    try {
        const response = await fetch('api/create_tournament', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken,
            },
            body: JSON.stringify(data),
        });
        let responseData = await response.json();
        //console.log('tournament created', responseData)
        return await responseData;
    }
    catch (error) {
        console.error('Error:', error);
    }
}

// return if tournament associated with this user is ongoing (bool)
export async function isTournamentOngoing(creatorId) {
    const csrftoken = getCookie('csrftoken');

    try {
        const response = await fetch(`api/get_tournament/${creatorId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken,
            },
        });

        const responseData = await response.json();
        //console.log('tournament is ongoing: ', response.status === 200);
        // return true if the tournament is ongoing
        // false if ended or no tournament found
        if (response.status !== 200)
            return false;
        else
            return responseData.ongoing;
    }
    catch (error) {
        console.error('Error:', error);
        return false;
    }
}

export async function getGameTournament(gameId) {
    const csrftoken = getCookie('csrftoken');

    try {
        const response = await fetch(`api/get_game_tournament/${gameId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken,
            },
        });
        const responseData = await response.json();
        //console.log('game: ', responseData);
        return await responseData;
    }
    catch (error) {
        console.error('Error:', error);
    }
}


export async function getCurrentGameTournament(tournamentId) {
    const csrftoken = getCookie('csrftoken');

    try {
        const response = await fetch(`api/get_current_game_tournament/${tournamentId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken,
            },
        });
        return await response.json();
    }
    catch (error) {
        console.error('Error:', error);
    }
}

export async function getUserTournament(userId) {
    const csrftoken = getCookie('csrftoken');

    try {
        const response = await fetch(`api/get_user_tournament/${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken,
            },
        });

        return await response.json();
    }
    catch (error) {
        console.error('Error:', error);
    }
}

export async function checkTournament(creatorId) {
    const csrftoken = getCookie('csrftoken');

    try {
        const response = await fetch(`api/check_tournament/${creatorId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken,
            },
        });

        const responseData = await response.json();
        return responseData.exist;
    }
    catch (error) {
        console.error('Error:', error);
    }
}

export async function getTournament(creatorId) {
    const csrftoken = getCookie('csrftoken');

    try {
        const response = await fetch(`api/get_tournament/${creatorId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken,
            },
        });

        const responseData = await response.json();
        //console.log('tournament: ', responseData);
        if (response.status !== 200)
            return false;
        else
            return responseData;
    }
    catch (error) {
        console.error('Error:', error);
    }
}

export async function updatePlayersGameTournament(game_id, user1, user2) {
    const csrftoken = getCookie('csrftoken');

    let data = {
        user1: user1,
        user2: user2,
    };

    try {
        const response = await fetch(`api/update_game_tournament/${game_id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken,
            },
            body: JSON.stringify(data),
        });

        const responseData = await response.json();
        //console.log('updated players for winner game: ', responseData);
    } catch (error) {
        console.error('Error:', error);
    }
}

export async function patchTournament (tournamentId, data) {
    const csrftoken = getCookie('csrftoken');

    try {
        const response = await fetch(`api/update_tournament/${tournamentId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken,
            },
            body: JSON.stringify(data),
        });

        const responseData = await response.json();
        //console.log('patched tournament: ', responseData);
    } catch (error) {
        console.error('Error:', error);
    }
}

