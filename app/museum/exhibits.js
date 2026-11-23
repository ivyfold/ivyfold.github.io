import * as THREE from "three";
import { place } from "./gallery-path.js";
import { guideLinks } from "./museum.js";
import { makeBooksProp, makeGameProp } from "./exhibitProps.js";
import { makePlantProp } from "./pedestalPlant.js";
import { createPhoneDisplay } from "./phoneDisplay.js";

function radial(stops) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext("2d");
  const fill = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  stops.forEach(([position, color]) => fill.addColorStop(position, color));
  ctx.fillStyle = fill;
  ctx.fillRect(0, 0, 128, 128);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

const plaquePixels = { width: 1024, height: 344 };
const guideFace = { width: 2.60, headerHeight: .31, top: 2.60, depth: .10 };
const pedestalProps = {
  leafia: makePlantProp,
  widgetgame: makeGameProp,
  studyseed: makeBooksProp,
};

function drawExpandIcon(ctx, x, y, size) {
  ctx.save();
  ctx.translate(x, y - size / 2);
  ctx.scale(size / 24, size / 24);
  ctx.strokeStyle = ctx.fillStyle;
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(15, 3);
  ctx.lineTo(21, 3);
  ctx.lineTo(21, 9);
  ctx.moveTo(21, 3);
  ctx.lineTo(14, 10);
  ctx.moveTo(10, 14);
  ctx.lineTo(3, 21);
  ctx.moveTo(3, 15);
  ctx.lineTo(3, 21);
  ctx.lineTo(9, 21);
  ctx.stroke();
  ctx.restore();
}

