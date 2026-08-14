<script setup>
import { computed } from 'vue'
import { ArrowUpRight } from 'lucide-vue-next'

const props = defineProps({
  project: { type: Object, required: true },
})

/** Les dépôts mélangent les deux conventions : « Clock-Creative-Web », « text_to_voice ». */
const displayName = computed(() => props.project.name.replace(/[-_]/g, ' '))

/**
 * La vignette n'est plus une image mais le nom lui-même : sa longueur décide
 * donc de son échelle, sinon « Rendu librairie open source » déborde du cadre
 * là où « Vuephone » y flotte. Trois paliers suffisent — au-delà, l'écart
 * entre deux cartes voisines se voit plus que le gain.
 */
const nameScale = computed(() => {
  const length = displayName.value.length
  if (length > 24) return 'text-2xl'
  if (length > 14) return 'text-3xl'
  return 'text-4xl'
})
</script>

<template>
  <article class="card-punch group flex flex-col h-full overflow-hidden bg-surface md:odd:-rotate-[0.4deg] md:even:rotate-[0.4deg]">

    <!-- Le nom traité comme un visuel plutôt qu'illustré par une image.
         Auparavant, chaque carte affichait la carte OpenGraph du dépôt servie
         par opengraph.githubassets.com : une requête vers un tiers hors UE à
         chaque affichage, pour une vignette qui ne montrait que ce même nom
         sur fond blanc. Le mur de mastheads de la page d'accueil applique
         déjà ce raisonnement aux organisations. -->
    <div class="relative flex items-end h-44 p-5 overflow-hidden bg-surface-2 border-b border-line-soft">
      <h3
        class="font-display leading-[0.95] tracking-tight text-ink capitalize line-clamp-3 transition-colors group-hover:text-accent"
        :class="nameScale"
      >
        {{ displayName }}
      </h3>

      <!-- La pile plutôt qu'un seul nom : le projet Symfony est à 52 % de PHP
           contre 44 % de Twig, l'étiquette unique en cachait la moitié. Les
           langages sont ordonnés du plus présent au moins présent, et pivotés
           en alternance pour garder l'allure de tampons du reste du site. -->
      <ul
        v-if="project.languages.length"
        class="absolute top-3 right-3 flex flex-wrap justify-end gap-1.5 max-w-[65%]"
      >
        <li
          v-for="(language, i) in project.languages"
          :key="language"
          class="px-2 py-0.5 text-xs font-medium bg-surface border border-line text-ink"
          :class="i % 2 ? 'rotate-2' : '-rotate-2'"
        >
          {{ language }}
        </li>
      </ul>
    </div>

    <div class="flex flex-col flex-grow p-5 text-left">
      <p v-if="project.description" class="mb-4 text-sm line-clamp-2 text-ink-muted">
        {{ project.description }}
      </p>

      <div class="flex items-center justify-between pt-4 mt-auto border-t border-line-soft">
        <time :datetime="project.updated_at" class="text-xs text-ink-muted">
          {{ new Date(project.updated_at).toLocaleDateString() }}
        </time>

        <a
          :href="project.html_url"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-1 py-1.5 text-sm font-medium text-accent hover:underline underline-offset-4"
        >
          {{ $t('projects.detail') }}
          <span class="sr-only">- {{ displayName }} ({{ $t('accessibility.new_window') }})</span>
          <ArrowUpRight class="w-4 h-4" aria-hidden="true" />
        </a>
      </div>
    </div>
  </article>
</template>
