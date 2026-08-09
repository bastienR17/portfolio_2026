<template>
  <!-- Fond entièrement opaque : le décor 3D défile derrière, un fond
       translucide rendrait le contraste des liens non déterministe. -->
  <nav class="sticky top-0 z-[100] bg-page border-b border-line-soft">
    <div class="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">

      <router-link to="/" class="no-active font-display text-3xl md:text-4xl text-ink tracking-tight">
        B<span class="text-accent">.</span>R
      </router-link>

      <div class="hidden md:flex items-center gap-7 text-sm uppercase tracking-wide">
        <router-link
          v-for="(link, i) in links"
          :key="link.to"
          :to="link.to"
          :class="['nav-circle', `nav-circle-${(i % 5) + 1}`]"
          class="text-ink-muted hover:text-accent transition-colors"
        >
          {{ $t(link.label) }}
        </router-link>

        <div class="flex items-center gap-2 pl-5 border-l border-line-soft normal-case">
          <LanguageSwitcher />
          <ThemeSwitcher />
        </div>

        <a
          href="/docs/RB_CV_2026.pdf"
          download="CV_Bastien_Roc.pdf"
          class="px-4 py-2 bg-accent text-accent-ink font-medium normal-case hover:opacity-90 transition-opacity"
        >
          {{ $t('nav.downloadCV') }}
        </a>
      </div>

      <button
        ref="burger"
        @click="isMenuOpen = !isMenuOpen"
        class="md:hidden inline-flex items-center justify-center w-11 h-11 -mr-2 text-ink"
        :aria-expanded="isMenuOpen"
        aria-controls="mobile-menu"
        :aria-label="isMenuOpen ? $t('accessibility.menu_close') : $t('accessibility.menu_open')"
      >
        <Menu v-if="!isMenuOpen" class="w-6 h-6" />
        <X v-else class="w-6 h-6" />
      </button>
    </div>

    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div
        v-if="isMenuOpen"
        id="mobile-menu"
        class="absolute top-full left-0 w-full bg-page border-b border-line-soft md:hidden"
      >
        <div class="flex flex-col p-6 gap-1">
          <router-link
            v-for="link in links"
            :key="link.to"
            @click="isMenuOpen = false"
            :to="link.to"
            class="py-3 font-display text-2xl text-ink border-b border-line-soft"
          >
            {{ $t(link.label) }}
          </router-link>

          <div class="flex justify-between items-center py-4">
            <LanguageSwitcher />
            <ThemeSwitcher />
          </div>

          <a
            href="/docs/RB_CV_2026.pdf"
            @click="isMenuOpen = false"
            download="CV_Bastien_Roc.pdf"
            class="w-full py-3 text-center bg-accent text-accent-ink font-medium"
          >
            {{ $t('nav.downloadCV') }}
          </a>
        </div>
      </div>
    </Transition>
  </nav>
</template>

<script setup>
import { ref, watch, onBeforeUnmount } from 'vue'
import { Menu, X } from 'lucide-vue-next'
import ThemeSwitcher from '../common/ThemeSwitcher.vue'
import LanguageSwitcher from '../common/LanguageSwitcher.vue'

const isMenuOpen = ref(false)
const burger = ref(null)

/**
 * Échap referme le menu et rend le focus au bouton.
 * Sans ça, une personne au clavier qui ouvre le menu n'a aucun moyen d'en
 * sortir sans le reparcourir en entier.
 */
const onKeydown = (e) => {
  if (e.key === 'Escape' && isMenuOpen.value) {
    isMenuOpen.value = false
    burger.value?.focus()
  }
}

watch(isMenuOpen, (open) => {
  if (open) document.addEventListener('keydown', onKeydown)
  else document.removeEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown))

const links = [
  { to: '/', label: 'nav.home' },
  { to: '/about', label: 'nav.about' },
  { to: '/projects', label: 'nav.projects' },
  { to: '/prestations', label: 'nav.prestations' },
  { to: '/contact', label: 'nav.contact' },
]
</script>
