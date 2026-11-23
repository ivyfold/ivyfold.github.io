import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

const potProfile = [
  [0, 0], [.121, 0], [.137, .014], [.15, .032], [.163, .073],
  [.174, .126], [.181, .207], [.182, .266], [.180, .279], [.173, .287],
  [.160, .287], [.155, .277], [.153, .254], [.147, .209], [0, .209],
];

// Each shoot starts in the soil and ends at the base of a distinct, curved leaf.
const shoots = [
  // leaf base x/y/z, vein direction x/y/z, length, width, texture, bend
  [[-.060, .695, -.080], [-.50, .71, -.05], .230, .170, 0, .05],
  [[.019, .659, .081], [.40, .51, .23], .250, .197, 1, .12],
  [[.100, .616, -.098], [.92, .32, -.29], .286, .202, 0, .07],
  [[-.116, .613, .034], [-.98, .11, .41], .286, .218, 1, .10],
  [[.054, .588, -.151], [.25, .40, -.92], .249, .183, 1, .10],
  [[.068, .572, .153], [.46, .11, .88], .228, .185, 0, .16],
  [[-.072, .539, .142], [-.57, .19, 1], .245, .191, 0, .13],
  [[.137, .511, .038], [.93, .03, .48], .213, .164, 1, .18],
  [[-.111, .519, -.093], [-.65, .21, -.71], .242, .179, 0, .11],
  [[.107, .484, -.130], [.67, .03, -.83], .219, .158, 1, .16],
  [[-.132, .452, .067], [-.95, -.12, .55], .203, .159, 0, .21],
  [[-.074, .461, -.172], [-.43, .25, -.88], .218, .166, 1, .13],
  [[.047, .444, .155], [.11, -.08, .99], .205, .163, 1, .20],
  [[.029, .500, -.121], [.48, .55, -.36], .147, .103, 0, .05],
  [[-.024, .585, .042], [-.31, .57, .72], .162, .120, 1, .08],
];

const tendril = [
  [-.110, .256, .06], [-.184, .348, .085], [-.230, .345, .123],
  [-.272, .277, .151], [-.290, .167, .170], [-.339, .133, .190],
];
const tendrilLeaves = [
  [[-.228, .345, .123], [-.65, .17, .62], .147, .117, 0, .12],
  [[-.269, .286, .151], [.17, -.18, 1], .143, .102, 1, .13],
  [[-.287, .212, .160], [-.53, -.58, .52], .112, .089, 0, .09],
  [[-.332, .137, .184], [1, -.46, .58], .110, .086, 1, .10],
];

function veinPoint(t, thickness, length, bend) {
  return new THREE.Vector3(0, length * t,
    thickness * .155 * Math.sin(Math.PI * t) - length * bend * t ** 2.5);
}

function leafSurface(length, width, bend, index) {
  const rows = 10;
  const rails = 8;
  const positions = [];
  const uvs = [];
  const indices = [];
  for (let row = 0; row <= rows; row++) {
    const t = row / rows;
    const vein = veinPoint(t, width, length, bend);
    const blade = Math.sin(Math.PI * t ** .67) ** .87;
    for (let rail = 0; rail <= rails; rail++) {
      const across = 2 * rail / rails - 1;
      const flare = 1 + .038 * Math.sin(11 * t + index * 2.4 + across * 2.3);
      const x = across * blade * width / 2 * flare + .026 * width * Math.sin(Math.PI * t * 1.2);
      const lobe = Math.abs(across) ** 1.85 * blade * (1 - t) ** 4;
      const y = vein.y - lobe * width * .59;
      const z = vein.z - across ** 2 * blade * width * .22
        + Math.sin(13 * t + index) * across * blade * width * .022;
      positions.push(x, y, z);
      uvs.push(rail / rails, t);
      if (row < rows && rail < rails) {
        const i = row * (rails + 1) + rail;
        const above = i + rails + 1;
        indices.push(i, i + 1, above, i + 1, above + 1, above);
      }
    }
  }
  const mesh = new THREE.BufferGeometry();
  mesh.setIndex(indices);
  mesh.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  mesh.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  mesh.computeVertexNormals();
  return mesh;
}

