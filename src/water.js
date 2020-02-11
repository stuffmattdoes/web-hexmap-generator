/*
    TODO:
    - Reflection
    - Refraction
    - Subsurface light scattering
*/

import {
    DepthTexture,
    ImageUtils,
    Math as ThreeMath,
    Mesh,
    // MeshStandardMaterial,
    MeshPhongMaterial,
    NearestFilter,
    PlaneGeometry,
    PlaneBufferGeometry,
    RepeatWrapping,
    RGBFormat,
    ShaderMaterial,
    TextureLoader,
    UnsignedShortType,
    Vector2,
    Vector3,
    Vector4,
    WebGLRenderTarget
} from 'three';
import { createWireframe } from './util';
import { camera, colors, depthTarget, scene } from '.';
import { fragShader, vertShader } from './water.shader.js';

function Water() {
    let h = 200,
        w = 200,
        geometry = new PlaneBufferGeometry(w, h);
        // target,
        // textureLoader = new TextureLoader();
    
    geometry.name = 'Water';

    // Create a multi render target with Float buffers
    // target = new WebGLRenderTarget(window.innerWidth, window.innerHeight);
    // target.texture.format = RGBFormat;
    // target.texture.minFilter = NearestFilter;
    // target.texture.magFilter = NearestFilter;
    // target.texture.generateMipmaps = false;
    // target.stencilBuffer = false;
    // target.depthBuffer = true;
    // target.depthTexture = new DepthTexture();
    // target.depthTexture.type = UnsignedShortType; 

    // const noiseTex = textureLoader.load('/img/tiling-perlin-noise.png');
    // noiseTex.wrapS = RepeatWrapping;
    // noiseTex.wrapT = RepeatWrapping;
    // noiseTex.repeat.set(w, h);

    // const normalMap1 = textureLoader.load('/img/water_normal_1.png');
    // normalMap1.wrapS = RepeatWrapping;
    // normalMap1.wrapT = RepeatWrapping;

    const { r, g, b } = colors.earth.m;
    const uniforms = {
        cameraNear: { value: camera.near },
        cameraFar: { value: camera.far },
        tDiffuse: { value: depthTarget.texture },
        tDepth: { value: depthTarget.depthTexture },
                        
        waterColor: { value: new Vector3(r, g, b) },
        fogColor: { value: scene.fog.color },
        fogFar: { value: scene.fog.far },
        fogNear: { value: scene.fog.near },
        // noiseTex: { value: noiseTex },
        // normalMap1: { value: normalMap1 }
        // colorTop: '#0000ff',
		// colorDepth: '#00ff00',
		// depthMaxDistance: 2,
        // time: { value: 1.0 },
        // 'uvScale': { value: new Vector2(3.0, 1.0) },
    };

	const material = new ShaderMaterial({
        uniforms: uniforms,
        // fog: true,   // for USE_FOG conditional in shader
        fragmentShader: fragShader,
        // lighting: true,
        vertexShader: vertShader,
        transparent: true
    });

    const mesh = new Mesh(geometry, material);
    mesh.name = 'Water';
    mesh.rotateX(-90 * ThreeMath.DEG2RAD);
    mesh.position.y = -1;

    const wireframe = createWireframe(geometry);
    mesh.add(wireframe);

    return mesh;
}

export default Water;