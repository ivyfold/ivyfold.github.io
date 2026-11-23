import * as THREE from "three";
import { asset } from "./museum.js";
import { finish, path, place, start } from "./gallery-path.js";
import { createHall } from "./hall.js";
import { createExhibits } from "./exhibits.js";

function eased(from, to, value) {
  const normalized = Math.max(0, Math.min(1, (value - from) / (to - from)));
  return normalized * normalized * (3 - 2 * normalized);
}

function cameraPose(camera, distance, rooms, endNoticeTarget) {
  const wallInterest = Math.max(...rooms.map((room) =>
    eased(room.phoneAt - .25, room.phoneAt + 1.55, distance) *
    (1 - eased(room.frames.at(-1).at - .50, room.frames.at(-1).at + 1.75, distance))
  ));
  const approachingPhone = Math.max(...rooms.map((room) =>
    eased(room.phoneAt - 4.30, room.phoneAt - 3.45, distance) *
    (1 - eased(room.phoneAt - 1.80, room.phoneAt - .85, distance))
  ));
  const passingPlaque = Math.max(...rooms.map((room) =>
    eased(room.phoneAt - 1.25, room.phoneAt - .20, distance) *
    (1 - eased(room.phoneAt + 1.65, room.phoneAt + 2.55, distance))
  ));
  const glance = wallInterest * (1 - approachingPhone);
  const portrait = 1 - eased(.61, .82, camera.aspect);
  const portraitFraming = portrait * approachingPhone;
  const visitor = place(distance, .43 + wallInterest * .14 + portraitFraming * .69);
  const narrowView = camera.aspect < .76 ? .83 : 0;
  const approachFraming = camera.aspect < .76 ? approachingPhone * .62 : 0;
  const plaqueFraming = passingPlaque * portrait * 1.55;
  const look = place(
    distance + 5.0 - glance * 1.15 + portraitFraming * .50,
    -1.68 - glance * (1.95 + narrowView) - approachFraming - portraitFraming * 2.25 - plaqueFraming,
  );
  const verticalFov = (horizontalFov) => THREE.MathUtils.radToDeg(
    2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(horizontalFov / 2)) / camera.aspect),
  );
  const corridorFov = camera.aspect < .85 ? Math.min(88, verticalFov(52)) : 54;
  const stationFov = Math.min(98, verticalFov(43.5));
  const fov = THREE.MathUtils.lerp(corridorFov, stationFov, portraitFraming);
  if (camera.fov !== fov) {
    camera.fov = fov;
    camera.updateProjectionMatrix();
  }
  camera.position.set(visitor.x, 1.60, visitor.z);
  const lookHeight = 1.62 - portraitFraming * .01;
  if (endNoticeTarget) {
    const approachEnd = eased(finish - 1.90, finish - .15, distance);
    camera.lookAt(
      THREE.MathUtils.lerp(look.x, endNoticeTarget.x, approachEnd),
      THREE.MathUtils.lerp(lookHeight, endNoticeTarget.y, approachEnd),
      THREE.MathUtils.lerp(look.z, endNoticeTarget.z, approachEnd),
    );
  } else {
    camera.lookAt(look.x, lookHeight, look.z);
  }
}

const PLAQUE_WIDTH = 284;
const PLAQUE_HEADER_HEIGHT = 56;
const hiddenNotice = { transform: "none", scale: 1, visible: false };

