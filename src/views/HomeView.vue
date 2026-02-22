<script setup>
import { onMounted, onUnmounted } from 'vue'
import Experience3D from '../components/common/Experience3D.vue'

onMounted(() => {
  document.body.style.overflow = 'hidden'
})

onUnmounted(() => {
  document.body.style.overflow = 'auto'
})
</script>

<template>
  <Experience3D />

  <div class="relative z-10 max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center gap-12 h-screen overflow-hidden transition-colors duration-500">
    
    <div class="flex-1 space-y-6 text-left">
      <h1 class="text-5xl md:text-7xl font-bold text-dark-soft dark:text-white leading-tight transition-colors">
        {{ $t('home.title') }}
      </h1>
      
      <p class="text-xl text-gray-600 dark:text-gray-300 leading-relaxed transition-colors">
        {{ $t('home.subtitle') }} 
        <span class="text-terracotta font-semibold italic">{{ $t('home.sub_subtitle') }}</span>
        
      </p>

      <div class="flex gap-4 pt-4">
        <router-link to="/projects" class="bg-terracotta text-white px-8 py-3 rounded-full font-bold shadow-lg hover:-translate-y-1 transition">
          {{ $t('home.cta') }}
        </router-link>
        
        <router-link to="/about" class="border-2 border-dark-soft text-dark-soft dark:border-white dark:text-white px-8 py-3 rounded-full font-bold hover:bg-dark-soft hover:text-white dark:hover:bg-white dark:hover:text-dark-soft transition">
          {{ $t('nav.about') }}
        </router-link>
      </div>
    </div>

    <div class="flex-1 relative flex items-center justify-center">
      <div class="relative bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-2xl border border-cream dark:border-gray-700 transition-colors">
        <img 
          src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=500" 
          alt="Transformation Digitale" 
          class="rounded-xl w-full h-auto"
        >
      </div>
    </div>
  </div>
</template>