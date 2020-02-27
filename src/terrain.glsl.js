export const vertexShader = `
    varying vec2 vUv;
    varying vec3 vPos;

    // #include <fog_pars_vertex>

    void main() {
        // #include <fog_vertex>
        vPos = position;
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

export const fragmentShader = `
    varying vec2 vUv;

    uniform sampler2D uGrassTex;
    uniform sampler2D uSandTex;
    uniform sampler2D uRockTex;

    uniform vec3 uFogColor;
    uniform float uFogFar;
    uniform float uFogNear;

    // #include <fog_pars_fragment>

    void main() {
        // gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
        gl_FragColor = texture2D(uSandTex, vUv);

        // #include <fog_fragment>

        // Fog
        float fogDepth = gl_FragCoord.z / gl_FragCoord.w;
        float fogFactor = smoothstep(uFogNear, uFogFar, fogDepth);
        gl_FragColor.rgb = mix(gl_FragColor.rgb, uFogColor, fogFactor);
    }
`;