import * as THREE from "three";

const LEFT = -3.1;
const RIGHT = 2.03;
const RIGHT_CEILING_SCALE = RIGHT / 3;
const LOW_CEILING = 4.09;
const HIGH_CEILING = 4.46;
const WARM_WASH = new THREE.Color("#eeac68");

// A positive offset is the right side of the visitor's walking direction.
function offsetPoint(sample, offset, y) {
  return [sample.x - sample.dz * offset, y, sample.z + sample.dx * offset];
}

function range(start, end, divisions) {
  return Array.from({ length: divisions + 1 }, (_, i) => start + (end - start) * i / divisions);
}

function floorSection(start, end, y, divisions = 1) {
  return range(start, end, divisions).map((offset) => ({ offset, y, v: offset }));
}

function wallSection(offset, start, end, divisions = 1) {
  return range(start, end, divisions).map((y) => ({ offset, y, v: y }));
}

function stripMesh(samples, section, material, settings = {}) {
  const { reverse = false, repeatEvery = 1, rgba } = settings;
  const positions = [];
  const uv = [];
  const indices = [];
  const colors = [];
  const columns = section.length;

  samples.forEach((sample, row) => {
    section.forEach((point, column) => {
      positions.push(...offsetPoint(sample, point.offset, point.y));
      uv.push(sample.s / repeatEvery, point.v / repeatEvery);
      if (rgba) colors.push(...rgba(sample.s, point));
      if (row === samples.length - 1 || column === columns - 1) return;
      const a = row * columns + column;
      const b = a + 1;
      const c = a + columns;
      const d = c + 1;
      if (reverse) indices.push(a, c, b, b, c, d);
      else indices.push(a, b, c, b, d, c);
    });
  });

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  if (rgba) geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 4));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return new THREE.Mesh(geometry, material);
}

function coveProfile(left) {
  const side = left ? -1 : 1;
  const positions = [
    [2.04, HIGH_CEILING], [2.16, 4.438], [2.27, 4.402], [2.36, 4.346],
    [2.43, 4.274], [2.49, 4.187], [2.53, LOW_CEILING],
  ];
  return (left ? positions.slice().reverse() : positions).map(([offset, y]) => ({
    offset: offset * side * (left ? 1 : RIGHT_CEILING_SCALE), y, v: y,
  }));
}

function periodicDistance(s, pitch, shift) {
  return s - shift - pitch * Math.round((s - shift) / pitch);
}

function glowMaterial() {
  return new THREE.MeshBasicMaterial({
    vertexColors: true,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
  });
}

function lightWash(alpha) {
  return [WARM_WASH.r, WARM_WASH.g, WARM_WASH.b, alpha];
}

function createWalnutSlats(path, texture, start = 0, backingOffset = RIGHT) {
  const pitch = 0.152;
  const first = Math.ceil(start / pitch);
  const count = Math.max(0, Math.ceil(path.length / pitch) - first);
  const geometry = new THREE.BoxGeometry(0.064, 4.02, 0.107, 1, 9, 1);
  const positions = geometry.attributes.position;
  const uv = geometry.attributes.uv;
  const tint = [];
  for (let i = 0; i < positions.count; i += 1) {
    const glow = Math.exp(-(positions.getY(i) + 2.01) * 4.7);
    tint.push(1 + 0.72 * glow, 1 + 0.27 * glow, 1 + 0.08 * glow);
    uv.setX(i, 0.19 + 0.17 * uv.getX(i));
  }
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(tint, 3));
  const material = new THREE.MeshStandardMaterial({
    color: "#fff", map: texture ?? null, vertexColors: true, roughness: 0.55,
    emissive: "#472813", emissiveIntensity: 0.47,
  });
  const mesh = new THREE.InstancedMesh(geometry, material, count);
  const piece = new THREE.Object3D();
  const walnut = new THREE.Color(texture ? "#bca089" : "#77513c");
  const grain = new THREE.Color();

  for (let i = 0; i < count; i += 1) {
    const index = first + i;
    const station = path.sample(Math.min(path.length, (index + 0.5) * pitch));
    piece.position.fromArray(offsetPoint(station, backingOffset - 0.051, 2.06));
    piece.rotation.y = Math.atan2(-station.dz, station.dx);
    piece.updateMatrix();
    mesh.setMatrixAt(i, piece.matrix);
    mesh.setColorAt(i, grain.copy(walnut).multiplyScalar(0.76 + 0.21 * Math.sin(index * 1.17) ** 2 + 0.21 * Math.cos(index * 0.39) ** 4));
  }
  return mesh;
}

