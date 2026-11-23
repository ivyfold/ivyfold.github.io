import * as THREE from "three";

const WIDTH = 768;
const HEIGHT = 1664;
const INSET = 67;
const ICON_SIZE = 400;
const TITLE_FACE = 'Baskerville, "Hiragino Mincho ProN", "Yu Mincho", Georgia, serif';
const TAGLINE_FACE = '"Avenir Next", "Hiragino Sans", "Yu Gothic", sans-serif';

const palettes = {
  leafia: {
    top: "#faf6e9", bottom: "#dfe7d4", glow: "#fffdf5",
    name: "#243d2d", lead: "#40604c", shadow: "#32422d45",
    wallpaper: { focusX: .5, tint: "#fff9ed54" },
  },
  widgetgame: {
    top: "#19263c", bottom: "#0b1020", glow: "#273b62",
    name: "#fff2dc", lead: "#d7deed", shadow: "#01030db3",
    wallpaper: { focusX: .66, tint: "#080b1c66" },
  },
  studyseed: {
    top: "#fef3df", bottom: "#ead1ad", glow: "#fff9eb",
    name: "#48301d", lead: "#745039", shadow: "#321b13a8",
    wallpaper: { focusX: .66, tint: "#29170eb0", name: "#fff6e8", lead: "#fff0d7" },
  },
};

function breakPoints(text) {
  if (typeof Intl.Segmenter !== "function") {
    return [...text.matchAll(/[\s\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/gu)]
      .map(match => match.index + match[0].length);
  }
  const language = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u.test(text) ? "ja" : "en";
  return [...new Intl.Segmenter(language, { granularity: "word" }).segment(text)]
    .slice(1).map(segment => segment.index);
}

function fitTagline(context, text, limit) {
  for (let size = 57; size >= 49; size -= 2) {
    context.font = `500 ${size}px ${TAGLINE_FACE}`;
    if (context.measureText(text).width <= limit) return { lines: [text], size };
  }
  const splits = breakPoints(text).map(index => [text.slice(0, index).trim(), text.slice(index).trim()])
    .filter(([first, last]) => first && last && !/^[、。,.!?:;！？）」』]/.test(last));
  for (let size = 57; size >= 39; size -= 2) {
    context.font = `500 ${size}px ${TAGLINE_FACE}`;
    const fit = splits.map(lines => ({ lines, width: Math.max(...lines.map(line => context.measureText(line).width)) }))
      .filter(candidate => candidate.width <= limit).sort((a, b) => a.width - b.width)[0];
    if (fit) return { lines: fit.lines, size };
  }
  return { lines: [text], size: 39 };
}

function roundedIcon(context, x, y, size) {
  const radius = size * .225;
  context.beginPath();
  context.moveTo(x + radius, y);
  context.arcTo(x + size, y, x + size, y + size, radius);
  context.arcTo(x + size, y + size, x, y + size, radius);
  context.arcTo(x, y + size, x, y, radius);
  context.arcTo(x, y, x + size, y, radius);
  context.closePath();
}

function paintWallpaper(context, image, style, textTop, textBottom) {
  const width = image?.naturalWidth ?? image?.width;
  const height = image?.naturalHeight ?? image?.height;
  if (!width || !height) return false;

  const scale = Math.max(WIDTH / width, HEIGHT / height);
  const drawnWidth = width * scale;
  const drawnHeight = height * scale;
  context.imageSmoothingQuality = "high";
  context.drawImage(image, (WIDTH - drawnWidth) * style.focusX, (HEIGHT - drawnHeight) / 2,
    drawnWidth, drawnHeight);

  const top = textTop - 160;
  const bottom = textBottom + 200;
  const wash = context.createLinearGradient(0, top, 0, bottom);
  const transparent = `${style.tint.slice(0, 7)}00`;
  wash.addColorStop(0, transparent);
  wash.addColorStop((textTop - top) / (bottom - top), style.tint);
  wash.addColorStop((textBottom - top) / (bottom - top), style.tint);
  wash.addColorStop(1, transparent);
  context.fillStyle = wash;
  context.fillRect(0, top, WIDTH, bottom - top);
  return true;
}

function paintFallback(context, palette) {
  const background = context.createLinearGradient(0, 0, WIDTH * .52, HEIGHT);
  background.addColorStop(0, palette.top);
  background.addColorStop(1, palette.bottom);
  context.fillStyle = background;
  context.fillRect(0, 0, WIDTH, HEIGHT);
  const glow = context.createRadialGradient(WIDTH * .46, HEIGHT * .36, 10, WIDTH * .46, HEIGHT * .36, 660);
  glow.addColorStop(0, palette.glow);
  glow.addColorStop(1, `${palette.glow}00`);
  context.fillStyle = glow;
  context.fillRect(0, 0, WIDTH, HEIGHT);
}

export function createPhoneDisplay(room, iconTexture, wallpaperTexture) {
  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const context = canvas.getContext("2d");
  const texture = new THREE.CanvasTexture(canvas);
  texture.name = `${room.name} exhibit phone display`;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;

  const palette = palettes[room.id] ?? palettes.studyseed;
  const tagline = String(room.displayTagline || room.summary || "").trim();
  const span = WIDTH - 2 * INSET;

  function update() {
    if (!context) return;

    const name = String(room.name);
    let nameSize = 98;
    context.font = `600 ${nameSize}px ${TITLE_FACE}`;
    while (nameSize > 52 && context.measureText(name).width > span) {
      nameSize -= 2;
      context.font = `600 ${nameSize}px ${TITLE_FACE}`;
    }
    const { lines, size: taglineSize } = fitTagline(context, tagline, span);
    const titleGap = 74;
    const taglineGap = 30;
    const leading = taglineSize * 1.3;
    const blockHeight = ICON_SIZE + titleGap + nameSize + taglineGap + leading * lines.length;
    const left = (WIDTH - ICON_SIZE) / 2;
    const top = HEIGHT * .466 - blockHeight / 2;
    const nameTop = top + ICON_SIZE + titleGap;
    const hasWallpaper = paintWallpaper(context, wallpaperTexture?.image, palette.wallpaper,
      nameTop, top + blockHeight);
    if (!hasWallpaper) paintFallback(context, palette);

    const iconImage = iconTexture?.image;
    if ((iconImage?.naturalWidth ?? iconImage?.width) > 0 && (iconImage?.naturalHeight ?? iconImage?.height) > 0) {
      context.save();
      roundedIcon(context, left, top, ICON_SIZE);
      context.shadowBlur = 30;
      context.shadowOffsetY = 13;
      context.shadowColor = palette.shadow;
      context.fillStyle = palette.bottom;
      context.fill();
      context.shadowColor = "transparent";
      context.clip();
      context.imageSmoothingQuality = "high";
      context.drawImage(iconImage, left, top, ICON_SIZE, ICON_SIZE);
      context.restore();
    }

    const colors = hasWallpaper ? palette.wallpaper : palette;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillStyle = colors.name ?? palette.name;
    context.font = `600 ${nameSize}px ${TITLE_FACE}`;
    context.fillText(name, WIDTH / 2, nameTop + nameSize * .5, span);
    context.fillStyle = colors.lead ?? palette.lead;
    context.font = `500 ${taglineSize}px ${TAGLINE_FACE}`;
    lines.forEach((line, index) => context.fillText(line, WIDTH / 2,
      nameTop + nameSize + taglineGap + leading * (index + .5), span));
    texture.needsUpdate = true;
  }

  update();
  return { texture, update };
}
