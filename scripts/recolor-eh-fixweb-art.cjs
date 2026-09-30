#!/usr/bin/env node
/**
 * Recolor /uploads/fixweb → /uploads/fixweb-eh for Extra Hosting.
 *
 * Uses luminosity blend: keep original clay shading, paint with brand chroma.
 *   purple family → navy  #0a4f9c
 *   teal family   → light #1e9bff
 *
 * 000-it.com keeps originals under /uploads/fixweb/.
 */
const fs = require("node:fs");
const path = require("node:path");
const sharp = require("sharp");

const ROOT = path.join(__dirname, "..");
const SRC = path.join(ROOT, "public/uploads/fixweb");
const DST = path.join(ROOT, "public/uploads/fixweb-eh");

const NAVY = { r: 0x0a / 255, g: 0x4f / 255, b: 0x9c / 255 }; // #0a4f9c
const SKY = { r: 0x1e / 255, g: 0x9b / 255, b: 0xff / 255 }; // #1e9bff

function lum(r, g, b) {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function clipColor(r, g, b) {
  const L = lum(r, g, b);
  const min = Math.min(r, g, b);
  if (min < 0) {
    const t = L / (L - min);
    r = L + (r - L) * t;
    g = L + (g - L) * t;
    b = L + (b - L) * t;
  }
  const max2 = Math.max(r, g, b);
  if (max2 > 1) {
    const t = (1 - L) / (max2 - L);
    r = L + (r - L) * t;
    g = L + (g - L) * t;
    b = L + (b - L) * t;
  }
  return [
    Math.min(1, Math.max(0, r)),
    Math.min(1, Math.max(0, g)),
    Math.min(1, Math.max(0, b)),
  ];
}

/** Paint brand color while keeping source luminosity (soft clay shading). */
function setLum(brand, L) {
  const d = L - lum(brand.r, brand.g, brand.b);
  return clipColor(brand.r + d, brand.g + d, brand.b + d);
}

function rgbToHls(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, l, 0];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h;
  switch (max) {
    case r:
      h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
      break;
    case g:
      h = ((b - r) / d + 2) / 6;
      break;
    default:
      h = ((r - g) / d + 4) / 6;
      break;
  }
  return [h, l, s];
}

function recolorBuffer(data) {
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 8) continue;

    const r = data[i] / 255;
    const g = data[i + 1] / 255;
    const b = data[i + 2] / 255;
    const [h, , s] = rgbToHls(r, g, b);
    if (s < 0.06) continue;

    const hd = h * 360;
    let brand = null;
    let L = lum(r, g, b);

    if (hd >= 230 && hd <= 310) {
      brand = NAVY;
    } else if (hd >= 145 && hd <= 200) {
      brand = SKY;
      // Accents read clearly lighter than navy bodies
      L = Math.min(0.78, L * 1.12 + 0.05);
    } else {
      continue;
    }

    const [nr, ng, nb] = setLum(brand, L);
    data[i] = Math.round(nr * 255);
    data[i + 1] = Math.round(ng * 255);
    data[i + 2] = Math.round(nb * 255);
  }
}

async function processFile(name) {
  const input = path.join(SRC, name);
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  recolorBuffer(data);
  await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(path.join(DST, name));
}

async function main() {
  fs.mkdirSync(DST, { recursive: true });
  const only = process.argv.slice(2);
  const names = fs
    .readdirSync(SRC)
    .filter((n) => n.endsWith(".png"))
    .filter((n) => (only.length ? only.includes(n) : true))
    .sort();
  for (let i = 0; i < names.length; i++) {
    await processFile(names[i]);
    console.log(`${i + 1}/${names.length} ${names[i]}`);
  }
  console.log("done");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
