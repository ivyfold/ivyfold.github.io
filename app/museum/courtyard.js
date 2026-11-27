import * as THREE from "three";
import { finish, path, place } from "./gallery-path.js";

const eyeHeight = 1.60;
const backdropDepth = 10.8;
const backdropSpan = 36;
const openingCeiling = 4.09;
const leftEdge = -3.1;
const rightEdge = 2.03;
const titlePixels = { width: 1536, height: 560 };
const titleFont = '"Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", Georgia, serif';
// Coordinates are normalized to the source photograph, measured at the wall and ceiling edges.
const wide = {
  file: "courtyard.webp", aspect: 1672 / 941, guideX: .623, guideCurve: .28,
  titleX: .026, titleWidth: .250,
  left: [[-.055, .990], [0, .946], [.10, .873], [.20, .799], [.286, .735]],
  right: [[.967, 1.055], [.908, 1], [.870, .947], [.830, .898], [.800, .853], [.780, .804], [.776, .770]],
  roof: [[-.15, .09], [.286, .202], [.45, .177], [.60, .162], [.739, .155], [1.15, .08]],
};
const tall = {
  file: "courtyard-portrait.webp", aspect: 864 / 1536, guideX: .706, guideCurve: .19,
  left: [[-.07, .778], [0, .748], [.062, .722]],
  right: [[1.06, .93], [1, .852], [.972, .831], [.950, .803], [.944, .782]],
  roof: [[-.15, .13], [.062, .177], [.32, .161], [.60, .154], [.80, .160], [.90, .179], [.940, .219], [1.15, .125]],
};

export function courtyardTitleLines(title) {
  const pause = title.indexOf("、");
  if (pause !== -1 && pause < title.length - 1) {
    return [title.slice(0, pause + 1), title.slice(pause + 1).trim()];
  }
  const clause = title.indexOf(" will ");
  if (clause > 0) return [title.slice(0, clause), title.slice(clause).trim()];
  return [title];
}

