import { access, cp, mkdir, rm } from "node:fs/promises";
import { constants } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentFilePath = fileURLToPath(import.meta.url);
const scriptsDir = path.dirname(currentFilePath);
const projectRoot = path.resolve(scriptsDir, "..");

const nextExportDir = path.join(projectRoot, "out");
const distDir = path.join(projectRoot, "dist");
const cloudflarePagesDir = path.join(projectRoot, "cloudflare-pages", "bella-vista");

const assertNextExportExists = async () => {
  try {
    await access(nextExportDir, constants.F_OK);
  } catch {
    throw new Error(
      "Pasta 'out' nao encontrada. Rode `npm run build` antes de preparar o pacote do Cloudflare."
    );
  }
};

await assertNextExportExists();

await rm(distDir, { recursive: true, force: true });
await rm(cloudflarePagesDir, { recursive: true, force: true });

await mkdir(path.dirname(cloudflarePagesDir), { recursive: true });

await cp(nextExportDir, distDir, { recursive: true });
await cp(nextExportDir, cloudflarePagesDir, { recursive: true });

console.log("Pacote Cloudflare gerado em:");
console.log(`- ${distDir}`);
console.log(`- ${cloudflarePagesDir}`);
