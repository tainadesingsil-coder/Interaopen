import { mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import sharp from 'sharp';

const SOURCE_URL =
  'https://i.postimg.cc/Qt6LPq29/Chat-GPT-Image-25-de-fev-de-2026-00-31-56-removebg-preview.png';

const OUTPUTS = [
  { size: 512, path: resolve('public/icons/marcinha-premium.png') },
  { size: 192, path: resolve('public/icons/marcinha-premium-192.png') },
];

async function fetchBuffer(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Falha ao baixar imagem (${res.status})`);
  const ab = await res.arrayBuffer();
  return Buffer.from(ab);
}

function bgSvg(size) {
  const r = Math.round(size * 0.22);
  const stroke = Math.max(2, Math.round(size * 0.012));
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#7a3e18"/>
      <stop offset="55%" stop-color="#4a1f0c"/>
      <stop offset="100%" stop-color="#251005"/>
    </linearGradient>
    <radialGradient id="whiteGlow" cx="50%" cy="5%" r="72%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.94"/>
      <stop offset="18%" stop-color="#fffefb" stop-opacity="0.66"/>
      <stop offset="36%" stop-color="#fff7eb" stop-opacity="0.34"/>
      <stop offset="62%" stop-color="#ffffff" stop-opacity="0"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="topSheen" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.35"/>
      <stop offset="30%" stop-color="#ffffff" stop-opacity="0.14"/>
      <stop offset="72%" stop-color="#ffffff" stop-opacity="0"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="warmEdge" cx="50%" cy="100%" r="85%">
      <stop offset="0%" stop-color="#c89840" stop-opacity="0.22"/>
      <stop offset="68%" stop-color="#8f4f20" stop-opacity="0.08"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.2"/>
    </radialGradient>
  </defs>
  <rect x="0" y="0" width="${size}" height="${size}" rx="${r}" fill="url(#bg)"/>
  <rect x="0" y="0" width="${size}" height="${size}" rx="${r}" fill="url(#whiteGlow)"/>
  <rect x="0" y="0" width="${size}" height="${Math.round(size * 0.58)}" rx="${r}" fill="url(#topSheen)"/>
  <rect x="0" y="0" width="${size}" height="${size}" rx="${r}" fill="url(#warmEdge)"/>
  <rect x="${stroke}" y="${stroke}" width="${size - stroke * 2}" height="${size - stroke * 2}" rx="${r - stroke}" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="${stroke}"/>
</svg>`;
}

function mascotAuraSvg(size, mascotTop, mascotHeight) {
  const cx = Math.round(size / 2);
  const cy = Math.round(mascotTop + mascotHeight * 0.33);
  const rx = Math.round(size * 0.34);
  const ry = Math.round(size * 0.31);
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <radialGradient id="mascotAura" cx="50%" cy="50%" r="62%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.33"/>
      <stop offset="45%" stop-color="#f5e6d0" stop-opacity="0.14"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#mascotAura)"/>
</svg>`;
}

function mascotShadowSvg(size, mascotTop, mascotHeight) {
  const cx = Math.round(size / 2);
  const cy = Math.round(mascotTop + mascotHeight * 0.86);
  const rx = Math.round(size * 0.24);
  const ry = Math.max(10, Math.round(size * 0.06));
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#140700" fill-opacity="0.55"/>
</svg>`;
}

async function renderOne(size, sourceBuffer, outPath) {
  const mascotPng = await sharp(sourceBuffer)
    .trim()
    .resize({
      width: Math.round(size * 0.84),
      height: Math.round(size * 0.86),
      fit: 'contain',
      withoutEnlargement: false,
    })
    .modulate({ brightness: 1.03, saturation: 1.06 })
    .sharpen(1.1)
    .png()
    .toBuffer();

  const mascotMeta = await sharp(mascotPng).metadata();
  const mascotWidth = mascotMeta.width || Math.round(size * 0.84);
  const mascotHeight = mascotMeta.height || Math.round(size * 0.86);
  const left = Math.round((size - mascotWidth) / 2);
  const top = Math.round(size * 0.1);

  const icon = await sharp(Buffer.from(bgSvg(size)))
    .composite([
      { input: Buffer.from(mascotAuraSvg(size, top, mascotHeight)), blend: 'screen' },
      { input: Buffer.from(mascotShadowSvg(size, top, mascotHeight)), blend: 'multiply' },
      { input: mascotPng, top, left },
    ])
    .png()
    .toBuffer();

  await mkdir(dirname(outPath), { recursive: true });
  await sharp(icon).png({ quality: 100, compressionLevel: 9 }).toFile(outPath);
}

async function main() {
  const sourceBuffer = await fetchBuffer(SOURCE_URL);
  for (const out of OUTPUTS) {
    await renderOne(out.size, sourceBuffer, out.path);
    console.log(`Gerado: ${out.path}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
