<template>
  <nav class="bg-white/20 dark:bg-gray-900/20 backdrop-blur-md sticky top-0 z-[100] border-b border-white/10 dark:border-white/5 transition-colors duration-300">
    <div class="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
      <router-link to="/" class="text-2xl font-black text-dark-soft dark:text-cream">
        MTD<span class="text-terracotta">.</span>
      </router-link>
      
      <div class="hidden md:flex items-center gap-8 font-medium dark:text-gray-300">
        <router-link to="/" class="hover:text-terracotta transition">{{ $t('nav.home') }}</router-link>
        <router-link to="/about" class="hover:text-terracotta transition">{{ $t('nav.about') }}</router-link>
        <router-link to="/projects" class="hover:text-terracotta transition">{{ $t('nav.projects') }}</router-link>
        <router-link to="/contact" class="hover:text-terracotta transition">{{ $t('nav.contact') }}</router-link>
        
        <div class="flex items-center gap-4">
            <LanguageSwitcher />
            <ThemeSwitcher />
            <FontSwitcher />
        </div>
        
        <a href="/docs/cv.pdf" download class="bg-dark-soft dark:bg-terracotta text-white px-5 py-2 rounded-full text-sm hover:opacity-80 transition">
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