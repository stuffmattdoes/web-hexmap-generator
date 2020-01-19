import {
    FontLoader,
    Group,
    Math as Math3,
    Mesh,
    MeshBasicMaterial,
    Shape,
    ShapeBufferGeometry,
    ShapeGeometry,
    Vector2
} from 'three';
import * as THREE from 'three';
import { scene } from './index.js';

const outerRadius = 5;
const innerRadius = outerRadius * 0.866025404;

function HexGrid(width, height) {
    let hexGrid = new Group();

    for (let i = 0; i < width; i++) {
        for (let j = 0; j < height; j++) {
            let position = new Vector2(i, j);
            const hexCell = new Hexagon(position);
            hexGrid.add(hexCell.mesh);
        }
    }

    return hexGrid;
}

// Hexagon
function Hexagon({ x: cx, y: cy }) {
    let x = (cx + cy * 0.5 - parseInt(cy / 2)) * (innerRadius * 2);
    let y = cy * (outerRadius * 1.5);

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
    this.geometry.translate(x, y, 0);
    this.geometry.rotateX(-90 * Math3.DEG2RAD);
    // this.geometry.applyMatrix(new THREE.Matrix4().makeTranslation( 0, 0, 0 ));

    
    // Debug
    const wireframe = new THREE.WireframeGeometry(this.geometry);
    const line = new THREE.LineSegments(wireframe);
    line.material.depthTest = false;
    line.material.opacity = 0.25;
    line.material.transparent = true;
    scene.add(line);

    label(cx, cy, x, y);

    this.color = '#' + Math.random().toString(16).slice(2, 8);
    this.material = new MeshBasicMaterial({ color: this.color });
    this.mesh = new Mesh(this.geometry, this.material);
    // this.mesh.rotation.x = -90 * Math3.DEG2RAD;
    
	return this;
}

function label(cx, cy, x, y) {
    const loader = new FontLoader();
    loader.load('fonts/helvetiker_regular.typeface.json', function(font) {
        const message = `${cx}, ${cy}`;
        const matLite = new MeshBasicMaterial({
            color: '#000',
            // transparent: true,
            // opacity: 0.4,
            // side: THREE.DoubleSide
        });

        const shapes = font.generateShapes(message, 2);
        const geometry = new ShapeBufferGeometry(shapes);
        geometry.computeBoundingBox();
        const xMid = - 0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);
        geometry.translate(x + xMid, y - 1, 0.1);
        const text = new THREE.Mesh(geometry, matLite);
        text.rotation.x = -90 * Math3.DEG2RAD;
        scene.add(text);
    });
}

export default HexGrid;
