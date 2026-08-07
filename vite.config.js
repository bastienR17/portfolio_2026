import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

import { SITE_URL } from './src/config/site.js'

/**
 * Remplace %SITE_URL% dans index.html (canonical, Open Graph, JSON-LD).
 * Évite d'avoir le domaine en dur à la fois dans le HTML et dans
 * src/config/site.js : une seule ligne à changer lors du passage au domaine
 * définitif.
 */
const injectSiteUrl = () => ({
  name: 'inject-site-url',
  transformIndexHtml(html) {
    return html.replaceAll('%SITE_URL%', SITE_URL)
  },
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    injectSiteUrl(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
