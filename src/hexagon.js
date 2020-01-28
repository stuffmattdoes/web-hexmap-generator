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
    WireframeGeometry
} from 'three';
// import { scene } from '.';
// import * as THREE from 'three';

const outerRadius = 5;
const innerRadius = outerRadius * 0.866025404;
const solidArea = 0.75;
// const blendArea = 1 - solidArea;
// const dir = [ 'NE', 'E', 'SE', 'SW', 'W', 'NW' ];

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
            console.log(hexCell);
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
    }
    this.coordinates.y = -1 * this.coordinates.x - this.coordinates.z;
    this.neighbors = {
        NW: cZ > 0 && cZ % 2 === 1 ? cells[index - w] : cells[index - w - 1],
        NE: cZ > 0 && cZ % 2 === 1 ? cells[index - w + 1] : cells[index - w],
        E: null,
        SE: null,
        SW: null,
        W: cX > 0 && cells[index - 1]
    }

    this.position = {
        x: (cX + cZ * 0.5 - parseInt(cZ / 2)) * (innerRadius * 2),
        y: Math.floor(Math.random() * 10) - 5,
        z: cZ * (outerRadius * 1.5)
    }
    const corners = [
		new Vector3(0, 0, -outerRadius),
        new Vector3(innerRadius, 0, -0.5 * outerRadius),
		new Vector3(innerRadius, 0, 0.5 * outerRadius),
        new Vector3(0, 0, outerRadius),
		new Vector3(-innerRadius, 0, 0.5 * outerRadius),
        new Vector3(-innerRadius, 0, -0.5 * outerRadius)
    ];
    const geometry = new Geometry();

    // begin: center, solid area, border area
    geometry.vertices.push(new Vector3(0, this.position.y, 0));
    const color = new Color('#' + Math.random().toString(16).slice(2, 8));
    // geometry.colors.push(color);
    let blendColor;

    for (let i = 0; i < corners.length; i++) {
        blendColor = color;
        geometry.vertices.push(new Vector3(corners[i].x * solidArea, this.position.y, corners[i].z * solidArea));
        geometry.vertices.push(corners[i]);
        geometry.colors.push(color);
        // geometry.colors.push(color);

        if (i > 0) {
            geometry.faces.push(new Face3(0, i + i + 1, i + i - 1, null, color));   // Face

            if (i === 5 && this.neighbors.W) {
                blendColor = this.neighbors.W.mesh.geometry.colors[1];
            } else if (i === 1 && this.neighbors.NE) {
                blendColor = this.neighbors.NE.mesh.geometry.colors[1];
            }

            geometry.faces.push(new Face3(i + i - 1, i + i + 1, i * 2, null, [ color, color, blendColor ]));   // Border
            geometry.faces.push(new Face3(i * 2 + 1, i * 2 + 2, i * 2, null, [ color, blendColor, blendColor ]));   // Border
        }
    }

    // end
    if (this.neighbors.NW) {
        blendColor = this.neighbors.NW.mesh.geometry.colors[1];
    }

    geometry.faces.push(new Face3(0, 1, 11, null, color));
    geometry.faces.push(new Face3(11, 1, 12, null, [ color, color, blendColor ]));
    geometry.faces.push(new Face3(1, 2, 12, null, [ color, blendColor, blendColor ]));

    geometry.computeFaceNormals();
    // geometry.computeVertexNormals();
    // geometry.normalsNeedUpdate = true;
    geometry.name = 'Hexagon';
    // geometry.rotateX(-90 * ThreeMath.DEG2RAD);
    const material = new MeshStandardMaterial({
        // vertexColors: FaceColors
        vertexColors: VertexColors
    });

    // material.color = new THREE.Color('#ff0000');
    // material.needsUpdate = true;

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
