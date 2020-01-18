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
            const hexCell = new Hexagon(position);
            console.log(hexCell);
            hexGrid.add(hexCell.mesh);
        }
    }

    return hexGrid;
}

// Hexagon
function Hexagon({ x, y, z }) {
    this.x = x;
    this.y = y;
    this.z = z;

	let hex = new Shape()
        .moveTo(x, y)
        .lineTo(x, y + outerRadius)
        .lineTo(x + innerRadius, y + (0.5 * outerRadius))
		.lineTo(x + innerRadius, y + (-0.5 * outerRadius))
		.lineTo(x, y - outerRadius)
		.lineTo(x - innerRadius, y + (-0.5 * outerRadius))
        .lineTo(x - innerRadius, y + (0.5 * outerRadius))
        .lineTo(x, y + outerRadius);

    this.geo = new ShapeGeometry(hex);
    this.color = '#' + Math.floor(Math.random()*16777215).toString(16);
    this.mat = new MeshBasicMaterial({ color: this.color });
    this.mesh = new Mesh(this.geo, this.mat);
    this.mesh.rotation.x = (-90 * Math3.DEG2RAD);
    
	return this;
}

export default HexGrid;
