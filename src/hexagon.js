import {
    // BufferAttribute,
    // BufferGeometry,
    FontLoader,
    Group,
    // Line,
    // LineBasicMaterial,
    LineSegments,
    Math as ThreeMath,
    Mesh,
    MeshBasicMaterial,
    // Raycaster,
    Shape,
    ShapeBufferGeometry,
    ShapeGeometry,
    Vector2,
    Vector3,
    WireframeGeometry
} from 'three';
// import * as THREE from 'three';
import { scene } from './index.js';

const outerRadius = 5;
const innerRadius = outerRadius * 0.866025404;

function HexGrid(width, height) {
    let hexGrid = new Group();

    for (let coordX = 0; coordX < width; coordX++) {
        for (let coordZ = 0; coordZ < height; coordZ++) {
            coordX = coordX - coordZ / 2;
            let coordindates = new Vector3(coordX, 0, coordZ);
            const hexCell = new Hexagon(coordindates);
            hexGrid.add(hexCell.mesh);
        }
    }

    return hexGrid;
}

// Hexagon
function Hexagon({ x: cX, y: cY, z: cZ}) {
    let x = (cX + cZ * 0.5 - parseInt(cZ / 2)) * (innerRadius * 2);
    let z = cZ * (outerRadius * 1.5);

    const points = [
        new Vector2(0, 0),
        new Vector2(0, outerRadius),
        new Vector2(innerRadius, 0.5 * outerRadius),
		new Vector2(innerRadius, -0.5 * outerRadius),
		new Vector2(0, -outerRadius),
		new Vector2(-innerRadius, -0.5 * outerRadius),
        new Vector2(-innerRadius, 0.5 * outerRadius),
        new Vector2(0, outerRadius)
    ];

	let shape = new Shape(points);
    this.geometry = new ShapeGeometry(shape);
    this.geometry.rotateX(-90 * ThreeMath.DEG2RAD);
    this.geometry.translate(x, 0, z);
    this.color = '#' + Math.random().toString(16).slice(2, 8);
    this.material = new MeshBasicMaterial({ color: this.color });
    this.mesh = new Mesh(this.geometry, this.material);

    // Wireframe
    const wireframe = new WireframeGeometry(this.geometry);
    const line = new LineSegments(wireframe);
    line.material.depthTest = false;
    line.material.opacity = 0.25;
    line.material.transparent = true;
    scene.add(line);

    label(cX, cZ, x, z);

    // const lineGeo = new BufferGeometry();
    // lineGeo.setAttribute('position', new BufferAttribute(new Float32Array(4 * 3), 3));
    // const lineMat = new LineBasicMaterial({ color: '#fff', transparent: true });
    // const outline = new Line(lineGeo, lineMat);
    // scene.add(outline);
    
	return this;
}

function label(cX, cZ, x, z) {
    const loader = new FontLoader();
    loader.load('fonts/helvetiker_regular.typeface.json', function(font) {
        const message = `${cX}, ${cZ}`;
        const matLite = new MeshBasicMaterial({
            color: '#000',
            // transparent: true,
            // opacity: 0.4,
            // side: THREE.DoubleSide
        });

        const shapes = font.generateShapes(message, 1.5);
        const geometry = new ShapeBufferGeometry(shapes);
        geometry.computeBoundingBox();
        geometry.rotateX( -90 * ThreeMath.DEG2RAD)
        const xMid = - 0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);
        geometry.translate(x + xMid, 0.1, z + 1);
        const text = new Mesh(geometry, matLite);
        // text.rotation.x = -90 * ThreeMath.DEG2RAD;
        scene.add(text);
    });
}

export default HexGrid;
