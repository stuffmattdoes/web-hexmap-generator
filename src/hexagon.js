import {
    BufferAttribute,
    BufferGeometry,
    FontLoader,
    Group,
    Line,
    LineBasicMaterial,
    LineSegments,
    Math as ThreeMath,
    Mesh,
    MeshBasicMaterial,
    // MeshPhongMaterial,
    // Raycaster,
    Shape,
    ShapeBufferGeometry,
    // ShapeGeometry,
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
    hexGrid.name = 'HexGrid';

    for (let i = 0; i < width; i++) {
        for (let j = 0; j < height; j++) {
            let coordindates = new Vector3(i, 0, j);
            const hexCell = new Hexagon(coordindates);
            hexGrid.add(hexCell);
        }
    }

    return hexGrid;
}

// Hexagon
function Hexagon({ x: cX, y: cY, z: cZ}) {
    this.coordinates = {
        x: cX,
        y: cY,
        z: cZ
    }
    this.position = {
        x: (cX + cZ * 0.5 - parseInt(cZ / 2)) * (innerRadius * 2),
        y: 0,
        z: cZ * (outerRadius * 1.5)
    }

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
    const geometry = new ShapeBufferGeometry(shape);
    geometry.name = 'Hexagon';
    geometry.rotateX(-90 * ThreeMath.DEG2RAD);
    geometry.translate(this.position.x, 0, this.position.z);
    geometry.computeBoundingSphere();
    const color = '#' + Math.random().toString(16).slice(2, 8);
    const material = new MeshBasicMaterial({ color: color });

    // material.color = new THREE.Color('#ff0000');
    // material.needsUpdate = true;

    // const material = new MeshPhongMaterial( {
    //     color: this.color, specular: '#fff', shininess: 250,
    //     side: THREE.DoubleSide, vertexColors: THREE.VertexColors
    // });

    const mesh = new Mesh(geometry, material);
    mesh.name = 'Hexagon';

    // Wireframe
    const wireframe = new WireframeGeometry(geometry);
    const line = new LineSegments(wireframe);
    line.material.depthTest = false;
    line.material.opacity = 0.25;
    line.material.transparent = true;
    scene.add(line);

    label(this.coordinates, this.position);

	return mesh;
}

Hexagon.prototype = {
    active: function() {
        console.log('active', this.coordinates);
    },
    hover: function() {
        console.log('hover', this.coordinates);
    }
}

function label({ x: cX, z: cZ }, { x, z }) {
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
