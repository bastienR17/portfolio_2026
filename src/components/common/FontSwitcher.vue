<script setup>
import { ref, onMounted } from 'vue'
import { ALargeSmall } from 'lucide-vue-next'

const isDyslexic = ref(false)

/**
 * OpenDyslexic est auto-hébergée et déclarée en @font-face dans Main.css.
 * Aucun chargement à piloter ici : un @font-face inutilisé ne déclenche aucune
 * requête, le navigateur ne va chercher les deux fichiers qu'au moment où la
 * famille s'applique réellement, donc au premier clic.
 *
 * Elle venait auparavant de cdn.jsdelivr.net : activer une aide à la lecture
 * signalait un besoin d'accessibilité à un tiers hors UE, et contredisait
 * l'auto-hébergement des deux autres familles.
 */
const toggleFont = () => {
  isDyslexic.value = !isDyslexic.value
  // La classe vit sur <html> et non <body> : le script inline d'index.html
  // peut ainsi la poser avant le premier paint, sans attendre Vue.
  document.documentElement.classList.toggle('font-dys', isDyslexic.value)
  localStorage.setItem('font-preference', isDyslexic.value ? 'dys' : 'standard')
}

onMounted(() => {
  isDyslexic.value = document.documentElement.classList.contains('font-dys')
})
</script>

<template>
  <button
    @click="toggleFont"
    class="fixed bottom-6 right-6 z-[90] inline-flex items-center justify-center gap-2 min-h-11 px-4 bg-surface border border-line text-ink-muted hover:text-accent hover:border-accent transition-colors"
    :aria-label="isDyslexic ? $t('accessibility.dys_disable') : $t('accessibility.dys_enable')"
    :aria-pressed="isDyslexic"
  >
    <ALargeSmall class="w-4 h-4" />
    <span class="text-xs font-medium">Dys</span>
  </button>
</template>
