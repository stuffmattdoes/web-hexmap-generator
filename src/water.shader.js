/*
    https://threejs.org/docs/#api/en/materials/ShaderMaterial

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
export const vertShader = `
    /*
        Multiply each vertex by the
        model-view matrix and the
        projection matrix (both provided
        by Three.js) to get a final
        vertex position
    */
    // uniform mat4 textureMatrix;
    // varying vec4 vUv;
    varying vec2 vUv;
    
    void main() { 
        // vUv = textureMatrix * vec4( position, 1.0 );
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

export const fragShader = `
    // #include <packing>
    uniform sampler2D tDiffuse;
    uniform sampler2D tDepth;
    uniform float cameraNear;
    uniform float cameraFar;

    varying vec2 vUv;
    uniform vec3 waterColor;
    // uniform vec3 fogColor;
    // uniform float fogNear;
    // uniform float fogFar;
    // uniform sampler2D normalMap1;

    void main() {
        // gl_FragColor = vec4(waterColor, 0.5);
        vec4 sceneDepth = texture2D(tDepth, vUv);
        gl_FragColor = vec4(waterColor * sceneDepth.z, 0.5);

        // Depth
        // float near = 1.0;
        // float far = 10.0;
        // float z = gl_FragCoord.z;  // depth value [0,1]
        // float ndcZ = 2.0 * z - 1.0;  // [-1,1]
        // float linearDepth = (2.0 * near * far) / (far + near - ndcZ * (far - near));
        // gl_FragColor = vec4(vec3(linearDepth)/far, 1.0);
        // this division is for better visualization

        // Fog
        // float fogDepth = gl_FragCoord.z / gl_FragCoord.w;
        // float fogFactor = smoothstep(fogNear, fogFar, fogDepth);
        // gl_FragColor.rgb = mix(gl_FragColor.rgb, fogColor, fogFactor);
    }
`;
