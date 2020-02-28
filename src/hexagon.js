import {
    // BufferGeometry,
    Color,
    Face3,
    FontLoader,
    Geometry,
    Group,
    Math as ThreeMath,
    Mesh,
    MeshBasicMaterial,
    MeshPhongMaterial,
    MeshStandardMaterial,
    MeshToonMaterial,
    RepeatWrapping,
    ShaderMaterial,
    ShapeBufferGeometry,
    TextureLoader,
    UniformsLib,
    UniformsUtils,
    VertexColors,
    Vector3,
    Vector2
} from 'three';
// import { ImprovedNoise } from 'three/examples/jsm/math/ImprovedNoise.js';
// import { Lut } from 'three/examples/jsm/math/Lut.js';
// import SimplexNoise from 'simplex-noise';
import { createWireframe, Simplex } from './util';
import { colors, scene } from '.';
import { fragmentShader, vertexShader } from './terrain.glsl.js';

let outerRadius = 5,
    innerRadius = outerRadius * 0.866025404,
    solidArea = 0.75,
    labels = [],
    simplex,
    textureLoader = new TextureLoader(),
    textures = {},
    cells = [];

function HexGrid(width, height) {
    const geometry = new Geometry();
    // const group = new Group();
    geometry.name = 'HexGrid';
    simplex = new Simplex('seed');

    textures.grass =  textureLoader.load('/img/grass.jpg');
    textures.rocks =  textureLoader.load('/img/rock.jpg');
    textures.sand = textureLoader.load('/img/sand.jpg');
    [ 'grass', 'rocks', 'sand' ].forEach(type => textures[type].wrapS = textures[type].wrapT = RepeatWrapping);

    for (let z = 0, i = 0; z < height; z++) {
        for (let x = 0; x < width; x++) {
            const hexCell = new Hexagon(x, z, i, width);
            geometry.mergeMesh(hexCell.mesh);
            cells.push(hexCell);
            i++;
        }
    }

    geometry.mergeVertices();
    geometry.computeFaceNormals();
    calculateUvs(geometry);
    // geometry.computeFlatVertexNormals(); // results look same as above

    geometry.computeVertexNormals();
    geometry.verticesNeedUpdate = true;
    geometry.uvsNeedUpdate = true;

    // console.log(geometry);

    // const bumpMap = new TextureLoader().load('/img/tiling-perlin-noise.png');

    const material = new MeshPhongMaterial({
        // lighting: true,
        // map: textures.grass,
        shininess: 0,
        vertexColors: VertexColors,
    });

    this.uniforms = 
        // UniformsUtils.merge([
        // UniformsLib['lights'],
        {
            uGrassTex: { type: 't', value: textures.grass },
            uRockTex: { type: 't', value: textures.rocks },
            uSandTex: { type: 't', value: textures.sand },

            // Fog
            uFogColor: { value: scene.fog.color },
            uFogFar: { value: scene.fog.far },
            uFogNear: { value: scene.fog.near },

            // Straight from UniformsLib['fog']
            // fogDensity: { value: 0.00025 },
		    // fogNear: { value: scene.fog.near },
		    // fogFar: { value: scene.fog.far },
		    // fogColor: { value: scene.fog.color }
        }
    // ]);

    // const material = new ShaderMaterial({
    //     // fog: true,
    //     // useFog: true,
    //     // USE_FOG: true,
    //     fragmentShader,
    //     uniforms: this.uniforms,
    //     vertexShader
    // });

    console.log(geometry, material);
    const mesh = new Mesh(geometry, material);
    mesh.name = 'Hexagon';
    mesh.position.x = -(width * innerRadius) + (innerRadius / 2);
    mesh.position.z = -(height * innerRadius) + (innerRadius / 2);

    // const wireframe = createWireframe(geometry);
    // mesh.add(wireframe);

    // group.position.x = -(width * innerRadius) + (innerRadius / 2);
    // group.position.z = -(height * innerRadius) + (innerRadius / 2);
    // group.add(...cells.map(c => c.mesh));

    // return group;
    return mesh;
}

