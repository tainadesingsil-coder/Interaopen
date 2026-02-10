import { createWriteStream, existsSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';
import { spawn } from 'node:child_process';

const rootDir = process.cwd();
const assetsDir = path.join(rootDir, 'public', 'images');

const downloads = [
  // Hero poster
  {
    url: 'https://res.cloudinary.com/dwedcl97k/video/upload/so_0,f_jpg,w_1600/v1769199580/Design_sem_nome_-_2026-01-23T171932.339_fjulxo.mp4',
    dest: 'hero/hero-poster.jpg',
  },
  // Showcase - studio
  { url: 'https://i.postimg.cc/mksDjFhJ/Whats-App-Image-2026-01-22-at-12-04-21.jpg', dest: 'showcase/studio-1.jpg' },
  { url: 'https://i.postimg.cc/GpTm1jyg/Whats-App-Image-2026-01-22-at-12-04-21-(2).jpg', dest: 'showcase/studio-2.jpg' },
  { url: 'https://i.postimg.cc/mDNRbp2p/Whats-App-Image-2026-01-22-at-12-04-21-(1).jpg', dest: 'showcase/studio-3.jpg' },
  // Showcase - 2 bedrooms
  { url: 'https://i.postimg.cc/pV5VhCch/Whats-App-Image-2026-01-22-at-12-04-20.jpg', dest: 'showcase/apt-2-1.jpg' },
  { url: 'https://i.postimg.cc/vZYdztXF/Whats-App-Image-2026-01-22-at-12-04-20-(1).jpg', dest: 'showcase/apt-2-2.jpg' },
  { url: 'https://i.postimg.cc/1zbTLGGj/Whats-App-Image-2026-01-22-at-12-04-20-(2).jpg', dest: 'showcase/apt-2-3.jpg' },
  { url: 'https://i.postimg.cc/m2Tqf29C/Design-sem-nome-2026-01-24T013521-711.png', dest: 'showcase/apt-2-4.png' },
  // Showcase - 3 bedrooms
  { url: 'https://i.postimg.cc/LsrVzVfh/CASA-TIPO-E-5.png', dest: 'showcase/apt-3-1.png' },
  { url: 'https://i.postimg.cc/xTtysQMH/CASA-TIPO-E-6.png', dest: 'showcase/apt-3-2.png' },
  // Showcase - amenities
  { url: 'https://i.postimg.cc/kX7Z3XSm/Design-sem-nome-2026-01-24T013513-644.png', dest: 'showcase/amenities-1.png' },
  { url: 'https://i.postimg.cc/6QBTCZ4p/Design-sem-nome-2026-01-24T013506-098.png', dest: 'showcase/amenities-2.png' },
  { url: 'https://i.postimg.cc/gJTJ9BM5/Design-sem-nome-2026-01-24T013459-346.png', dest: 'showcase/amenities-3.png' },
  { url: 'https://i.postimg.cc/qq67pXS1/Design-sem-nome-2026-01-24T013356-074.png', dest: 'showcase/amenities-4.png' },
  // Progress gallery
  { url: 'https://i.postimg.cc/bwQR1PBD/20251204-082816-(1).jpg', dest: 'progress/progress-1.jpg' },
  { url: 'https://i.postimg.cc/tT7mRvNb/20251204-082550-(1).jpg', dest: 'progress/progress-2.jpg' },
  { url: 'https://i.postimg.cc/9fwJvwmZ/20251204-082247-(1).jpg', dest: 'progress/progress-3.jpg' },
  { url: 'https://i.postimg.cc/90rCyBPd/20251113-080300.jpg', dest: 'progress/progress-4.jpg' },
];

const ensureDir = async (dir) => {
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }
};

const downloadFile = async (url, outputPath) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download ${url}: ${response.status}`);
  }
  await ensureDir(path.dirname(outputPath));
  const fileStream = createWriteStream(outputPath);
  await pipeline(response.body, fileStream);
};

const runOptimize = () =>
  new Promise((resolve, reject) => {
    const proc = spawn('node', [path.join(rootDir, 'scripts', 'optimize-images.mjs')], {
      stdio: 'inherit',
    });
    proc.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Optimization failed with code ${code}`));
    });
  });

const run = async () => {
  await ensureDir(assetsDir);
  // eslint-disable-next-line no-console
  console.log('Downloading images...');
  for (const item of downloads) {
    const outputPath = path.join(assetsDir, item.dest);
    // eslint-disable-next-line no-console
    console.log(`→ ${item.dest}`);
    await downloadFile(item.url, outputPath);
  }
  // eslint-disable-next-line no-console
  console.log('Running WebP optimization...');
  await runOptimize();
  // eslint-disable-next-line no-console
  console.log('✅ Images downloaded and optimized.');
};

run().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exit(1);
});
