/**
 * Entrée de rendu côté Node. Sert uniquement au prérendu
 * (scripts/prerender-routes.js) ; rien de tout ceci n'atteint le navigateur.
 *
 * Jusqu'ici le build ne produisait qu'un corps vide — `<div id="app"></div>` —
 * et les 2 300 mots du site n'existaient que dans le bundle JavaScript. Google
 * exécute le script, mais dans une seconde passe et avec du retard ; Bing,
 * Qwant et la plupart des agents ne l'exécutent pas du tout. Le contenu est
 * désormais écrit dans la réponse HTTP, pour les six routes.
 *
 * Le routeur et i18n restent les instances partagées du site : le prérendu
 * tourne dans un process jetable qui rend les routes l'une après l'autre, et
 * chaque passage réécrit l'état par `router.replace()`. Ce qui vaudrait pour
 * un vrai serveur — une instance par requête, pour qu'aucune fuite d'état ne
 * se produise entre deux visiteurs simultanés — ne s'applique pas ici.
 */
import { createSSRApp } from 'vue'
import { renderToString } from 'vue/server-renderer'
import App from './App.vue'
import router from './router'
import i18n from './i18n'

export async function render(url) {
  const app = createSSRApp(App)
  app.use(router)
  app.use(i18n)

  await router.replace(url)
  await router.isReady()

  return renderToString(app)
}
