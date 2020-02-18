/*
    TODO:
    - Clipping plane
    - Reflection
    - Refraction
    - Subsurface light scattering
*/

import {
    Clock,
    DepthTexture,
    ImageUtils,
    Math as ThreeMath,
    Mesh,
    // MeshStandardMaterial,
    MeshPhongMaterial,
    NearestFilter,
    Plane,
    // PlaneGeometry,
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
import { fragmentShader, vertexShader } from './water.glsl.js';

function Water() {
    this.clock = new Clock();
    let h = 100,
        w = 100,
        geometry = new PlaneBufferGeometry(w, h),
        textureLoader = new TextureLoader();
    
    geometry.name = 'Water';

    const surfaceTexture = textureLoader.load('/img/water_bw.png');
    surfaceTexture.wrapS = RepeatWrapping;
    surfaceTexture.wrapT = RepeatWrapping;

    const distortionTexture = textureLoader.load('/img/DuDv.jpeg');
    distortionTexture.wrapS = RepeatWrapping;
    distortionTexture.wrapT = RepeatWrapping;
    // const noiseTex = textureLoader.load('/img/tiling-perlin-noise.png');
    // noiseTex.wrapS = RepeatWrapping;
    // noiseTex.wrapT = RepeatWrapping;
    // noiseTex.repeat.set(w, h);

    // const normalMap1 = textureLoader.load('/img/water_normal_1.png');
    // normalMap1.wrapS = RepeatWrapping;
    // normalMap1.wrapT = RepeatWrapping;

    const { r, g, b } = colors.earth.m;
    this.uniforms = {
        // uClippingPlanes: [ clippingPlane ],
        uSurfaceTexture: { value: surfaceTexture },

        uCameraNear: { value: camera.near },
        // cameraFar: { value: camera.far },
        uCameraFar: { value: 10.0 },
        uDiffuseMap: { value: depthTarget.texture },
        uDepthMap: { value: depthTarget.depthTexture },
        // uDepthMap2: { value: depthTarget2.depthTexture },
        uDistortionMap: { value: distortionTexture },
        uTime: { value: 0 },

        uWaterColor: { value: new Vector3(r, g, b) },
        uWaterColorSurface: { value: new Vector3(r, g, b) },
        uWaterColorDeep: { value: new Vector3(r, g, b) },

        uFogColor: { value: scene.fog.color },
        uFogFar: { value: scene.fog.far },
        uFogNear: { value: scene.fog.near },
        // noiseTex: { value: noiseTex },
        // normalMap1: { value: normalMap1 }
        // colorTop: '#0000ff',
		// colorDepth: '#00ff00',
		// depthMaxDistance: 2,
        // time: { value: 1.0 },
        // 'uvScale': { value: new Vector2(3.0, 1.0) },
    };

	const material = new ShaderMaterial({
        clipping: true,
        clippingPlanes: [ new Plane(new Vector3(0, -1, 0), 0) ],
        // depthTest: false,
        // fog: true,   // for USE_FOG conditional in shader
        fragmentShader,
        // lighting: true,
        transparent: true,
        uniforms: this.uniforms,
        vertexShader
    });

    material.extensions = {
        // derivatives: false, // set to use derivatives
        fragDepth: false, // set to use fragment depth values
        // drawBuffers: false, // set to use draw buffers
        // shaderTextureLOD: false // set to use shader texture LOD
    }

    const mesh = new Mesh(geometry, material);
    mesh.name = 'Water';
    mesh.rotateX(-90 * ThreeMath.DEG2RAD);
    mesh.position.y = -1;
    // mesh.position.z = -4;
    // mesh.position.x = 1;

    // mesh.rotateX(-30 * ThreeMath.DEG2RAD);
    // mesh.position.y = 2;

    const wireframe = createWireframe(geometry);
    mesh.add(wireframe);

    this.animate();

    return mesh;
}

Water.prototype = {
    animate: function() {
        requestAnimationFrame(this.animate.bind(this));
        const delta = this.clock.getDelta();
        this.uniforms['uTime'].value += delta;
    }
}

export default Water;
