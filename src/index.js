import {
	AmbientLight,
	Color,
	DirectionalLight,
	Fog,
	// FogExp2,
	GridHelper,
	HemisphereLight,
	// Material,
	PerspectiveCamera,
	Raycaster,
	Scene,
	WebGLRenderer,
	Vector2
} from 'three';
import { MapControls } from 'three/examples/jsm/controls/OrbitControls';
// import { GUI } from 'three/examples/jsm/libs/dat.gui.module.js';
import { WEBGL } from 'three/examples/jsm/webGL';

// Game Objects
import HexGrid from './hexagon';

let HEIGHT,
	WIDTH,
	camera,
	controls,
	mouse,
	raycaster,
	renderer,
	scene;

let hexGrid,
	intersects,
	intersected;

function createControls() {
	controls = new MapControls(camera, renderer.domElement);
	controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
	controls.dampingFactor = 0.05;
	controls.screenSpacePanning = false;
	controls.minDistance = 20;
	controls.maxDistance = 100;
	controls.maxPolarAngle = Math.PI;
}

function createLighting() {
	const ambientLight = new AmbientLight('#222');
	const sky = '#aaa';
	const ground = '#000';
	const hemisphereLight = new HemisphereLight(sky, ground, .6);
	const directionalLight = new DirectionalLight('#fff', .6);
	directionalLight.position.set(150, 350, 350);
	directionalLight.castShadow = true;
	directionalLight.shadow.camera.left = -400;		// Directional shadows visible area constraints
	directionalLight.shadow.camera.right = 400;
	directionalLight.shadow.camera.top = 400;
	directionalLight.shadow.camera.bottom = -400;
	directionalLight.shadow.camera.near = 1;
	directionalLight.shadow.camera.far = 1000;
	directionalLight.shadow.mapSize.width = 2048;	// Shadow resolution
	directionalLight.shadow.mapSize.height = 2048;

	scene.add(hemisphereLight);
	scene.add(directionalLight);
	scene.add(ambientLight);
}

function createScene() {
	HEIGHT = window.innerHeight;
	WIDTH = window.innerWidth;

	// Scene
	scene = new Scene();
	scene.background = new Color('#ccc');
	// scene.fog = new FogExp2('#ccc', 0.002);
	scene.fog = new Fog('#ccc', 100, 950);

	// Camera
	const aspectRatio = WIDTH / HEIGHT;
	const fieldOfView = 60;
	const nearPlane = 1;
	const farPlane = 10000;
	camera = new PerspectiveCamera(fieldOfView, aspectRatio, nearPlane, farPlane);
	camera.position.set(0, 25, 15);
	// camera.rotation.set(10, 10, 10);

	// Interaction
	mouse = new Vector2();
	raycaster = new Raycaster();
	
	// Renderer
	renderer = new WebGLRenderer({ 
		alpha: true, 
		antialias: true
	});

	renderer.setSize(WIDTH, HEIGHT);
	// renderer.shadowMap.enabled = true;

	document.body.appendChild(renderer.domElement);
	document.addEventListener('mousemove', onMouseMove, false);
	window.addEventListener('resize', onWindowResize, false);
}

function createutilities() {
	const grid = new GridHelper(100, 20, '#FF9933', '#fff');
	scene.add(grid);

	// var gui = new GUI();
	// gui.add({ 'GUI Parameter': false }, 'GUI Parameter');
}

function createObjects() {
	hexGrid = new HexGrid(12, 12);
	scene.add(hexGrid);
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
		if (intersected != intersects[0]) {
			intersected = intersects[0];
			// intersected.originalMaterial = intersected.object.material;
			// intersected.object.material.color = new Color('#fff');
		}
	} else {
		// if (intersected) intersected.object.material = new Material(intersected.originalMaterial);
		intersected = null;
	}

	controls.update();	// only required if controls.enableDamping = true, or if controls.autoRotate = true
	renderer.render(scene, camera);
	requestAnimationFrame(update);
}

function onMouseMove({ clientX, clientY }) {
	event.preventDefault();
	
	// Normalized from -1 to 1
	mouse = new Vector2(
		(clientX / window.innerWidth) * 2 - 1,
		-(clientY / window.innerHeight) * 2 + 1
	);
	// console.log(intersected && intersected.originalMaterial);
}

function initialize() {
	createScene();
	createControls();
	createLighting();
	createutilities();
	createObjects();
	update();
}

if (WEBGL.isWebGLAvailable()) {
	initialize();
} else {
	var warning = WEBGL.getWebGLErrorMessage();
	document.body.appendChild(warning);
}

export {
	scene
};