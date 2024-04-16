// Imports
import Ball from "./Ball.js";
import Paddle from "./Paddle.js";
import Board from "./Board.js";
import { collisionPaddleBall } from "./pong_utils.js";
import {postScore, patchGameTournament, addOneToOngoingGameTournament, updateUserGameNumber} from "./post_score.js";
import { getCurrentUserInfo, setupNavigationEventListeners } from "../utils.js";
import { predictBallcollision, predictBallcollision2 } from "./ia.js";
import { setStatus } from "../utils.js";
import { loadText } from "../utils.js";
import * as THREE from '/media/three.module.js';
import { OrbitControls } from '/media/OrbitControls.js';
import { EffectComposer } from "/media/EffectComposer.js";
import { RenderPass } from "/media/RenderPass.js";
import { UnrealBloomPass } from "/media/UnrealBloomPass.js";
import * as MathUtils from '/media/MathUtils.js';

// var for IA
let probabilyStrat2 = 0.5;
let wasAboveZero = true;
let randomNum = Math.random();
let scoreIa = 0;
let scorePlayer = 0;
let strat1 = false;
let strat2 = false;
var scene = new THREE.Scene();
scene.background = new THREE.Color(0x08212C);

var renderer = new THREE.WebGLRenderer( { antialias : true } );
var ren_width = window.innerWidth;
var	ren_height = window.innerHeight;
if (ren_width > ren_height)
{
	if (ren_width < 1920)
		ren_width = 1920;
	ren_height = ren_width / 1.97734294542;
	if (ren_height < window.innerHeight)
		ren_height = window.innerHeight;
}
else
{
	if (ren_height < 971)
		ren_height = 971;
	ren_width = ren_height * 1.97734294542;
	if (ren_width < window.innerWidth)
		ren_width = window.innerWidth;
}
renderer.setSize(ren_width, ren_height);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);
const size_renderer = new THREE.Vector2();
size_renderer.width = ren_width;
size_renderer.height = ren_height;

var fov = 75;
var aspectRatio = ren_width / ren_height;
var height = ren_height;
var fovRadians = MathUtils.degToRad(fov);
var distanceZ = height / (2 * Math.tan(fovRadians / 2));

var camera = new THREE.PerspectiveCamera(fov, aspectRatio, 0.1, 10000);
camera.position.z = distanceZ + (distanceZ * 0.3);
camera.position.x = 0;
camera.position.y = 0;
camera.lookAt(new THREE.Vector3(0, 0, 0));


var light = new THREE.PointLight(0xDDDDDD, 2, size_renderer.width + 500, 0);
light.castShadow = true;
light.position.set(0, 0, 100);
scene.add(light);


scene.add(new THREE.AmbientLight(0xFFFFFF, 1));

var controls = new OrbitControls(camera, renderer.domElement);
controls.enablePan = false;


const renderScene = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1.5,
  0.4,
  0.85
);
bloomPass.threshold = 0.5;
bloomPass.strength = 2;
bloomPass.radius = 0.5;
const bloomComposer = new EffectComposer(renderer);
bloomComposer.setSize(window.innerWidth, window.innerHeight);
bloomComposer.renderToScreen = true;
bloomComposer.addPass(renderScene);
bloomComposer.addPass(bloomPass);


const particleMaterial = new THREE.PointsMaterial({ size: 7, color: 0xFFFFFF });
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 200;
const positions = new Float32Array(particlesCount * 3);
const directions = new Float32Array(particlesCount * 3);
let center = new THREE.Vector3(0, 0, 0);
const creationTimes = new Float32Array(particlesCount);



const ball = new Ball(size_renderer);
const firstPaddle = new Paddle(-(size_renderer.width / 2) + 100, 0x00ACDD, size_renderer);
const secondPaddle = new Paddle(size_renderer.width / 2 - 100, 0xFB1075, size_renderer);
const board = new Board(size_renderer);

// Determine game mode
let gameMode;
let username2;

//Determine if game is started or 
let start = false

// Set up game elements
const pointsToWin = 1;
let firstScore;
let secondScore;
const bannerElem = document.getElementById('banner');
const endElem = document.getElementById('end');
const userInfo = await getCurrentUserInfo();
let requiredElapsed = 1000 / 120; // 120fps
let end = { value: false };
let requestID;
let winner;
let lastTime;
let heightCollision = 0;
let playersIdTournament = [];
let playerNicknamesTournament = [];
let gameIdTournament;
let tournamentId;
let animatePoint = 0;

export async function init(additionalInfo) {
	if (!additionalInfo) {
		navigate('/menu');
		return;
	}
	// console.log(additionalInfo)
	gameMode = additionalInfo[0];
	if (gameMode === 'two_players') {
		username2 = additionalInfo[1];
	}
	// in case of tournament the players are passed with additionalInfo
	if (gameMode === 'tournament') {
		tournamentId = additionalInfo[1];
		gameIdTournament = additionalInfo[2];
		playersIdTournament.push(additionalInfo[3], additionalInfo[4]);
		playerNicknamesTournament.push(additionalInfo[5], additionalInfo[6]);
	}
	setupNavigationEventListeners(createGame)
}

