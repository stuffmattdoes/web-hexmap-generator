export const vertexShader = `
    attribute vec3 color;

    varying vec3 vColor;
    varying vec3 vNormal;
    varying vec3 vPos;
    varying vec2 vUv;

    uniform vec2 uTiling;
    // #include <common>
    // #include <fog_pars_vertex>

    void main() {
        // #include <common>
        // #include <fog_vertex>
        vColor = color;
        vNormal = normal;
        // vPos = (position + 2.0) * 0.1;
        vPos = (modelMatrix * vec4(position + 2.0, 1.0)).xyz * 0.1;
        vUv = uv * uTiling;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

export const fragmentShader = `
    varying vec3 vColor;
    varying vec3 vNormal;
    varying vec3 vPos;
    varying vec2 vUv;

    uniform sampler2D uDistortionMap;
    uniform sampler2D uGrassTex;
    uniform sampler2D uSandTex;
    uniform sampler2D uRockTex;

    uniform vec3 uFogColor;
    uniform float uFogFar;
    uniform float uFogNear;

    // #include <common>
    // #include <fog_pars_fragment>
    // #include <lights_phong_pars_fragment>

    vec3 getTriPlanarFrag(sampler2D texture, vec3 blending) {
        vec4 xAxis = texture2D(texture, vPos.yz);
        vec4 yAxis = texture2D(texture, vPos.xz);
        vec4 zAxis = texture2D(texture, vPos.xy);
        // blend the results of the 3 planar projections.
        return (xAxis * blending.x + yAxis * blending.y + zAxis * blending.z).rgb;
    }

    void main() {
        // #include <lights_phong_fragment>
        gl_FragColor = vec4(1.0);
        // gl_FragColor.rgb = vColor;
        // gl_FragColor = vec4(vNormal, 1.0);

        // wNormal is the world-space normal of the fragment
        vec3 blending = abs(vNormal);
        // blending = normalize(max(blending, 0.00001)); // Force weights to sum to 1.0
        blending /= (blending.x + blending.y + blending.z);

        // coords is world-space
        vec3 sand = getTriPlanarFrag(uSandTex, blending) * vColor.r;
        vec3 grass = getTriPlanarFrag(uGrassTex, blending) * vColor.g;
        vec3 rock = getTriPlanarFrag(uRockTex, blending) * vColor.b;
        gl_FragColor.rgb = (sand + grass + rock);

        // vec3 transition = vColor.rgb;
        // float cutoff = texture2D(uDistortionMap, vUv).r;

        // vec3 sand = texture2D(uSandTex, vUv).rgb * transition.r;
        // vec3 grass = texture2D(uGrassTex, vUv).rgb * transition.g;
        // vec3 rock = texture2D(uRockTex, vUv).rgb * transition.b;
        // gl_FragColor.rgb = (sand + grass + rock);

        // vec3 sand = texture2D(uSandTex, vUv).rgb * transition.r;
        // vec3 grass = texture2D(uGrassTex, vUv).rgb * transition.g;
        // vec3 rock = texture2D(uRockTex, vUv).rgb * transition.b;

        // #include <fog_fragment>

        // Fog
        float fogDepth = gl_FragCoord.z / gl_FragCoord.w;
        float fogFactor = smoothstep(uFogNear, uFogFar, fogDepth);
        gl_FragColor.rgb = mix(gl_FragColor.rgb, uFogColor, fogFactor);
    }
`;