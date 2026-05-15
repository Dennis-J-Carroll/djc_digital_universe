import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [svelte()],
  base: '/apps/convergence/',
  build: {
    outDir: resolve(__dirname, '../../static/apps/convergence'),
    emptyOutDir: true,
  },
  test: {
    environment: 'node',
  },
});
