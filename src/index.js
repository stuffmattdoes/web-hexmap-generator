import {
	AmbientLight,
	BackSide,
	Color,
	DepthTexture,
	DirectionalLight,
	DirectionalLightHelper,
	// FogExp2,
	Fog,
	// GridHelper,
	HemisphereLight,
	HemisphereLightHelper,
	Mesh,
	MeshBasicMaterial,
	MeshLambertMaterial,
	NearestFilter,
	PerspectiveCamera,
	PlaneBufferGeometry,
	Raycaster,
	RGBFormat,
	Scene,
	ShaderMaterial,
	SphereBufferGeometry,
	UnsignedShortType,
	WebGLRenderer,
	Vector2,
	// Vector3,
	WebGLRenderTarget
} from 'three';
// import { AsciiEffect } from 'three/examples/jsm/effects/AsciiEffect.js';
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { MapControls } from 'three/examples/jsm/controls/OrbitControls';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { GUI } from 'three/examples/jsm/libs/dat.gui.module.js';
import { WEBGL } from 'three/examples/jsm/webGL';
// import { Sky } from 'three/examples/jsm/objects/Sky.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
// import { Water } from 'three/examples/jsm/objects/Water2.js';

// Game Objects
import Terrain from './terrain';
import Water from './water';
import { skyVertex, skyFrag } from './sky.glsl.js';

export const colors = {
	ground: new Color('hsl(35, 100%, 75%)'),
	// horizon: new Color('#e6f0ff'),
	horizon: new Color('hsl(214, 100%, 95%)'),
	sky: new Color('hsl(214, 100%, 60%)'),
	earth: {
		a: new Color('#493829'),
		b: new Color('#816c5b'),
		c: new Color('#a9a18c'),
		d: new Color('#613318'),
		e: new Color('#855723'),
		f: new Color('#b99c6b'),
		g: new Color('#8f3b1b'),
		h: new Color('#d57500'),
		i: new Color('#dbca60'),
		j: new Color('#404f24'),
		k: new Color('#668d3c'),
		l: new Color('#bdd09f'),
		m: new Color('#4e6172'),
		n: new Color('#83929f'),
		o: new Color('#a3adb8')
	},
	water: {
		a: new Color('#D3F3EE'),
		b: new Color('#7BD8C1'),
		c: new Color('#7FB7BE'),
		d: new Color('#53A0BC'),
		e: new Color('#154C7C'),
	}
};

let HEIGHT = window.innerHeight,
	WIDTH = window.innerWidth,
	// ascii,
	camera,
	controls,
	depthTarget,
	// depthTarget2,
	hemisphereLight,
	mouse,
	postprocessing = {},
	raycaster,
	renderer,
	scene,
	stats;

let terrain,
	intersects,
	intersected,
	childUpdates = [],
	water;

function createControls() {
	controls = new MapControls(camera, renderer.domElement);
	controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
	controls.dampingFactor = 0.05;
	controls.screenSpacePanning = false;
	controls.minDistance = 1;
	controls.maxDistance = 100;
	controls.maxPolarAngle = Math.PI;
}

function createLighting() {
	const ambientLight = new AmbientLight('#ca80ff', 0.5);
	ambientLight.name = 'Ambient Light';
	scene.add(ambientLight);

	hemisphereLight = new HemisphereLight(colors.sky, colors.ground, 0.2);
	hemisphereLight.name = 'Hemisphere Light';
	// hemisphereLight.color.setHSL(0.6, 1, 0.6);
	// hemisphereLight.groundColor.setHSL(0.1, 1, 0.75);
	hemisphereLight.position.set(0, 25, 0);
	scene.add(hemisphereLight);

	const hemiLightHelper = new HemisphereLightHelper(hemisphereLight, 10);
	scene.add(hemiLightHelper);

	const dirLight = new DirectionalLight(0xffffff, 0.65);
	dirLight.name = 'Directional Light';
	dirLight.position.set(-1, 1.75, 1);
	dirLight.position.multiplyScalar(30);
	scene.add(dirLight);

	dirLight.castShadow = true;
	dirLight.shadow.mapSize.width = 2048;
	dirLight.shadow.mapSize.height = 2048;

	const d = 50;
	dirLight.shadow.camera.left = -d;
	dirLight.shadow.camera.right = d;
	dirLight.shadow.camera.top = d;
	dirLight.shadow.camera.bottom = -d;

	dirLight.shadow.camera.far = 3500;
	dirLight.shadow.bias = - 0.0001;

	const dirLightHeper = new DirectionalLightHelper(dirLight, 10);
	scene.add(dirLightHeper);
}

