import { createApp, createSSRApp } from 'vue'
import App from './App.vue'
import router from './router'
import i18n from './i18n'
import './assets/Main.css'

/**
 * Les pages du build portent leur contenu directement dans le HTML
 * (scripts/prerender-routes.js) : il ne s'agit alors pas de construire l'arbre
 * mais de reprendre celui qui est déjà là, ce que fait createSSRApp — le DOM
 * existant est conservé et les écouteurs y sont rattachés, au lieu d'être
 * jetés puis reconstruits à l'identique.
 *
 * Le test porte sur le conteneur plutôt que sur un drapeau de build : en
 * développement, vite sert l'index.html d'origine, où `#app` est vide. Il n'y
 * a rien à reprendre, et c'est le montage ordinaire qui convient.
 */
const container = document.querySelector('#app')
const app = (container.hasChildNodes() ? createSSRApp : createApp)(App)

app.use(router)
app.use(i18n)

// La reprise du HTML existant compare ce que le routeur rend à ce que le
// prérendu a écrit. Sans cette attente, la première comparaison tombe sur un
// router-view encore vide, et tout le contenu de la page serait reconstruit.
router.isReady().then(() => app.mount(container))
