import {
    // BufferAttribute,
    // BufferGeometry,
    // Color,
    Face3,
    FontLoader,
    // Geometry,
    Group,
    // Line,
    // LineBasicMaterial,
    LineSegments,
    Math as ThreeMath,
    Mesh,
    MeshBasicMaterial,
    // MeshPhongMaterial,
    // Shape,
    ShapeBufferGeometry,
    // ShapeGeometry,
    // Vector2,
    Vector3,
    WireframeGeometry,
    Geometry
} from 'three';
// import { scene } from '.';
// import * as THREE from 'three';

const outerRadius = 5;
const innerRadius = outerRadius * 0.866025404;
const solidArea = 0.75;	
const blendArea = 1 - solidArea;

function HexGrid(width, height) {
    let hexGrid = new Group();
    hexGrid.name = 'HexGrid';
    hexGrid.position.x = -(width * innerRadius) + innerRadius;
    hexGrid.position.z = -(height * innerRadius) + innerRadius;

    for (let i = 0; i < width; i++) {
        for (let j = 0; j < height; j++) {
            const hexCell = new Hexagon(i, 0, j);
            hexGrid.add(hexCell);
        }
    }

    return hexGrid;
}

// Hexagon
function Hexagon(cX, cY, cZ) {
    this.coordinates = {
        // x: cX - (cZ - (cZ & 1)) / 2,    // "& 1" is "bitwise and"
        x: cX - (cZ - (cZ % 2)) / 2,    // Also works
        z: cZ,
    }
    this.position = {
        x: (cX + cZ * 0.5 - parseInt(cZ / 2)) * (innerRadius * 2),
        y: 0,
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
    // const points = [];

    // for (let i = 0; i < corners.length; i++) {
    //     const c1 = corners[i];
    //     const c2 = corners[i + 1] || corners[0];

    //     // Solid area
    //     points.push(0, 0, 0);
    //     points.push(c2.x * solidArea, 0, c2.z * solidArea);
    //     points.push(c1.x * solidArea, 0, c1.z * solidArea);
    // }

    // const vertices = new Float32Array(points);
    // const geometry = new BufferGeometry().setFromPoints(vertices);
    // geometry.setAttribute('position', new BufferAttribute(vertices, 3));

    const geometry = new Geometry();

    // Solid area
    geometry.vertices.push(new Vector3(0, 0, 0));
    geometry.vertices.push(new Vector3(corners[0].x * solidArea, 0, corners[0].z * solidArea)); // NE
    geometry.vertices.push(new Vector3(corners[1].x * solidArea, 0, corners[1].z * solidArea)); // E
    geometry.vertices.push(new Vector3(corners[2].x * solidArea, 0, corners[2].z * solidArea)); // SE
    geometry.vertices.push(new Vector3(corners[3].x * solidArea, 0, corners[3].z * solidArea)); // SW
    geometry.vertices.push(new Vector3(corners[4].x * solidArea, 0, corners[4].z * solidArea)); // W
    geometry.vertices.push(new Vector3(corners[5].x * solidArea, 0, corners[5].z * solidArea)); // NW
    geometry.faces.push(new Face3(0, 2, 1));
    geometry.faces.push(new Face3(0, 3, 2));
    geometry.faces.push(new Face3(0, 4, 3));
    geometry.faces.push(new Face3(0, 5, 4));
    geometry.faces.push(new Face3(0, 6, 5));
    geometry.faces.push(new Face3(0, 1, 6));

    // Blend area
    geometry.vertices.push(corners[0]); // 7
    geometry.vertices.push(corners[1]); // 8
    geometry.faces.push(new Face3(1, 8, 7));
    geometry.faces.push(new Face3(1, 2, 8));

    geometry.vertices.push(corners[2]);
    geometry.faces.push(new Face3(2, 9, 8));
    geometry.faces.push(new Face3(2, 3, 9));

    geometry.vertices.push(corners[3]);
    geometry.faces.push(new Face3(3, 10, 9));
    geometry.faces.push(new Face3(3, 4, 10));

    geometry.vertices.push(corners[4]);
    geometry.faces.push(new Face3(4, 11, 10));
    geometry.faces.push(new Face3(4, 5, 11));

    geometry.vertices.push(corners[5]);
    geometry.faces.push(new Face3(5, 12, 11));
    geometry.faces.push(new Face3(5, 6, 12));

    // geometry.vertices.push(corners[6]);
    geometry.faces.push(new Face3(6, 7, 12));
    geometry.faces.push(new Face3(6, 1, 7));
    // geometry.faces.push(new Face3(6, 7, 1));

    geometry.computeVertexNormals();
    geometry.normalsNeedUpdate = true;
    geometry.name = 'Hexagon';
    // geometry.rotateX(-90 * ThreeMath.DEG2RAD);
    const color = '#' + Math.random().toString(16).slice(2, 8);
    const material = new MeshBasicMaterial({ color: color });

    // material.color = new THREE.Color('#ff0000');
    // material.needsUpdate = true;

    // const material = new MeshPhongMaterial( {
    //     color: this.color, specular: '#fff', shininess: 250,
    //     side: THREE.DoubleSide, vertexColors: THREE.VertexColors
    // });

    const hexagon = new Mesh(geometry, material);
    hexagon.name = 'Hexagon';
    hexagon.position.x = this.position.x;
    // hexagon.position.y = Math.floor(Math.random() * 10);
    hexagon.position.z = this.position.z;

    createLabel(this.coordinates).then(text => hexagon.add(text));
    const wireframe = createWireframe(geometry);
    hexagon.add(wireframe);

	return hexagon;
}

function createWireframe(geometry) {
    const wireframe = new WireframeGeometry(geometry);
    const line = new LineSegments(wireframe);
    
    line.material.depthTest = false;
    line.material.opacity = 0.25;
    line.material.transparent = true;

    return line
}

function createLabel({ x: cX, z: cZ }) {
    const loader = new FontLoader();

    return new Promise((resolve, reject) => {
        loader.load('fonts/helvetiker_regular.typeface.json', 
            (font) => {
                const message = `${cX}, ${cZ}`;
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
                text.position.y = 0.1
                text.position.z = 1;

                return resolve(text);
            }),
            console.log,
            reject
    });
}

export default HexGrid;