function leafBasis(base, heading, index) {
  const axis = new THREE.Vector3(...heading).normalize();
  const light = new THREE.Vector3(.2 * Math.sin(index * 2.2), .40 + .45 * Math.abs(Math.cos(index * 1.8)), .70);
  const edge = new THREE.Vector3().crossVectors(axis, light).normalize();
  const face = new THREE.Vector3().crossVectors(edge, axis).normalize();
  return new THREE.Matrix4().makeBasis(edge, axis, face).setPosition(...base);
}

function branch(points, width) {
  const curve = new THREE.CatmullRomCurve3(points.map(point => new THREE.Vector3(...point)));
  return new THREE.TubeGeometry(curve, 8, width, 5, false);
}

function addMesh(group, geometry, material) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  group.add(mesh);
  return mesh;
}

function addBatch(group, geometries, material) {
  addMesh(group, mergeGeometries(geometries), material);
  geometries.forEach(geometry => geometry.dispose());
}

export function makePlantProp(texture, materials) {
  const plant = new THREE.Group();
  plant.name = "Variegated pothos in stoneware";
  const clay = texture("leafia-pot-clay.webp") ?? materials?.marble;
  const leaves = [texture("leafia-leaf-variegated.webp"), texture("leafia-leaf-green.webp")].map((map, index) =>
    new THREE.MeshPhysicalMaterial({
      color: index ? "#aed088" : "#c7d49e", map, side: THREE.DoubleSide,
      roughness: .47, metalness: 0, clearcoat: .19, clearcoatRoughness: .37,
      emissive: "#2d3b15", emissiveIntensity: .12,
    })
  );

  addMesh(plant, new THREE.LatheGeometry(potProfile.map(([r, y]) => new THREE.Vector2(r, y)), 40),
    new THREE.MeshStandardMaterial({
      color: "#ded5c8", map: clay, bumpMap: clay, bumpScale: .009, roughness: .95, metalness: 0,
    }));
  addMesh(plant, new THREE.CylinderGeometry(.153, .145, .012, 32),
    new THREE.MeshStandardMaterial({ color: "#33271c", roughness: .99 })).position.y = .243;

  const grain = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 0),
    new THREE.MeshStandardMaterial({ color: "#58402c", roughness: .98 }), 44);
  const particle = new THREE.Object3D();
  for (let i = 0; i < grain.count; i++) {
    const angle = i * 2.399963;
    const spread = .145 * Math.sqrt((i + .5) / grain.count);
    const size = .0039 + (i % 8) * .00105;
    particle.position.set(Math.cos(angle) * spread, .249 + (i % 4) * .0007, Math.sin(angle) * spread);
    particle.rotation.set(i * 1.03, i * .78, i * .42);
    particle.scale.set(size * 1.4, size * .45, size);
    particle.updateMatrix();
    grain.setMatrixAt(i, particle.matrix);
    grain.setColorAt(i, new THREE.Color().setScalar(.54 + (i % 7) * .121));
  }
  plant.add(grain);

  const stems = [branch(tendril, .0058)];
  const veins = [];
  const blades = [[], []];
  shoots.forEach(([base], index) => {
    const [x, y, z] = base;
    const roots = [.068 * Math.sin(index * 2.8), .243, .075 * Math.cos(index * 2.8)];
    stems.push(branch([roots, [x * .57, .36, z * .51], [x * .72, y - .07, z * .78], base], .0049 + index % 3 * .00062));
  });

  [...shoots, ...tendrilLeaves].forEach(([base, heading, length, width, material, bend], index) => {
    const matrix = leafBasis(base, heading, index);
    const blade = leafSurface(length, width, bend, index).applyMatrix4(matrix);
    blades[material].push(blade);
    const spine = [0, .27, .54, .80, .98].map(t => {
      const point = veinPoint(t, width, length, bend);
      point.x += .026 * width * Math.sin(Math.PI * t * 1.2);
      point.z += .0011;
      return point.toArray();
    });
    veins.push(branch(spine, .00110).applyMatrix4(matrix));
  });

  addBatch(plant, stems, new THREE.MeshStandardMaterial({ color: "#596b31", roughness: .69 }));
  addBatch(plant, veins, new THREE.MeshStandardMaterial({ color: "#91a65a", roughness: .57 }));
  blades.forEach((batch, i) => addBatch(plant, batch, leaves[i]));
  return plant;
}
