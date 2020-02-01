import {
    BufferGeometry,
    Color,
    Face3,
    FontLoader,
    Geometry,
    Group,
    LineSegments,
    Math as ThreeMath,
    Mesh,
    MeshBasicMaterial,
    MeshStandardMaterial,
    ShapeBufferGeometry,
    VertexColors,
    Vector3,
    WireframeGeometry
} from 'three';
// import { ImprovedNoise } from 'three/examples/jsm/math/ImprovedNoise.js';
// import { Lut } from 'three/examples/jsm/math/Lut.js';
// import { randomRange } from './util';
import SimplexNoise from 'simplex-noise';

let outerRadius = 5,
    innerRadius = outerRadius * 0.866025404,
    solidArea = 0.75,
    labels = [],
    simplex,
    // lut = new Lut(),
    // blendArea = 1 - solidArea,
    cells = [];
    // heightMap = [],
    // heightMapRange = [];

function HexGrid(width, height) {
    const geometry = new Geometry();
    const group = new Group();
    geometry.name = 'HexGrid';
    // heightMap = generateHeight(width, height);
    // heightMapRange = [
    //     heightMap.slice().sort()[0],
    //     heightMap.slice().sort()[heightMap.length -1]
    // ];

    simplex = new SimplexNoise('seed');

    for (let z = 0, i = 0; z < height; z++) {
        for (let x = 0; x < width; x++) {
            const hexCell = new Hexagon(x, z, i, width);
            geometry.mergeMesh(hexCell.mesh);
            // geometry.mergeVertices();
            cells.push(hexCell);
            i++;
        }
    }

    geometry.mergeVertices();
    geometry.computeFaceNormals()
    // geometry.computeFlatVertexNormals(); // results look same as above

    geometry.computeVertexNormals();
    // geometry.verticesNeedUpdate = true;

    const material = new MeshStandardMaterial({
        vertexColors: VertexColors
    });
    const mesh = new Mesh(geometry, material);
    mesh.name = 'Hexagon';
    mesh.position.x = -(width * innerRadius) + (innerRadius / 2);
    mesh.position.z = -(height * innerRadius) + (innerRadius / 2);

    const wireframe = createWireframe(geometry);
    mesh.add(wireframe);

    group.position.x = -(width * innerRadius) + (innerRadius / 2);
    group.position.z = -(height * innerRadius) + (innerRadius / 2);
    group.add(...cells.map(c => c.mesh));

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
        (cX + cZ * 0.5 - parseInt(cZ / 2)) * (innerRadius * 2),
        // Math.floor(Math.random() * 10) - 3,
        // heightMap[index],
        simplex.noise2D(cX, cZ) * 4,
        cZ * (outerRadius * 1.5)
    );

    // const rnd = () => randomRange(-0.6, 0.6);

    this.corners = {
		SW: new Vector3(-innerRadius, 0, 0.5 * outerRadius).addScalar(simplex.noise2D(cX, cZ)),
        NW: new Vector3(-innerRadius, 0, -0.5 * outerRadius).addScalar(simplex.noise2D(cX + 1, cZ + 1)),
		N: new Vector3(0, 0, -outerRadius).addScalar(simplex.noise2D(cX + 2, cZ + 2)),
        NE: new Vector3(innerRadius, 0, -0.5 * outerRadius).addScalar(simplex.noise2D(cX + 3, cZ + 3)),
		SE: new Vector3(innerRadius, 0, 0.5 * outerRadius).addScalar(simplex.noise2D(cX + 4, cX + 4)),
        S: new Vector3(0, 0, outerRadius).addScalar(simplex.noise2D(cX + 5, cX + 5)),
    };
    const geometry = new Geometry();
    const color = new Color(this.position.y < 0 ? '#0000FF'
        : this.position.y < 0.4 ? '#FFFF00'
        : this.position.y < 0.6 ? '#00FF00'
        : this.position.y < 0.8 ? '#654321'
        : '#FFF'
    );
    geometry.colors.push(color);
    // const colors = [ new Color('#FF0000'), new Color('#00F00F'), new Color('#0000FF') ];

    // Trianglation loop
    const cornersKeys = Object.keys(this.corners);

    for (let i = 0, faceI = 0; i < cornersKeys.length; i++) {
        const { x, z } = this.corners[cornersKeys[i]];
        const { y } = this.position;
        const { x: x2, z: z2 } = this.corners[cornersKeys[i + 1]] || this.corners[cornersKeys[0]];

        // main
        geometry.vertices.push(new Vector3(0, this.position.y, 0));
        geometry.vertices.push(new Vector3(x * solidArea, y, z * solidArea));
        geometry.vertices.push(new Vector3(x2 * solidArea, y, z2 * solidArea));
        geometry.faces.push(new Face3(0, faceI + 2, faceI + 1, null, color));

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
                const b1Colors = [ color, color, neighborColors[0] ];
                const b2Colors = [ color, neighborColors[0], neighborColors[0] ];

                geometry.vertices.push(b1);
                geometry.vertices.push(b2);
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
                    const triColors = [ color, nextNeighborColors[0], neighborColors[0] ];
                    geometry.vertices.push(tri);
                    geometry.faces.push(new Face3(faceI + 2, faceI + 5, faceI + 3, null, triColors));

                    faceI += 1;
                }

                faceI += 2;
            }
        }

        faceI += 3;
    }

    // geometry.mergeVertices();
    // geometry.computeFaceNormals();
    // geometry.computeVertexNormals();
    // geometry.normalsNeedUpdate = true;
    // geometry.verticesNeedUpdate = true;
    geometry.name = 'Hexagon';

    // const displacementMap = new TextureLoader().load('img/tiling-perlin-normal.png');

    const material = new MeshStandardMaterial({
        // displacementMap: displacementMap,
		// displacementScale: 1.25,
		// displacementBias: - 0.428408, // from original model
        // vertexColors: FaceColors
        vertexColors: VertexColors
    });

    this.mesh = new Mesh(geometry, material);
    this.mesh.name = 'Hexagon';
    this.mesh.position.x = this.position.x;
    // hexagon.position.y = Math.floor(Math.random() * 10);
    this.mesh.position.z = this.position.z;

    // const sprite = new Sprite(new SpriteMaterial({
    //     map: new CanvasTexture(lut.createCanvas())
    // }));
    // sprite.scale.x = 0.125;
    // this.mesh.add(sprite);
    
    createLabel(this.coordinates, this.position.y).then(text => this.mesh.add(text));
    // const wireframe = createWireframe(geometry);
    // this.mesh.add(wireframe);

	return this;
}

function createWireframe(geometry) {
    const wireframe = new WireframeGeometry(geometry);
    const line = new LineSegments(wireframe);
    
    line.material.depthTest = false;
    line.material.opacity = 0.25;
    line.material.transparent = true;

    return line
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

// function generateHeight(width, height) {
//     let size = width * height,
//         data = new Uint8Array(size),
//         perlin = new ImprovedNoise(),
//         quality = 1,
//         z = Math.random() * 10;

//     for (let j = 0; j < 4; j ++) {
//         for (let i = 0; i < size; i ++) {

//             let x = i % width, y = ~ ~ ( i / width );
//             data[i] += Math.abs(perlin.noise(x / quality, y / quality, z) * quality * 1.75);
//         }

//         quality += 3;
//     }

//     return data;
// }

export default HexGrid;
