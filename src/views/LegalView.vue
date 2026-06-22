<script setup>
import { ScrollText } from 'lucide-vue-next'

// Sections pilotées par l'i18n : chaque entrée = un bloc de texte simple
const sections = ['editor', 'hosting', 'ip', 'data']

// Lignes d'identité (label / value) du bloc éditeur
const identity = ['editor_name', 'status', 'siret', 'contact']
</script>

<template>
  <section class="max-w-3xl mx-auto py-24 px-4 relative z-10 transition-colors duration-500">

    <div class="flex items-center gap-3 mb-12">
      <span class="flex items-center justify-center w-12 h-12 rounded-2xl bg-terracotta/10 dark:bg-ochre/10 text-terracotta dark:text-ochre">
        <ScrollText class="w-6 h-6" />
      </span>
      <h2 class="text-4xl font-extrabold text-dark-soft dark:text-white tracking-tight">
        {{ $t('legal.title') }}
      </h2>
    </div>

    <div class="space-y-10">

      <!-- Éditeur du site + carte d'identité -->
      <div>
        <h3 class="text-xl font-bold text-dark-soft dark:text-white mb-3 tracking-tight">
          {{ $t('legal.editor_title') }}
        </h3>
        <p class="text-gray-600 dark:text-gray-400 font-medium leading-relaxed mb-6">
          {{ $t('legal.editor_desc') }}
        </p>

        <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl p-6 rounded-2xl border border-white/30 dark:border-white/10">
          <div v-for="row in identity" :key="row">
            <dt class="text-[10px] uppercase tracking-widest text-gray-500 dark:text-ochre/60 font-black mb-1">
              {{ $t(`legal.${row}_label`) }}
            </dt>
            <dd class="text-sm font-bold text-dark-soft dark:text-white">
              {{ $t(`legal.${row}_value`) }}
            </dd>
          </div>
        </dl>
      </div>

      <!-- Autres sections textuelles -->
      <div v-for="key in sections.slice(1)" :key="key">
        <h3 class="text-xl font-bold text-dark-soft dark:text-white mb-3 tracking-tight">
          {{ $t(`legal.${key}_title`) }}
        </h3>
        <p class="text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
          {{ $t(`legal.${key}_desc`) }}
        </p>
      </div>

    </div>
  </section>
</template>
