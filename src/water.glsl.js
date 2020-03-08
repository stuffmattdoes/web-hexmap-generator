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
    attribute vec3 position;    // Position of this vertex (local-space)
    attribute vec2 uv;          // Coordinates for texture mapping (normalized from 0 to 1)
    */

    uniform float uTime;

    varying vec4 vClipSpace;
    // varying vec3 vNormal;
    // varying vec3 vPos;
    varying vec2 vTexCoords;
    // varying vec2 vUv;

    float PI = 3.1415926535897932384626433832795;
    float tiling = 0.05;
    
    void main() {
        // vNormal = normal;
        // vPos = (modelViewMatrix * vec4(position, 1.0)).xyz;
        vTexCoords = vec2(position.x / 2.0 + 0.5, position.y / 2.0 + 0.5) * tiling;
        // vUv = uv;

        vClipSpace = projectionMatrix * modelViewMatrix * vec4(position, 1.0);  // Represents clip-space coords, or -1 to 1
        float amplitude = 0.9;
        float wavelength = 10.0;
        float velocity = 1.0;

        // Gerstner waves
        float k = 2.0 * PI / wavelength;
		float f = k * (position.x - velocity * uTime);
        // vClipSpace.x += amplitude * cos(f);
        // vClipSpace.y -= amplitude * sin(f);
        // vClipSpace.y += amplitude * sin(k * (position.x - velocity * uTime));    // Sine wave

        // vClipSpace.y += sin(uTime * waveVelocity * 1.1 - position.x)
        //     * sin(uTime * waveVelocity * 0.9 - position.y) * waveAmplitude;
        gl_Position = vClipSpace;
    }
`;

export const fragmentShader = `
    // From vert
    varying vec4 vClipSpace;
    // varying vec3 vNormal;
    // varying vec3 vPos;
    varying vec2 vTexCoords;
    // varying vec2 vUv;

    // Characteristics
    // uniform sampler2D uSurfaceTexture;
    uniform vec3 uWaterColorShallow;
    uniform vec3 uWaterColorDeep;
    uniform float uTime;
    
    // Depth
    uniform sampler2D uDepthMap;
    uniform sampler2D uDiffuseMap;
    uniform sampler2D uDistortionMap;
    uniform sampler2D uNormalMap;
    uniform sampler2D uWaterFoam;

    uniform float uCameraNear;
    uniform float uCameraFar;
    uniform vec4 uScreenSize;

    // Fog
    uniform vec3 uFogColor;
    uniform float uFogNear;
    uniform float uFogFar;

    float distortionStrength = 0.02;
    float flowSpeed = 0.01;
    float surfaceNoiseCutoff = 0.7;

    vec2 toClipSpace(vec2 uv) {
        return uv * 2.0 - 1.0;
    }

    float toLinearDepth(float depth) {
        return 2.0 * uCameraNear * uCameraFar / (
            uCameraFar + uCameraNear
            - (2.0 * depth - 1.0)
            * (uCameraFar - uCameraNear)
        );
    }

    void main() {
        gl_FragColor = vec4(1.0);

        // Distortion
        float moveFactor = flowSpeed * uTime;
        vec2 distortedTexCoords = texture2D(uDistortionMap, vec2(vTexCoords.x + moveFactor, vTexCoords.y)).rg * 0.1;
        distortedTexCoords = vTexCoords + vec2(distortedTexCoords.x, distortedTexCoords.y + moveFactor);
        vec2 totalDistortion = toClipSpace(texture2D(uDistortionMap, distortedTexCoords).rg) * distortionStrength;

        // Convert clip space coords (from -1 to 1) into normalized device coords ("NDC", from  0 to 1)
        vec2 ndc = vClipSpace.xy / vClipSpace.w / 2.0 + 0.5;
        vec2 depthCoords = vec2(ndc.x, ndc.y);
        vec2 distortionCoords = depthCoords + totalDistortion;
        // distortionCoords = clamp(depthCoords, 0.001, 0.999);

        // vec4 diffuse = texture2D(uDiffuseMap, depthCoords);
        // gl_FragColor.rgb *= mix(gl_FragColor.rgb, diffuse.rgb, 0.5);
        
        // Depth shading
        // TODO: attempted drawing at destination texture, results in warning
        float sceneDepth = texture2D(uDepthMap, depthCoords).r;
        float floorDistance = toLinearDepth(sceneDepth);
        float surfaceDistance = toLinearDepth(gl_FragCoord.z);
        float waterDepth = floorDistance - surfaceDistance;
        float murkiness = 0.7;
        waterDepth = 1.0 - exp(-waterDepth * murkiness);  // Beers law for murkiness
        gl_FragColor.rgb *= mix(uWaterColorShallow, uWaterColorDeep, waterDepth);

        // Refraction
        // float refraction = texture2D(uDepthMap, distortionCoords).r;
        // float floorDistance2 = toLinearDepth(refraction);
        // float waterDepth2 = floorDistance2 - surfaceDistance;
        // waterDepth2 = 1.0 - exp(-waterDepth2 * murkiness);  // Beers law for murkiness
        // gl_FragColor.rgb = mix(uWaterColorShallow, uWaterColorDeep, waterDepth2);

        // Soft edges & foam lines
        float shoreDepth = 1.0;

        if (waterDepth < shoreDepth) {
            float foamMovement = uTime * 0.0025;
            float scaledUv = 3.0;
            float foamTexCutoff = waterDepth / shoreDepth;
            float foamTex1 = texture2D(uNormalMap, vec2(vTexCoords.x - foamMovement, vTexCoords.y + foamMovement) * scaledUv).r;
            float foamTex2 = texture2D(uNormalMap, vec2(vTexCoords.x + foamMovement * 1.1, vTexCoords.y - foamMovement) * scaledUv).r;
            float foamTex = foamTex1 * foamTex2;
            float falloff = mix(0.0, 1.0, 1.0 - waterDepth / shoreDepth);
            foamTex = foamTex < falloff / 1.5 ? 1.0 : 0.0;
            falloff = pow(falloff, 2.0);
            foamTex *= falloff;
            gl_FragColor.rgb += vec3(foamTex);

            // Soft leading edge
            float foamEdge = clamp(waterDepth / (shoreDepth * 0.25), 0.0, 1.0);
            gl_FragColor.a = foamEdge;
        }

        // NormalSurface noises
        float lightness = 0.1;
        vec4 normalMapColor = texture2D(uNormalMap, totalDistortion);
        vec3 normal = vec3(normalMapColor.r * 2.0  - 1.0, normalMapColor.b, normalMapColor.g * 2.0 - 1.0);
        normal = normalize(normal);
        float surfaceNoise = normalMapColor.r > surfaceNoiseCutoff
            ? normalMapColor.r * lightness : 0.0;

        gl_FragColor += surfaceNoise;

        // Fog
        float fogDepth = gl_FragCoord.z / gl_FragCoord.w;
        float fogFactor = smoothstep(uFogNear, uFogFar, fogDepth);
        gl_FragColor.rgb = mix(gl_FragColor.rgb, uFogColor, fogFactor);
    }
`;