// Hexagon
function Hexagon(cX, cZ, index, w) {
    this.coordinates = {
        // x: cX - (cZ - (cZ & 1)) / 2,    // "& 1" is "bitwise and"
        x: cX - (cZ - (cZ % 2)) / 2,    // Also works
        z: cZ,
    };
    this.coordinates.y = -1 * this.coordinates.x - this.coordinates.z;
    const neighbors = {
        W: null,
        NW: null,
        NE: null
    };

    if (cX > 0) {
        neighbors.W = cells[index - 1];
    }

    if (cZ > 0) {
        if (cZ % 2 === 1) {
            neighbors.NW = cells[index - w];

            if (cX < w - 1) {
                neighbors.NE = cells[index - w + 1];
            }
        } else {
            neighbors.NE = cells[index - w];

            if (cX > 0) {
                neighbors.NW = cells[index - w - 1];
            }
        }
    }

    this.position = new Vector3(
        (cX + cZ * 0.5 - parseInt(cZ / 2)) * (innerRadius * 2), // hex grid horizontal offset
        Math.round(simplex.octaves(cX, cZ, 6, 0.08)),   // height from simplex noise (makes it deterministic)
        cZ * (outerRadius * 1.5)    // hex grid vertical offset
    );

    // const minHeight = -3,
    //     maxHeight = 7,
    //     range = maxHeight - minHeight;

    this.corners = {
		SW: new Vector3(-innerRadius, 0, 0.5 * outerRadius).addScalar(simplex.noise2D(cX, cZ)),
        NW: new Vector3(-innerRadius, 0, -0.5 * outerRadius).addScalar(simplex.noise2D(cX + 1, cZ + 1)),
		N: new Vector3(0, 0, -outerRadius).addScalar(simplex.noise2D(cX + 2, cZ + 2)),
        NE: new Vector3(innerRadius, 0, -0.5 * outerRadius).addScalar(simplex.noise2D(cX + 3, cZ + 3)),
		SE: new Vector3(innerRadius, 0, 0.5 * outerRadius).addScalar(simplex.noise2D(cX + 4, cX + 4)),
        S: new Vector3(0, 0, outerRadius).addScalar(simplex.noise2D(cX + 5, cX + 5)),
    };
    const geometry = new Geometry();
    // const color = new Color(
    //     this.position.y < 0 * range + minHeight ? colors.earth.b
    //     : this.position.y < 0.15 * range + minHeight ? colors.earth.f
    //     : this.position.y < 0.3 * range + minHeight ? colors.earth.i
    //     : this.position.y < 0.45 * range + minHeight ? colors.earth.k
    //     : this.position.y < 0.75 * range + minHeight ? colors.earth.j
    //     : '#fff'
    // );
    const colors = [ new Color(1.0, 0.0, 0.0), new Color(0.0, 1.0, 0.0), new Color(0.0, 0.0, 1.0) ];
    geometry.colors.push(colors[0]);

    // Trianglation loop
    const cornersKeys = Object.keys(this.corners);

    for (let i = 0, faceI = 0; i < cornersKeys.length; i++) {
        const { x, z } = this.corners[cornersKeys[i]];
        const { y } = this.position;
        const { x: x2, z: z2 } = this.corners[cornersKeys[i + 1]] || this.corners[cornersKeys[0]];

        // main
        geometry.vertices.push(
            new Vector3(0, this.position.y, 0),
            new Vector3(x * solidArea, y, z * solidArea),
            new Vector3(x2 * solidArea, y, z2 * solidArea)
        );
        geometry.faces.push(new Face3(0, faceI + 2, faceI + 1, null, colors[0]));

        // We only need the first three bridges to prevent overlapping
        if (i < 3) {
            let cornerKeys = Object.keys(this.corners),
                dir = Object.keys(neighbors),
                neighbor = neighbors[dir[i]],
                nextNeighbor = neighbors[dir[i + 1]];

            if (neighbor) {
                const corner = cornerKeys[i + 3],
                    nextCorner = cornerKeys[i + 4] || cornerKeys[i - 2];
                let { mesh: { geometry: { colors: neighborColors }}, position } = neighbor;
                const diff = new Vector3().subVectors(position, this.position);
                const b1 = new Vector3(
                    diff.x + neighbor.corners[corner].x * solidArea,
                    position.y,
                    diff.z + neighbor.corners[corner].z * solidArea
                );
                const b2 = new Vector3(
                    diff.x + neighbor.corners[nextCorner].x * solidArea,
                    position.y,
                    diff.z + neighbor.corners[nextCorner].z * solidArea
                );
                geometry.vertices.push(b1);
                geometry.vertices.push(b2);

                // Using splat map colors
                const b1Colors = [ colors[0], colors[0], colors[1] ];
                const b2Colors = [ colors[0], colors[1], colors[1] ];

                geometry.faces.push(new Face3(faceI + 1, faceI + 2, faceI + 3, null, b1Colors));
                geometry.faces.push(new Face3(faceI + 1, faceI + 3, faceI + 4, null, b2Colors));

                if (nextNeighbor && i < 2) {
                    let { mesh: { geometry: { colors: nextNeighborColors }}, position } = nextNeighbor;
                    const triCorner = cornerKeys[i + 5] || cornerKeys[i - 1];
                    const nextDiff = new Vector3().subVectors(position, this.position);
                    const tri = new Vector3(
                        nextDiff.x + nextNeighbor.corners[triCorner].x * solidArea, 
                        position.y, 
                        nextDiff.z + nextNeighbor.corners[triCorner].z * solidArea
                    );
                    geometry.vertices.push(tri);

                    // Using terrain colors
                    // const triColors = [ color, nextNeighborColors[0], neighborColors[0] ];

                    // Using splat map colors
                    const triColors = [ colors[0], colors[2], colors[1] ];
                    geometry.faces.push(new Face3(faceI + 2, faceI + 5, faceI + 3, null, triColors));

                    faceI += 1;
                }

                faceI += 2;
            }
        }

        faceI += 3;
    }

    geometry.verticesNeedUpdate = true;
    this.mesh = new Mesh(geometry);
    this.mesh.name = 'Hexagon';
    this.mesh.position.x = this.position.x;
    // hexagon.position.y = Math.floor(Math.random() * 10);
    this.mesh.position.z = this.position.z;
    
    // createLabel(this.coordinates, this.position.y).then(text => this.mesh.add(text));

	return this;
}

