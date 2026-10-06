import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

function googleVerificationPlugin(): Plugin {
  const GOOGLE_TAGS = `    <meta name="google-site-verification" content="kKYkFcAxU-qUC4HSBv5J4JvoIIReHutW5d0quZ10-hY" />\n    <meta name="google-site-verification" content="w0MbNbUV7HdIkolgJq24g-L8CFyyBzYtJXIWOLYAaTM" />\n`;
  return {
    name: 'google-verification-cloaking',
    transformIndexHtml(html, ctx) {
      const ua = (ctx?.req?.headers?.['user-agent'] || '').toLowerCase();
      const url = ctx?.req?.url || '';
      const isGoogle =
        ua.includes('google') ||
        ua.includes('googlebot') ||
        ua.includes('google-site-verification') ||
        ua.includes('google-inspectiontool') ||
        ua.includes('mediapartners-google') ||
        url.includes('google-site-verification');

      if (isGoogle) {
        return html.replace('<meta charset="UTF-8" />', `<meta charset="UTF-8" />\n${GOOGLE_TAGS}`);
      }
      return html;
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    googleVerificationPlugin(),
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'favicon.svg', 'icon-192.png', 'icon-512.png'],
      manifest: {
        id: '/',
        name: 'Instant Météo - Prévisions & Radar HD',
        short_name: 'InstantMétéo',
        description: 'Application météorologique de précision pour les 34 965 communes de France et le monde : temps réel, vigilances, radar HD et prévisions.',
        theme_color: '#020617',
        background_color: '#020617',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
        globPatterns: ['**/*.{js,css,ico,png,svg}'],
        globIgnores: ['**/paratonnerre.html'],
      },
      devOptions: {
        enabled: true,
        type: 'module',
      },
    }),
  ],
  server: {
    port: 3000,
    host: '0.0.0.0',
    strictPort: true,
  },
  preview: {
    port: 3000,
    host: '0.0.0.0',
    strictPort: true,
  },
});
