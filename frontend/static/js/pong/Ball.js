import * as THREE from '/media/three.module.js';
import { randomNumberBetween } from "./pong_utils.js";

// pass ball properties in js to use them

const VELOCITY_INCREASE = 0.01

export default class Ball {
	#light;
	#trail

	constructor(size_renderer) {
		this.radius = 20;
		this.geometry = new THREE.SphereGeometry(this.radius, 32, 32);
        this.material = new THREE.MeshBasicMaterial({color: 0xFDA141, side: THREE.DoubleSide});
        this.mesh = new THREE.Mesh(this.geometry, this.material);

		this.#light = new THREE.PointLight(0xFDA141, 5, 300, 0);
		this.#light.position.set(0, 0, 0);

		this.stopBall = true;
        this.direction = new THREE.Vector3(0, 0, 0);

		this.#trail = [];
		for (let i = 1; i < this.radius; i++) {
			const ballGeometry = new THREE.SphereGeometry(this.radius - i, 32, 32);
  			const ballMaterial = new THREE.MeshBasicMaterial({color: 0xFDA141 , transparent: true, opacity: 0.8});
  			const ball = new THREE.Mesh(ballGeometry, ballMaterial);
  			ball.position.set(0, 0, 0);
  			this.#trail.push(ball);
		}

		this.reset(size_renderer);
	}
	
	trail_set(x, y, z) {
		for (let i = 1; i < this.radius; i++) {
  			this.#trail[i - 1].position.set(x, y, z);
		}
	}
	
	trail_update() {
		var x_ball = this.mesh.position.x;
		var y_ball = this.mesh.position.y;
		for (let i = this.radius - 2; i > 0; i--) {
  			this.#trail[i].position.set(this.#trail[i - 1].position.x, this.#trail[i - 1].position.y, 0);
		}
  		this.#trail[0].position.set(x_ball, y_ball, 0);
	}

	rect() {
		return {
			top: this.mesh.position.y - this.radius,
			bottom: this.mesh.position.y + this.radius,
			left: this.mesh.position.x - this.radius,
			right: this.mesh.position.x + this.radius,
		}
	}

	reset(size_renderer) {
		this.mesh.position.set(0, 0, 0);
		this.#light.position.set(0, 0, 0);
		this.trail_set(0, 0, 0);

		this.direction = {x: 50, y: 50}
		let heading = randomNumberBetween(-Math.PI, Math.PI);
		while (Math.abs(heading) > Math.PI /  3 && Math.abs(heading) <  2 * Math.PI /  3) {
			heading = randomNumberBetween(-Math.PI, Math.PI);
		}
		this.direction = {x: Math.cos(heading), y: Math.sin(heading)}
		this.velocity = size_renderer.width / 125;
		this.stopBall = true;
	}

	update(size_renderer) {
		if (this.stopBall) return;

		this.mesh.position.x += this.velocity * this.direction.x;
		this.mesh.position.y += this.velocity * this.direction.y;
		this.velocity += VELOCITY_INCREASE;

		this.#light.position.x = this.mesh.position.x;
		this.#light.position.y = this.mesh.position.y;

		this.trail_update();

		this.collision(size_renderer)
	}

	collision(size_renderer) {
		if (this.rect().bottom >= size_renderer.height / 2 && this.direction.y > 0) {
			this.direction.y *= -1;
		}
		else if (this.rect().top <= -(size_renderer.height / 2) && this.direction.y < 0) {
			this.direction.y *= -1
		}
	}

	stopBallFor(time) {
		let temp = this.stopBall;
		this.stopBall = true;
		setTimeout(() => {
			this.stopBall = temp;
		}, time);
	}

	draw(scene) {
        scene.add(this.mesh);
        scene.add(this.#light);
		for (let i = 1; i < this.radius; i++) {
			scene.add(this.#trail[i - 1]);
	  	}
    }

}

