import { Group, Math as Math3, Mesh, MeshBasicMaterial, Shape, ShapeGeometry, Vector3 } from 'three';

const outerRadius = 5;
const innerRadius = outerRadius * 0.866025404;

function HexGrid({ w, h, x, y }) {
    // const hexagons = [];
    let hexGrid = new Group();

    for (let i = 0; i < w; i++) {
        for (let j = 0; j < h; j++) {
            let position = new Vector3(
                (i + j * 0.5 - parseInt(j / 2)) * (innerRadius * 2),
                j * (outerRadius * 1.5),
                0
            );
            const hexCell = Hexagon(position);
            hexGrid.add(hexCell);
        }
    }

    return hexGrid;
}

// Hexagon
function Hexagon({ x, y, z }) {
	let hex = new Shape()
        .moveTo(x, y)
        .lineTo(x, y + outerRadius)
        .lineTo(x + innerRadius, y + (0.5 * outerRadius))
		.lineTo(x + innerRadius, y + (-0.5 * outerRadius))
		.lineTo(x, y - outerRadius)
		.lineTo(x - innerRadius, y + (-0.5 * outerRadius))
        .lineTo(x - innerRadius, y + (0.5 * outerRadius))
        .lineTo(x, y + outerRadius);

    let geo = new ShapeGeometry(hex);
    const color = '#' + Math.floor(Math.random()*16777215).toString(16);
    let mat = new MeshBasicMaterial({ color });
    let mesh = new Mesh(geo, mat);
    mesh.rotation.x = (-90 * Math3.DEG2RAD);

	return mesh;
}

export default HexGrid;
