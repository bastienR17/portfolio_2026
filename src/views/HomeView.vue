<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  Target, Users, Workflow, Bot,
  Landmark, ShoppingBag, TrainFront, HeartHandshake,
  CalendarDays, Package, Repeat,
  ArrowRight, ArrowDown,
} from 'lucide-vue-next'
import { useReveal } from '../composables/useReveal'

const { t, locale } = useI18n()

useReveal()

// ── Compteurs ────────────────────────────────────────────────
// Faits vérifiables issus du CV plutôt que des chiffres d'impact : ancienneté
// depuis 2023, étendue de l'offre, contextes traversés, certifications.
const stats = [
  { target: 3, suffix: '', key: 'home.stat_experience', detail: 'home.stat_experience_detail' },
  { target: 4, suffix: '', key: 'home.stat_domains', detail: 'home.stat_domains_detail' },
  { target: 3, suffix: '', key: 'home.stat_sectors', detail: 'home.stat_sectors_detail' },
  { target: 2, suffix: '', key: 'home.stat_certs', detail: 'home.stat_certs_detail' },
]

const counts = ref(stats.map(() => 0))
let intervals = []

const formatCount = (n) => n.toLocaleString(locale.value === 'fr' ? 'fr-FR' : 'en-US')

function animateCounters() {
  stats.forEach((stat, i) => {
    const steps = 30
    const delay = 800 / steps
    let step = 0
    const interval = setInterval(() => {
      step++
      counts.value[i] = Math.min(Math.round((stat.target / steps) * step), stat.target)
      if (step >= steps) clearInterval(interval)
    }, delay)
    intervals.push(interval)
  })
}

onMounted(() => {
  // En mouvement réduit, on affiche directement les valeurs finales.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    counts.value = stats.map((s) => s.target)
    return
  }
  setTimeout(animateCounters, 400)
})

onUnmounted(() => {
  intervals.forEach(clearInterval)
  intervals = []
})

// ── Contenu piloté depuis l'i18n ─────────────────────────────
const services = [
  { key: 'amoa',   icon: Target },
  { key: 'change', icon: Users },
  { key: 'agile',  icon: Workflow },
  { key: 'ai',     icon: Bot },
]

const contexts = [
  { key: 'state',     icon: Landmark },
  { key: 'retail',    icon: ShoppingBag },
  { key: 'transport', icon: TrainFront },
  { key: 'assoc',     icon: HeartHandshake },
]

const formats = [
  { key: 'daily',     icon: CalendarDays },
  { key: 'fixed',     icon: Package },
  { key: 'recurring', icon: Repeat },
]
</script>

