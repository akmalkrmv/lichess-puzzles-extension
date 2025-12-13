import {build} from 'esbuild';
import {readdirSync} from 'node:fs';
import {join} from 'node:path';

const contentDir = 'src/content';
const outDir = 'dist/content';

// Collect all .ts files in src/content
const entryPoints = readdirSync(contentDir)
  .filter((file) => file.endsWith('.ts'))
  .map((file) => join(contentDir, file));

if (entryPoints.length === 0) {
  console.log('No content scripts found.');
  process.exit(0);
}

await build({
  entryPoints,
  bundle: true,
  target: 'es2020',
  format: 'iife', // required for content scripts
  outdir: outDir,
  sourcemap: true,
  logLevel: 'info',
});
