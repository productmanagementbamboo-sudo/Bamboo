import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'بامبو — بیمه‌ی تمام‌آنلاین',
        short_name: 'بامبو',
        description: 'صدور بیمه ثالث و بدنه، مدیریت حادثه و خسارت',
        lang: 'fa',
        dir: 'rtl',
        start_url: '/',
        display: 'standalone',
        background_color: '#05070C',
        theme_color: '#1F8A5B',
        icons: [
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,woff2}'],
        navigateFallback: '/index.html',
      },
    }),
  ],
});