function projectPlaque(notice, viewProjection, width, height) {
  const { anchor, right, down, height: panelHeight = 229 } = notice;
  const origin = new THREE.Vector4(anchor.x, anchor.y, anchor.z, 1).applyMatrix4(viewProjection);
  const horizontal = new THREE.Vector4(right.x, right.y, right.z, 0)
    .multiplyScalar(1 / PLAQUE_WIDTH).applyMatrix4(viewProjection);
  const vertical = new THREE.Vector4(down.x, down.y, down.z, 0)
    .multiplyScalar(1 / PLAQUE_HEADER_HEIGHT).applyMatrix4(viewProjection);
  const corner = (x, y) => {
    const w = origin.w + horizontal.w * x + vertical.w * y;
    const z = origin.z + horizontal.z * x + vertical.z * y;
    if (w <= .2 || z < -w || z > w) return null;
    const px = origin.x + horizontal.x * x + vertical.x * y;
    const py = origin.y + horizontal.y * x + vertical.y * y;
    return { x: (1 + px / w) * width / 2, y: (1 - py / w) * height / 2 };
  };
  const topLeft = corner(0, 0);
  const topRight = corner(PLAQUE_WIDTH, 0);
  const bottomLeft = corner(0, PLAQUE_HEADER_HEIGHT);
  const bottomRight = corner(PLAQUE_WIDTH, PLAQUE_HEADER_HEIGHT);
  const panelLeft = corner(0, panelHeight);
  const panelRight = corner(PLAQUE_WIDTH, panelHeight);
  const corners = [topLeft, topRight, bottomLeft, bottomRight, panelLeft, panelRight];
  if (corners.some((point) => !point)) return null;

  const boardWidth = Math.min(topRight.x - topLeft.x, bottomRight.x - bottomLeft.x);
  const headerHeight = Math.min(bottomLeft.y - topLeft.y, bottomRight.y - topRight.y);
  const scale = Math.min(boardWidth / PLAQUE_WIDTH, headerHeight / PLAQUE_HEADER_HEIGHT);
  const bounds = {
    left: Math.min(...corners.map((point) => point.x)),
    right: Math.max(...corners.map((point) => point.x)),
    top: Math.min(topLeft.y, topRight.y),
    bottom: Math.max(panelLeft.y, panelRight.y),
  };
  return { origin, horizontal, vertical, boardWidth, headerHeight, scale, bounds };
}

function viewProjectionFor(camera) {
  return new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
}

function plaqueTransform(projection, width, height) {
  const { origin, horizontal, vertical } = projection;
  // Compose local CSS pixels -> world wall plane -> camera clip -> viewport.
  // Keep the HTML links in the same wall plane as the plaque beneath them.
  const toCssX = (clip) => (clip.x + clip.w) * width / 2 / origin.w;
  const toCssY = (clip) => (-clip.y + clip.w) * height / 2 / origin.w;
  const matrix = [
    toCssX(horizontal), toCssY(horizontal), 0, horizontal.w / origin.w,
    toCssX(vertical), toCssY(vertical), 0, vertical.w / origin.w,
    0, 0, 1, 0,
    toCssX(origin), toCssY(origin), 0, 1,
  ];
  return `matrix3d(${matrix.map((value) => Number(value.toFixed(9))).join(",")})`;
}

function isCompact(width, height) {
  return width < 640 || (width < 900 && height < 600);
}

function projectNotices(notices, camera, distance, width, height) {
  if (!width || !height) return notices.map(() => hiddenNotice);
  const viewProjection = viewProjectionFor(camera);
  const compact = isCompact(width, height);
  return notices.map((notice) => {
    if (distance < notice.phoneAt - 4.40 || distance > notice.phoneAt + 2.18) return hiddenNotice;
    const projection = projectPlaque(notice, viewProjection, width, height);
    if (!projection) return hiddenNotice;
    const { bounds, boardWidth, headerHeight, scale } = projection;
    if (bounds.left < -1 || bounds.right > width + 1 || bounds.top < Math.min(68, height * .14)
      || bounds.bottom > height - (compact ? 72 : 74) || boardWidth < (compact ? 72 : 94)
      || headerHeight < (compact ? 12 : 16)) return hiddenNotice;
    return { transform: plaqueTransform(projection, width, height), scale, visible: true };
  });
}

