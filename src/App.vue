<script setup>
import { ref, onMounted, defineAsyncComponent } from 'vue'
import { RouterView } from 'vue-router'
import SiteNavbar from './components/layout/SiteNavbar.vue'
import SiteFooter from './components/layout/SiteFooter.vue'
import FontSwitcher from './components/common/FontSwitcher.vue'
import { useSeo } from './composables/useSeo'

// Le décor 3D embarque three.js (~500 Ko) pour un simple fond d'écran.
// En plus d'être dans son propre chunk, son téléchargement attend que le
// navigateur soit inactif : il ne dispute jamais la bande passante au contenu.
// Le timeout garantit qu'il finit par se charger même sur une page très active.
const Experience3D = defineAsyncComponent(
  () =>
    new Promise((resolve) => {
      const load = () => resolve(import('./components/common/Experience3D.vue'))
      if ('requestIdleCallback' in window) requestIdleCallback(load, { timeout: 2500 })
      else setTimeout(load, 400)
    }),
)

// Synchronise <title>, description, canonical et Open Graph avec la route
// et la langue courantes.
useSeo()

const isLoading = ref(true)

onMounted(() => {
  // Le rideau se lève dès que l'app est réellement prête. L'ancien délai fixe
  // de 1,5 s retardait le LCP pour tout le monde sans rien attendre de réel.
  requestAnimationFrame(() => {
    isLoading.value = false
  })
})
</script>

<template>
  <div class="min-h-screen text-ink transition-colors duration-300">

    <Transition name="reveal">
      <div v-if="isLoading" class="fixed inset-0 z-[1000] bg-page flex items-center justify-center">
        <div class="flex flex-col items-center">
          <span class="font-display text-5xl text-accent">
            B<span class="text-ink">.</span>R
          </span>
          <div class="mt-6 w-24 h-px bg-line-soft overflow-hidden">
            <div class="h-full bg-accent animate-progress"></div>
          </div>
        </div>
      </div>
    </Transition>

    <Experience3D />

    <!-- RGAA 12.7 — permet d'atteindre le contenu sans retraverser la
         navigation au clavier. Invisible tant qu'il n'a pas le focus. -->
    <a href="#contenu" class="skip-link">
      {{ $t('accessibility.skip') }}
    </a>

    <SiteNavbar class="relative z-50" />
    <FontSwitcher />

    <main id="contenu" tabindex="-1" class="relative z-10 focus:outline-none">
      <router-view v-slot="{ Component }">
        <Transition name="page" mode="out-in">
          <component :is="Component" />
        </Transition>
      </router-view>
    </main>

    <SiteFooter />
  </div>
</template>

<style>
/* Animation de sortie du rideau */
.reveal-leave-active {
  transition: all 0.8s cubic-bezier(0.7, 0, 0.3, 1);
}

.reveal-leave-to {
  opacity: 0;
  transform: scale(1.05); /* Effet de zoom arrière à la sortie */
  filter: blur(20px);
}

/* Transitions de page */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.page-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.page-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Animation de la barre de progression */
@keyframes progress {
  0% { width: 0%; transform: translateX(-100%); }
  50% { width: 100%; transform: translateX(0); }
  100% { width: 0%; transform: translateX(100%); }
}
.animate-progress {
  animation: progress 2s infinite ease-in-out;
}

@media (prefers-reduced-motion: reduce) {
  .reveal-leave-active,
  .page-enter-active,
  .page-leave-active {
    transition-duration: 0.01ms;
  }
  .animate-progress {
    animation: none;
  }
}

body {
  margin: 0;
  padding: 0;
  overflow-x: hidden;
}

#app {
  min-height: 100vh;
}
</style>