function ceilingSpots(group, path) {
  const pitch = 2.65;
  const count = Math.floor(path.length / pitch);
  const shades = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.064, 0.064, 0.016, 14),
    new THREE.MeshStandardMaterial({ color: "#483322", roughness: 0.37, metalness: 0.48 }), count,
  );
  const apertures = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.038, 0.038, 0.009, 14),
    new THREE.MeshBasicMaterial({ color: "#f6d5a8", toneMapped: false }), count,
  );
  const piece = new THREE.Object3D();

  for (let i = 0; i < count; i += 1) {
    const station = path.sample(i * pitch + 0.76);
    piece.position.fromArray(offsetPoint(station, LEFT + 0.34, LOW_CEILING - 0.012));
    piece.updateMatrix();
    shades.setMatrixAt(i, piece.matrix);
    piece.position.y -= 0.01;
    piece.updateMatrix();
    apertures.setMatrixAt(i, piece.matrix);
  }
  group.add(shades, apertures);
}

export function createHall(scene, path, textures = {}, courtyard) {
  const group = new THREE.Group();
  group.name = "Continuous limestone and walnut gallery";
  const samples = range(0, path.length, Math.max(2, Math.ceil(path.length / 0.21)))
    .map((s) => ({ ...path.sample(s), s }));
  const stone = new THREE.MeshStandardMaterial({
    color: textures.slate ? "#f1eeef" : "#45454b",
    map: textures.slate ?? null,
    bumpMap: textures.slate ?? null,
    bumpScale: 0.031,
    roughness: 0.91,
    metalness: 0.02,
    emissive: "#1d1c22",
    emissiveIntensity: 0.84,
    side: THREE.DoubleSide,
  });
  const floor = new THREE.MeshStandardMaterial({
    color: textures.floor ? "#f4e7db" : "#615851",
    map: textures.floor ?? null,
    bumpMap: textures.floor ?? null,
    bumpScale: 0.018,
    roughness: 0.46,
    metalness: 0.055,
    emissive: "#261e18",
    emissiveIntensity: 0.68,
  });
  const walnut = new THREE.MeshStandardMaterial({ color: "#2d1a14", roughness: 0.84 });
  const walnutTexture = textures.walnut ?? textures.wood;
  group.add(
    stripMesh(samples, floorSection(LEFT, RIGHT, 0), floor, { repeatEvery: 2.35 }),
    stripMesh(samples, wallSection(LEFT, 0, LOW_CEILING), stone, { reverse: true, repeatEvery: 2.6 }),
    stripMesh(samples, wallSection(RIGHT, 0, LOW_CEILING), walnut),
    createWalnutSlats(path, walnutTexture),
  );

  const plaster = new THREE.MeshStandardMaterial({
    color: "#bd9471", roughness: 0.91, emissive: "#735137", emissiveIntensity: 0.91,
    bumpMap: textures.floor ?? null, bumpScale: 0.026,
  });
  const fascia = new THREE.MeshStandardMaterial({
    color: "#765745", roughness: 0.82, emissive: "#493120", emissiveIntensity: 0.58,
  });
  const coveLedge = new THREE.MeshStandardMaterial({
    color: "#ceb195", roughness: 0.83, emissive: "#ab6e47", emissiveIntensity: 0.86,
  });
  const reverse = { reverse: true };
  const rightRoof = 2.04 * RIGHT_CEILING_SCALE;
  group.add(
    stripMesh(samples, floorSection(LEFT, -2.53, LOW_CEILING), fascia, reverse),
    stripMesh(samples, coveProfile(true), coveLedge, reverse),
    stripMesh(samples, floorSection(-2.04, rightRoof, HIGH_CEILING), plaster, reverse),
    stripMesh(samples, coveProfile(false), coveLedge, reverse),
    stripMesh(samples, floorSection(2.53 * RIGHT_CEILING_SCALE, RIGHT, LOW_CEILING), fascia, reverse),
  );

  const led = new THREE.MeshBasicMaterial({ color: "#ffd7a5", toneMapped: false, side: THREE.DoubleSide });
  const baseboard = new THREE.MeshStandardMaterial({ color: "#2a221c", roughness: 0.68 });
  const seam = new THREE.MeshStandardMaterial({ color: "#9e7547", metalness: 0.42, roughness: 0.42, emissive: "#392711", emissiveIntensity: 0.32 });
  group.add(
    stripMesh(samples, floorSection(-2.552, -2.513, 4.081), led),
    stripMesh(samples, floorSection(2.513 * RIGHT_CEILING_SCALE, 2.582 * RIGHT_CEILING_SCALE, 4.081), led),
    stripMesh(samples, wallSection(LEFT + 0.024, 0, 0.095), baseboard, reverse),
    stripMesh(samples, wallSection(RIGHT - 0.106, 0, 0.06), baseboard),
    stripMesh(samples, floorSection(0.64, 0.676, 0.0018), baseboard),
    stripMesh(samples, floorSection(0.651, 0.665, 0.0026), seam),
  );
  courtyard.addInterior({
    stone,
    floor,
    walnut,
    baseboard,
    createSlats: (extension) => createWalnutSlats(extension, walnutTexture, path.length, 0),
  });
  ceilingSpots(group, path);

  const wash = glowMaterial();
  const interiorLight = (s) => 1 - THREE.MathUtils.smoothstep(s, path.length - 1.3, path.length);
  const wallGlow = stripMesh(samples, wallSection(LEFT + 0.006, 0.076, LOW_CEILING - 0.007, 24), wash, {
    reverse: true,
    rgba(s, { y }) {
      const distance = periodicDistance(s, 3.85, 1.65);
      const beam = Math.exp(-((distance / (0.15 + 0.77 * y)) ** 2) - 3.5 * y);
      const cove = 0.052 * Math.exp(-(LOW_CEILING - y) * 4.1);
      return lightWash(0.43 * beam * interiorLight(s) + cove);
    },
  });
  const floorGlow = stripMesh(samples, floorSection(LEFT, RIGHT, 0.004, 32), wash, {
    rgba(s, { offset }) {
      const leftDistance = periodicDistance(s, 3.85, 1.65);
      const leftFalloff = Math.exp(-(((offset - LEFT) / 0.69) ** 2) - (leftDistance / 0.34) ** 2);
      const walnutFalloff = Math.exp(-(((offset - RIGHT + 0.16) / 0.63) ** 2));
      const floorReflection = Math.exp(-(((offset - LEFT - 0.65) / 1.23) ** 2) - (leftDistance / 0.49) ** 2);
      return lightWash((0.34 * leftFalloff + 0.19 * walnutFalloff + 0.085 * floorReflection) * interiorLight(s));
    },
  });
  const roofGlow = stripMesh(samples, floorSection(-2.035, rightRoof - 0.005, HIGH_CEILING - 0.003, 18), wash, {
    reverse: true,
    rgba(s, { offset }) {
      const shoulder = Math.min(offset + 2.04, rightRoof - offset);
      return lightWash(0.43 * Math.exp(-shoulder * 1.6));
    },
  });
  const shoulderWash = (left) => stripMesh(samples,
    coveProfile(left).map((point) => ({ ...point, y: point.y - 0.004 })), wash, {
      reverse: true,
      rgba(s, { y }) {
        return lightWash(0.18 + 0.43 * Math.exp(-(y - LOW_CEILING) * 6.0));
      },
    });
  group.add(wallGlow, floorGlow, roofGlow, shoulderWash(true), shoulderWash(false));

  const fill = new THREE.HemisphereLight("#f7eadd", "#938779", 1.63);
  const bounce = new THREE.DirectionalLight("#ffd8b2", 0.58);
  bounce.position.set(2.7, 6.5, 3.1);
  const daylight = new THREE.PointLight("#fff2d7", 14, 5.4, 2);
  daylight.position.fromArray(offsetPoint(path.sample(path.length - .18), -.89, 2.9));
  group.add(fill, bounce, daylight);
  scene.add(group);
  return group;
}
