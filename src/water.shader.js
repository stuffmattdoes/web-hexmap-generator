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
    // varying vec2 vUv;
    
    void main() { 
        // vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1);
    }
`;

export const fragShader = `
    // fragment shaders don't have a default precision so we need
    // to pick one. mediump is a good default
    precision mediump float;
    // varying vec2 vUv;
    uniform vec3 waterColor;

    void main() {
        // gl_FragColor is a special variable a fragment shader
        // is responsible for setting
        gl_FragColor = vec4(waterColor, 0.5); // return reddish-purple
    }
`;