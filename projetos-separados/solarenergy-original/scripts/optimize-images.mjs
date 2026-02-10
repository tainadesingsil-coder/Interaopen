import path from 'node:path';
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import sharp from 'sharp';

const SIZES = [480, 768, 1024, 1440];
const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png']);

const root = path.join(process.cwd(), 'public', 'images');

const walk = async (dir) => {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const res = path.resolve(dir, entry.name);
      return entry.isDirectory() ? walk(res) : res;
    })
  );
  return files.flat();
};

const isSourceImage = (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  if (!IMAGE_EXTENSIONS.has(ext)) return false;
  if (filePath.includes(`${path.sep}optimized${path.sep}`)) return false;
  if (/-\d+\.(jpg|jpeg|png)$/i.test(filePath)) return false;
  return true;
};

const ensureDir = async (dir) => {
  if (!existsSync(dir)) {
    await fs.mkdir(dir, { recursive: true });
  }
};

const optimizeImage = async (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  const base = filePath.slice(0, -ext.length);

  const image = sharp(filePath);

  await Promise.all(
    SIZES.map(async (size) => {
      const resize = image.clone().resize({ width: size, withoutEnlargement: true });
      const targetRaster = `${base}-${size}${ext}`;
      const targetWebp = `${base}-${size}.webp`;

      if (!existsSync(targetRaster)) {
        if (ext === '.png') {
          await resize.png({ compressionLevel: 9 }).toFile(targetRaster);
        } else {
          await resize.jpeg({ quality: 82 }).toFile(targetRaster);
        }
      }

      if (!existsSync(targetWebp)) {
        await resize.webp({ quality: 80 }).toFile(targetWebp);
      }
    })
  );
};

const run = async () => {
  await ensureDir(root);
  const files = await walk(root);
  const sources = files.filter(isSourceImage);

  for (const file of sources) {
    // eslint-disable-next-line no-console
    console.log(`Optimizing ${path.relative(process.cwd(), file)}`);
    await optimizeImage(file);
  }

  // eslint-disable-next-line no-console
  console.log('✅ Imagens otimizadas.');
};

run();