function plaqueMaterial(caption, action) {
  const canvas = document.createElement("canvas");
  canvas.width = plaquePixels.width;
  canvas.height = plaquePixels.height;
  const ctx = canvas.getContext("2d");
  const finish = ctx.createLinearGradient(0, 0, 0, canvas.height);
  finish.addColorStop(0, "#fff0d4");
  finish.addColorStop(1, "#ead2aa");
  ctx.fillStyle = finish;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#e3c597";
  ctx.fillRect(13, 182, canvas.width - 26, canvas.height - 195);
  ctx.strokeStyle = "#aa8a59";
  ctx.lineWidth = 3;
  ctx.strokeRect(12, 12, canvas.width - 24, canvas.height - 24);
  ctx.fillStyle = "#b6966b";
  ctx.fillRect(14, 182, canvas.width - 28, 3);

  ctx.fillStyle = "#21180f";
  const font = '"Hiragino Kaku Gothic ProN", "Yu Gothic", "Noto Sans JP", sans-serif';
  ctx.font = `600 88px ${font}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(caption, canvas.width / 2, 103, canvas.width - 100);

  const iconSize = 67;
  const gap = 24;
  const actionY = 256;
  const maxActionWidth = canvas.width - iconSize - gap - 100;
  ctx.fillStyle = "#3c2918";
  ctx.font = `650 79px ${font}`;
  const actionWidth = Math.min(ctx.measureText(action).width, maxActionWidth);
  const iconX = (canvas.width - iconSize - gap - actionWidth) / 2;
  drawExpandIcon(ctx, iconX, actionY, iconSize);
  ctx.textAlign = "left";
  ctx.fillText(action, iconX + iconSize + gap, actionY, maxActionWidth);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return new THREE.MeshBasicMaterial({ map: texture, toneMapped: false });
}

function printedGuide(room, copy, links) {
  const width = 284;
  const height = 73 + links.length * 52;
  const canvas = document.createElement("canvas");
  canvas.width = width * 3;
  canvas.height = height * 3;
  const ctx = canvas.getContext("2d");
  ctx.scale(3, 3);
  const brass = ctx.createLinearGradient(0, 0, width, 56);
  brass.addColorStop(0, "#cc9e61");
  brass.addColorStop(.49, "#ecd097");
  brass.addColorStop(1, "#ad7a43");
  ctx.fillStyle = brass;
  ctx.fillRect(0, 0, width, 56);
  ctx.fillStyle = "#f0e3c8";
  ctx.fillRect(5, 56, width - 10, height - 56);
  ctx.strokeStyle = "#a88050";
  ctx.strokeRect(5.5, 56.5, width - 11, height - 57);

  ctx.textBaseline = "middle";
  ctx.fillStyle = "#24180e";
  ctx.font = '500 22px Baskerville, "Hiragino Mincho ProN", Georgia, serif';
  ctx.fillText(room.name, 14, 28, 113);
  const nameWidth = Math.min(113, ctx.measureText(room.name).width);
  ctx.font = '600 14px "Hiragino Kaku Gothic ProN", sans-serif';
  ctx.fillText(copy.appGuide, Math.ceil(nameWidth) + 29, 28, 132);
  ctx.font = '500 17px "Hiragino Kaku Gothic ProN", sans-serif';
  links.forEach(({ label }, index) => {
    const y = 63 + index * 52;
    if (index > 0) {
      ctx.strokeStyle = "#b9a588";
      ctx.beginPath();
      ctx.moveTo(18, y);
      ctx.lineTo(266, y);
      ctx.stroke();
    }
    ctx.fillText(label, 18, y + 26, 210);
    ctx.fillText("→", 247, y + 26);
  });
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return new THREE.MeshBasicMaterial({ map: texture, toneMapped: false });
}

function flat(map, opacity) {
  return new THREE.MeshBasicMaterial({
    map, transparent: true, opacity, depthWrite: false, toneMapped: false,
  });
}

function mesh(group, geometry, material, x, y, z) {
  const object = new THREE.Mesh(geometry, material);
  object.position.set(x, y, z);
  group.add(object);
  return object;
}

function roundShape(width, height, radius) {
  const x = width / 2;
  const y = height / 2;
  const shape = new THREE.Shape();
  shape.moveTo(-x + radius, -y);
  shape.lineTo(x - radius, -y);
  shape.quadraticCurveTo(x, -y, x, -y + radius);
  shape.lineTo(x, y - radius);
  shape.quadraticCurveTo(x, y, x - radius, y);
  shape.lineTo(-x + radius, y);
  shape.quadraticCurveTo(-x, y, -x, y - radius);
  shape.lineTo(-x, -y + radius);
  shape.quadraticCurveTo(-x, -y, -x + radius, -y);
  return shape;
}

function screenGeometry(width, height) {
  const geometry = new THREE.ShapeGeometry(roundShape(width, height, .097), 12);
  const positions = geometry.getAttribute("position");
  const uv = geometry.getAttribute("uv");
  for (let i = 0; i < uv.count; i += 1) {
    uv.setXY(i, positions.getX(i) / width + .5, positions.getY(i) / height + .5);
  }
  return geometry;
}

function mounted(group, at, across, wall) {
  const p = place(at, across);
  const towards = wall ? [p.rx, p.rz] : [.66 * p.rx - .75 * p.dx, .66 * p.rz - .75 * p.dz];
  const object = new THREE.Group();
  object.position.set(p.x, 0, p.z);
  object.rotation.y = Math.atan2(...towards);
  group.add(object);
  return object;
}

export function createExhibits(scene, rooms, texture, materials, copy) {
  const exhibit = new THREE.Group();
  exhibit.name = "Phones and frames";
  const targets = [];
  const notices = [];
  const phoneDisplays = [];
  const shades = [
    [0, "rgba(13,7,4,0.92)"], [.55, "rgba(16,10,7,0.55)"], [1, "rgba(16,10,7,0)"],
  ];
  const warm = [[0, "rgba(255,186,107,0.8)"], [.42, "rgba(242,155,81,0.31)"], [1, "rgba(242,155,81,0)"]];
  const shadowMap = radial(shades);
  const lightMap = radial(warm);
  const shadow = flat(shadowMap, .74);
  const pool = flat(lightMap, .76);
  pool.blending = THREE.AdditiveBlending;
  const wallWash = flat(lightMap, .55);
  wallWash.blending = THREE.AdditiveBlending;
  const dark = new THREE.MeshPhysicalMaterial({ color: "#100e0c", roughness: .27, metalness: .24, clearcoat: .45 });
  const brass = new THREE.MeshStandardMaterial({ color: "#bd8b56", roughness: .35, metalness: .39 });
  const warmBulb = new THREE.MeshBasicMaterial({ color: "#ffce96", toneMapped: false });
  const limestone = texture("plinth-limestone.webp", true);
  const limestoneRelief = texture("plinth-limestone-relief.webp", true);
  limestoneRelief.colorSpace = THREE.NoColorSpace;
  const stone = new THREE.MeshStandardMaterial({
    color: "#f0ece5", map: limestone, bumpMap: limestoneRelief, bumpScale: .022, roughness: .88,
    emissive: "#a3988a", emissiveMap: limestone, emissiveIntensity: .19,
  });
  const foot = new THREE.MeshStandardMaterial({ color: "#302822", roughness: .92 });
  const plinthHeight = .418;
  const bevel = .018;
  const plinth = new THREE.ExtrudeGeometry(roundShape(2.08, .99, .028), {
    depth: plinthHeight - .027 - 2 * bevel, bevelEnabled: true, bevelThickness: bevel,
    bevelSize: .014, bevelSegments: 3, curveSegments: 5,
  });
  plinth.rotateX(-Math.PI / 2);
  plinth.translate(0, .027 + bevel, 0);
  const plinthFoot = new THREE.BoxGeometry(2.012, .033, .920);
  const darkWood = new THREE.MeshStandardMaterial({ color: "#5c3520", map: materials.wood, roughness: .58 });
  const edgeWood = new THREE.MeshStandardMaterial({ color: "#b58756", map: materials.wood, roughness: .5 });
  const frameWidth = .91;
  const trim = .027;
  const printWidth = frameWidth - trim * 2;
  const printHeight = printWidth / .46;
  const frameHeight = printHeight + trim * 2;
  const frameCenter = 1.86;
  const frameBottom = frameCenter - frameHeight / 2;
  const lampHeight = frameCenter + frameHeight / 2 + .23;
  const frameBack = new THREE.BoxGeometry(frameWidth, frameHeight, .064);
  const frameStile = new THREE.BoxGeometry(trim, frameHeight, .016);
  const frameRail = new THREE.BoxGeometry(printWidth, trim, .016);
  const framePrint = new THREE.PlaneGeometry(printWidth, printHeight);
  const frameShadow = new THREE.PlaneGeometry(1.23, frameHeight + .29);
  const highlightShape = roundShape(frameWidth + .030, frameHeight + .030, .006);
  highlightShape.holes.push(roundShape(frameWidth - .002, frameHeight - .002, .003));
  const highlightGeometry = new THREE.ShapeGeometry(highlightShape, 4);
  const highlightMaterial = new THREE.MeshBasicMaterial({ color: "#e5b97d", toneMapped: false });

  const plaqueHeight = frameWidth * plaquePixels.height / plaquePixels.width;
  const plaqueCenter = frameBottom - plaqueHeight / 2 - .065;
  const plaqueBack = new THREE.BoxGeometry(frameWidth, plaqueHeight, .025);
  const plaqueFace = new THREE.PlaneGeometry(frameWidth - .008, plaqueHeight - .006);
  const phoneDepth = .104;
  const phoneHeight = 2.12;
  const phoneWidth = phoneHeight * .46;
  const phoneShape = roundShape(phoneWidth, phoneHeight, .105);
  const body = new THREE.ExtrudeGeometry(phoneShape, {
    depth: phoneDepth, bevelEnabled: true, bevelSize: .035, bevelThickness: .024, bevelSegments: 4, curveSegments: 10,
  });
  const glass = screenGeometry(phoneWidth - .026, phoneHeight - .031);
  const guideWash = new THREE.PlaneGeometry(guideFace.width + .75, 1.65);
  const propContact = new THREE.PlaneGeometry(.90, .64);
  const phoneContact = new THREE.PlaneGeometry(1.25, .36);
  const lampShade = new THREE.CylinderGeometry(.069, .092, .063, 18);
  const lampAperture = new THREE.CircleGeometry(.074, 18);
  const lampStem = new THREE.CylinderGeometry(.022, .022, .18, 12);

  function pictureLight(hung, height) {
    mesh(hung, lampShade, brass, 0, height, .201).rotation.x = .42;
    mesh(hung, lampAperture, warmBulb, 0, height - .033, .179).rotation.x = -1.15;
    mesh(hung, lampStem, brass, 0, height + .020, .099).rotation.x = Math.PI / 2;
  }

  for (const room of rooms) {
    const station = mounted(exhibit, room.phoneAt - .50, -2.06, false);
    const guideMount = mounted(exhibit, room.phoneAt + 3.32, -3.067, true);
    const { width, headerHeight, top, depth } = guideFace;
    const links = guideLinks(room, copy);
    const guideHeight = headerHeight * (73 + links.length * 52) / 56;
    const anchor = guideMount.localToWorld(new THREE.Vector3(-width / 2, top, depth));
    const opposite = guideMount.localToWorld(new THREE.Vector3(width / 2, top, depth));
    notices.push({
      id: room.id,
      phoneAt: room.phoneAt,
      height: 73 + links.length * 52,
      anchor,
      right: opposite.sub(anchor),
      down: new THREE.Vector3(0, -headerHeight, 0),
    });
    mesh(guideMount, guideWash, wallWash, 0, top + .03, .061).renderOrder = 2;
    mesh(guideMount, new THREE.BoxGeometry(width + .027, guideHeight + .020, .066),
      darkWood, 0, top - guideHeight / 2, depth - .036);
    mesh(guideMount, new THREE.PlaneGeometry(width, guideHeight), printedGuide(room, copy, links),
      0, top - guideHeight / 2, depth - .001);
    pictureLight(guideMount, top + .35);
    const spill = mesh(station, new THREE.PlaneGeometry(3.15, 2.35), pool, -.06, .009, .21);
    spill.rotation.x = -Math.PI / 2;
    spill.renderOrder = 1;
    const grounded = mesh(station, new THREE.PlaneGeometry(2.46, 1.42), shadow, .06, .013, .04);
    grounded.rotation.x = -Math.PI / 2;
    grounded.renderOrder = 2;
    mesh(station, plinthFoot, foot, 0, .016, 0);
    mesh(station, plinth, stone, 0, 0, 0).receiveShadow = true;
    mesh(station, phoneContact, shadow, .18, plinthHeight + .002, -.020).rotation.x = -Math.PI / 2;
    const phoneCenter = plinthHeight + .014 + phoneHeight / 2;
    mesh(station, body, brass, .18, phoneCenter, -.070).castShadow = true;
    mesh(station, new THREE.ShapeGeometry(phoneShape, 12), dark, .18, phoneCenter, .061).scale.set(1.006, 1.004, 1);
    const display = createPhoneDisplay(room,
      texture(`${room.slug}-display-icon.webp`), texture(`${room.slug}-display-background.webp`));
    phoneDisplays.push(display);
    const phone = mesh(station, glass, new THREE.MeshBasicMaterial({
      map: display.texture, toneMapped: false,
    }), .18, phoneCenter, .064);
    phone.userData.art = { room, title: room.name, image: room.phone, description: room.summary };
    targets.push(phone);

    mesh(station, propContact, shadow, -.66, plinthHeight + .002, .11).rotation.x = -Math.PI / 2;
    const displayProp = pedestalProps[room.id](texture, materials);
    displayProp.position.set(-.66, plinthHeight, .09);
    displayProp.rotation.y = -.09;
    displayProp.traverse((part) => {
      if (part.isMesh) part.castShadow = true;
    });
    station.add(displayProp);
    const exhibitLight = new THREE.SpotLight("#ffe2c6", 13, 4.8, .44, .82);
    exhibitLight.position.set(-.40, 3.08, 1.23);
    exhibitLight.target.position.set(-.15, .58, 0);
    exhibitLight.castShadow = true;
    exhibitLight.shadow.mapSize.set(512, 512);
    exhibitLight.shadow.camera.near = .65;
    exhibitLight.shadow.camera.far = 4.8;
    exhibitLight.shadow.bias = -.0002;
    exhibitLight.shadow.normalBias = .012;
    station.add(exhibitLight, exhibitLight.target);

    for (const frame of room.frames) {
      const hung = mounted(exhibit, frame.at, -3.067, true);
      const backgroundShadow = mesh(hung, frameShadow, shadow, .044, frameCenter - .04, .002);
      backgroundShadow.renderOrder = 1;
      const wash = mesh(hung, new THREE.PlaneGeometry(1.27, 1.95), wallWash, 0, frameCenter + .66, .008);
      wash.renderOrder = 2;
      const hoverHighlight = mesh(hung, highlightGeometry, highlightMaterial, 0, frameCenter, .098);
      hoverHighlight.visible = false;
      const art = { ...frame, room, hoverHighlight };
      const box = mesh(hung, frameBack, darkWood, 0, frameCenter, .049);
      box.userData.art = art;
      for (const side of [-1, 1]) {
        mesh(hung, frameStile, edgeWood, side * (frameWidth - trim) / 2, frameCenter, .087);
        mesh(hung, frameRail, edgeWood, 0, frameCenter + side * (frameHeight - trim) / 2, .087);
      }
      const print = mesh(hung, framePrint, new THREE.MeshBasicMaterial({
        map: texture(frame.image), toneMapped: false,
      }), 0, frameCenter, .090);
      print.userData.art = art;

      const label = mesh(hung, plaqueBack, darkWood, 0, plaqueCenter, .035);
      const plaque = mesh(hung, plaqueFace, plaqueMaterial(frame.caption, copy.artworkDetails), 0, plaqueCenter, .050);
      label.userData.art = art;
      plaque.userData.art = art;
      targets.push(box, print, label, plaque);

      pictureLight(hung, lampHeight);
    }
  }

  scene.add(exhibit);
  return { targets, notices, phoneDisplays };
}
