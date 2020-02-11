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
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1);
    }
`;

export const fragShader = `
    varying vec2 vUv;
    uniform vec3 waterColor;
    uniform vec3 fogColor;
    uniform float fogNear;
    uniform float fogFar;
    uniform sampler2D normalMap1;
    // uniform sampler2D normalMap2;

    void main() {
        float scale = 1.0;
		vec4 normalColor = texture2D(normalMap1, (vUv * scale));
        normalColor = normalize(normalColor * 2.0 - 1.0);

        // calculate normal vector
		// vec3 normal = normalize(vec3(normalColor.r * 2.0 - 1.0, normalColor.b,  normalColor.g * 2.0 - 1.0));

        gl_FragColor = vec4(waterColor, 1.0);
        // gl_FragColor = mix(waterColor, normalColor.rgb, 0.5);

        // #ifdef USE_FOG   // Applies to "fog: true" in shader 
            // #ifdef USE_LOGDEPTHBUF_EXT
                // float depth = gl_FragDepthEXT / gl_FragCoord.w;
            // #else
        float depth = gl_FragCoord.z / gl_FragCoord.w;
        // #endif
        float fogFactor = smoothstep(fogNear, fogFar, depth);
        gl_FragColor.rgb = mix(gl_FragColor.rgb, fogColor, fogFactor);
        // #endif
    }
`;
