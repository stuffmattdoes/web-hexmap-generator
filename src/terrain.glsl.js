export const vertexShader = `
    attribute vec3 color;

    varying vec2 vUv;
    varying vec3 vPos;
    varying vec3 vColor;

    uniform vec2 uTiling;
    // #include <common>
    // #include <fog_pars_vertex>

    void main() {
        // #include <common>
        // #include <fog_vertex>
        vColor = color;
        vPos = position;
        vUv = uv * uTiling;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

export const fragmentShader = `
    varying vec3 vColor;
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
        gl_FragColor = vec4(1.0);

        vec3 grass = texture2D(uGrassTex, vUv).rgb * vColor.r;
        vec3 rock = texture2D(uRockTex, vUv).rgb * vColor.g;
        vec3 sand = texture2D(uSandTex, vUv).rgb * vColor.b;
        gl_FragColor.rgb = grass + rock + sand;
        
        // #include <fog_fragment>

        // Fog
        float fogDepth = gl_FragCoord.z / gl_FragCoord.w;
        float fogFactor = smoothstep(uFogNear, uFogFar, fogDepth);
        gl_FragColor.rgb = mix(gl_FragColor.rgb, uFogColor, fogFactor);
    }
`;