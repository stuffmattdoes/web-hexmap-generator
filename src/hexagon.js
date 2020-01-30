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
const blendArea = 1 - solidArea;
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
    }
    this.coordinates.y = -1 * this.coordinates.x - this.coordinates.z;
    const neighbors = {
        W: cX > 0 ? cells[index - 1] : null,
        NW: cZ > 0? cZ % 2 === 1 ? cells[index - w] : cells[index - w - 1] : null,
        NE: cZ > 0 ? cZ % 2 === 1 ? cells[index - w + 1] : cells[index - w] : null,
    }
    this.position = {
        x: (cX + cZ * 0.5 - parseInt(cZ / 2)) * (innerRadius * 2),
        y: Math.floor(Math.random() * 10) - 3,
        // y: 0,
        z: cZ * (outerRadius * 1.5)
    }
    const corners = [
		new Vector3(-innerRadius, 0, 0.5 * outerRadius),
        new Vector3(-innerRadius, 0, -0.5 * outerRadius),
		new Vector3(0, 0, -outerRadius),
        new Vector3(innerRadius, 0, -0.5 * outerRadius),
		new Vector3(innerRadius, 0, 0.5 * outerRadius),
        new Vector3(0, 0, outerRadius),
    ];
    const geometry = new Geometry();
    const color = new Color(this.position.y < 0 ? '#0000FF'
        : this.position.y < 1 ? '#FFFF00'
        : this.position.y < 2 ? '#00FF00'
        : this.position.y < 4 ? '#654321'
        : '#FFF'
    );
    geometry.colors.push(color);
    // const colors = [ new Color('#FF0000'), new Color('#00F00F'), new Color('#0000FF') ];
    // const neighborKeys = Object.keys(neighbors);

    // Trianglation loop
    for (let i = 0, faceI = 0; i < corners.length; i++) {
        const { x, z } = corners[i];
        const { y } = this.position;
        const { x: x2, z: z2 } = corners[i + 1] || corners[0];

        // main
        geometry.vertices.push(new Vector3(0, this.position.y, 0));
        geometry.vertices.push(new Vector3(x * solidArea, y, z * solidArea));
        geometry.vertices.push(new Vector3(x2 * solidArea, y, z2 * solidArea));
        geometry.faces.push(new Face3(0, faceI + 2, faceI + 1, null, color));

        if (i < 3) {
            let b = new Vector3(x, y, z),
                bColors = [ color, color, color ],
                b2 = new Vector3(x2, y, z2),
                b2Colors = [ color, color, color ],
                tri = new Vector3(x, y, z),
                triColors = [ color, color, color ];

            if (i === 0) {
                // West bridge
                b.x = x + (x * blendArea);
                b.z = z * solidArea;
                b2.x = x2 + (x2 * blendArea);
                b2.z = z2 * solidArea;

                if (neighbors.W) {
                    const { mesh, position } = neighbors.W;
                    const neighborColor = mesh.geometry.colors[0];

                    b.y = b2.y = position.y;
                    bColors = [ color, neighborColor, neighborColor ];
                    b2Colors = [ color, color, neighborColor ];
                    triColors[2] = neighborColor;
                }

                tri.z = -outerRadius * solidArea;

                if (neighbors.NW) {
                    const { mesh, position } = neighbors.NW;
                    const neighborColor = mesh.geometry.colors[0];

                    tri.y = position.y;
                    triColors[1] = neighborColor;
                }
            } else if (i === 1) {
                // North West bridge
                b.z = -outerRadius * solidArea;
                b2.x = x2 + ((x + x2) * blendArea);
                b2.z = z2 - ((z - z2) * blendArea);

                if (neighbors.NW) {
                    const { mesh, position } = neighbors.NW;
                    const neighborColor = mesh.geometry.colors[0];

                    b.y = b2.y = position.y;
                    bColors = [ color, neighborColor, neighborColor ];
                    b2Colors = [ color, color, neighborColor ];
                    triColors[2] = neighborColor;
                }

                tri.x = x2 - ((x + x2) * blendArea);
                tri.z = z2 - ((z - z2) * blendArea);

                if (neighbors.NE) {
                    const { mesh, position } = neighbors.NE;
                    const neighborColor = mesh.geometry.colors[0];

                    tri.y = position.y;
                    triColors[1] = neighborColor;
                }
            } else {
                // North East bridge
                b.x = x + ((x + x2) * blendArea);
                b.z = z + ((z - z2) * blendArea);
                b2.z = -outerRadius * solidArea;
                tri = b;

                if (neighbors.NE) {
                    const { mesh, position } = neighbors.NE;
                    const neighborColor = mesh.geometry.colors[0];

                    b.y = b2.y = position.y;
                    bColors = [ color, neighborColor, neighborColor ];
                    b2Colors = [ color, color, neighborColor ];
                    triColors[2] = neighborColor;
                }
            }

            geometry.vertices.push(b);   // bridge 1
            geometry.vertices.push(b2); // bridge 2
            geometry.vertices.push(tri); // Gap tri
            
            geometry.faces.push(new Face3(faceI + 1, faceI + 4, faceI + 3, null, bColors));   // bridge 1
            geometry.faces.push(new Face3(faceI + 1, faceI + 2, faceI + 4, null, b2Colors));   // bridge 2
            geometry.faces.push(new Face3(faceI + 2, faceI + 5, faceI + 4, null, triColors));   // Gap tri
            faceI += 3;
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

    // createLabel(this.coordinates, this.position.y).then(text => this.mesh.add(text));
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
