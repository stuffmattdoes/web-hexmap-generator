export const vertexShader = `
    varying vec2 vUv;
    varying vec3 vPos;

    // #include <common>
    // #include <fog_pars_vertex>

    vec2 tiling = vec2(2.0, 2.0);

    void main() {
        // #include <common>
        // #include <fog_vertex>
        vPos = position;
        vUv = uv * tiling;
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
    
    // #include <common>
    // #include <fog_pars_fragment>
    // #include <lights_phong_pars_fragment>

    void main() {
        // #include <lights_phong_fragment>

        gl_FragColor = texture2D(uSandTex, vUv);
        
        // #include <fog_fragment>

        // Fog
        float fogDepth = gl_FragCoord.z / gl_FragCoord.w;
        float fogFactor = smoothstep(uFogNear, uFogFar, fogDepth);
        gl_FragColor.rgb = mix(gl_FragColor.rgb, uFogColor, fogFactor);
    }
`;