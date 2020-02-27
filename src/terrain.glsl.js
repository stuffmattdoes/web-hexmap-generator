export const vertexShader = `
    varying vec2 vUv;
    varying vec3 vPos;

    void main() {
        vPos = position;
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

export const fragmentShader = `
    varying vec2 vUv;

    uniform sampler2D uGrassTex;

    void main() {
        // gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
        gl_FragColor = texture2D(uGrassTex, vUv);
    }
`;