function createGame() {
	firstScore = 0;
	secondScore = 0;
	ball.draw(scene);
    firstPaddle.draw(scene);
    secondPaddle.draw(scene);
	board.draw(scene, size_renderer);
	end.value = false;
	loadText();
	bannerElem.style.display = 'block';
	board.setScore1(firstScore, scene, size_renderer);
	board.setScore2(secondScore, scene, size_renderer);

	var username1 = localStorage.getItem('username');
	if (username1 && gameMode !== 'tournament') {
		board.setName1(username1, scene, size_renderer);
	} else if (username1) {
		board.setName1(playerNicknamesTournament[0], scene, size_renderer);
    } else {
      	console.error("Username not found in local storage");
       	handleLogout();
    }

	if (gameMode === 'single_player') {
		board.setName2('AI', scene, size_renderer);
	} else if (gameMode === 'two_players') {
		board.setName2(username2, scene, size_renderer);
	} else {
		board.setName2(playerNicknamesTournament[1], scene, size_renderer);
	}

	firstPaddle.updateWithKeyboard();
	if (gameMode !== 'single_player') secondPaddle.updateWithKeyboard();
	window.addEventListener('keydown', startGameOnKeyPress, { once: true });
	window.addEventListener('popstate', cleanup, {once: true});
	document.getElementById('quit').addEventListener('click', quitAndCleanUp, {once: true});
	ball.reset(size_renderer);

	//console.log(`game set up with gameMode ${gameMode}`)
	gameLoop();
	// Call predictBallcollision every 1 second
	setInterval(() => {
		if (gameMode === 'single_player') {
			heightCollision = IaStrat(ball, size_renderer, start, firstScore, secondScore);
		} 
	}, 1000);
    setStatus('in_game')
}

function gameLoop(time) {
	//console.log(`gameLoop`)
	if (!lastTime) lastTime = time;
	let elapsedTime = time - lastTime;

	// set the game to run at 120 fps
	if (elapsedTime > requiredElapsed) {
		updateGame(heightCollision);
    	requestAnimationFrame(animate);
		lastTime = time;
	}
	if (end.value) return;
	requestID = requestAnimationFrame(gameLoop);
}

function updateGame(heightCollision) {
	if (isLose(size_renderer)) handleLose()

	collisionPaddleBall(firstPaddle, secondPaddle, ball);
	ball.update(size_renderer);
	firstPaddle.updateLeft();
	if (animatePoint == 1)
  		animateParticles();
	if (gameMode === 'single_player') secondPaddle.updateIA(heightCollision, size_renderer);
	else secondPaddle.updateRight();
	
}

function animate() {
    renderer.render(scene, camera);
    controls.update();
	bloomComposer.render();
}

function isLose(size_renderer) {
	return ball.rect().right >= size_renderer.width / 2 || ball.rect().left <= -(size_renderer.width / 2)
}


function animateParticles() {
	requestAnimationFrame(animate);
  
	const speed = 2;
	const maxDistance = 200;
	const fadeOutTime = 4000;
  
	for (let i = 0; i < particlesCount; i++) {
	  const particlePosition = new THREE.Vector3(
			positions[i * 3],
			positions[i * 3 + 1],
			positions[i * 3 + 2]
	  	);

	  	const direction = new THREE.Vector3(
			directions[i * 3],
			directions[i * 3 + 1],
			directions[i * 3 + 2]
	 	);
  
		const distance = particlePosition.distanceTo(center);
		if (distance > maxDistance || performance.now() - creationTimes[i] > fadeOutTime)
			positions[i * 3] = positions[i * 3 + 1] = positions[i * 3 + 2] = -10000;
		else
		{
	  		particlePosition.add(direction.multiplyScalar(speed));
	  		particlesGeometry.attributes.position.setXYZ(i, particlePosition.x, particlePosition.y, particlePosition.z);
		}
	}
	particlesGeometry.attributes.position.needsUpdate = true;
}
  


function handleLose() {

	center = new THREE.Vector3(ball.mesh.position.x, ball.mesh.position.y, 0);
	for (let i = 0; i < particlesCount; i++) {
		positions[i * 3] = center.x;
		positions[i * 3 + 1] = center.y;
		positions[i * 3 + 2] = center.z;
	
		directions[i * 3] = (Math.random() - 0.5) * 2;
		directions[i * 3 + 1] = (Math.random() - 0.5) * 2;
		directions[i * 3 + 2] = (Math.random() - 0.5) * 2;

		creationTimes[i * 3] = performance.now();
		creationTimes[i * 3 + 1] = performance.now();
		creationTimes[i * 3 + 2] = performance.now();
	}
	particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
	particlesGeometry.setAttribute('direction', new THREE.BufferAttribute(directions, 3));
	const particles = new THREE.Points(particlesGeometry, particleMaterial);
	if (ball.mesh.position.x < 0)
		particleMaterial.color.setHex(0x00ACDD);
	else
		particleMaterial.color.setHex(0xFB1075);
	scene.add(particles);
	animatePoint = 1;

	updateScore()
	board.setScore1(firstScore, scene, size_renderer);
	board.setScore2(secondScore, scene, size_renderer);
	ball.reset(size_renderer);
	ball.stopBall = true;
	// playerPaddle.reset()
	// computerPaddle.reset()
	if (firstScore == pointsToWin) {
		if (gameMode === 'tournament') winner = playerNicknamesTournament[0];
		else winner = userInfo.username;
		endGame();
	}
	else if (secondScore == pointsToWin) {
		if (gameMode === 'tournament') winner = playerNicknamesTournament[1];
		else if (gameMode === 'single_player') winner = 'IA';
		else winner = username2
		endGame();
	}
	else 
	{
		ball.reset(size_renderer);
		ball.stopBall = false;
		ball.stopBallFor(1000);
		gameLoop();
	}
}

