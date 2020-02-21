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
        geometry = new PlaneBufferGeometry(w, h, 50, 50),
        textureLoader = new TextureLoader();
    
    geometry.name = 'Water';

    // const surfaceTexture = textureLoader.load('/img/water_bw.png');
    // surfaceTexture.wrapS = RepeatWrapping;
    // surfaceTexture.wrapT = RepeatWrapping;

    const distortionTexture = textureLoader.load('/img/water_dudv.png');
    distortionTexture.wrapS = RepeatWrapping;
    distortionTexture.wrapT = RepeatWrapping;

    const normalTexture = textureLoader.load('/img/water_normal.png');
    normalTexture.wrapS = RepeatWrapping;
    normalTexture.wrapT = RepeatWrapping;

    const foamTexture = textureLoader.load('/img/water_foam.png');
    foamTexture.wrapS = RepeatWrapping;
    foamTexture.wrapT = RepeatWrapping;
;
    this.uniforms = {
        uTime: { value: 0 },

        // uClippingPlanes: [ clippingPlane ],
        // uSurfaceTexture: { value: surfaceTexture },
        uCameraNear: { value: camera.near },
        uCameraFar: { value: camera.far },
        uDiffuseMap: { value: depthTarget.texture },
        uDepthMap: { value: depthTarget.depthTexture },
        uDistortionMap: { value: distortionTexture },
        uNormalMap: { value: normalTexture },
        uWaterFoam: { value: foamTexture },

        // Color
        uWaterColorDeep: { value: new Vector3(colors.water.e.r, colors.water.e.g, colors.water.e.b) },
        uWaterColorShallow: { value: new Vector3(colors.water.b.r, colors.water.b.g, colors.water.b.b) },

        // Fog
        uFogColor: { value: scene.fog.color },
        uFogFar: { value: scene.fog.far },
        uFogNear: { value: scene.fog.near },
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
    mesh.position.y = -1.5;
    // mesh.position.z = -4;
    // mesh.position.x = 1;

    // mesh.rotateX(-30 * ThreeMath.DEG2RAD);
    // mesh.position.y = 2;

    // this.wireframe = createWireframe(geometry);
    // mesh.add(this.wireframe);

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
