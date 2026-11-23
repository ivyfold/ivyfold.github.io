import * as THREE from "three";
import { asset } from "./museum.js";

const turn = 2 * Math.PI / 3;
const bodyColors = {
  leafia: "#e8d5ad",
  studyseed: "#d4a271",
  widgetgame: "#403171",
};

export function projectIcon(index, position, width, height) {
  const angle = (index - position) * turn;
  const depth = Math.cos(angle);
  const perspective = 2 / (3 - depth);
  const isNarrow = width <= 700;
  const size = isNarrow ? Math.min(width * .43, height * .255) : Math.min(width * .235, height * .353);
  return {
    x: width * (.5 + Math.sin(angle) * (isNarrow ? .382 : .55 * perspective)),
    y: height * (isNarrow ? .478 + .196 * perspective : .427 + .274 * perspective),
    scale: size * perspective,
    depth,
    yaw: -Math.sin(angle) * .56,
  };
}

function tileShape() {
  const edge = .5;
  const radius = .177;
  const corner = edge - radius;
  const shape = new THREE.Shape();
  shape.moveTo(-corner, -edge);
  shape.lineTo(corner, -edge);
  shape.quadraticCurveTo(edge, -edge, edge, -corner);
  shape.lineTo(edge, corner);
  shape.quadraticCurveTo(edge, edge, corner, edge);
  shape.lineTo(-corner, edge);
  shape.quadraticCurveTo(-edge, edge, -edge, corner);
  shape.lineTo(-edge, -corner);
  shape.quadraticCurveTo(-edge, -edge, -corner, -edge);
  return shape;
}

function tileFace(shape) {
  const geometry = new THREE.ShapeGeometry(shape, 20);
  const xyz = geometry.getAttribute("position");
  const uv = geometry.getAttribute("uv");
  for (let i = 0; i < xyz.count; i += 1) uv.setXY(i, xyz.getX(i) + .5, xyz.getY(i) + .5);
  return geometry;
}

function floorShadow() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 256;
  const ctx = canvas.getContext("2d");
  const fill = ctx.createRadialGradient(119, 125, 9, 130, 128, 125);
  fill.addColorStop(0, "#281407e3");
  fill.addColorStop(.62, "#3420139c");
  fill.addColorStop(1, "#3b201400");
  ctx.fillStyle = fill;
  ctx.fillRect(0, 0, 256, 256);
  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  return new THREE.MeshBasicMaterial({
    map, transparent: true, depthWrite: false, toneMapped: false, opacity: .82,
  });
}

