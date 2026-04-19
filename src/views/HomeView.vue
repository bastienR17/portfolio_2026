<script setup>
import { onMounted, onUnmounted } from 'vue'

onMounted(() => {
  // Empêche le scroll sur la home pour garder l'effet immersif du village 3D
  document.body.style.overflow = 'hidden'
})

onUnmounted(() => {
  // Réactive le scroll quand on quitte la home
  document.body.style.overflow = 'auto'
})
</script>

<template>
  <div class="relative z-10 max-w-7xl mx-auto px-8 flex flex-col md:flex-row items-center gap-10 h-screen overflow-hidden transition-colors duration-500">

    <div class="flex-[3] flex flex-col justify-center min-w-0">
      <div class="bg-white/30 dark:bg-gray-800/40 backdrop-blur-md p-6 md:p-10 rounded-2xl border border-white/20 dark:border-white/5 shadow-xl space-y-6">
        <h1 class="text-4xl md:text-6xl font-bold text-dark-soft dark:text-white leading-tight transition-colors">
          {{ $t('home.title') }}
        </h1>

        <p class="text-lg md:text-xl text-gray-600 dark:text-gray-300 leading-relaxed transition-colors">
          {{ $t('home.subtitle') }}
          <span class="text-terracotta font-semibold italic">{{ $t('home.sub_subtitle') }}</span>
        </p>

        <div class="flex flex-wrap gap-4 pt-2">
          <router-link to="/projects" class="bg-terracotta text-white px-8 py-3 rounded-full font-bold shadow-lg hover:-translate-y-1 transition-transform active:scale-95">
            {{ $t('home.cta') }}
          </router-link>

          <router-link to="/about" class="border-2 border-dark-soft text-dark-soft dark:border-white dark:text-white px-8 py-3 rounded-full font-bold hover:bg-dark-soft hover:text-white dark:hover:bg-white dark:hover:text-dark-soft transition-all active:scale-95">
            {{ $t('nav.about') }}
          </router-link>
        </div>
      </div>
    </div>

    <div class="hidden md:flex flex-[2] relative items-center justify-center">
      <div class="relative bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-4 rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700 transition-colors">
        <img
          src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=500"
          alt="Transformation Digitale"
          class="rounded-xl w-full h-auto"
        >
      </div>
    </div>

    <!-- Scroll indicator -->
    <router-link
      to="/about"
      class="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-dark-soft/40 dark:text-white/30 hover:text-terracotta dark:hover:text-terracotta transition-colors duration-300"
    >
      <span class="text-xs font-bold uppercase tracking-widest">Explorer</span>
      <span class="animate-bounce text-xl">↓</span>
    </router-link>

  </div>
</template>