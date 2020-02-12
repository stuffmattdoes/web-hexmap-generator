export const vert = `
    varying vec2 vUv;

    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

export const frag =`
    #include <packing>

    varying vec2 vUv;
    uniform sampler2D tDiffuse;
    uniform sampler2D tDepth;
    uniform float cameraNear;
    uniform float cameraFar;


    float readDepth( sampler2D depthSampler, vec2 coord ) {
        float fragCoordZ = texture2D( depthSampler, coord ).x;
        float viewZ = perspectiveDepthToViewZ( fragCoordZ, cameraNear, cameraFar );
        return viewZToOrthographicDepth( viewZ, cameraNear, cameraFar );
    }

    void main() {
        //vec3 diffuse = texture2D( tDiffuse, vUv ).rgb;
        float depth = readDepth( tDepth, vUv );

        gl_FragColor.rgb = 1.0 - vec3( depth );
        gl_FragColor.a = 1.0;
    }
`