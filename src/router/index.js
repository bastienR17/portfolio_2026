import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/about',
      name: 'about',
      // On utilise le "lazy-loading" pour la performance
      component: () => import('../views/AboutView.vue')
    },
    {
      path: '/projects',
      name: 'projects',
      component: () => import('../views/ProjectsView.vue')
    },
    {
      path: '/contact',
      name: 'contact',
      component: () => import('../views/ContactView.vue')
    },
    {
      path: '/prestations',
      name: 'prestations',
      component: () => import('../views/PrestationsView.vue')
    },
    {
      path: '/mentions-legales',
      name: 'legal',
      component: () => import('../views/LegalView.vue')
    }
  ],
  // Petit bonus : revient en haut de page automatiquement lors d'un changement de vue
  scrollBehavior() {
    return { top: 0 }
  }
})

export default router