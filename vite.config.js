import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

import { SITE, SITE_URL } from './src/config/site.js'

/**
 * Remplace les valeurs de src/config/site.js dans index.html :
 * %SITE_URL% (canonical, Open Graph, JSON-LD) et %CV_PATH% (le lien
 * `rel="alternate"` vers le PDF).
 *
 * Évite d'avoir ces valeurs en dur à la fois dans le HTML et dans la config :
 * une seule ligne à changer lors du passage au domaine définitif, un seul
 * endroit à corriger quand le CV est remplacé.
 */
const injectSiteUrl = () => ({
  name: 'inject-site-url',
  transformIndexHtml(html) {
    return html.replaceAll('%SITE_URL%', SITE_URL).replaceAll('%CV_PATH%', SITE.cv.path)
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