function createSkyShader() {
	// Add Sky
	const sky = new Sky();
	sky.scale.setScalar( 450000 );
	scene.add(sky);

	// Add Sun Helper
	const sunSphere = new Mesh(
		new SphereBufferGeometry(20000, 16, 8),
		new MeshBasicMaterial({ color: 0xffffff })
	);
	sunSphere.position.y = - 700000;
	sunSphere.visible = false;
	scene.add(sunSphere);

	/// GUI
	var effectController = {
		turbidity: 10,
		rayleigh: 2,
		mieCoefficient: 0.005,
		mieDirectionalG: 0.8,
		luminance: 1,
		inclination: 0.49, // elevation / inclination
		azimuth: 0.25, // Facing front,
		sun: !true
	};

	var distance = 400000;

	function guiChanged() {
		var uniforms = sky.material.uniforms;
		uniforms['turbidity'].value = effectController.turbidity;
		uniforms['rayleigh'].value = effectController.rayleigh;
		uniforms['mieCoefficient'].value = effectController.mieCoefficient;
		uniforms['mieDirectionalG'].value = effectController.mieDirectionalG;
		uniforms['luminance'].value = effectController.luminance;

		var theta = Math.PI * (effectController.inclination - 0.5);
		var phi = 2 * Math.PI * (effectController.azimuth - 0.5);

		sunSphere.position.x = distance * Math.cos(phi);
		sunSphere.position.y = distance * Math.sin(phi) * Math.sin(theta);
		sunSphere.position.z = distance * Math.sin(phi) * Math.cos(theta);
		sunSphere.visible = effectController.sun;

		uniforms['sunPosition'].value.copy(sunSphere.position);

		renderer.render(scene, camera);
	}

	const gui = new GUI();

	gui.add(effectController, 'turbidity', 1.0, 20.0, 0.1).onChange(guiChanged);
	gui.add(effectController, 'rayleigh', 0.0, 4, 0.001).onChange(guiChanged);
	gui.add(effectController, 'mieCoefficient', 0.0, 0.1, 0.001).onChange(guiChanged);
	gui.add(effectController, 'mieDirectionalG', 0.0, 1, 0.001).onChange(guiChanged);
	gui.add(effectController, 'luminance', 0.0, 2).onChange(guiChanged);
	gui.add(effectController, 'inclination', 0, 1, 0.0001).onChange(guiChanged);
	gui.add(effectController, 'azimuth', 0, 1, 0.0001).onChange(guiChanged);
	gui.add(effectController, 'sun').onChange(guiChanged);

	guiChanged();
}

function createEnvironment() {
	// Sky
	// const vert = document.getElementById('sky-vert').textContent;
	// const frag = document.getElementById('sky-frag').textContent;
	let uniforms = {
		'topColor': { value: colors.sky },
		'bottomColor': { value: new Color('#fff') },
		'offset': { value: 33 },
		'exponent': { value: 0.6 }
	};

	// uniforms['topColor'].value.copy(hemisphereLight.color);

	const skyGeo = new SphereBufferGeometry(1000, 32, 15);
	const skyMat = new ShaderMaterial({
		uniforms: uniforms,
		vertexShader: skyVertex,
		fragmentShader: skyFrag,
		side: BackSide
	});

	const sky = new Mesh(skyGeo, skyMat);
	sky.name = 'Sky';
	scene.add(sky);

	// Fog
	scene.fog = new Fog(colors.horizon, 100, 200);
	scene.fog.name = 'Fog';
	// scene.fog.color.copy(uniforms['bottomColor'].value);

	// Ground
	const groundGeo = new PlaneBufferGeometry(10000, 10000);
	const groundMat = new MeshLambertMaterial({ color: colors.ground });
	// groundMat.color.setHSL(0.095, 1, 0.75);

	const ground = new Mesh(groundGeo, groundMat);
	ground.position.y = -20;
	ground.rotation.x = -Math.PI / 2;
	ground.receiveShadow = true;
	// scene.add(ground);
}

function createScene() {
	// Scene
	scene = new Scene();
	scene.name = 'Main';
	scene.background = new Color('#ccc');

	// Camera
	const aspectRatio = WIDTH / HEIGHT;
	const fieldOfView = 60;
	const nearPlane = 1;
	const farPlane = 10000;
	camera = new PerspectiveCamera(fieldOfView, aspectRatio, nearPlane, farPlane);
	camera.position.set(0, 20, 45);	// far
	// camera.position.set(0, 1, 6);	 // close
	// camera.rotation.set(10, 10, 10);

	// Interaction
	mouse = new Vector2();
	raycaster = new Raycaster();

	// Renderer
	renderer = new WebGLRenderer({ 
		alpha: true, 
		antialias: true,
		// localClippingEnabled: true
	});

	renderer.localClippingEnabled = true;	// For clipping planes

	renderer.setSize(WIDTH, HEIGHT);
	// renderer.shadowMap.enabled = true;

	document.body.appendChild(renderer.domElement);
	document.addEventListener('mousemove', onMouseMove, false);
	window.addEventListener('resize', onWindowResize, false);
}

function createutilities() {
	const grid = new GridHelper(100, 20, '#FF9933', '#fff');
	scene.add(grid);

	var gui = new GUI();
	gui.add({ 'GUI Parameter': false }, 'GUI Parameter');
}

function populateScene() {
	terrain = new Terrain(48, 48);
	scene.add(terrain);
	water = new Water(300, 300);
	scene.add(water);
}

