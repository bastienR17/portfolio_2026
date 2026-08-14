<script setup>
import { ArrowUpRight } from 'lucide-vue-next'

/**
 * Lien d'appel à l'action à double flèche.
 *
 * La flèche qui part en haut à droite est remplacée par sa jumelle qui arrive
 * d'en bas à gauche : le geste se répète sans jamais revenir en arrière. La
 * paire est aria-hidden — deux flèches pour un seul mouvement n'ont rien à
 * dire à qui ne les voit pas, le libellé du lien suffit.
 *
 * Les deux décalages (translate-x-10 / translate-y-10) doivent rester
 * symétriques, sinon les flèches se croisent au milieu de la pastille au lieu
 * de se relayer : c'est ce qui justifie un composant plutôt qu'un copier-coller
 * du balisage à chaque emploi.
 */
defineProps({
  to: { type: String, required: true },
  // Le CTA de bas de page pèse plus lourd que celui du hero, où le titre
  // porte déjà toute l'emphase.
  large: { type: Boolean, default: false },
})
</script>

<template>
  <router-link :to="to" class="group inline-flex items-stretch">
    <span
      class="bg-accent-vivid text-accent-vivid-ink font-medium transition-colors duration-500 ease-in-out group-hover:bg-ink group-hover:text-page"
      :class="large ? 'px-7 py-4 text-lg' : 'px-6 py-3'"
    >
      <slot />
    </span>
    <span
      class="relative grid place-items-center overflow-hidden bg-accent-vivid text-accent-vivid-ink border-l border-accent-vivid-ink/20 transition-colors duration-500 ease-in-out group-hover:bg-ink group-hover:text-page"
      :class="large ? 'w-14' : 'w-12'"
      aria-hidden="true"
    >
      <ArrowUpRight
        class="absolute transition-transform duration-500 ease-in-out group-hover:translate-x-10 group-hover:-translate-y-10"
        :class="large ? 'w-6 h-6' : 'w-5 h-5'"
      />
      <ArrowUpRight
        class="absolute -translate-x-10 translate-y-10 transition-transform duration-500 ease-in-out group-hover:translate-x-0 group-hover:translate-y-0"
        :class="large ? 'w-6 h-6' : 'w-5 h-5'"
      />
    </span>
  </router-link>
</template>
