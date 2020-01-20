import {
	AmbientLight,
	Color,
	DirectionalLight,
	FogExp2,
	GridHelper,
	PerspectiveCamera,
	Raycaster,
	Scene,
	WebGLRenderer,
	Vector2
} from 'three';
import { MapControls } from 'three/examples/jsm/controls/OrbitControls';
import { WEBGL } from './webGL';

// Game Objects
import HexGrid from './hexagon';
import { _Math } from 'three/src/math/Math';

const raycaster = new Raycaster();
const mouse = new Vector2();
let hexGrid,
	intersects,
	intersected;

let scene = new Scene();
scene.background = new Color('#ccc');
scene.fog = new FogExp2('#ccc', 0.002);

let camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 25, 15);
// camera.rotation.set(10, 10, 10);

let renderer = new WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);

let controls = new MapControls(camera, renderer.domElement);

function initialize() {
	document.body.appendChild(renderer.domElement);
	window.addEventListener('resize', onWindowResize, false);
	document.addEventListener('mousemove', onMouseMove, false);
	
	// Grid
	const grid = new GridHelper(100, 20, '#FF9933', '#fff');
	scene.add(grid);

	// Lighting
	let light = new DirectionalLight('#fff');
	light.position.set(1, 1, 1);
	scene.add(light);

	light = new DirectionalLight('#002288');
	light.position.set(-1, -1, -1);
	scene.add(light);

	light = new AmbientLight('#222222');
	scene.add(light);

	// Controls
	// controls.addEventListener('change', render); // call this only in static scenes (i.e., if there is no animation loop)
	controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
	controls.dampingFactor = 0.05;
	controls.screenSpacePanning = false;
	controls.minDistance = 20;
	controls.maxDistance = 100;
	controls.maxPolarAngle = Math.PI;

	// Game Objects
	hexGrid = new HexGrid(6, 6);
	scene.add(hexGrid);

	if (WEBGL.isWebGLAvailable()) {
		// Initiate function or other initializations here
		update();
	} else {
		var warning = WEBGL.getWebGLErrorMessage();
		document.body.appendChild(warning);
	}
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}

function update() {
	raycaster.setFromCamera(mouse, camera);
	intersects = raycaster.intersectObjects(hexGrid.children);

	if (intersects.length > 0 ) {
		if (intersected != intersects[0].object) {
			// if (intersected) intersected.material.emissive.setHex(intersected.currentHex);
			intersected = intersects[0].object;
			// intersected.currentHex = intersected.material.emissive.getHex();
			// intersected.material.emissive.setHex('#ff0000');
			// intersected.material.color = '#fff';
			// intersected.material.color = new THREE.Color('#ff0000');
		}
	} else {
		// if (intersected) intersected.material.emissive.setHex(intersected.currentHex);
		// intersected.material.color = '#fff';
		intersected = null;
	}

	controls.update();	// only required if controls.enableDamping = true, or if controls.autoRotate = true
	renderer.render(scene, camera);
	requestAnimationFrame(update);
}

function onMouseMove({ clientX, clientY }) {
	// Normalized from -1 to 1
	event.preventDefault();
	mouse.x = (clientX / window.innerWidth) * 2 - 1;
	mouse.y = -(clientY / window.innerHeight) * 2 + 1;
	console.log(intersected);
}

initialize();

export {
	scene
};