function createStats() {
	stats = new Stats();
	document.body.appendChild(stats.dom);
}

function onWindowResize() {
	HEIGHT = window.innerHeight;
	WIDTH = window.innerWidth;
	camera.aspect = WIDTH / HEIGHT;
	camera.updateProjectionMatrix();
	renderer.setSize(WIDTH, HEIGHT);
	depthTarget.setSize(WIDTH, HEIGHT);
	// depthTarget2.setSize(WIDTH, HEIGHT);
	// postprocessing.composer.setSize(window.innerWidth, window.innerHeight);
	// ascii.setSize(WIDTH, HEIGHT);
}

function update() {
	// raycaster.setFromCamera(mouse, camera);
	// intersects = raycaster.intersectObjects(Terrain.children);

	// if (intersects.length > 0 ) {
	// 	if (intersected != intersects[0]) {
	// 		intersected = intersects[0];
	// 		// intersected.originalMaterial = intersected.object.material;
	// 		// intersected.object.material.color = new Color('#fff');
	// 	}
	// } else {
	// 	// if (intersected) intersected.object.material = new Material(intersected.originalMaterial);
	// 	intersected = null;
	// }

	// Depth buffer
	renderer.setRenderTarget(depthTarget);
	renderer.render(scene, camera);
	// renderer.setRenderTarget(depthTarget2);
	// renderer.render(scene, camera);

	// Regular render
	renderer.setRenderTarget(null);
	renderer.render(scene, camera);

	controls.update();	// only required if controls.enableDamping = true, or if controls.autoRotate = true

	// postprocessing.composer.render(0.1);
	// ascii.render(scene, camera);
	stats.update();
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

function postProcessing() {
	let renderPass = new RenderPass(scene, camera);
	let bokehPass = new BokehPass(scene, camera, {
		focus: 10,
		aperture: 0.000005,
		maxblur: 0.025,
		width: WIDTH,
		height: HEIGHT
	});

	let composer = new EffectComposer(renderer);

	composer.addPass(renderPass);
	composer.addPass(bokehPass);

	postprocessing.composer = composer;
	postprocessing.bokeh = bokehPass;

	// GUI
	// let effectController = {
	// 	focus: 500.0,
	// 	aperture: 5,
	// 	maxblur: 1.0
	// };

	// let matChanger = () => {
	// 	postprocessing.bokeh.uniforms['focus'].value = effectController.focus;
	// 	postprocessing.bokeh.uniforms['aperture'].value = effectController.aperture * 0.00001;
	// 	postprocessing.bokeh.uniforms['maxblur'].value = effectController.maxblur;
	// };

	// let gui = new GUI();
	// gui.add(effectController, 'focus', 10.0, 3000.0, 10 ).onChange(matChanger);
	// gui.add(effectController, 'aperture', 0, 10, 0.1 ).onChange(matChanger);
	// gui.add(effectController, 'maxblur', 0.0, 3.0, 0.025 ).onChange(matChanger);
	// gui.close();

	// matChanger();

	// ascii = new AsciiEffect(renderer, ' .:-+*=%@#',{ invert: true });
	// ascii.setSize(WIDTH, HEIGHT);
	// ascii.domElement.style.color = 'white';
	// ascii.domElement.style.backgroundColor = 'black';

	// Special case: append effect.domElement, instead of renderer.domElement.
	// AsciiEffect creates a custom domElement (a div container) where the ASCII elements are placed.

	// document.body.appendChild(ascii.domElement);
}

function depthBuffer() {
	// Create a multi render target with Float buffers
	depthTarget = new WebGLRenderTarget(WIDTH, HEIGHT);
	depthTarget.texture.format = RGBFormat;
	depthTarget.texture.minFilter = NearestFilter;
	depthTarget.texture.magFilter = NearestFilter;
	depthTarget.texture.generateMipmaps = false;
	depthTarget.stencilBuffer = false;
	depthTarget.depthBuffer = true;
	depthTarget.depthTexture = new DepthTexture();
	depthTarget.depthTexture.type = UnsignedShortType;

	// depthTarget2 = new WebGLRenderTarget(WIDTH, HEIGHT);
	// depthTarget2.texture.format = RGBFormat;
	// depthTarget2.texture.minFilter = NearestFilter;
	// depthTarget2.texture.magFilter = NearestFilter;
	// depthTarget2.texture.generateMipmaps = false;
	// depthTarget2.stencilBuffer = false;
	// depthTarget2.depthBuffer = true;
	// depthTarget2.depthTexture = new DepthTexture();
	// depthTarget2.depthTexture.type = UnsignedShortType;
}

function initialize() {
	depthBuffer();
	createScene();
	createLighting();
	createEnvironment();
	// createutilities();
	populateScene();
	createStats();
	// postProcessing();
	createControls();
	update();
}

if (WEBGL.isWebGLAvailable()) {
	initialize();
} else {
	var warning = WEBGL.getWebGLErrorMessage();
	document.body.appendChild(warning);
}

export {
	camera,
	depthTarget,
	// depthTarget2,
	scene
};