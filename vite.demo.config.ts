// Single-file demo build (no service worker, everything inlined) for sharing
// as one HTML page. Output: dist-demo/index.html
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  define: { 'import.meta.env.VITE_ROUTER': JSON.stringify('memory') },
  plugins: [react(), viteSingleFile()],
  build: { outDir: 'dist-demo', assetsInlineLimit: 100_000_000 },
});
