import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

function box(group, dimensions, radius, material, x, y, z) {
  const geometry = new RoundedBoxGeometry(...dimensions, 2, radius);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z);
  group.add(mesh);
  return mesh;
}

function crossControl() {
  const arm = .021;
  const end = .058;
  const points = [[-arm, end], [arm, end], [arm, arm], [end, arm], [end, -arm], [arm, -arm],
    [arm, -end], [-arm, -end], [-arm, -arm], [-end, -arm], [-end, arm], [-arm, arm]];
  const shape = new THREE.Shape(points.map(([x, y]) => new THREE.Vector2(x, y)));
  return new THREE.ExtrudeGeometry(shape, {
    depth: .012, bevelEnabled: true, bevelSize: .004, bevelThickness: .004, bevelSegments: 2,
  });
}

export function makeGameProp(texture, materials = {}) {
  const exhibit = new THREE.Group();
  exhibit.name = "Handheld console on a walnut cradle";
  const walnut = texture("prop-console-walnut.webp") ?? materials.wood;
  const wood = new THREE.MeshStandardMaterial({
    color: "#f2dfc9", map: walnut, bumpMap: walnut, bumpScale: .004, roughness: .65,
  });
  box(exhibit, [.70, .042, .30], .012, wood, 0, .021, 0);
  for (const side of [-1, 1]) {
    box(exhibit, [.082, .127, .128], .012, wood, side * .235, .087, -.072).rotation.x = -.17;
    box(exhibit, [.076, .060, .071], .012, wood, side * .235, .061, .087).rotation.x = -.11;
  }

  const handheld = new THREE.Group();
  handheld.position.set(0, .231, .019);
  handheld.rotation.x = -.137;
  exhibit.add(handheld);
  const grain = texture("prop-console-grain.webp");
  const housing = new THREE.MeshStandardMaterial({
    color: "#657081", map: grain, bumpMap: grain, bumpScale: .005, roughness: .66, metalness: .09,
  });
  const face = housing.clone();
  face.color.set("#8792a4");
  box(handheld, [.677, .365, .078], .039, housing, 0, 0, -.013);
  box(handheld, [.687, .376, .050], .025, face, 0, 0, .024);

  const bezel = new THREE.MeshPhysicalMaterial({ color: "#111213", roughness: .43, clearcoat: .24 });
  box(handheld, [.311, .207, .025], .012, bezel, -.005, .015, .051);
  const screenMap = texture("prop-console-screen.webp");
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(.280, .175), new THREE.MeshStandardMaterial({
    color: "#9eb0c8", map: screenMap, emissive: "#b3cfff", emissiveMap: screenMap,
    emissiveIntensity: 1.0, roughness: .35,
  }));
  screen.position.set(-.005, .015, .064);
  handheld.add(screen);

  const rubber = new THREE.MeshStandardMaterial({ color: "#28292c", roughness: .71 });
  const directionPad = new THREE.Mesh(crossControl(), rubber);
  directionPad.position.set(-.231, -.003, .049);
  handheld.add(directionPad);
  const buttons = new THREE.CylinderGeometry(.0275, .030, .018, 16);
  const brass = new THREE.MeshStandardMaterial({ color: "#ac8046", roughness: .34, metalness: .43 });
  for (const [x, y] of [[.213, -.013], [.277, .002]]) {
    const button = new THREE.Mesh(buttons, brass);
    button.rotation.x = Math.PI / 2;
    button.position.set(x, y, .054);
    handheld.add(button);
  }
  return exhibit;
}

const bookSizes = [
  { width: .716, height: .150, depth: .401, x: -.004, z: 0, turn: .031, cover: "leather" },
  { width: .667, height: .139, depth: .374, x: .012, z: -.009, turn: -.058, cover: "olive" },
  { width: .616, height: .131, depth: .350, x: -.013, z: .003, turn: .071, cover: "linen" },
];

export function makeBooksProp(texture) {
  const exhibit = new THREE.Group();
  exhibit.name = "Three clothbound and leather books";
  const paper = texture("prop-books-paper.webp");
  const edges = new THREE.MeshStandardMaterial({
    color: "#faebd5", map: paper, bumpMap: paper, bumpScale: .002, roughness: .94,
  });
  let elevation = 0;
  for (const { width, height, depth, x, z, turn, cover } of bookSizes) {
    const book = new THREE.Group();
    book.position.set(x, elevation, z);
    book.rotation.y = turn;
    exhibit.add(book);

    const board = .014;
    const grain = texture(`prop-books-${cover}.webp`);
    const binding = new THREE.MeshStandardMaterial({
      map: grain, bumpMap: grain, bumpScale: .004, roughness: cover === "leather" ? .72 : .88,
    });
    box(book, [width - .022, height - 2 * board, depth - .018], .006, edges, 0, height / 2, -.004);
    const base = box(book, [width, board, depth], .005, binding, 0, board / 2, 0);
    const top = base.clone();
    top.position.y = height - board / 2;
    book.add(top);
    box(book, [width - .009, height, .037], .016, binding, 0, height / 2, depth / 2 - .011);
    elevation += height;
  }
  return exhibit;
}
