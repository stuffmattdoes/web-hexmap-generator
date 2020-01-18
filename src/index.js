import {
	AmbientLight,
	Color,
	DirectionalLight,
	FogExp2,
	GridHelper,
	PerspectiveCamera,
	Scene,
	WebGLRenderer
} from 'three';
import { MapControls } from 'three/examples/jsm/controls/OrbitControls';
import { WEBGL } from './webGL';

// Game Objects
import Hexagon from './hexagon';

let scene = new Scene();
scene.background = new Color(0xcccccc);
scene.fog = new FogExp2(0xcccccc, 0.002);

let camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 10);
// camera.rotation.set(10, 10, 10);

let renderer = new WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);

let controls = new MapControls(camera, renderer.domElement);

function initialize() {
	document.body.appendChild(renderer.domElement);
	window.addEventListener('resize', onWindowResize, false);
	helpers();


	// Lighting
	let light = new DirectionalLight(0xffffff);
	light.position.set(1, 1, 1);
	scene.add(light);

	light = new DirectionalLight(0x002288);
	light.position.set(-1, -1, -1);
	scene.add(light);

	light = new AmbientLight(0x222222);
	scene.add(light);


	// Controls
	//controls.addEventListener( 'change', render ); // call this only in static scenes (i.e., if there is no animation loop)

	controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
	controls.dampingFactor = 0.05;

	controls.screenSpacePanning = false;

	controls.minDistance = 100;
	controls.maxDistance = 500;

	controls.maxPolarAngle = Math.PI / 2;


	// Game Objects
	const hex = Hexagon({ x: 0, y: 0 });
	scene.add(hex);


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
	requestAnimationFrame(update);
	controls.update();	// only required if controls.enableDamping = true, or if controls.autoRotate = true
	renderer.render(scene, camera);
}

function helpers() {
	const helper = new GridHelper(1000, 20, 0xffffff, 0xffffff);
	scene.add( helper );
}

initialize();
