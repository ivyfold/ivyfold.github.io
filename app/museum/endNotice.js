import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

const paperWidth = 3.34;
const paperHeight = 1.86;
const canvasWidth = 1440;
const canvasHeight = 802;
const serif = '"Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", Georgia, serif';
const sans = '"Hiragino Kaku Gothic ProN", "Yu Gothic", "Noto Sans JP", system-ui, sans-serif';

function wrap(ctx, text, lineWidth, japanese) {
  const tokens = japanese
    ? Array.from(new Intl.Segmenter("ja", { granularity: "word" }).segment(text), ({ segment }) => segment)
    : (text.match(/\S+\s*/g) ?? []);
  const lines = [];
  let current = "";
  for (const token of tokens) {
    const next = current + token;
    const closingPunctuation = japanese && /^[、。！？）」』]/u.test(token);
    if (current && ctx.measureText(next.trimEnd()).width > lineWidth && !closingPunctuation) {
      lines.push(current.trimEnd());
      current = token;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current.trimEnd());
  return lines;
}

function printedNotice({ title, body }) {
  const canvas = document.createElement("canvas");
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext("2d");
  const wash = ctx.createLinearGradient(0, 0, canvasWidth * .65, canvasHeight);
  wash.addColorStop(0, "#f5e8d0");
  wash.addColorStop(.48, "#f0e1c7");
  wash.addColorStop(1, "#e0caab");
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  ctx.strokeStyle = "#bda688";
  ctx.lineWidth = 2;
  ctx.strokeRect(27, 27, canvasWidth - 54, canvasHeight - 54);

  const middle = canvasWidth / 2;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#33251c";
  const titleWidth = canvasWidth - 150;
  ctx.font = `600 119px ${serif}`;
  const titleSize = Math.min(119, Math.floor(119 * titleWidth / ctx.measureText(title).width));
  ctx.font = `600 ${titleSize}px ${serif}`;

  const japanese = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u.test(body);
  let bodySize = 75;
  const setBodyFont = () => { ctx.font = `500 ${bodySize}px ${sans}`; };
  ctx.save();
  setBodyFont();
  let lines = wrap(ctx, body, canvasWidth - 216, japanese);
  while (lines.length > 4 && bodySize > 50) {
    bodySize -= 3;
    setBodyFont();
    lines = wrap(ctx, body, canvasWidth - 216, japanese);
  }
  if (lines.length > 1) {
    const balancedWidth = Math.min(canvasWidth - 216, ctx.measureText(body).width / lines.length + bodySize * 1.75);
    const balanced = wrap(ctx, body, balancedWidth, japanese);
    if (balanced.length === lines.length) lines = balanced;
  }
  ctx.restore();

  const lineSpacing = bodySize * 1.36;
  const textHeight = titleSize + 86 + bodySize + (lines.length - 1) * lineSpacing;
  const titleY = (canvasHeight - textHeight) / 2 + titleSize / 2;
  ctx.fillText(title, middle, titleY, titleWidth);
  const separatorY = titleY + titleSize / 2 + 42;
  ctx.fillStyle = "#93734a";
  ctx.fillRect(middle - 43, separatorY, 86, 3);
  ctx.fillStyle = "#473426";
  setBodyFont();
  lines.forEach((line, index) => {
    ctx.fillText(line, middle, separatorY + 44 + bodySize / 2 + index * lineSpacing);
  });

  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 4;
  return new THREE.MeshStandardMaterial({
    map, roughness: .95, emissive: "#fff4e6", emissiveMap: map, emissiveIntensity: .44,
  });
}

function rail(group, material, width, height, depth, radius, y, z) {
  const mesh = new THREE.Mesh(new RoundedBoxGeometry(width, height, depth, 2, radius), material);
  mesh.position.set(0, y, z);
  group.add(mesh);
  return mesh;
}

export function createEndNotice(notice) {
  const board = new THREE.Group();
  board.name = "End of the gallery announcement";
  const surround = new THREE.MeshStandardMaterial({ color: "#342b26", roughness: .72 });
  const bronze = new THREE.MeshStandardMaterial({
    color: "#ac8360", metalness: .35, roughness: .47, emissive: "#322416", emissiveIntensity: .26,
  });
  const panel = new THREE.Mesh(new THREE.PlaneGeometry(paperWidth, paperHeight), printedNotice(notice));

  rail(board, surround, 3.60, 2.12, .095, .030, 0, .058);
  rail(board, bronze, 3.43, 1.95, .032, .014, 0, .109);
  panel.position.z = .126;
  board.add(panel);

  rail(board, surround, .32, .091, .16, .023, 1.22, .089);
  rail(board, bronze, 1.08, .078, .13, .026, 1.22, .211);
  const diffuser = new THREE.MeshBasicMaterial({ color: "#ffdbab", toneMapped: false });
  rail(board, diffuser, .93, .016, .052, .006, 1.181, .245).rotation.x = .25;
  return board;
}
