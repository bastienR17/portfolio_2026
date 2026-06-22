<script setup>
import { ref, onMounted } from 'vue'
import { RouterView } from 'vue-router'
import Navbar from './components/layout/Navbar.vue'
import Footer from './components/layout/Footer.vue'
import Experience3D from './components/common/Experience3D.vue'
import FontSwitcher from './components/common/FontSwitcher.vue'

// État du chargement
const isLoading = ref(true)

onMounted(() => {
  // On simule un petit temps de chargement pour l'immersion (1.5s)
  // Tu pourras l'ajuster selon tes envies
  setTimeout(() => {
    isLoading.value = false
  }, 1500)
})
</script>

<template>
  <div class="min-h-screen text-dark-soft dark:text-cream transition-colors duration-500">
    
    <Transition name="reveal">
      <div v-if="isLoading" class="fixed inset-0 z-[1000] bg-cream dark:bg-dark-soft flex items-center justify-center">
        <div class="flex flex-col items-center">
          <span class="text-5xl font-black text-terracotta tracking-tighter animate-pulse">
            B<span class="text-dark-soft dark:text-cream">.</span>R
          </span>
          <div class="mt-8 w-32 h-[2px] bg-terracotta/10 rounded-full overflow-hidden">
            <div class="h-full bg-terracotta animate-progress"></div>
          </div>
          <p class="mt-4 text-[10px] uppercase tracking-[0.3em] text-gray-400 font-bold">
            Initialisation...
          </p>
        </div>
      </div>
    </Transition>

    <Experience3D />

    <Navbar class="relative z-50" />
    <FontSwitcher />

    <main class="relative z-10">
      <router-view v-slot="{ Component }">
        <Transition name="page" mode="out-in">
          <component :is="Component" />
        </Transition>
      </router-view>
    </main>

    <Footer />
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

body {
  margin: 0;
  padding: 0;
  overflow-x: hidden;
  background-color: #FFF9F5; /* Couleur cream par défaut pour éviter le flash blanc */
}

.dark body {
  background-color: #111827;
}

#app {
  min-height: 100vh;
}
</style>