export function renderGallery(canvas, rooms, onReady, onUnavailable, onPlaques, copy, nextNotice) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas, antialias: true, alpha: false, powerPreference: "high-performance",
    });
  } catch {
    onUnavailable();
    return null;
  }

  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#25211e");
  scene.fog = new THREE.FogExp2("#25211e", .031);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.65));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.16;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  // The exhibits are stationary. Refresh after textures used by the shadow casters have loaded.
  renderer.shadowMap.autoUpdate = false;

  const camera = new THREE.PerspectiveCamera(54, 1, .075, 85);
  const ray = new THREE.Raycaster();
  const cursor = new THREE.Vector2();
  const loaded = new Map();
  let distance = start;
  let viewportWidth = 0;
  let viewportHeight = 0;
  let pending = 0;
  let destroyed = false;
  let pointerPosition = null;
  let highlightedFrame = null;

  function pick(clientX, clientY) {
    const bounds = canvas.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return null;
    cursor.x = (clientX - bounds.left) / bounds.width * 2 - 1;
    cursor.y = -(clientY - bounds.top) / bounds.height * 2 + 1;
    ray.setFromCamera(cursor, camera);
    return ray.intersectObjects(targets, false)[0]?.object.userData.art;
  }

  function refreshHover() {
    const artwork = pointerPosition ? pick(...pointerPosition) : null;
    const highlight = artwork?.hoverHighlight ?? null;
    canvas.dataset.art = String(Boolean(artwork));
    if (highlight === highlightedFrame) return false;
    if (highlightedFrame) highlightedFrame.visible = false;
    highlightedFrame = highlight;
    if (highlightedFrame) highlightedFrame.visible = true;
    return true;
  }

  function paint() {
    pending = 0;
    if (destroyed) return;
    cameraPose(camera, distance, rooms, endNoticeTarget);
    if (pointerPosition) {
      camera.updateMatrixWorld();
      refreshHover();
    }
    renderer.render(scene, camera);
    onPlaques?.(projectNotices(notices, camera, distance, viewportWidth, viewportHeight));
  }

  function invalidate() {
    if (!pending && !destroyed) pending = requestAnimationFrame(paint);
  }

  const loading = new THREE.LoadingManager();
  loading.onLoad = () => {
    if (destroyed) return;
    phoneDisplays.forEach((display) => display.update());
    renderer.shadowMap.needsUpdate = true;
    invalidate();
    onReady();
  };
  const images = new THREE.TextureLoader(loading);
  function texture(name, repeat = false) {
    if (loaded.has(name)) return loaded.get(name);
    const image = images.load(asset(name), invalidate);
    image.colorSpace = THREE.SRGBColorSpace;
    image.anisotropy = Math.min(12, renderer.capabilities.getMaxAnisotropy());
    if (repeat) image.wrapS = image.wrapT = THREE.RepeatWrapping;
    loaded.set(name, image);
    return image;
  }

  const materials = {
    slate: texture("slate.jpg", true),
    floor: texture("floor.jpg", true),
    wood: texture("walnut-floor.jpg", true),
  };
  const hall = createHall(scene, path, { ...materials, walnut: materials.wood }, nextNotice);
  const { endNoticeTarget } = hall.userData;
  const { targets, notices, phoneDisplays } = createExhibits(scene, rooms, texture, materials, copy);

  function fit() {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (!width || !height) return;
    viewportWidth = width;
    viewportHeight = height;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    invalidate();
  }

  const observer = new ResizeObserver(fit);
  observer.observe(canvas);
  canvas.addEventListener("webglcontextlost", onUnavailable);
  fit();

  return {
    setDistance(value) {
      distance = value;
      invalidate();
    },
    pick,
    hover(clientX, clientY) {
      pointerPosition = [clientX, clientY];
      if (refreshHover()) invalidate();
    },
    clearHover() {
      pointerPosition = null;
      if (refreshHover()) invalidate();
    },
    dispose() {
      destroyed = true;
      cancelAnimationFrame(pending);
      observer.disconnect();
      canvas.removeEventListener("webglcontextlost", onUnavailable);
      const freed = new Set();
      scene.traverse((object) => {
        if (object.isLight) object.shadow?.dispose();
        if (object.geometry) freed.add(object.geometry);
        const surfaces = Array.isArray(object.material) ? object.material : [object.material];
        for (const surface of surfaces) {
          if (surface?.map) freed.add(surface.map);
          if (surface) freed.add(surface);
        }
      });
      for (const image of loaded.values()) freed.add(image);
      freed.forEach((value) => value.dispose());
      renderer.dispose();
    },
  };
}
