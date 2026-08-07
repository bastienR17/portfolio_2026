<script setup>
import { ref, onMounted } from 'vue'
import { ALargeSmall } from 'lucide-vue-next'

const OPENDYSLEXIC_CSS = 'https://cdn.jsdelivr.net/npm/@fontsource/opendyslexic@5.0.1/index.css'

const isDyslexic = ref(false)

/**
 * OpenDyslexic n'est téléchargée qu'au premier passage en mode lecture.
 * Elle était auparavant importée dans Main.css, donc payée par tous les
 * visiteurs alors que seule cette bascule l'utilise.
 */
const loadDyslexicFont = () => {
  if (document.getElementById('opendyslexic-font')) return
  const link = document.createElement('link')
  link.id = 'opendyslexic-font'
  link.rel = 'stylesheet'
  link.href = OPENDYSLEXIC_CSS
  document.head.appendChild(link)
}

const toggleFont = () => {
  isDyslexic.value = !isDyslexic.value
  if (isDyslexic.value) loadDyslexicFont()
  // La classe vit sur <html> et non <body> : le script inline d'index.html
  // peut ainsi la poser avant le premier paint, sans attendre Vue.
  document.documentElement.classList.toggle('font-dys', isDyslexic.value)
  localStorage.setItem('font-preference', isDyslexic.value ? 'dys' : 'standard')
}

onMounted(() => {
  isDyslexic.value = document.documentElement.classList.contains('font-dys')
  if (isDyslexic.value) loadDyslexicFont()
})
</script>

<template>
  <button
    @click="toggleFont"
    class="fixed bottom-6 right-6 z-[90] inline-flex items-center gap-2 px-3 py-2 bg-surface border border-line text-ink-muted hover:text-accent hover:border-accent transition-colors"
    :aria-label="isDyslexic ? $t('accessibility.dys_disable') : $t('accessibility.dys_enable')"
    :aria-pressed="isDyslexic"
  >
    <ALargeSmall class="w-4 h-4" />
    <span class="text-xs font-medium">Dys</span>
  </button>
</template>
