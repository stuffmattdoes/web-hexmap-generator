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
    // MeshPhongMaterial,
    Shape,
    ShapeBufferGeometry,
    // ShapeGeometry,
    Vector2,
    Vector3,
    WireframeGeometry
} from 'three';
// import * as THREE from 'three';

const outerRadius = 5;
const innerRadius = outerRadius * 0.866025404;

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
    geometry.computeBoundingSphere();
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
    const wireframe = createWireframe(this.geometry);
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
                // geometry.rotateX(-90 * ThreeMath.DEG2RAD);
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
