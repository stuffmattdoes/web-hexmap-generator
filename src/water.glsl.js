/*

    Tutorial: https://code.tutsplus.com/series/creating-toon-water-for-the-web--cms-1263?_ga=2.49532515.436311687.1581566262-604567708.1579538549

    SHADERS

    Shaders are code that render things to a screen. There are two types
    of shaders - vertex shaders and fragment shaders. These two types of
    shaders must run as a pair for every object in a program.

    Being graphical in nature, shaders run solely on the GPU, making them an
    ideal choice to offload CPU computation to the GPU whenever possible.


    VERTEX SHADERS

    Vertex shaders handle manipulation and transformation of a geometry vertex
    in 3d space to a 2d projection (screen). It's primary utility is to set the
    `gl_Position` 4D float vector, which is the final position of the vertex on
    the screen.

    
    FRAGMENT SHADERS


    DATA TYPES
    - uniforms - sent to both the vertex and fragment programs. Uniforms stay 
        the same throughout the lifetime of the frame being rendered. An example
        of a uniform would be a light's position.
    - attributes - apply only to the vertex shader. They apply directly to the
        vertices via BufferGeometry attributes
    - varying - declared in the vertex shader & shared with the fragment shader.
        Must be of the same data type & variable name in both functions. A common
        example wold be a vertex's normal that would be used for lighting calculations
*/
export const vertexShader = `
    /*  
    Provided by Three.js:
    uniform vec3 cameraPosition;    // camera position in world space
    uniform mat4 modelMatrix;       // world space data of shader object (position, scale, rotation)
    uniform mat4 modelViewMatrix;   // camera.matrixWorldInverse * object.matrixWorld
    uniform mat3 normalMatrix;      // inverse transpose of modelViewMatrix
    uniform mat4 projectionMatrix;  // camera.projectionMatrix
    uniform mat4 viewMatrix;        // camera.matrixWorldInverse

    Provided by Geometry & BufferGeometry:
    attribute vec3 normal;      // Direction of normal for light calculations
    attribute vec3 position;    // Position of this vertex (world-space)
    attribute vec2 uv;          // Coordinates for texture mapping (normalized from 0 to 1)
    */

    // #include <clipping_planes_pars_vertex>

    varying vec4 vClipSpace;
    varying vec3 vNormal;
    varying vec3 vPos;
    varying vec2 vTextCoords;
    varying vec2 vUv;

    float tiling = 10.0;
    
    void main() {
        // #include <begin_vertex>

        vNormal = normal;
        vPos = position;
        vTextCoords = vec2(position.x / 2.0 + 0.5, position.y / 2.0 + 0.5) / tiling;
        vUv = uv;

        /*
            Multiply each vertex by the model-view matrix and the
            projection matrix to convert to clip-space
        */
        // gl_ClipDistance[0] = 1;  // gl_ClipDisance undefined in Three.js ?
        vClipSpace = projectionMatrix * modelViewMatrix * vec4(position, 1.0);  // Represents clip-space coords, or -1 to 1
        gl_Position = vClipSpace;
        // vClipSpace = position * 2.0 - 1.0;  // screen space
        
        // #include <project_vertex>
        // #include <clipping_planes_vertex>
    }
`;

export const fragmentShader = `
    #include <packing>
    // #include <clipping_planes_pars_fragment>

    // From vert
    varying vec4 vClipSpace;
    varying vec3 vNormal;
    varying vec3 vPos;
    varying vec2 vTextCoords;
    varying vec2 vUv;

    // Characteristics
    uniform sampler2D uSurfaceTexture;
    uniform vec3 uWaterColor;
    uniform float uTime;
    
    // Depth
    uniform sampler2D uDiffuseMap;
    uniform sampler2D uDepthMap;
    // uniform sampler2D uDepthMap2;
    uniform sampler2D uDistortionMap;

    uniform float uCameraNear;
    uniform float uCameraFar;
    uniform vec4 uScreenSize;

    float waveAmplitude = 0.005;
    float flowSpeed = 0.05;

    // Fog
    // uniform vec3 fogColor;
    // uniform float fogNear;
    // uniform float fogFar;

    float readDepth (sampler2D depthSampler, vec2 coord) {
        float fragCoordZ = texture2D(depthSampler, coord).x;
        float viewZ = perspectiveDepthToViewZ(fragCoordZ, uCameraNear, uCameraFar);
        return viewZToOrthographicDepth(viewZ, uCameraNear, uCameraFar);
    }

    // float getLinearDepth(vec3 pos) {
    //     return -(viewMatrix * vec4(pos, 1.0)).z;
    // }

    // float getLinearScreenDepth(sampler2D map) {
    //     vec2 uv = gl_FragCoord.xy * uScreenSize.zw;
    //     return readDepth(map, uv);
    // }

    void main() {
        // #include <clipping_planes_fragment>
        vec4 color = vec4(uWaterColor, 1.0);
        gl_FragColor = color;

        // Sampling depth buffer
        // Convert clip space coords (from -1 to 1) into normalized device coords ("NDC", from  0 to 1)
        vec2 ndc = vClipSpace.xy / vClipSpace.w / 2.0 + 0.5;
        vec2 depthCoords = vec2(ndc.x, ndc.y);


        // Distortion
        flowSpeed *= uTime;
        vec2 distortion1 = (texture2D(uDistortionMap, vec2(vTextCoords.x + flowSpeed, vTextCoords.y)).rg * 2.0 - 1.0);
        distortion1 *= waveAmplitude;
        vec2 distortion2 = (texture2D(uDistortionMap, vec2(-vTextCoords.x + flowSpeed, vTextCoords.y)).rg * 2.0 - 1.0);
        distortion2 *= waveAmplitude;
        vec2 distortionSum = distortion1 + distortion2;
        depthCoords += distortionSum;   

        float depth = readDepth(uDepthMap, depthCoords);
        // float depth = texture2D(uDepthMap, depthCoords).x;
        // float diff = (depth - gl_FragCoord.z);
        // gl_FragColor.rgb *= 1.0 - vec3(depth);
        gl_FragColor.rgb = mix(vec3(0.71, 1.0, 0.88), vec3(0.0, 0.08, 0.5), depth);

        // Fog
        // float fogDepth = gl_FragCoord.z / gl_FragCoord.w;
        // float fogFactor = smoothstep(fogNear, fogFar, fogDepth);
        // gl_FragColor.rgb = mix(gl_FragColor.rgb, fogColor, fogFactor);
    }
`;
