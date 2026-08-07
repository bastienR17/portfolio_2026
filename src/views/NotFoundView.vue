<script setup>
import { ArrowRight } from 'lucide-vue-next'
</script>

<template>
  <section class="relative z-10 max-w-3xl mx-auto px-6 pt-24 pb-32">
    <p class="font-display text-6xl text-accent mb-6">404</p>

    <h1 class="h-page text-ink mb-5">
      {{ $t('notfound.title') }}
    </h1>

    <p class="text-lg text-ink-muted leading-relaxed mb-10 max-w-xl">
      {{ $t('notfound.desc') }}
    </p>

    <div class="flex flex-wrap gap-3">
      <router-link
        to="/"
        class="inline-flex items-center gap-2 px-6 py-3 bg-accent text-accent-ink font-medium hover:opacity-90 transition-opacity"
      >
        {{ $t('notfound.cta') }}
        <ArrowRight class="w-4 h-4" />
      </router-link>

      <router-link
        to="/prestations"
        class="px-6 py-3 border border-line text-ink font-medium hover:border-accent hover:text-accent transition-colors"
      >
        {{ $t('nav.prestations') }}
      </router-link>
    </div>
  </section>
</template>
