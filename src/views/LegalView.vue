<script setup>
// Sections pilotées par l'i18n : chaque entrée = un bloc de texte simple
const sections = ['editor', 'hosting', 'ip', 'data']

// Lignes d'identité (label / value) du bloc éditeur.
// Le SIRET sera réintroduit ici une fois l'immatriculation effective.
const identity = ['editor_name', 'status', 'contact']
</script>

<template>
  <section class="relative z-10 max-w-3xl mx-auto px-6 pt-16 pb-24 md:pt-24">

    <h1 class="text-4xl md:text-5xl text-ink mb-14">
      {{ $t('legal.title') }}
    </h1>

    <div class="space-y-12">

      <!-- Éditeur du site + carte d'identité -->
      <section>
        <h2 class="font-sans font-semibold text-xl text-ink mb-3 tracking-tight">
          {{ $t('legal.editor_title') }}
        </h2>
        <p class="text-ink-muted leading-relaxed mb-6">
          {{ $t('legal.editor_desc') }}
        </p>

        <dl class="grid sm:grid-cols-3 gap-6 border-t border-line-soft pt-6">
          <div v-for="row in identity" :key="row">
            <dt class="text-sm text-ink-muted mb-1">
              {{ $t(`legal.${row}_label`) }}
            </dt>
            <dd class="text-ink font-medium break-words">
              {{ $t(`legal.${row}_value`) }}
            </dd>
          </div>
        </dl>
      </section>

      <!-- Autres sections textuelles -->
      <section v-for="key in sections.slice(1)" :key="key">
        <h2 class="font-sans font-semibold text-xl text-ink mb-3 tracking-tight">
          {{ $t(`legal.${key}_title`) }}
        </h2>
        <p class="text-ink-muted leading-relaxed">
          {{ $t(`legal.${key}_desc`) }}
        </p>
      </section>

    </div>
  </section>
</template>