function updateScore() {
	if (ball.rect().right > 0) {
		firstScore += 1;
	} else {
		secondScore += 1;
	}
}

function startGameOnKeyPress() {
	ball.stopBall = false;
	ball.stopBallFor(1000);

	setTimeout(() => {
        start = true;
    }, 1000);

	window.removeEventListener('keydown', startGameOnKeyPress);
	document.getElementById('banner').style.display = 'none';

}

function IaStrat(ball, size_renderer, start, firstScoreElem, secondScoreElem)
{
	
	if(firstScoreElem == 5 || secondScoreElem == 5)
	{
		scoreIa = 0;
		firstScoreElem = 0;
	}
	let height = size_renderer.height;
	
	if (secondScoreElem > scoreIa)
	{
		scoreIa = secondScoreElem;

		if (strat2 && probabilyStrat2 < 1)
			probabilyStrat2 += 0.25;
		if (strat1 && probabilyStrat2 > 0)
			probabilyStrat2 -= 0.25;
	}

	if (firstScoreElem > scorePlayer)
	{
		scorePlayer = firstScoreElem;

		if (strat2 && probabilyStrat2 > 0)
			probabilyStrat2 -= 0.25;
		if (strat1 && probabilyStrat2 < 1)
		probabilyStrat2 += 0.25;
	}

	if (!start)
		return(0);

	if (ball.direction.x < 0 && wasAboveZero == false)
	{
		wasAboveZero = true;
		randomNum = Math.random();
	}
	if (ball.direction.x > 0)
		wasAboveZero = false;
	
	if (randomNum < probabilyStrat2) 
	{
		strat2 = true;
		strat1 = false;
        return predictBallcollision2(ball, size_renderer);
    } 
	else 
	{
		strat1 = true;
		strat2 = false;
        return predictBallcollision(ball, size_renderer);
    }
}


function playAgainEventListeners() {
	document.getElementById('playAgain').addEventListener('click', playAgainClick, { once: true });
}

function playAgainClick() {
	endElem.style.display = 'none';
	createGame();
}

async function endGame() {
	document.getElementById('winner').textContent = winner;
	document.getElementById('end').style.display = 'block';

	start = false

	if (gameMode === 'tournament')
		document.getElementById('playAgain').style.display = 'none';
	else
		playAgainEventListeners();


	if (gameMode !== 'tournament')
	{
		await updateUserGameNumber(userInfo.id, winner === userInfo.username, 'True');
		if (gameMode === 'two_players' && username2 !== 'GUEST')
		{
			fetch(`/api/getOtherUser/${username2}`)
			.then(response => response.json())
			.then(data => {
				postScore('api/save_game', firstScore, secondScore, userInfo.id, data.id, gameMode === 'single_player');
				updateUserGameNumber(data.id, winner === username2);
		   	})
		}
		else
			await postScore('api/save_game', firstScore, secondScore, userInfo.id, '', gameMode === 'single_player', 'False');
	}
	else {
		await patchGameTournament('api/update_game_tournament', gameIdTournament, firstScore, secondScore, playersIdTournament[0], playersIdTournament[1]);
		await addOneToOngoingGameTournament(tournamentId);
	}
}


function quitAndCleanUp() {
	if (gameMode === 'tournament') navigate('/tournament');
	else navigate('/menu');
	cleanup();
}

function cleanup() {
	end.value = true;
	window.removeEventListener('keydown', startGameOnKeyPress);
	firstPaddle.removeListener();
	window.cancelAnimationFrame(requestID);
	//console.log(`killed gameLoop with requestID ${requestID}`)
}

function onWindowResize() {
	if (window.location.href.includes('quick_play') || window.location.href.includes('two_players')) {
		var ren_width = window.innerWidth;
		var ren_height = window.innerHeight;
		if (ren_width < 700)
			ren_width = 700;
		if (ren_height < 500)
			ren_height = 500;
		renderer.setSize(ren_width, ren_height);
    	camera.aspect = ren_width / ren_height;
 		camera.updateProjectionMatrix();
	}
}

window.addEventListener('resize', onWindowResize, false);
