import {
    ImageUtils,
    Math as ThreeMath,
    Mesh,
    // MeshStandardMaterial,
    MeshPhongMaterial,
    PlaneGeometry,
    PlaneBufferGeometry,
    RepeatWrapping,
    ShaderMaterial,
    Vector2
} from 'three';
import { createWireframe } from './util';

function Water() {
    const geometry = new PlaneBufferGeometry(1000, 1000);
    geometry.name = 'Water';

    const vert = document.getElementById('water-vert').textContent;
	const frag = document.getElementById('water-frag').textContent;
    
    let uniforms = {
        colorTop: '#0000ff',
		colorDepth: '00ff00',
		depthMaxDistance: 2
	};

	// uniforms['topColor'].value.copy(hemisphereLight.color);
	// const material = new ShaderMaterial({
	// 	uniforms: uniforms,
    //     fragmentShader: frag,
    //     vertexShader: vert
    // });
    
    const material = new MeshPhongMaterial({
        color: '#0000ff',
        opacity: 0.6,
        transparent: true,
    });

    const mesh = new Mesh(geometry, material);
    mesh.name = 'Water';
    mesh.rotateX(-90 * ThreeMath.DEG2RAD);
    mesh.position.y = -1;
    // mesh.position.x = -(width * innerRadius) + (innerRadius / 2);
    // mesh.position.z = -(height * innerRadius) + (innerRadius / 2);

    const wireframe = createWireframe(geometry);
    mesh.add(wireframe);

    return mesh;

    // var waterTexture = new ImageUtils.loadTexture('images/water.jpg');
    // waterTexture.wrapS = waterTexture.wrapT = RepeatWrapping; 
    
    // const noiseTexture = new ImageUtils.loadTexture('img/cloud.png');
	// noiseTexture.wrapS = noiseTexture.wrapT = RepeatWrapping; 
	
	// // use 'this.' to create global object
	// this.customUniforms = {
	// 	baseTexture: 	{ type: 't', value: waterTexture },
	// 	baseSpeed: 		{ type: 'f', value: 0.05 },
	// 	noiseTexture: 	{ type: 't', value: noiseTexture },
	// 	noiseScale:		{ type: 'f', value: 0.5337 },
	// 	alpha: 			{ type: 'f', value: 1.0 },
	// 	time: 			{ type: 'f', value: 1.0 }
	// };
	
	// // create custom material from the shader code above
	// //   that is within specially labeled script tags
	// const material = new ShaderMaterial({
    //     uniforms: this.customUniforms,
	// 	vertexShader: document.getElementById('water-vert').textContent,
	// 	fragmentShader: document.getElementById('water-frag').textContent
	// });

	// // other material properties
	// // customMaterial.side = THREE.DoubleSide;

	// // apply the material to a surface
	// const geometry = new PlaneGeometry(200, 200);
    // const mesh = new Mesh(geometry, material);
    // mesh.name = 'Water';
    // mesh.rotateX(-90 * ThreeMath.DEG2RAD);
    // mesh.position.y = -1;
    
	// return mesh;
}

export default Water;