function createTitleTexture(title) {
  const canvas = document.createElement("canvas");
  canvas.width = titlePixels.width;
  canvas.height = titlePixels.height;
  const context = canvas.getContext("2d");
  if (context) {
    const lines = courtyardTitleLines(title);
    const fontSize = 209;
    context.font = `600 ${fontSize}px ${titleFont}`;
    const lineWidth = Math.max(...lines.map(line => context.measureText(line).width));
    const fittedSize = fontSize * Math.min(1, (canvas.width - 64) / Math.max(lineWidth, 1));
    context.font = `600 ${fittedSize}px ${titleFont}`;
    context.textBaseline = "alphabetic";
    context.translate(22, 0);

    for (let index = 0; index < lines.length; index++) {
      const line = lines[index];
      const baseline = lines.length === 2 ? 216 + 241 * index : 354;
      context.save();
      context.shadowColor = "#181008bf";
      context.shadowBlur = 8;
      context.shadowOffsetX = 4;
      context.shadowOffsetY = 6;
      context.fillStyle = "#684325";
      context.fillText(line, 3, baseline + 4);
      context.restore();

      context.lineWidth = 2.8;
      context.strokeStyle = "#edc496";
      context.strokeText(line, 0, baseline);
      const face = context.createLinearGradient(0, baseline - 171, 0, baseline + 14);
      face.addColorStop(0, "#fffaed");
      face.addColorStop(.58, "#f9e6c5");
      face.addColorStop(1, "#e4bc87");
      context.fillStyle = face;
      context.fillText(line, 0, baseline);
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

const projectionFragment = [
  "varying vec3 vCourtWorld;",
  "uniform sampler2D courtImage;",
  "uniform vec3 courtEye, courtForward, courtRight;",
  "uniform vec2 courtLens, courtEntrance, courtPhotoGuide;",
  "vec2 courtLocalFloor() {",
  "  vec3 relative = vCourtWorld - courtEye;",
  "  return vec2(dot(relative, courtRight), dot(relative, courtForward));",
  "}",
  "vec2 courtUv(vec2 point) {",
  "  return .5 + .5 * vec2(point.x, vCourtWorld.y - courtEye.y) / (max(.001, point.y) * courtLens);",
  "}",
  "vec3 courtColor(vec2 uv) {",
  "  return texture2D(courtImage, clamp(uv, 0., 1.)).rgb;",
  "}",
  "float courtSides(vec2 uv) {",
  "  return smoothstep(-.055, 0., min(uv.x, 1. - uv.x));",
  "}",
].join("\n");

const inscriptionUniforms = [
  "uniform sampler2D courtTitle;",
  "uniform vec3 courtTitleOrigin, courtTitleAlong;",
  "uniform vec2 courtTitleSize;",
  "uniform bool courtTitleVisible;",
].join("\n");

const inscriptionSample = [
  "if (courtTitleVisible) {",
  "  vec3 relative = vCourtWorld - courtTitleOrigin;",
  "  vec2 sign = vec2(dot(relative, courtTitleAlong), relative.y) / courtTitleSize;",
  "  vec2 light = (sign - vec2(-.15, .62)) / vec2(.60, 1.14);",
  "  float wash = exp(-dot(light, light));",
  "  vec4 glyph = texture2D(courtTitle, clamp(sign + .5, 0., 1.));",
  "  gl_FragColor.rgb = mix(gl_FragColor.rgb + vec3(.120, .064, .029) * wash, glyph.rgb, glyph.a);",
  "}",
].join("\n");

function applyProjection(material, uniforms, surface) {
  const hasInscription = surface === "slate";
  material.customProgramCacheKey = () => "courtyard-" + surface;
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = "varying vec3 vCourtWorld;\n" + shader.vertexShader.replace(
      "#include <worldpos_vertex>",
      "#include <worldpos_vertex>\nvCourtWorld = (modelMatrix * vec4(transformed, 1.)).xyz;",
    );
    const sample = surface === "floor" ? [
      "vec2 local = courtLocalFloor();",
      "if (local.y >= courtEntrance.y - .035) {",
      "vec2 uv = courtUv(local);",
      "float photoAmount = courtSides(uv) * smoothstep(0., .20, uv.y);",
      "float photoDepth = courtEye.y / courtLens.y;",
      "float progress = smoothstep(courtEntrance.y, photoDepth, local.y);",
      "float floorU = courtPhotoGuide.x + courtPhotoGuide.y * max(0., uv.y) * max(0., uv.y);",
      "float guideAtPhoto = (2. * floorU - 1.) * courtLens.x * local.y;",
      "float guideX = mix(courtEntrance.x, guideAtPhoto, progress);",
      "float guideDistance = abs(local.x - guideX);",
      "float guideExtent = step(courtEntrance.y, local.y) * (1. - smoothstep(.12, .22, uv.y));",
      "float border = (1. - smoothstep(.010, .018, guideDistance)) * guideExtent;",
      "float brass = (1. - smoothstep(.005, .009, guideDistance)) * guideExtent;",
      "vec3 floorColor = mix(gl_FragColor.rgb, courtColor(uv), photoAmount);",
      "floorColor = mix(floorColor, vec3(.020, .012, .007), .76 * border);",
      "vec3 brassColor = mix(vec3(.155, .091, .042), vec3(.24, .145, .061), progress);",
      "gl_FragColor.rgb = mix(floorColor, brassColor, .84 * brass);",
      "}",
    ].join("\n") : hasInscription ? "" : [
      "vec2 uv = courtUv(courtLocalFloor());",
      "float fade = courtSides(uv) * smoothstep(-.08, 0., min(uv.y, 1. - uv.y));",
      "gl_FragColor.rgb = mix(gl_FragColor.rgb, courtColor(uv), fade);",
    ].join("\n");
    shader.fragmentShader = [
      projectionFragment,
      hasInscription ? inscriptionUniforms : "",
      shader.fragmentShader.replace(
        "#include <tonemapping_fragment>",
        ["#include <tonemapping_fragment>", sample, hasInscription ? inscriptionSample : ""].join("\n"),
      ),
    ].join("\n");
  };
}

function stripBetween(first, second, tiling) {
  const positions = [];
  const uvs = [];
  const triangles = [];
  first.forEach((point, index) => {
    const next = second[index];
    positions.push(point.x, point.y, point.z, next.x, next.y, next.z);
    const u = tiling ? (path.length + tiling.step * index) / tiling.repeat : index * .75;
    const v1 = tiling ? point.y / tiling.repeat : 0;
    const v2 = tiling ? next.y / tiling.repeat : 1;
    uvs.push(u, v1, u, v2);
    if (index > 0) {
      const a = 2 * (index - 1);
      triangles.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
    }
  });
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(triangles);
  geometry.computeVertexNormals();
  return geometry;
}

export function createCourtyard(scene, texture, title) {
  const end = place(finish, .43);
  const eye = new THREE.Vector3(end.x, eyeHeight, end.z);
  const forward = new THREE.Vector3(end.dx, 0, end.dz);
  const right = new THREE.Vector3(-end.dz, 0, end.dx);
  const target = eye.clone().addScaledVector(forward, backdropDepth);
  const guide = place(path.length, .658);
  const contact = new THREE.Vector3(guide.x, 0, guide.z).sub(eye);
  const titleTexture = createTitleTexture(title);
  const panoramas = [texture(wide.file), texture(tall.file)];
  const uniforms = {
    courtImage: { value: panoramas[0] },
    courtTitle: { value: titleTexture },
    courtEye: { value: eye },
    courtForward: { value: forward },
    courtRight: { value: right },
    courtLens: { value: new THREE.Vector2(1, 1) },
    courtEntrance: { value: new THREE.Vector2(contact.dot(right), contact.dot(forward)) },
    courtPhotoGuide: { value: new THREE.Vector2() },
    courtTitleOrigin: { value: new THREE.Vector3() },
    courtTitleAlong: { value: new THREE.Vector3() },
    courtTitleSize: { value: new THREE.Vector2(1, 1) },
    courtTitleVisible: { value: false },
  };

  // The courtyard view and its sunlit floor share a fixed projector beyond the gallery.
  const backMaterial = new THREE.MeshBasicMaterial({ color: "#5a5046", fog: false, toneMapped: false });
  applyProjection(backMaterial, uniforms, "facade");
  const backdrop = new THREE.Mesh(new THREE.PlaneGeometry(backdropSpan * 2, 28), backMaterial);
  backdrop.name = "Courtyard facade";
  backdrop.position.set(target.x, 14, target.z);
  backdrop.lookAt(backdrop.position.clone().sub(forward));
  scene.add(backdrop);

  function shellSurface(name, material) {
    const surface = new THREE.Mesh(new THREE.BufferGeometry(), material);
    surface.name = name;
    scene.add(surface);
    return surface;
  }

  let interior;
  let rightSlats;
  const ceilingMaterial = new THREE.MeshStandardMaterial({
    color: "#b9987c", emissive: "#775035", emissiveIntensity: .72, side: THREE.DoubleSide, roughness: .88,
  });
  applyProjection(ceilingMaterial, uniforms, "facade");
  const ceiling = shellSurface("Ceiling above the courtyard threshold", ceilingMaterial);

  function atOpening(offset, y) {
    const point = place(path.length, offset);
    return new THREE.Vector3(point.x, y, point.z);
  }

  const header = new THREE.Mesh(stripBetween(
    [leftEdge, rightEdge].map(offset => atOpening(offset, openingCeiling)),
    [leftEdge, rightEdge].map(offset => atOpening(offset, 4.46)),
  ), ceiling.material);
  header.name = "Soffit at the courtyard opening";
  scene.add(header);

  function pointOnPhoto([u, v], height, lensX, lensY) {
    const along = (height - eyeHeight) / ((1 - 2 * v) * lensY);
    return eye.clone().addScaledVector(forward, along).addScaledVector(right, along * (2 * u - 1) * lensX).setY(height);
  }

  function setSurface(mesh, first, second, tiling) {
    mesh.geometry.dispose();
    mesh.geometry = stripBetween(first, second, tiling);
  }

  function wallCurve(points, edge, lensX, lensY) {
    const join = atOpening(edge, 0);
    const measured = points.map(point => pointOnPhoto(point, 0, lensX, lensY));
    const station = path.sample(path.length);
    const from = new THREE.Vector3(station.dx, 0, station.dz);
    // Bridge the straight slate face. Carry the curved timber wall in one arc to the opening.
    const curvedTimber = edge === rightEdge;
    const end = curvedTimber ? measured.at(-1) : measured[0];
    const into = curvedTimber
      ? end.clone().sub(measured.at(-2)).normalize()
      : measured[1].clone().sub(end).normalize();
    const handle = join.distanceTo(end) / 3;
    const curve = new THREE.CurvePath();
    curve.add(new THREE.CubicBezierCurve3(
      join, join.clone().addScaledVector(from, handle), end.clone().addScaledVector(into, -handle), end,
    ));
    if (!curvedTimber) curve.add(new THREE.CatmullRomCurve3(measured));
    return curve;
  }

  function fitWall(wall, baseboard, curve, inward, trimHeight) {
    const length = curve.getLength();
    const divisions = Math.ceil(length / .14);
    const ground = [];
    const trim = [];
    for (let i = 0; i <= divisions; i++) {
      const t = i / divisions;
      const point = curve.getPoint(t);
      const direction = curve.getTangent(t);
      ground.push(point);
      trim.push(point.clone().addScaledVector(new THREE.Vector3(-direction.z, 0, direction.x), inward));
    }
    const upper = ground.map(point => point.clone().setY(openingCeiling));
    const trimTop = trim.map(point => point.clone().setY(trimHeight));
    if (inward > 0) {
      setSurface(wall, ground, upper, { repeat: 2.6, step: length / divisions });
      setSurface(baseboard, trim, trimTop);
    } else {
      setSurface(wall, upper, ground);
      setSurface(baseboard, trimTop, trim);
    }
    return trim;
  }

  function removeSlats() {
    if (!rightSlats) return;
    scene.remove(rightSlats);
    rightSlats.geometry.dispose();
    rightSlats.material.dispose();
    rightSlats.dispose();
    rightSlats = null;
  }

  function fitShell(view, lensX, lensY) {
    const left = wallCurve(view.left, leftEdge, lensX, lensY);
    const right = wallCurve(view.right, rightEdge, lensX, lensY);
    fitWall(interior.leftWall, interior.leftTrim, left, .024, .095);
    const rightTrim = fitWall(interior.rightWall, interior.rightTrim, right, -.106, .06);
    // A narrow timber cap joins the slats to the ceiling along the same curve.
    setSurface(interior.rightCap,
      rightTrim.map(point => point.clone().setY(openingCeiling + .018)),
      rightTrim.map(point => point.clone().setY(openingCeiling - .065)),
    );
    removeSlats();
    const length = right.getLength();
    rightSlats = interior.createSlats({
      length: path.length + length,
      sample(distance) {
        const t = THREE.MathUtils.clamp((distance - path.length) / length, 0, 1);
        const position = right.getPoint(t);
        const direction = right.getTangent(t);
        return { x: position.x, z: position.z, dx: direction.x, dz: direction.z };
      },
    });
    scene.add(rightSlats);
    const roofEdge = view.roof.map(point => pointOnPhoto(point, openingCeiling, lensX, lensY));
    const nearRoof = roofEdge.map((_, index) => atOpening(
      THREE.MathUtils.lerp(leftEdge, rightEdge, index / (roofEdge.length - 1)), openingCeiling,
    ));
    setSurface(ceiling, nearRoof, roofEdge);
  }

  function addFloor(material) {
    applyProjection(material, uniforms, "floor");
    const opening = [place(path.length, leftEdge), place(path.length, rightEdge)];
    const far = [-backdropSpan, backdropSpan].map(offset => ({
      x: target.x + right.x * offset, z: target.z + right.z * offset,
    }));
    const floor = new THREE.BufferGeometry();
    floor.setAttribute("position", new THREE.Float32BufferAttribute(
      [...opening, ...far].flatMap(({ x, z }) => [x, 0, z]), 3,
    ));
    floor.setAttribute("uv", new THREE.Float32BufferAttribute([
      path.length / 2.35, leftEdge / 2.35, path.length / 2.35, rightEdge / 2.35,
      (path.length + backdropDepth) / 2.35, -backdropSpan / 2.35,
      (path.length + backdropDepth) / 2.35, backdropSpan / 2.35,
    ], 2));
    floor.setIndex([0, 1, 2, 1, 3, 2]);
    floor.computeVertexNormals();
    const surface = new THREE.Mesh(floor, material);
    surface.name = "Gallery floor continuing into the courtyard";
    scene.add(surface);
  }

  function addInterior({ stone, floor, walnut, baseboard, createSlats }) {
    applyProjection(stone, uniforms, "slate");
    addFloor(floor);
    interior = {
      leftWall: shellSurface("Slate continuing to the courtyard", stone),
      rightWall: shellSurface("Walnut backing continuing to the courtyard", walnut),
      leftTrim: shellSurface("Left gallery baseboard continuation", baseboard),
      rightTrim: shellSurface("Right gallery baseboard continuation", baseboard),
      rightCap: shellSurface("Walnut slat cap at the courtyard", walnut),
      createSlats,
    };
  }

  function fitInscription(aspect, halfHeight, lensX, lensY) {
    const visible = aspect > 33 / 25;
    uniforms.courtTitleVisible.value = visible;
    if (!visible) return;

    // The sign uses wall coordinates at a constant height. Only the courtyard picture uses camera UVs.
    const visibleLeft = .5 - halfHeight * aspect / (2 * lensX);
    const startX = Math.max(wide.titleX, visibleLeft + .025);
    const endX = Math.min(startX + wide.titleWidth, .277);
    const [nearU, nearV] = wide.left[0];
    const [farU, farV] = wide.left.at(-1);
    const basePoint = (u) => {
      const v = THREE.MathUtils.lerp(nearV, farV, (u - nearU) / (farU - nearU));
      return pointOnPhoto([u, v], 0, lensX, lensY);
    };
    const first = basePoint(startX);
    const last = basePoint(endX);
    const width = first.distanceTo(last);
    uniforms.courtTitleOrigin.value.copy(first).lerp(last, .5).setY(1.98);
    uniforms.courtTitleAlong.value.subVectors(last, first).normalize();
    uniforms.courtTitleSize.value.set(width, width * titlePixels.height / titlePixels.width);
  }

  function fit(aspect, verticalFov) {
    const portrait = aspect < .85;
    const view = portrait ? tall : wide;
    const halfHeight = Math.tan(THREE.MathUtils.degToRad(verticalFov) / 2);
    const lensY = Math.max(halfHeight, halfHeight * aspect / view.aspect) * 1.008;
    const lensX = lensY * view.aspect;
    uniforms.courtImage.value = panoramas[portrait ? 1 : 0];
    uniforms.courtLens.value.set(lensX, lensY);
    uniforms.courtPhotoGuide.value.set(view.guideX, view.guideCurve);
    fitInscription(aspect, halfHeight, lensX, lensY);
    fitShell(view, lensX, lensY);
  }

  return {
    target,
    addInterior,
    fit,
    dispose() {
      titleTexture.dispose();
      rightSlats?.dispose();
    },
  };
}
