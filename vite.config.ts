/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Rep Counter',
        short_name: 'Reps',
        description:
          'Count calisthenics reps in real time with your webcam — fully on-device.',
        theme_color: '#0a0a0a',
        background_color: '#0a0a0a',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'pwa-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        // MoveNet model files are fetched from Google's model hosts at runtime.
        // Cache them so the app loads offline on repeat visits.
        runtimeCaching: [
          {
            urlPattern:
              /^https:\/\/(storage\.googleapis\.com|www\.kaggle\.com|tfhub\.dev|kaggle\.com)\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'tfjs-models',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 60, // 60 days
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    include: ['tests/**/*.test.{ts,tsx}'],
  },
});
