import {
    LineSegments,
    WireframeGeometry
} from 'three';

import SimplexNoise from 'simplex-noise';

export const createWireframe = (geometry) => {
    const wireframe = new WireframeGeometry(geometry);
    const line = new LineSegments(wireframe);
    
    line.material.depthTest = false;
    line.material.opacity = 0.25;
    line.material.transparent = true;

    return line
}

export const randomRange = (min, max) => Math.random() * (max - min);

export const map = (val, smin, smax, emin, emax) => {
    const t =  (val-smin)/(smax-smin)
    return (emax-emin)*t + emin
}
// Re-map from -1.0:+1.0 to 0.0:1.0
// export const noise = (nx, ny) => map(simplex.noise2D(nx,ny), -1, 1, 0, 1);
// export const noise = (x, y) => {};

//stack some noisefields together
export const octave = (nx, ny, octaves) => {
    let val = 0;
    let freq = 1;
    let max = 0;
    let amp = 1;

    for (let i = 0; i < octaves; i++) {
        val += noise(nx * freq, ny * freq) * amp;
        max += amp;
        amp /= 2;
        freq *= 2;
    }

    return val / max;
}

export function Simplex(seed) {
    this.simplex = new SimplexNoise(seed);
}

Simplex.prototype = {
    noise2D: function(x, y, amp = 1, freq = 1) {
        return this.simplex.noise2D(x * freq, y * freq) * amp;
    },
    octaves: function(x, y, amp = 1, freq = 1) {
        const e = 1 * this.simplex.noise2D(x * 1 * freq, y * 1 * freq) * amp
        + 0.5 * this.simplex.noise2D(x * 2 * freq, y * 2 * freq) * amp
        + 0.25 * this.simplex.noise2D(x * 4 * freq, y * 2 * freq) * amp;

        return e;
        // return Math.pow(e, 0.9);
    }
}