export function renderEntrance(canvas, apps, onFallback) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "low-power" });
  } catch {
    onFallback();
    return null;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.65));
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 9000);
  const ray = new THREE.Raycaster();
  const cursor = new THREE.Vector2();
  camera.position.z = 3200;
  const lighting = new THREE.HemisphereLight("#fff6e7", "#ad8065", 2.5);
  const key = new THREE.DirectionalLight("#fff1d5", 2.7);
  key.position.set(-450, 740, 580);
  const contour = new THREE.DirectionalLight("#ffd7a8", 1.2);
  contour.position.set(370, 560, -350);
  scene.add(lighting, key, contour);

  let width = 0;
  let height = 0;
  let position = 0;
  let pending = 0;
  let destroyed = false;
  let painted = false;
  const loader = new THREE.TextureLoader();
  function texture(filename) {
    const map = loader.load(asset(filename), requestPaint);
    map.colorSpace = THREE.SRGBColorSpace;
    map.anisotropy = Math.min(12, renderer.capabilities.getMaxAnisotropy());
    return map;
  }

  const stone = new THREE.MeshStandardMaterial({
    color: "#d4b796", map: texture("ivy-pedestal.jpg"), roughness: .67, metalness: .035,
  });
  const shape = tileShape();
  const frame = new THREE.ExtrudeGeometry(shape, {
    depth: .135, bevelEnabled: true, bevelThickness: .026, bevelSize: .026, bevelSegments: 5, curveSegments: 20,
  });
  const face = tileFace(shape);
  const plinth = new THREE.LatheGeometry([
    [0, 0], [.492, 0], [.535, .009], [.539, .021], [.539, .091],
    [.527, .114], [.507, .127], [0, .127],
  ].map(([radius, height]) => new THREE.Vector2(radius, height)), 96);
  const shadowGeometry = new THREE.PlaneGeometry(1.95, .24);
  const shadow = floorShadow();
  const displays = apps.map(app => {
    const group = new THREE.Group();
    const object = new THREE.Group();
    const side = new THREE.MeshStandardMaterial({
      color: bodyColors[app.id], roughness: .29, metalness: .16,
    });
    const art = new THREE.MeshBasicMaterial({
      map: texture(app.id + "-icon.png"), toneMapped: false,
    });
    const base = new THREE.Mesh(plinth, stone);
    base.rotation.x = .22;
    base.scale.z = .91;
    const support = new THREE.Mesh(shadowGeometry, shadow);
    support.position.set(.47, -.055, -.40);
    const contact = new THREE.Mesh(shadowGeometry, shadow);
    contact.position.set(.06, -.090, -.38);
    contact.scale.set(.61, .73, 1);
    contact.renderOrder = -1;
    support.renderOrder = -1;
    const shell = new THREE.Mesh(frame, side);
    shell.position.z = -.071;
    const artwork = new THREE.Mesh(face, art);
    artwork.position.z = .091;
    shell.userData.appId = artwork.userData.appId = app.id;
    object.add(shell, artwork);
    object.position.y = .637;
    group.add(base, object, support, contact);
    scene.add(group);
    return { group, object };
  });
  const targets = displays.flatMap(({ object }) => object.children);

  function paint() {
    pending = 0;
    if (destroyed || !width || !height) return;
    displays.forEach(({ group, object }, index) => {
      const pose = projectIcon(index, position, width, height);
      group.position.set(pose.x - width / 2, height / 2 - pose.y + pose.scale * .106, pose.depth * 2 * width);
      group.scale.setScalar(pose.scale);
      object.rotation.y = pose.yaw;
    });
    renderer.render(scene, camera);
    painted = true;
  }

  function requestPaint() {
    if (!pending && !destroyed) pending = requestAnimationFrame(paint);
  }

  function resize() {
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    painted = false;
    if (!width || !height) return;
    camera.left = -width / 2;
    camera.right = width / 2;
    camera.top = height / 2;
    camera.bottom = -height / 2;
    camera.position.z = Math.max(3200, width * 3);
    camera.far = Math.max(9000, width * 8);
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    requestPaint();
  }

  const size = new ResizeObserver(resize);
  size.observe(canvas);
  canvas.addEventListener("webglcontextlost", onFallback);
  resize();

  return {
    setPosition(next) {
      position = next;
      requestPaint();
    },
    pick(clientX, clientY) {
      if (!painted || destroyed) return;
      const bounds = canvas.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      cursor.set((clientX - bounds.left) / bounds.width * 2 - 1,
        1 - (clientY - bounds.top) / bounds.height * 2);
      if (Math.abs(cursor.x) > 1 || Math.abs(cursor.y) > 1) return;
      ray.setFromCamera(cursor, camera);
      return ray.intersectObjects(targets, false)[0]?.object.userData.appId;
    },
    dispose() {
      destroyed = true;
      cancelAnimationFrame(pending);
      size.disconnect();
      canvas.removeEventListener("webglcontextlost", onFallback);
      const resources = new Set();
      scene.traverse(object => {
        if (object.geometry) resources.add(object.geometry);
        if (object.material) {
          resources.add(object.material);
          if (object.material.map) resources.add(object.material.map);
        }
      });
      resources.forEach(resource => resource.dispose());
      renderer.dispose();
    },
  };
}
