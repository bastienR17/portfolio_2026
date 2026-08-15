import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

// `seoKey` pointe vers seo.<clé>.title / .description dans les locales.
// useSeo() s'en sert pour mettre à jour le <head> à chaque navigation.
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { seoKey: 'home' }
    },
    {
      path: '/about',
      name: 'about',
      // On utilise le "lazy-loading" pour la performance
      component: () => import('../views/AboutView.vue'),
      meta: { seoKey: 'about' }
    },
    {
      path: '/projects',
      name: 'projects',
      component: () => import('../views/ProjectsView.vue'),
      meta: { seoKey: 'projects' }
    },
    {
      path: '/contact',
      name: 'contact',
      component: () => import('../views/ContactView.vue'),
      meta: { seoKey: 'contact' }
    },
    {
      path: '/prestations',
      name: 'prestations',
      component: () => import('../views/PrestationsView.vue'),
      meta: { seoKey: 'prestations' }
    },
    {
      path: '/mentions-legales',
      name: 'legal',
      component: () => import('../views/LegalView.vue'),
      meta: { seoKey: 'legal' }
    },
    {
      // Sans cette route, toute URL inconnue affichait une page vide : le
      // rewrite Vercel renvoie index.html pour n'importe quel chemin, et aucune
      // route ne correspondait.
      path: '/:pathMatch(.*)*',
      name: 'notfound',
      component: () => import('../views/NotFoundView.vue'),
      meta: { seoKey: 'notfound', noindex: true }
    }
  ],
  // Petit bonus : revient en haut de page automatiquement lors d'un changement de vue
  scrollBehavior(to) {
    if (!to.hash) return { top: 0 }

    // Les ancres internes (#offre) gardent leur défilement animé — sauf pour
    // qui a demandé moins de mouvement. La règle `scroll-behavior: auto` de
    // Main.css ne couvre que le défilement piloté par CSS : une option passée
    // en JavaScript lui échappe, et l'animation se jouait quand même.
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    return { el: to.hash, behavior: reduced ? 'auto' : 'smooth' }
  }
})

export default router
