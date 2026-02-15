<script setup>
import { ref, onMounted } from 'vue'

const isDark = ref(false)

const toggleDark = () => {
  isDark.value = !isDark.value
  const el = document.documentElement
  
  if (isDark.value) {
    el.classList.add('dark')
    localStorage.setItem('theme', 'dark')
  } else {
    el.classList.remove('dark')
    localStorage.setItem('theme', 'light')
  }
}

onMounted(() => {
  const saved = localStorage.getItem('theme')
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  
  if (saved === 'dark' || (!saved && systemDark)) {
    isDark.value = true
    document.documentElement.classList.add('dark')
  }
})
</script>

<template>
  <button @click="toggleDark" class="p-2 text-2xl relative z-[110]">
    {{ isDark ? '☀️' : '🌙' }}
  </button>
</template>