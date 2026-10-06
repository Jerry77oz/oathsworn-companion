import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

const basePath = '/oathsworn-companion/'

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'script-defer',
      includeAssets: ['apple-touch-icon.png'],
      manifest: {
        id: basePath,
        name: 'Oathsworn Campaign Companion',
        short_name: 'Oathsworn',
        description: 'A private, spoiler-safe Oathsworn campaign companion.',
        theme_color: '#141711',
        background_color: '#10120e',
        display: 'standalone',
        orientation: 'any',
        scope: basePath,
        start_url: basePath,
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        navigateFallback: `${basePath}index.html`,
        globPatterns: ['**/*.{css,html,js,png,svg,webmanifest}'],
      },
    }),
  ],
})
