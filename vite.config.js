import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

import { SITE, SITE_URL } from './src/config/site.js'
import fr from './src/locales/fr.json' with { type: 'json' }

/**
 * Remplace dans index.html les valeurs qui n'ont le droit d'exister qu'une
 * fois : celles de src/config/site.js, plus le texte de remplacement de
 * l'image de partage, qui vient des traductions puisqu'il est lu par un
 * humain. Le français sert de valeur de départ ; useSeo() le repasse dans la
 * langue affichée.
 *
 * Évite d'avoir ces valeurs en dur à la fois dans le HTML et dans la config :
 * une seule ligne à changer lors du passage au domaine définitif, un seul
 * endroit à corriger quand le CV ou l'image de partage sont remplacés.
 */
const esc = (s) =>
  String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;')

const injectSiteUrl = () => ({
  name: 'inject-site-url',
  transformIndexHtml(html) {
    const values = {
      SITE_URL: SITE_URL,
      SITE_NAME: SITE.name,
      CV_PATH: SITE.cv.path,
      OG_IMAGE: SITE.ogImage.url,
      OG_IMAGE_WIDTH: SITE.ogImage.width,
      OG_IMAGE_HEIGHT: SITE.ogImage.height,
      OG_IMAGE_ALT: fr.seo.ogImageAlt,
    }
    for (const [key, value] of Object.entries(values)) {
      html = html.replaceAll(`%${key}%`, esc(value))
    }

    /**
     * Un marqueur oublié ne casse rien de visible : il part en production tel
     * quel, et c'est « %OG_IMAGE_ALT% » que LinkedIn affiche. Mieux vaut
     * refuser de construire.
     */
    const left = [...html.matchAll(/%[A-Z_]+%/g)].map((m) => m[0])
    if (left.length) {
      throw new Error(
        `inject-site-url : marqueur sans valeur dans index.html : ${[...new Set(left)].join(', ')}.\n` +
          `Ajouter la clé correspondante dans ce plugin, ou retirer le marqueur.`,
      )
    }
    return html
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
