import * as THREE from '/media/three.module.js';
import { FontLoader } from '/media/FontLoader.js';
import { TextGeometry } from '/media/TextGeometry.js';


export default class Board {
	constructor(size_renderer) {

		this.verticalGeometry = new THREE.BoxGeometry(10, size_renderer.height + 30, 20);
		this.horizontalGeometry = new THREE.BoxGeometry(size_renderer.width + 30, 10, 20);
		this.middleGeometry = new THREE.BoxGeometry(10, size_renderer.height / 9 - 40, 5);
        this.material = new THREE.MeshPhongMaterial({color: 0xFFFFFF, side: THREE.DoubleSide});

        this.top = new THREE.Mesh(this.horizontalGeometry, this.material);
        this.bot = new THREE.Mesh(this.horizontalGeometry, this.material);
        this.left = new THREE.Mesh(this.verticalGeometry, this.material);
        this.right = new THREE.Mesh(this.verticalGeometry, this.material);

        this.middle = new THREE.Mesh(this.middleGeometry, this.material);

		this.top.receiveShadow = true;
		this.bot.receiveShadow = true;
		this.left.receiveShadow = true;
		this.right.receiveShadow = true;
		this.middle.receiveShadow = true;
        
        this.right.position.set(size_renderer.width / 2 + 10, 0, 0);
        this.left.position.set(-(size_renderer.width / 2) - 10, 0, 0);
        this.bot.position.set(0, -(size_renderer.height / 2) - 10, 0);
        this.top.position.set(0, size_renderer.height / 2 + 10, 0);
        this.middle.position.set(0, 0, -15);

	}


	draw(scene, size_renderer) {
        scene.add(this.top);
        scene.add(this.bot);
        scene.add(this.left);
        scene.add(this.right);
        scene.add(this.middle);
        for (let i=1; i<=4; i++) {
            var clone = this.middle.clone();
            var clone2 = this.middle.clone();
            clone.position.set(0, (0 - (size_renderer.height / 9 - 40) - 40) * i, -20);
            clone2.position.set(0, (0 + (size_renderer.height / 9 - 40) + 40) * i, -20);
            scene.add(clone);
            scene.add(clone2);
        }
    }

	setScore1(num, scene, size_renderer) {
		if (this.scoreTextMesh) {
			scene.remove(this.scoreTextMesh);
			this.scoreTextMesh = null;
		}

		const loader = new FontLoader();
	
		loader.load('/media/playFont.json', font => {
			const textGeometry = new TextGeometry(num.toString(), {
				font: font,
				size: size_renderer.height / 5,
				height: 50,
				curveSegments: 12,
				bevelEnabled: false
			});
	
			var material = new THREE.MeshPhongMaterial({ color: 0x00ACDD, side: THREE.DoubleSide });
			var textMesh = new THREE.Mesh(textGeometry, material);
	
			textMesh.userData.isScoreText = true;
			textMesh.geometry.computeBoundingBox();
			var width = textMesh.geometry.boundingBox.max.x - textMesh.geometry.boundingBox.min.x;

			textMesh.position.set(-(size_renderer.width / 4) - width / 2, -(size_renderer.height / 4) / 2, -60);
	
			scene.add(textMesh);
	
			this.scoreTextMesh = textMesh;
		});
	}

	setScore2(num, scene, size_renderer) {
		// Remove previous score text mesh if it exists
		if (this.scoreTextMesh2) {
			scene.remove(this.scoreTextMesh2);
			this.scoreTextMesh2 = null; // Clear reference to previous score text mesh
		}
	
		// Create a font loader
		const loader = new FontLoader();
	
		// Load a font
		loader.load('/media/playFont.json', font => {
			// Create text geometry
			const textGeometry = new TextGeometry(num.toString(), {
				font: font,
				size: size_renderer.height / 5, // Size of the text
				height: 50, // Thickness of the text
				curveSegments: 12, // Number of segments for curve
				bevelEnabled: false // Beveling of the text
			});
	
			// Create a material
			const material = new THREE.MeshPhongMaterial({ color: 0xFB1075, side: THREE.DoubleSide });
	
			// Create a mesh using text geometry and material
			const textMesh2 = new THREE.Mesh(textGeometry, material);
	
			// Set a user data flag to identify score text meshes
			textMesh2.userData.isScoreText = true;

			textMesh2.geometry.computeBoundingBox();
			var width2 = textMesh2.geometry.boundingBox.max.x - textMesh2.geometry.boundingBox.min.x;

	
			// Position the text
			textMesh2.position.set(size_renderer.width / 4 - width2 / 2, -(size_renderer.height / 4) / 2, -60);
	
			// Add text mesh to the scene
			scene.add(textMesh2);
	
			// Save reference to the current score text mesh
			this.scoreTextMesh2 = textMesh2;
		});
	}

	setName1(username, scene, size_renderer) {
		const loader = new FontLoader();

		if (username.length > 15)
			var ratio = 30;
		else
			ratio = 25;

		loader.load('/media/playFont.json', font => {
			const textGeometry = new TextGeometry(username, {
				font: font,
				size: size_renderer.height / ratio,
				height: 10,
				curveSegments: 12,
				bevelEnabled: false
			});

			const material = new THREE.MeshPhongMaterial({ color: 0x00ACDD, side: THREE.DoubleSide });
			const userMesh1 = new THREE.Mesh(textGeometry, material);
			userMesh1.geometry.computeBoundingBox();
			var width = userMesh1.geometry.boundingBox.max.x - userMesh1.geometry.boundingBox.min.x;
			userMesh1.position.set(-(size_renderer.width / 4) - width / 2, size_renderer.height / 2 - 100, -60);
			scene.add(userMesh1);
		});
	}


	setName2(username, scene, size_renderer) {
		const loader = new FontLoader();

		if (username.length > 15)
			var ratio = 30;
		else
			ratio = 25;

		loader.load('/media/playFont.json', font => {
			const textGeometry = new TextGeometry(username, {
				font: font,
				size: size_renderer.height / ratio,
				height: 10,
				curveSegments: 12,
				bevelEnabled: false
			});
	
			const material = new THREE.MeshPhongMaterial({ color: 0xFB1075, side: THREE.DoubleSide });
			const userMesh2 = new THREE.Mesh(textGeometry, material);
			userMesh2.geometry.computeBoundingBox();
			var width2 = userMesh2.geometry.boundingBox.max.x - userMesh2.geometry.boundingBox.min.x;
			userMesh2.position.set(size_renderer.width / 4 - width2 / 2, size_renderer.height / 2 - 100, -60);
			scene.add(userMesh2);
		});
	}
}