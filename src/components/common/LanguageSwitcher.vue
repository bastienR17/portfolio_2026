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
  <div class="flex items-center gap-1">
    <template v-for="(l, i) in locales" :key="l.code">
      <span v-if="i > 0" class="text-ink-muted select-none" aria-hidden="true">/</span>
      <button
        @click="setLocale(l.code)"
        :lang="l.code"
        :aria-label="l.name"
        :aria-pressed="locale === l.code"
        class="px-1.5 py-1 text-sm transition-colors"
        :class="locale === l.code ? 'text-accent font-semibold' : 'text-ink-muted hover:text-accent'"
      >
        {{ l.label }}
      </button>
    </template>
  </div>
</template>
