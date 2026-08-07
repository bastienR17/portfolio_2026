<script setup>
import { useI18n } from 'vue-i18n'
import { setLocale } from '../../i18n'

const { locale } = useI18n()
const locales = [
  { code: 'fr', label: 'FR', name: 'Français' },
  { code: 'en', label: 'EN', name: 'English' },
]
</script>

<template>
  <!-- Les deux boutons portent une cible de 44 px sans grossir visuellement :
       le rembourrage est transparent, seul le texte se voit. -->
  <div class="flex items-center">
    <template v-for="(l, i) in locales" :key="l.code">
      <span v-if="i > 0" class="text-ink-muted select-none" aria-hidden="true">/</span>
      <button
        @click="setLocale(l.code)"
        :lang="l.code"
        :aria-label="l.name"
        :aria-pressed="locale === l.code"
        class="inline-flex items-center justify-center min-w-11 min-h-11 text-sm transition-colors"
        :class="locale === l.code ? 'text-accent font-semibold' : 'text-ink-muted hover:text-accent'"
      >
        {{ l.label }}
      </button>
    </template>
  </div>
</template>
