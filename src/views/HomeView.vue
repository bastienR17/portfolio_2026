<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  Target, Users, Workflow, Bot,
  Landmark, ShoppingBag, TrainFront, HeartHandshake,
  CalendarDays, Package, Repeat,
  ArrowRight, ArrowDown,
} from 'lucide-vue-next'
import CtaLink from '../components/common/CtaLink.vue'
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
const statsEl = ref(null)
let intervals = []
let counterObserver = null

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

  // Le hero occupe désormais tout l'écran : les compteurs commencent sous la
  // ligne de flottaison. Lancés au montage, ils auraient fini leur course
  // avant que quiconque les ait à l'écran — on attend qu'ils entrent dans le
  // cadre. Sans IntersectionObserver, on retombe sur le comportement d'avant.
  if (!('IntersectionObserver' in window) || !statsEl.value) {
    animateCounters()
    return
  }

  counterObserver = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return
      counterObserver.disconnect()
      counterObserver = null
      animateCounters()
    },
    { threshold: 0.35 },
  )
  counterObserver.observe(statsEl.value)
})

onUnmounted(() => {
  counterObserver?.disconnect()
  counterObserver = null
  intervals.forEach(clearInterval)
  intervals = []
})

// ── Contenu piloté depuis l'i18n ─────────────────────────────
const services = [
  { key: 'amoa',   icon: Target },
  { key: 'ai',     icon: Bot },
  { key: 'change', icon: Users },
  { key: 'agile',  icon: Workflow },
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
    <!-- Aucun bg-* : la transparence laisse voir le décor 3D (canvas fixe
         -z-50 d'Experience3D.vue), ou son dégradé de repli sur les machines
         écartées par canRender3D(). C'est le seul endroit du site où le décor
         passe au premier plan plutôt que de border le contenu.
         La hauteur retire --nav-h : la barre de navigation est sticky mais
         reste dans le flux, un 100svh plein déborderait d'autant. -->
    <section
      class="relative flex flex-col overflow-hidden min-h-[calc(100svh-var(--nav-h))]"
    >
      <!-- Colonnes de repérage, façon gabarit d'imprimeur laissé apparent :
           1/3/4/3/1 sur douze en grand écran, ramenées à 2/8/2 en petit où
           cinq traits sur 375 px ne feraient plus qu'un motif serré. -->
      <div class="hero-rules absolute inset-0 grid grid-cols-12" aria-hidden="true">
        <div class="col-span-2 md:col-span-1"></div>
        <div class="hidden md:block md:col-span-3"></div>
        <div class="col-span-8 md:col-span-4"></div>
        <div class="hidden md:block md:col-span-3"></div>
        <div class="col-span-2 md:col-span-1"></div>
      </div>

      <!-- Voile de lisibilité : voir .hero-veil dans Main.css. -->
      <div class="hero-veil absolute inset-0" aria-hidden="true"></div>

      <div class="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-14 text-center">
        <span class="tag-stamp text-ink mb-8">
          <span class="w-1.5 h-1.5 bg-accent rounded-full shrink-0" aria-hidden="true"></span>
          {{ $t('home.availability') }}
        </span>

        <h1 class="h-mega text-ink max-w-5xl text-balance">
          {{ $t('home.title') }}
        </h1>

        <p class="mt-8 max-w-2xl text-lg md:text-xl text-ink-muted leading-relaxed">
          {{ $t('home.subtitle') }}
        </p>

        <div class="mt-10 flex flex-wrap items-center justify-center gap-3">
          <!-- Le bouton principal mène au contact : c'est l'action qui
               déclenche une mission. -->
          <CtaLink to="/contact">{{ $t('home.cta') }}</CtaLink>

          <!-- Bordure en encre pleine et fond translucide, là où le reste du
               site se contente de `border-line` sur un aplat : sur le décor,
               le filet gris tombait à 2,5:1 selon la crête qui passait
               derrière — sous le seuil des composants d'interface (RGAA
               4.1 / WCAG 1.4.11). Le voile de fond suffit à ramener le texte
               et son survol en accent au-dessus de 5,6:1 quelle que soit la
               scène. -->
          <router-link
            to="/prestations"
            class="px-6 py-3 border border-ink bg-page/50 text-ink font-medium hover:border-accent hover:text-accent transition-colors"
          >
            {{ $t('home.cta_secondary') }}
          </router-link>
        </div>
      </div>

      <!-- Dans le flux plutôt qu'en absolute : sur un écran bas, ou en mode
           dyslexique où les tailles de titre sont forcées, l'indicateur
           pousse la section au lieu de chevaucher le titre. -->
      <p class="relative z-10 pb-10 flex justify-center">
        <a
          href="#chiffres"
          class="inline-flex items-center gap-2 text-sm text-ink-muted hover:text-accent transition-colors"
        >
          {{ $t('home.scroll') }}
          <ArrowDown class="w-4 h-4" />
        </a>
      </p>
    </section>

    <!-- ─── 1bis. Chiffres ──────────────────────────────────── -->
    <!-- Fond opaque assumé : il ferme le plein écran et garantit le contraste
         des chiffres, que le décor 3D ne peut pas garantir seul. -->
    <section id="chiffres" class="bg-page scroll-mt-20">
      <div class="max-w-6xl mx-auto px-6 py-16 md:py-20">
        <!-- Compteurs, traités comme un bandeau de chiffres et non comme des cartes -->
        <dl ref="statsEl" class="grid grid-cols-2 md:grid-cols-4 border-t-2 border-ink">
          <div
            v-for="(stat, i) in stats"
            :key="stat.key"
            class="px-1 py-6 md:px-6 md:first:pl-0 border-b md:border-b-0 md:border-r last:border-r-0 border-line-soft"
          >
            <dd class="font-display text-5xl md:text-6xl text-accent tabular-nums leading-none mb-2">
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
      </div>
    </section>

    <!-- ─── 2. Offre ────────────────────────────────────────── -->
    <section id="offre" class="bg-surface-2 border-y border-line-soft scroll-mt-20">
      <div class="max-w-6xl mx-auto px-6 py-20 md:py-24">
        <div class="reveal max-w-2xl mb-14">
          <h2 class="h-section text-ink mb-5">{{ $t('home.offer_title') }}</h2>
          <p class="text-lg text-ink-muted leading-relaxed">{{ $t('home.offer_intro') }}</p>
        </div>

        <div class="grid sm:grid-cols-2 gap-6">
          <article
            v-for="service in services"
            :key="service.key"
            class="reveal group card-punch is-static bg-surface p-8 transition-colors duration-200 hover:border-accent md:odd:-rotate-[0.4deg] md:even:rotate-[0.4deg]"
          >
            <component :is="service.icon" class="w-5 h-5 text-accent mb-5 transition-transform duration-200 group-hover:scale-110" aria-hidden="true" />
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
    <section class="bg-page border-y border-line-soft">
      <div class="max-w-6xl mx-auto px-6 py-20 md:py-24">
        <div class="reveal max-w-2xl mb-14">
          <h2 class="h-section text-ink mb-5">{{ $t('home.contexts_title') }}</h2>
          <p class="text-lg text-ink-muted leading-relaxed">{{ $t('home.contexts_intro') }}</p>
        </div>

        <!-- Mur de "logotypes" typographiques : sans logos réels à disposition,
             le nom de chaque organisation devient lui-même l'élément visuel —
             un mur de mastheads plutôt que des cartes de texte. Le rôle et le
             détail restent en clair (pas au survol), juste réduits en échelle
             pour laisser le nom porter la mise en scène. -->
        <ul class="border-t border-line-soft">
          <li
            v-for="context in contexts"
            :key="context.key"
            class="reveal py-8 md:py-10 border-b border-line-soft"
          >
            <div class="flex flex-col md:flex-row md:items-baseline md:justify-between gap-2 md:gap-6">
              <h3 class="font-display text-4xl md:text-6xl text-ink leading-none tracking-tight">
                {{ $t(`home.contexts.${context.key}.org`) }}
              </h3>
              <p class="flex items-center gap-2 text-sm text-ink-muted shrink-0 md:text-right">
                <component :is="context.icon" class="w-4 h-4 text-accent shrink-0" aria-hidden="true" />
                {{ $t(`home.contexts.${context.key}.role`) }}
              </p>
            </div>
            <p class="mt-3 text-sm text-ink-muted max-w-lg">
              {{ $t(`home.contexts.${context.key}.detail`) }}
            </p>
          </li>
        </ul>
      </div>
    </section>

    <!-- ─── 4. Respiration 3D ───────────────────────────────── -->
    <!-- Section volontairement vide : après Offre + Contextes, on laisse le
         décor 3D respirer avant de reprendre. Pas de bg-* : la transparence
         laisse voir le canvas fixe -z-50 d'Experience3D.vue. Hauteur limitée
         à dessein : le ciel occupe toujours le haut du canvas (fixe, ne
         défile pas avec la page) et y reste souvent peu chargé la nuit —
         une section trop haute expose surtout ce vide plutôt que les
         crêtes/éoliennes, plus bas dans le cadre. -->
    <section class="min-h-[30vh] md:min-h-[45vh] flex flex-col items-center justify-end px-6 pb-16">
      <!-- Trait qui se dessine à l'arrivée : marque le temps d'arrêt plus
           franchement qu'un simple fondu, sans allonger la section. -->
      <div class="reveal signal-line w-24 h-[3px] bg-accent mb-6" aria-hidden="true"></div>
      <p class="reveal">
        <a
          href="#modalites"
          class="inline-flex items-center gap-2 text-base font-medium text-ink hover:text-accent transition-colors"
        >
          {{ $t('home.scroll') }}
          <ArrowDown class="w-4 h-4" />
        </a>
      </p>
    </section>

    <!-- ─── 5. Modalités d'intervention ─────────────────────── -->
    <section id="modalites" class="bg-surface-2 border-b border-line-soft scroll-mt-20">
      <div class="max-w-6xl mx-auto px-6 py-20 md:py-24">
        <div class="reveal max-w-2xl mb-14">
          <h2 class="h-section text-ink mb-5">{{ $t('home.formats_title') }}</h2>
          <p class="text-lg text-ink-muted leading-relaxed">{{ $t('home.formats_intro') }}</p>
        </div>

        <div class="grid md:grid-cols-3 gap-6">
          <article
            v-for="(format, i) in formats"
            :key="format.key"
            class="reveal group card-punch is-static bg-surface p-8 transition-colors duration-200 hover:border-accent"
            :class="i % 2 === 0 ? 'md:rotate-[0.4deg]' : 'md:-rotate-[0.4deg]'"
          >
            <component :is="format.icon" class="w-5 h-5 text-accent mb-5 transition-transform duration-200 group-hover:scale-110" aria-hidden="true" />
            <h3 class="text-lg text-ink mb-3">
              {{ $t(`home.formats.${format.key}.title`) }}
            </h3>
            <p class="text-sm text-ink-muted leading-relaxed">
              {{ $t(`home.formats.${format.key}.desc`) }}
            </p>
          </article>
        </div>

        <p class="reveal mt-8 text-sm text-ink-muted">
          {{ $t('home.formats_note') }}
        </p>
      </div>
    </section>

    <!-- ─── 6. CTA final ────────────────────────────────────── -->
    <section class="bg-page">
      <div class="reveal max-w-6xl mx-auto px-6 py-24 md:py-32">
        <h2 class="h-mega text-ink mb-8 max-w-4xl">{{ $t('home.final_title') }}</h2>
        <p class="text-lg text-ink-muted leading-relaxed max-w-lg mb-10">{{ $t('home.final_desc') }}</p>

        <CtaLink to="/contact" large>{{ $t('home.final_cta') }}</CtaLink>
      </div>
    </section>

  </div>
</template>
