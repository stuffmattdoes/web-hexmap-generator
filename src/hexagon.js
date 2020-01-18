import { Mesh, MeshBasicMaterial, Shape, ShapeGeometry } from 'three';

// Hexagon
function Hexagon({ x, y}) {
	let hex = new Shape()
	    .moveTo(x, y)
        .lineTo(x + 2, y + 8)
        .lineTo(x + 12, y + 8)
        .lineTo(x + 8, y + 2);

    let geo = new ShapeGeometry(hex);
    let mat = new MeshBasicMaterial({ color: 0x00ff00 });
    // const helper = new PlaneHelper(hex, 1, 0xffff00);
    // scene.add(helper);
	return new Mesh(geo, mat);
}

export default Hexagon;
