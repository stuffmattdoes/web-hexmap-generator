import {
    // BufferAttribute,
    // BufferGeometry,
    Color,
    Face3,
    FaceColors,
    FontLoader,
    Geometry,
    Group,
    // Line,
    // LineBasicMaterial,
    LineSegments,
    Math as ThreeMath,
    Mesh,
    MeshBasicMaterial,
    MeshStandardMaterial,
    // MeshPhongMaterial,
    // Shape,
    ShapeBufferGeometry,
    // ShapeGeometry,
    // Vector2,
    VertexColors,
    Vector3,
    WireframeGeometry,
    Vector2
} from 'three';
// import { scene } from '.';
// import * as THREE from 'three';

const outerRadius = 5;
const innerRadius = outerRadius * 0.866025404;
const solidArea = 0.75;
// const blendArea = 1 - solidArea;
let cells = [];

function HexGrid(width, height) {
    let hexGrid = new Group();
    hexGrid.name = 'HexGrid';
    hexGrid.position.x = -(width * innerRadius) + innerRadius;
    hexGrid.position.z = -(height * innerRadius) + innerRadius;

    for (let z = 0, i = 0; z < height; z++) {
        for (let x = 0; x < width; x++) {
            const hexCell = new Hexagon(x, 0, z, i, width);
            cells.push(hexCell);
            i++;
        }
    }

    hexGrid.add(...cells.map(c => c.mesh));

    return hexGrid;
}

// Hexagon
function Hexagon(cX, cY, cZ, index, w) {
    this.coordinates = {
        // x: cX - (cZ - (cZ & 1)) / 2,    // "& 1" is "bitwise and"
        x: cX - (cZ - (cZ % 2)) / 2,    // Also works
        z: cZ,
    };
    this.coordinates.y = -1 * this.coordinates.x - this.coordinates.z;
    const neighbors = {
        // W: cX > 0 ? cells[index - 1] : null,
        // NW: cZ > 0 ? cZ % 2 === 1 ? cells[index - w] : cells[index - w - 1] : null,
        // NE: cZ > 0 ? cZ % 2 === 1 ? cells[index - w + 1] : cells[index - w] : null,
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
        Math.floor(Math.random() * 10) - 3,
        cZ * (outerRadius * 1.5)
    );
    const corners = {
		SW: new Vector3(-innerRadius, 0, 0.5 * outerRadius),
        NW: new Vector3(-innerRadius, 0, -0.5 * outerRadius),
		N: new Vector3(0, 0, -outerRadius),
        NE: new Vector3(innerRadius, 0, -0.5 * outerRadius),
		SE: new Vector3(innerRadius, 0, 0.5 * outerRadius),
        S: new Vector3(0, 0, outerRadius),
    };
    const geometry = new Geometry();
    const color = new Color(this.position.y < 0 ? '#0000FF'
        : this.position.y < 1 ? '#FFFF00'
        : this.position.y < 2 ? '#00FF00'
        : this.position.y < 4 ? '#654321'
        : '#FFF'
    );
    geometry.colors.push(color);
    // const colors = [ new Color('#FF0000'), new Color('#00F00F'), new Color('#0000FF') ];

    // Trianglation loop
    const cornersKeys = Object.keys(corners);

    for (let i = 0, faceI = 0; i < cornersKeys.length; i++) {
        const { x, z } = corners[cornersKeys[i]];
        const { y } = this.position;
        const { x: x2, z: z2 } = corners[cornersKeys[i + 1]] || corners.SW;

        // main
        geometry.vertices.push(new Vector3(0, this.position.y, 0));
        geometry.vertices.push(new Vector3(x * solidArea, y, z * solidArea));
        geometry.vertices.push(new Vector3(x2 * solidArea, y, z2 * solidArea));
        geometry.faces.push(new Face3(0, faceI + 2, faceI + 1, null, color));

        // We only need the first three bridges to prevent overlapping
        if (i < 3) {
            let cornerKeys = Object.keys(corners),
                dir = Object.keys(neighbors),
                neighbor = neighbors[dir[i]],
                nextNeighbor = neighbors[dir[i + 1]];

            if (neighbor) {
                const corner = cornerKeys[i + 3],
                    nextCorner = cornerKeys[i + 4] || cornerKeys[i - 2];
                let { mesh: { geometry: { colors: neighborColors }}, position } = neighbor;
                const diff = new Vector3().subVectors(position, this.position);

                const b = new Vector3(diff.x + corners[corner].x * solidArea, position.y, diff.z + corners[corner].z * solidArea);
                const b2 = new Vector3(diff.x + corners[nextCorner].x * solidArea, position.y, diff.z + corners[nextCorner].z * solidArea);
                const bColors = [ color, color, neighborColors[0] ];
                const b1Colors = [ color, neighborColors[0], neighborColors[0] ];

                geometry.vertices.push(b);
                geometry.vertices.push(b2);
                geometry.faces.push(new Face3(faceI + 1, faceI + 2, faceI + 3, null, bColors));
                geometry.faces.push(new Face3(faceI + 1, faceI + 3, faceI + 4, null, b1Colors));

                if (nextNeighbor && i < 2) {
                    let { mesh: { geometry: { colors: nextNeighborColors }}, position } = nextNeighbor;
                    const triCorner = cornerKeys[i + 5] || cornerKeys[i - 1];
                    const nextDiff = new Vector3().subVectors(position, this.position);
                    const tri = new Vector3(nextDiff.x + corners[triCorner].x * solidArea, position.y, nextDiff.z + corners[triCorner].z * solidArea);
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

    // console.log(geometry);
    
    geometry.mergeVertices();   // Remove duplicate vertices introduced in triangulation loop
    geometry.computeFaceNormals();
    // geometry.computeVertexNormals();
    // geometry.normalsNeedUpdate = true;
    geometry.name = 'Hexagon';
    const material = new MeshStandardMaterial({
        // vertexColors: FaceColors
        vertexColors: VertexColors
    });

    this.mesh = new Mesh(geometry, material);
    this.mesh.name = 'Hexagon';
    this.mesh.position.x = this.position.x;
    // hexagon.position.y = Math.floor(Math.random() * 10);
    this.mesh.position.z = this.position.z;

    createLabel(this.coordinates, this.position.y).then(text => this.mesh.add(text));
    const wireframe = createWireframe(geometry);
    this.mesh.add(wireframe);

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