<template>
  <div class="relative z-10">

    <!-- ─── 1. Hero ─────────────────────────────────────────── -->
    <section class="max-w-6xl mx-auto px-6 pt-16 pb-20 md:pt-24 md:pb-28">
      <div class="grid md:grid-cols-12 gap-10 items-end">

        <div class="md:col-span-7">
          <p class="flex items-center gap-2.5 mb-8 text-sm text-ink-muted">
            <span class="w-1.5 h-1.5 bg-accent rounded-full shrink-0" aria-hidden="true"></span>
            {{ $t('home.availability') }}
          </p>

          <h1 class="text-5xl md:text-[4.25rem] text-ink mb-7">
            {{ $t('home.title') }}
          </h1>

          <p class="max-w-xl text-lg text-ink-muted leading-relaxed mb-9">
            {{ $t('home.subtitle') }}
          </p>

          <div class="flex flex-wrap items-center gap-3">
            <!-- Le bouton principal mène au contact : c'est l'action qui
                 déclenche une mission. « Explorer ↓ » couvre déjà le renvoi
                 vers l'offre plus bas, le secondaire ne fait que le doubler. -->
            <router-link
              to="/contact"
              class="inline-flex items-center gap-2 px-6 py-3 bg-accent text-accent-ink font-medium hover:opacity-90 transition-opacity"
            >
              {{ $t('home.cta') }}
              <ArrowRight class="w-4 h-4" />
            </router-link>

            <router-link
              to="/prestations"
              class="px-6 py-3 border border-line text-ink font-medium hover:border-accent hover:text-accent transition-colors"
            >
              {{ $t('home.cta_secondary') }}
            </router-link>
          </div>
        </div>

        <div class="md:col-span-5">
          <!-- WebP avec repli JPEG : le navigateur ne télécharge qu'un seul
               des deux, et le WebP fait presque moitié moins lourd.

               Les trois largeurs viennent de scripts/generate-hero-images.py.
               Une seule image de 800 px était servie à tout le monde alors
               qu'elle s'affiche à 437 px sur un écran de bureau : un poste en
               densité 1 téléchargeait plus de trois fois les pixels utiles.
               `sizes` décrit la place réellement occupée, calculée sur la
               grille : contenu = min(fenêtre, 1152) - 48, douze colonnes
               séparées de 40 px, la cellule en occupe cinq plus quatre
               gouttières. Au-delà de 1200 px, max-w-6xl plafonne et la largeur
               reste bloquée à 437 px. -->
          <picture>
            <source
              type="image/webp"
              sizes="(min-width: 1200px) 440px, (min-width: 768px) 37vw, calc(100vw - 3rem)"
              srcset="
                /hero-transformation-440.webp 440w,
                /hero-transformation-640.webp 640w,
                /hero-transformation-800.webp 800w
              "
            >
            <img
              src="/hero-transformation.jpg"
              alt="Transformation digitale - Bastien Roc"
              width="800"
              height="533"
              fetchpriority="high"
              class="w-full h-auto border border-line-soft"
            >
          </picture>
        </div>
      </div>

      <!-- Compteurs, traités comme un bandeau de chiffres et non comme des cartes -->
      <dl class="grid grid-cols-2 md:grid-cols-4 mt-16 border-t border-line-soft">
        <div
          v-for="(stat, i) in stats"
          :key="stat.key"
          class="px-1 py-6 md:px-6 md:first:pl-0 border-b md:border-b-0 md:border-r last:border-r-0 border-line-soft"
        >
          <dd class="font-display text-4xl md:text-5xl text-accent tabular-nums leading-none mb-2">
            {{ formatCount(counts[i]) }}{{ stat.suffix }}
          </dd>
          <!-- Le détail est affiché en clair et non au survol : un tooltip
               serait invisible au doigt et demanderait une gestion du focus
               pour rester conforme (RGAA 1.4.13). -->
          <dt class="text-sm text-ink leading-snug">
            {{ t(stat.key) }}
            <span class="block mt-1 text-xs text-ink-muted">{{ t(stat.detail) }}</span>
          </dt>
        </div>
      </dl>

      <p class="mt-12 flex justify-center">
        <a
          href="#offre"
          class="inline-flex items-center gap-2 text-sm text-ink-muted hover:text-accent transition-colors"
        >
          {{ $t('home.scroll') }}
          <ArrowDown class="w-4 h-4" />
        </a>
      </p>
    </section>

    <!-- ─── 2. Offre ────────────────────────────────────────── -->
    <section id="offre" class="bg-surface-2 border-y border-line-soft scroll-mt-20">
      <div class="max-w-6xl mx-auto px-6 py-20 md:py-24">
        <div class="reveal max-w-2xl mb-14">
          <h2 class="text-4xl md:text-5xl text-ink mb-5">{{ $t('home.offer_title') }}</h2>
          <p class="text-lg text-ink-muted leading-relaxed">{{ $t('home.offer_intro') }}</p>
        </div>

        <div class="grid sm:grid-cols-2 gap-px bg-line-soft border border-line-soft">
          <article
            v-for="service in services"
            :key="service.key"
            class="reveal bg-surface p-8"
          >
            <component :is="service.icon" class="w-5 h-5 text-accent mb-5" aria-hidden="true" />
            <h3 class="text-xl text-ink mb-3">
              {{ $t(`prestations.services.${service.key}.title`) }}
            </h3>
            <p class="text-ink-muted leading-relaxed">
              {{ $t(`prestations.services.${service.key}.desc`) }}
            </p>
          </article>
        </div>

        <p class="reveal mt-10">
          <router-link
            to="/prestations"
            class="inline-flex items-center gap-2 font-medium text-accent hover:underline underline-offset-4"
          >
            {{ $t('home.offer_cta') }}
            <ArrowRight class="w-4 h-4" />
          </router-link>
        </p>
      </div>
    </section>

    <!-- ─── 3. Contextes d'intervention ─────────────────────── -->
    <section class="bg-page">
      <div class="max-w-6xl mx-auto px-6 py-20 md:py-24">
        <div class="reveal max-w-2xl mb-14">
          <h2 class="text-4xl md:text-5xl text-ink mb-5">{{ $t('home.contexts_title') }}</h2>
          <p class="text-lg text-ink-muted leading-relaxed">{{ $t('home.contexts_intro') }}</p>
        </div>

        <ul class="border-t border-line-soft">
          <li
            v-for="context in contexts"
            :key="context.key"
            class="reveal grid md:grid-cols-12 gap-2 md:gap-6 py-7 border-b border-line-soft"
          >
            <div class="md:col-span-5 flex items-start gap-3">
              <component :is="context.icon" class="w-5 h-5 text-accent shrink-0 mt-0.5" aria-hidden="true" />
              <h3 class="text-lg text-ink leading-snug">
                {{ $t(`home.contexts.${context.key}.org`) }}
              </h3>
            </div>
            <p class="md:col-span-3 text-sm text-ink-muted md:pt-1">
              {{ $t(`home.contexts.${context.key}.role`) }}
            </p>
            <p class="md:col-span-4 text-sm text-ink-muted md:pt-1">
              {{ $t(`home.contexts.${context.key}.detail`) }}
            </p>
          </li>
        </ul>
      </div>
    </section>

    <!-- ─── 4. Modalités d'intervention ─────────────────────── -->
    <section class="bg-surface-2 border-y border-line-soft">
      <div class="max-w-6xl mx-auto px-6 py-20 md:py-24">
        <div class="reveal max-w-2xl mb-14">
          <h2 class="text-4xl md:text-5xl text-ink mb-5">{{ $t('home.formats_title') }}</h2>
          <p class="text-lg text-ink-muted leading-relaxed">{{ $t('home.formats_intro') }}</p>
        </div>

        <div class="grid md:grid-cols-3 gap-px bg-line-soft border border-line-soft">
          <article
            v-for="format in formats"
            :key="format.key"
            class="reveal bg-surface p-8"
          >
            <component :is="format.icon" class="w-5 h-5 text-accent mb-5" aria-hidden="true" />
            <h3 class="text-lg text-ink mb-3">
              {{ $t(`home.formats.${format.key}.title`) }}
            </h3>
            <p class="text-sm text-ink-muted leading-relaxed">
              {{ $t(`home.formats.${format.key}.desc`) }}
            </p>
          </article>
        </div>

        <p class="reveal mt-6 text-sm text-ink-muted">
          {{ $t('home.formats_note') }}
        </p>
      </div>
    </section>

    <!-- ─── 5. CTA final ────────────────────────────────────── -->
    <section class="bg-page">
      <div class="reveal max-w-6xl mx-auto px-6 py-20 md:py-24">
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10 border-b-2 border-accent">
          <div class="max-w-xl">
            <h2 class="text-4xl md:text-5xl text-ink mb-4">{{ $t('home.final_title') }}</h2>
            <p class="text-lg text-ink-muted leading-relaxed">{{ $t('home.final_desc') }}</p>
          </div>

          <router-link
            to="/contact"
            class="inline-flex items-center gap-2 px-6 py-3 shrink-0 bg-accent text-accent-ink font-medium hover:opacity-90 transition-opacity"
          >
            {{ $t('home.final_cta') }}
            <ArrowRight class="w-4 h-4" />
          </router-link>
        </div>
      </div>
    </section>

  </div>
</template>
