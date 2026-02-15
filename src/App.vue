<script setup>
import { RouterView } from 'vue-router'
import Navbar from './components/layout/Navbar.vue'
import Experience3D from './components/common/Experience3D.vue'
import FontSwitcher from './components/common/FontSwitcher.vue' 
</script>

<template>
  <div class="min-h-screen text-dark-soft dark:text-cream transition-colors duration-500">
    
    <Experience3D />

    <Navbar class="relative z-50" />
    <FontSwitcher />

    <main class="relative z-10">
      <router-view />
    </main>
  </div>
</template>
<style>
/* On retire TOUTE mention de color ou background-color ici */
body {
  margin: 0;
  padding: 0;
  overflow-x: hidden;
}

#app {
  min-height: 100vh;
}
</style>