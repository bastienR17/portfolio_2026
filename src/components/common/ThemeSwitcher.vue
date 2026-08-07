<script setup>
import { ref, onMounted } from 'vue'
import { Sun, Moon } from 'lucide-vue-next'

const isDark = ref(false)

const toggleDark = () => {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

onMounted(() => {
  // Le thème est déjà appliqué par le script inline d'index.html, avant le
  // premier paint. On se contente de refléter l'état réel du DOM, pour éviter
  // deux sources de vérité susceptibles de diverger.
  isDark.value = document.documentElement.classList.contains('dark')
})
</script>

<template>
  <button
    @click="toggleDark"
    class="p-2 text-ink-muted hover:text-accent transition-colors"
    :aria-label="isDark ? $t('accessibility.theme_toLight') : $t('accessibility.theme_toDark')"
    :aria-pressed="isDark"
  >
    <Sun v-if="isDark" class="w-5 h-5" />
    <Moon v-else class="w-5 h-5" />
  </button>
</template>
