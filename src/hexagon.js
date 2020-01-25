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
    // MeshStandardMaterial,
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
    const geometry = new Geometry();

    // begin: center, solid area, border area
    geometry.vertices.push(new Vector3(0, 0, 0));
    geometry.vertices.push(new Vector3(corners[0].x * solidArea, 0, corners[0].z * solidArea));
    geometry.vertices.push(corners[0]);

    const color = new Color('#' + Math.random().toString(16).slice(2, 8));
    const color2 = new Color('#' + Math.random().toString(16).slice(2, 8));
    const color3 = new Color('#' + Math.random().toString(16).slice(2, 8));

    for (let i = 0; i < corners.length; i++) {
        if (i > 0) {
            // solid area, border area
            geometry.vertices.push(new Vector3(corners[i].x * solidArea, 0, corners[i].z * solidArea));
            geometry.vertices.push(corners[i]);

            geometry.faces.push(new Face3(0, i + i + 1, i + i - 1, null, [ color, color2, color3 ])); // (0, 7, 5)
            geometry.faces.push(new Face3(i + i - 1, i + i + 1, i * 2, null, [ color, color2, color3 ])); // (5, 7, 6)
            geometry.faces.push(new Face3(i * 2 + 1, i * 2 + 2, i * 2, null, [ color, color2, color3 ])); // (7, 8, 6)
        }
    }

    // end
    geometry.faces.push(new Face3(0, 1, 11, null, [ color, color2, color3 ])); // 6
    geometry.faces.push(new Face3(1, 12, 11, null, [ color, color2, color3 ]));
    geometry.faces.push(new Face3(1, 2, 12, null, [ color, color2, color3 ]));

    geometry.computeFaceNormals();
    geometry.computeVertexNormals();
    // geometry.normalsNeedUpdate = true;
    geometry.name = 'Hexagon';
    // geometry.rotateX(-90 * ThreeMath.DEG2RAD);
    // const color = '#' + Math.random().toString(16).slice(2, 8);
    const material = new MeshBasicMaterial({
        // vertexColors: VertexColors
        vertexColors: FaceColors
    });

    // const material = new MeshBasicMaterial();
    // const material = new MeshStandardMaterial({ color : color });

    // material.color = new THREE.Color('#ff0000');
    // material.needsUpdate = true;

    // const material = new MeshPhongMaterial( {
    //     color: this.color, specular: '#fff', shininess: 250,
    //     side: THREE.DoubleSide, vertexColors: THREE.VertexColors
    // });

    const hexagon = new Mesh(geometry, material);
    console.log(hexagon);
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
