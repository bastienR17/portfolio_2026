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
  <!-- Ombre prolongeant le fond d'un écran vers le BAS : symétrique de celle
       de la barre de navigation, pour le rebond en fin de page. -->
  <footer
    class="relative z-10 mt-24 bg-page border-t border-line-soft shadow-[0_50vh_0_50vh_var(--c-page)]"
  >
    <!-- pb généreux : la bascule Dys est en position fixe à 24 px du bas et
         mesure 48 px de haut. Avec l'ancien pb-10, elle recouvrait le lien
         « Mentions légales » une fois la page défilée à fond — un lien
         obligatoire rendu incliquable, et masqué au focus clavier. -->
    <div class="max-w-6xl mx-auto px-6 pt-16 pb-24">

      <router-link
        to="/contact"
        class="group no-active inline-flex items-center gap-4 font-display leading-none tracking-tight text-ink hover:text-accent transition-colors"
        style="font-size: clamp(2.75rem, 8vw, 6rem)"
      >
        {{ $t('home.final_cta') }}
        <!-- Même relais que le bouton CtaLink — la flèche sort, sa jumelle
             prend sa place — mais à l'échelle du texte : les dimensions sont
             en em, donc la fenêtre suit le clamp() de la police au lieu
             d'être fixée en pixels. Ce lien est une affiche, pas un bouton :
             il garde sa taille et ne reçoit que le vocabulaire de geste. -->
        <span aria-hidden="true" class="relative inline-block overflow-hidden w-[1em] h-[0.8em] shrink-0">
          <span
            class="absolute inset-0 leading-[0.8] transition-transform duration-500 ease-in-out group-hover:translate-x-full"
          >→</span>
          <span
            class="absolute inset-0 leading-[0.8] -translate-x-full transition-transform duration-500 ease-in-out group-hover:translate-x-0"
          >→</span>
        </span>
      </router-link>

      <!-- Une ligne qui respire plutôt qu'une grille à deux colonnes : les
           liens et le contact se lisent l'un après l'autre, pas empilés dans
           des cases séparées par une règle. -->
      <div class="mt-14 flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
        <!-- py-1.5 sur des liens qui n'en avaient pas : leur zone cliquable
             tombait à 20 px de haut, sous les 24 px de WCAG 2.2 (2.5.8). Le
             padding est absorbé par le gap existant, la ligne ne bouge pas. -->
        <nav class="flex flex-wrap gap-x-6 text-sm uppercase tracking-wide">
          <router-link
            v-for="link in links"
            :key="link.to"
            :to="link.to"
            class="py-1.5 text-ink-muted hover:text-accent transition-colors"
          >
            {{ $t(link.label) }}
          </router-link>
        </nav>

        <div class="flex items-center gap-5">
          <a
            :href="`mailto:${SITE.email}`"
            class="py-1.5 text-sm text-ink hover:text-accent transition-colors break-all"
          >
            {{ SITE.email }}
          </a>

          <!-- Les deux liens sociaux sont les cibles les plus fines du site :
               une icône de 20 px sans rien autour. La boîte passe à 44 px —
               la taille d'un doigt — et l'écart tombe à gap-1 pour que deux
               cibles voisines ne se chevauchent pas : 20 px de glyphe + 24 px
               de blanc laissent exactement le pas nécessaire. -->
          <div class="flex items-center gap-1">
            <a
              :href="SITE.social.linkedin"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              class="inline-flex items-center justify-center w-11 h-11 text-ink-muted hover:text-accent transition-colors"
            >
              <Linkedin class="w-5 h-5" aria-hidden="true" />
              <span class="sr-only">({{ $t('accessibility.new_window') }})</span>
            </a>
            <a
              :href="SITE.social.github"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              class="inline-flex items-center justify-center w-11 h-11 text-ink-muted hover:text-accent transition-colors"
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
