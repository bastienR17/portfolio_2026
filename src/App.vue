<script setup>
import { ref, onMounted, defineAsyncComponent } from 'vue'
import { RouterView } from 'vue-router'
import SiteNavbar from './components/layout/SiteNavbar.vue'
import SiteFooter from './components/layout/SiteFooter.vue'
import FontSwitcher from './components/common/FontSwitcher.vue'
import MagneticCursor from './components/common/MagneticCursor.vue'
import { useSeo } from './composables/useSeo'
import { canRender3D } from './composables/canRender3D'

// Le décor 3D embarque three.js (~500 Ko) pour un simple fond d'écran.
// En plus d'être dans son propre chunk, son téléchargement attend que le
// navigateur soit inactif : il ne dispute jamais la bande passante au contenu.
// Le timeout garantit qu'il finit par se charger même sur une page très active.
//
// Le test de capacité est fait ici, dans le même temps mort : sur une machine
// qui ne peut pas payer le décor, on résout sur un composant vide et le chunk
// n'est jamais demandé.
const Experience3D = defineAsyncComponent(
  () =>
    new Promise((resolve) => {
      const load = () => {
        if (!canRender3D()) resolve({ render: () => null })
        else resolve(import('./components/common/Experience3D.vue'))
      }
      if ('requestIdleCallback' in window) requestIdleCallback(load, { timeout: 2500 })
      else setTimeout(load, 400)
    }),
)

// Panneau de diagnostic. Le ternaire est résolu au build : `import.meta.env.DEV`
// devient littéralement false, la branche d'import dynamique est éliminée et
// DebugPanel.vue ne produit aucun chunk en production.
const DebugPanel = import.meta.env.DEV
  ? defineAsyncComponent(() => import('./components/common/DebugPanel.vue'))
  : null

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
          <span class="font-display text-7xl md:text-8xl text-ink tracking-tight">
            B<span class="text-accent">.</span>R
          </span>
          <div class="mt-6 w-32 h-[3px] bg-line-soft overflow-hidden">
            <div class="h-full bg-accent animate-progress"></div>
          </div>
        </div>
      </div>
    </Transition>

    <Experience3D />

    <!-- Grain décoratif, au-dessus de tout mais jamais interactif. -->
    <div class="grain-overlay" aria-hidden="true"></div>

    <!-- RGAA 12.7 — permet d'atteindre le contenu sans retraverser la
         navigation au clavier. Invisible tant qu'il n'a pas le focus. -->
    <a href="#contenu" class="skip-link">
      {{ $t('accessibility.skip') }}
    </a>

    <!-- Le positionnement et le rang d'empilement appartiennent au composant
         (sticky top-0 z-[100]) : les imposer aussi d'ici mettait deux
         utilitaires de position et deux z-index sur le même élément, à
         spécificité égale. Ça tenait uniquement à l'ordre de génération de
         Tailwind — une montée de version pouvait rendre la barre non
         collante sans que rien ne le signale. -->
    <SiteNavbar />
    <FontSwitcher />
    <MagneticCursor />

    <main id="contenu" tabindex="-1" class="relative z-10 focus:outline-none">
      <router-view v-slot="{ Component }">
        <Transition name="page" mode="out-in">
          <component :is="Component" />
        </Transition>
      </router-view>
    </main>

    <SiteFooter />

    <component :is="DebugPanel" v-if="DebugPanel" />
  </div>
</template>

<style>
/* Animation de sortie du rideau.
   `all` embarquait toutes les propriétés animables, y compris celles qui
   déclenchent une mise en page. Seule l'opacité change réellement ici. */
.reveal-leave-active {
  transition: opacity 0.8s cubic-bezier(0.7, 0, 0.3, 1);
}

.reveal-leave-to {
  opacity: 0;
  transform: scale(1.05); /* Effet de zoom arrière à la sortie */
  filter: blur(20px);
}

/* Transitions de page
   mode="out-in" (sur le router-view) attend la fin de la sortie avant de
   démarrer l'entrée : à 0,25 s chacune, ça faisait jusqu'à 500 ms sans rien
   de nouveau à l'écran après un clic — perceptible comme un délai. Ramené à
   0,12 s : reste un fondu, mais le contenu suivant arrive nettement plus
   vite après le clic. */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.12s ease, transform 0.12s ease;
}
.page-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.page-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Animation de la barre de progression.
   Uniquement transform : animer `width` forçait un calcul de mise en page à
   chaque image, sur le thread principal, pendant le chargement — exactement ce
   que Lighthouse signale sous « animations non compositées ». scaleX produit le
   même effet visuel et reste sur le compositeur. */
@keyframes progress {
  0% { transform: translateX(-100%) scaleX(0.2); }
  50% { transform: translateX(0) scaleX(1); }
  100% { transform: translateX(100%) scaleX(0.2); }
}
.animate-progress {
  width: 100%;
  transform-origin: left center;
  will-change: transform;
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