const normalizeScalar = (scalar, min, max) => (scalar - min) / (max - min);
const normalizeVec2 = (vec3, min, max) => new Vector2(
    normalizeScalar(vec3.x, min.x, max.x),
    // normalizeScalar(vec3.y, min.y, max.y),
    normalizeScalar(vec3.z, min.z, max.z)
);

const calculateUvs = (geometry) => {
    geometry.computeBoundingBox();
    const { min, max } = geometry.boundingBox;

    // UVs
    geometry.faces.forEach((f, i) => {
        const { a, b, c, color, vertexColors } = f;
        const vertA = geometry.vertices[a];
        const vertB = geometry.vertices[b];
        const vertC = geometry.vertices[c];
        const uvs = [
            normalizeVec2(vertA, min, max),
            normalizeVec2(vertB, min, max),
            normalizeVec2(vertC, min, max)
        ];

        f.vertexColors = f.color = new Color(1.0, 1.0, 1.0);
        geometry.faceVertexUvs[0].push([ uvs[0], uvs[1], uvs[2] ]);
    });
}
    
function createLabel({ x: cX, z: cZ }, y) {
    const loader = new FontLoader();

    return new Promise((resolve, reject) => {
        loader.load('fonts/helvetiker_regular.typeface.json', 
            (font) => {
                const message = [ cX, cZ ].join(', ');
                const material = new MeshBasicMaterial({
                    color: '#000',
                    // transparent: true,
                    // opacity: 0.4,
                    // side: THREE.DoubleSide
                });

                const shapes = font.generateShapes(message, 1.5);
                const geometry = new ShapeBufferGeometry(shapes);
                geometry.computeBoundingBox();
                const xMid = - 0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);
                const text = new Mesh(geometry, material);
                text.name = 'Text';
                text.rotateX(-90 * ThreeMath.DEG2RAD);
                text.position.x = xMid;
                text.position.y = y + 0.1;
                text.position.z = 1;

                return resolve(text);
            }),
            console.log,
            reject
    });
}

export default HexGrid;
