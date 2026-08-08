<script setup>
import { Linkedin, Github } from 'lucide-vue-next'
import { SITE } from '../../config/site'

const year = new Date().getFullYear()

const links = [
  { to: '/', label: 'nav.home' },
  { to: '/about', label: 'nav.about' },
  { to: '/projects', label: 'nav.projects' },
  { to: '/prestations', label: 'nav.prestations' },
  { to: '/contact', label: 'nav.contact' },
]
</script>

<template>
  <footer class="relative z-10 mt-24 bg-page border-t border-line-soft">
    <div class="max-w-6xl mx-auto px-6 pt-16 pb-10">

      <router-link
        to="/contact"
        class="group no-active inline-flex items-center gap-4 font-display leading-none tracking-tight text-ink hover:text-accent transition-colors"
        style="font-size: clamp(2.75rem, 8vw, 6rem)"
      >
        {{ $t('home.final_cta') }}
        <span aria-hidden="true" class="inline-block transition-transform group-hover:translate-x-2">→</span>
      </router-link>

      <!-- Une ligne qui respire plutôt qu'une grille à deux colonnes : les
           liens et le contact se lisent l'un après l'autre, pas empilés dans
           des cases séparées par une règle. -->
      <div class="mt-14 flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
        <nav class="flex flex-wrap gap-x-6 gap-y-2 text-sm uppercase tracking-wide">
          <router-link
            v-for="link in links"
            :key="link.to"
            :to="link.to"
            class="text-ink-muted hover:text-accent transition-colors"
          >
            {{ $t(link.label) }}
          </router-link>
        </nav>

        <div class="flex items-center gap-5">
          <a
            :href="`mailto:${SITE.email}`"
            class="text-sm text-ink hover:text-accent transition-colors break-all"
          >
            {{ SITE.email }}
          </a>

          <div class="flex items-center gap-4">
            <a
              :href="SITE.social.linkedin"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              class="text-ink-muted hover:text-accent transition-colors"
            >
              <Linkedin class="w-5 h-5" aria-hidden="true" />
              <span class="sr-only">({{ $t('accessibility.new_window') }})</span>
            </a>
            <a
              :href="SITE.social.github"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              class="text-ink-muted hover:text-accent transition-colors"
            >
              <Github class="w-5 h-5" aria-hidden="true" />
              <span class="sr-only">({{ $t('accessibility.new_window') }})</span>
            </a>
          </div>
        </div>
      </div>

      <div class="mt-10 pt-6 border-t border-line-soft flex flex-col sm:flex-row items-center justify-between gap-3">
        <p class="text-sm text-ink-muted text-center sm:text-left">
          © {{ year }} Bastien Roc - {{ $t('footer.rights') }}
        </p>

        <router-link
          to="/mentions-legales"
          class="no-active inline-block py-1 text-sm text-ink-muted hover:text-accent transition-colors underline-offset-4 hover:underline"
        >
          {{ $t('footer.legal') }}
        </router-link>
      </div>

    </div>
  </footer>
</template>
