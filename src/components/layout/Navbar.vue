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
        <router-link to="/contact" class="hover:text-terracotta transition">{{ $t('nav.contact') }}</router-link>
        
        <div class="flex items-center gap-4">
            <LanguageSwitcher />
            <ThemeSwitcher />
            
        </div>
        
        <a  href="/RB_CV_2026.pdf" download="CV_Bastien_Manager_Digital.pdf" class="px-6 py-2 bg-terracotta text-white rounded-full font-bold hover:bg-ochre transition-all shadow-md hover:shadow-xl active:scale-95">
            {{ $t('nav.downloadCV') }}
        </a>
      </div>
    </div>
  </nav>
</template>

<script setup>
import ThemeSwitcher from '../common/ThemeSwitcher.vue'
import FontSwitcher from '../common/FontSwitcher.vue'
import LanguageSwitcher from '../common/LanguageSwitcher.vue'
</script>