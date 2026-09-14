import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

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
  plugins: [googleVerificationPlugin(), react(), tailwindcss()],
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
