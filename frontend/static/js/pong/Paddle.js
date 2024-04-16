import * as THREE from '/media/three.module.js';
import { linearInterpolation} from "./pong_utils.js";

export default class Paddle {
    #render_height;
	#height;
	#width;
	#maxSpeed;
	#keys = [];
	#light;

	constructor(x, color, size_renderer) {                
    	this.#render_height = size_renderer.height;
    	this.#height = size_renderer.height / 5;
    	this.#width = 10;
    	this.#maxSpeed = size_renderer.height / 100;
    	this.geometry = new THREE.CapsuleGeometry(this.#width, this.#height, 16, 31);
    	this.material = new THREE.MeshPhongMaterial({color: color, side: THREE.DoubleSide});
    	this.mesh = new THREE.Mesh(this.geometry, this.material);
    	this.mesh.position.set(x, 0, 0);

		this.#light = new THREE.PointLight(color, 4, 350, 0);
		this.#light.position.set(x, 0, 0);

	}

	reset() {
		this.#light.position.y = 0;
		this.mesh.position.y = 0;
	}

	set_y(value) {
		let halfPaddleLength = this.halfLength;

		if (this.mesh.position.y + value - halfPaddleLength <= -(this.#render_height / 2)) {
			value = -(this.#render_height / 2);
			this.mesh.position.y = value + halfPaddleLength;
		} else if (this.mesh.position.y + value + halfPaddleLength >= this.#render_height / 2) {
			value = this.#render_height / 2;
			this.mesh.position.y = value - halfPaddleLength;
		} else {
			this.mesh.position.y += value;
		}
		this.#light.position.y = this.mesh.position.y;
	}

    rect() {
		return {
			top: this.mesh.position.y - this.#height / 2,
			bottom: this.mesh.position.y + this.#height / 2,
			left: this.mesh.position.x - this.#width / 2,
			right: this.mesh.position.x + this.#width / 2,
		}
	}

    get paddlePos() {
		return {
			min: this.mesh.position.y - this.halfLength,
			mid: this.mesh.position.y,
			max: this.mesh.position.y + this.halfLength,
		}
	}

    get halfLength() {
		return (this.rect().bottom - this.rect().top) / 2
	}

	get height() {
		return this.#height
	}

	get width() {
		return this.#width
	}

    linearInterpolationBounce(ballPos) {
		let minBounceChange = -Math.PI / 6
		let maxBounceChange = Math.PI / 6
		return linearInterpolation(ballPos, this.paddlePos.min, minBounceChange, this.paddlePos.max, maxBounceChange)
	}

    updateIA(heightCollision, size_renderer ) {
		if (heightCollision >= ((size_renderer.height / 2) - (this.#height/2)))
			heightCollision -= this.#height/2;
		if (heightCollision <= (-(size_renderer.height / 2) + (this.#height/2)))
			heightCollision += this.#height/2;
		// neg when ball is above, pos when below, bigger when far
		// if (((this.mesh.position.y + this.#height/2) <= size_renderer.height / 2 )&& ((this.mesh.position.y - this.#height/2) >= -size_renderer.height / 2 ) )
			if (heightCollision < this.mesh.position.y ) 
				this.goUp();
			if (heightCollision > this.mesh.position.y )
				this.goDown();
	}

    update(delta, heightCollision) {
		const MAX_PADDLE_SPEED = 0.5;
		const SMOOTHING_FACTOR = 0.1;
	
		if (heightCollision !== undefined && heightCollision !== null) {
			let ballHeightFromToPaddle = heightCollision - this.mesh.position.y;
			let targetPaddleSpeed = ballHeightFromToPaddle * 0.2;
	
			targetPaddleSpeed = Math.min(Math.abs(targetPaddleSpeed), MAX_PADDLE_SPEED) * Math.sign(targetPaddleSpeed);
	
			let smoothedPaddleSpeed = this.smoothedPaddleSpeed || 0;
			smoothedPaddleSpeed = SMOOTHING_FACTOR * targetPaddleSpeed + (1 - SMOOTHING_FACTOR) * smoothedPaddleSpeed;
	
			this.mesh.position.y += smoothedPaddleSpeed * delta;
			this.smoothedPaddleSpeed = smoothedPaddleSpeed;
		}
    }

	draw(scene) {
        scene.add(this.mesh);
        scene.add(this.#light);
    }

    handleKeyDown(event) {
		this.#keys[event.key] = true;
	}

	handleKeyUp(event) {
		this.#keys[event.key] = false;
	}

	updateWithKeyboard() {
		this.bindHandleKeyDown = this.handleKeyDown.bind(this);
		this.bindHandleKeyUp = this.handleKeyUp.bind(this);
		document.addEventListener("keydown", this.bindHandleKeyDown);
		document.addEventListener("keyup", this.bindHandleKeyUp);
	}

	updateLeft() {
		if (this.#keys['w']) {
			this.set_y(this.#maxSpeed);
		}
		if (this.#keys['s']) {
			this.set_y(-this.#maxSpeed);
		}
	}

	goUp() {
		this.mesh.position.y -= this.#maxSpeed;
		this.#light.position.y = this.mesh.position.y;
	}
	
	goDown(){
		this.mesh.position.y += this.#maxSpeed;
		this.#light.position.y = this.mesh.position.y;
	}

	updateRight() {
		if (this.#keys['ArrowUp']) {
			this.set_y(this.#maxSpeed);
		}
		if (this.#keys['ArrowDown']) {
			this.set_y(-this.#maxSpeed);
		}
	}

	removeListener() {
		document.removeEventListener("keydown", this.bindHandleKeyDown);
		document.removeEventListener("keyup", this.bindHandleKeyUp);
	}
}
