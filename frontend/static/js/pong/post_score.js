import { getCookie } from '../utils.js'

export async function postScore(endpoint, score_user1, score_user2, user1, user2, quickplay) {
	const csrftoken = getCookie('csrftoken');

	let winner = score_user1 > score_user2 ? user1 : user2;
	let data = {
		score_user1: score_user1,
		score_user2: score_user2,
		user1: user1,
		user2: user2,
		winner: winner,
		quickplay: quickplay,
	};

	try {
		const response = await fetch(endpoint, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'X-CSRFToken': csrftoken,
			},
			body: JSON.stringify(data),
		});

		const responseData = await response.json();
		//console.log(responseData);
	} catch (error) {
		console.error('Error:', error);
	}
}

export async function patchGameTournament(endpoint, game_id, score_user1, score_user2, user1, user2) {
	const csrftoken = getCookie('csrftoken');

	let winner = score_user1 > score_user2 ? user1 : user2;
	let data = {
		winner: winner,
		score_user1: score_user1,
		score_user2: score_user2,
		ended: true,
	};

	try {
		const response = await fetch(`${endpoint}/${game_id}`, {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
				'X-CSRFToken': csrftoken,
			},
			body: JSON.stringify(data),
		});

		const responseData = await response.json();
		//console.log('patched game: ', responseData);
	} catch (error) {
		console.error('Error:', error);
	}
}

export async function addOneToOngoingGameTournament(tournamentId) {
	const csrftoken = getCookie('csrftoken');

	try {
		const response = await fetch(`api/update_ongoing_game_tournament/${tournamentId}`, {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
				'X-CSRFToken': csrftoken,
			},
		});

		const responseData = await response.json();
		//console.log('patched tournament: ', responseData);
	} catch (error) {
		console.error('Error:', error);
	}
}

export async function updateUserGameNumber(user_id, isWinner, is_user) {
	const csrftoken = getCookie('csrftoken');
	const  url = isWinner ? `api/update_game_won/${user_id}` : `api/update_game_lost/${user_id}`;

	try {
		const response = await fetch(url, {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
				'X-CSRFToken': csrftoken,
			},
		});

	const responseData = await response.json();
	} catch (error) {
		console.error('Error:', error);
	}
}