<template>
  <nav class="bg-white/20 dark:bg-gray-900/20 backdrop-blur-md sticky top-0 z-[100] border-b border-white/10 dark:border-white/5 transition-colors duration-300">
    <div class="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
      
      <router-link to="/" class="text-2xl font-black text-dark-soft dark:text-cream">
        B<span class="text-terracotta">.</span>R
      </router-link>
      
      <div class="hidden md:flex items-center gap-8 font-medium dark:text-gray-300">
        <router-link to="/" class="hover:text-terracotta transition">{{ $t('nav.home') }}</router-link>
        <router-link to="/about" class="hover:text-terracotta transition">{{ $t('nav.about') }}</router-link>
        <router-link to="/projects" class="hover:text-terracotta transition">{{ $t('nav.projects') }}</router-link>
        <router-link to="/prestations" class="hover:text-terracotta transition">{{ $t('nav.prestations') }}</router-link>
        <router-link to="/contact" class="hover:text-terracotta transition">{{ $t('nav.contact') }}</router-link>
        
        <div class="flex items-center gap-4 border-l border-white/20 pl-4">
          <LanguageSwitcher />
          <ThemeSwitcher />
        </div>
        
        <a href="/docs/RB_CV_2026.pdf" download="CV_Bastien_Manager_Digital.pdf"
           class="px-6 py-2 bg-terracotta text-white rounded-full font-bold hover:bg-ochre transition-all shadow-md hover:shadow-xl active:scale-95">
            {{ $t('nav.downloadCV') }}
        </a>
      </div>

      <button @click="isMenuOpen = !isMenuOpen" class="md:hidden p-2 text-dark-soft dark:text-cream transition-transform active:scale-90">
        <Menu v-if="!isMenuOpen" class="w-7 h-7" />
        <X v-else class="w-7 h-7" />
      </button>
    </div>

    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 -translate-y-4"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-4"
    >
      <div v-if="isMenuOpen" class="absolute top-full left-0 w-full bg-white/95 dark:bg-gray-900/98 backdrop-blur-2xl border-b border-white/20 md:hidden shadow-2xl">
        <div class="flex flex-col p-8 gap-6 text-center">
          <router-link @click="isMenuOpen = false" to="/" class="text-xl font-bold dark:text-white uppercase tracking-tight">{{ $t('nav.home') }}</router-link>
          <router-link @click="isMenuOpen = false" to="/about" class="text-xl font-bold dark:text-white uppercase tracking-tight">{{ $t('nav.about') }}</router-link>
          <router-link @click="isMenuOpen = false" to="/projects" class="text-xl font-bold dark:text-white uppercase tracking-tight">{{ $t('nav.projects') }}</router-link>
          <router-link @click="isMenuOpen = false" to="/prestations" class="text-xl font-bold dark:text-white uppercase tracking-tight">{{ $t('nav.prestations') }}</router-link>
          <router-link @click="isMenuOpen = false" to="/contact" class="text-xl font-bold dark:text-white uppercase tracking-tight">{{ $t('nav.contact') }}</router-link>
          
          <div class="h-px w-12 bg-terracotta/30 mx-auto my-2"></div>
          
          <div class="flex justify-center gap-8 items-center py-2">
            <LanguageSwitcher />
            <ThemeSwitcher />
          </div>

          <a href="/docs/RB_CV_2026.pdf" @click="isMenuOpen = false" download="CV_Bastien_Manager_Digital.pdf"
             class="w-full py-4 bg-terracotta text-white rounded-2xl font-black uppercase tracking-widest shadow-lg active:scale-95 transition-transform">
            {{ $t('nav.downloadCV') }}
          </a>
        </div>
      </div>
    </Transition>
  </nav>
</template>

<script setup>
import { ref } from 'vue'
import { Menu, X } from 'lucide-vue-next'
import ThemeSwitcher from '../common/ThemeSwitcher.vue'
import LanguageSwitcher from '../common/LanguageSwitcher.vue'

const isMenuOpen = ref(false)
</script>