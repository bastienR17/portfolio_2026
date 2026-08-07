<script setup>
import { ref } from 'vue'
import { Copy, Check, Linkedin, Github, Mail } from 'lucide-vue-next'

const email = 'contact@bastienroc.fr'
const isCopied = ref(false)
const copyFailed = ref(false)

const copyEmail = async () => {
  try {
    await navigator.clipboard.writeText(email)
    isCopied.value = true
    setTimeout(() => { isCopied.value = false }, 2000)
  } catch {
    // Presse-papiers refusé (contexte non sécurisé, permission) : on le dit
    // au lieu de laisser le bouton sans effet visible.
    copyFailed.value = true
    setTimeout(() => { copyFailed.value = false }, 4000)
  }
}
</script>

<template>
  <section class="relative z-10 max-w-3xl mx-auto px-6 pt-16 pb-24 md:pt-24">

    <h1 class="h-hero text-ink mb-6">
      {{ $t('contact.title') }}
    </h1>

    <p class="text-lg text-ink-muted leading-relaxed mb-14 max-w-xl">
      {{ $t('contact.subtitle') }}
    </p>

    <div class="border-t-2 border-accent pt-8">
      <p class="flex items-center gap-2 text-sm text-ink-muted mb-4">
        <Mail class="w-4 h-4" aria-hidden="true" />
        {{ $t('contact.email_label') }}
      </p>

      <div class="flex flex-wrap items-center gap-x-5 gap-y-3">
        <a
          :href="`mailto:${email}`"
          class="font-display text-3xl md:text-4xl text-ink hover:text-accent transition-colors break-all"
        >
          {{ email }}
        </a>

        <button
          @click="copyEmail"
          class="inline-flex items-center gap-2 px-3 py-2 border border-line text-sm text-ink-muted hover:text-accent hover:border-accent transition-colors"
        >
          <Check v-if="isCopied" class="w-4 h-4" aria-hidden="true" />
          <Copy v-else class="w-4 h-4" aria-hidden="true" />
          <span>{{ isCopied ? $t('contact.copied') : $t('contact.copy') }}</span>
        </button>
      </div>

      <!-- L'échec avait déjà son annonce, pas la réussite : au lecteur d'écran,
           copier semblait ne rien faire tant que ça marchait. Le libellé du
           bouton n'est pas touché — nom accessible et texte visible restent
           identiques (WCAG 2.5.3). -->
      <p role="status" class="sr-only">
        {{ isCopied ? $t('contact.copied') : '' }}
      </p>

      <p v-if="copyFailed" role="alert" class="mt-3 text-sm text-accent">
        {{ $t('contact.copy_failed') }}
      </p>
    </div>

    <ul class="grid sm:grid-cols-2 gap-px bg-line-soft border border-line-soft mt-14">
      <li>
        <a
          href="https://www.linkedin.com/in/bastien-roc/"
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center gap-4 p-6 bg-surface hover:bg-surface-2 transition-colors h-full"
        >
          <Linkedin class="w-5 h-5 text-accent shrink-0" aria-hidden="true" />
          <span>
            <span class="block font-medium text-ink">LinkedIn</span>
            <span class="block text-sm text-ink-muted">Bastien Roc</span>
            <span class="sr-only">({{ $t('accessibility.new_window') }})</span>
          </span>
        </a>
      </li>
      <li>
        <a
          href="https://github.com/bastienR17"
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center gap-4 p-6 bg-surface hover:bg-surface-2 transition-colors h-full"
        >
          <Github class="w-5 h-5 text-accent shrink-0" aria-hidden="true" />
          <span>
            <span class="block font-medium text-ink">GitHub</span>
            <span class="block text-sm text-ink-muted">bastienR17</span>
            <span class="sr-only">({{ $t('accessibility.new_window') }})</span>
          </span>
        </a>
      </li>
    </ul>

  </section>
</template>
