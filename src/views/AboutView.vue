<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useReveal } from '../composables/useReveal'

const { t, tm, te } = useI18n()

useReveal()

// ── Façon de travailler ──────────────────────────────────────
const method = ['listen', 'translate', 'reluctant', 'adoption']

// ── Timeline ─────────────────────────────────────────────────
const timelineFilter = ref('all')
const timelineFilters = ['all', 'pro', 'scolaire', 'engagement']

const allEntries = [
  { key: 'exp1',  type: 'pro' },        // Oct.  2024 — actuel
  { key: 'eng2',  type: 'engagement' }, // Juil. 2025
  { key: 'edu2',  type: 'scolaire' },   // 2024
  { key: 'exp2',  type: 'pro' },        // Sept. 2023
  { key: 'eng1',  type: 'engagement' }, // Juil. 2023
  { key: 'exp3',  type: 'pro' },        // Mai   2023
  { key: 'edu1',  type: 'scolaire' },   // 2020
]

const visibleEntries = computed(() =>
  timelineFilter.value === 'all'
    ? allEntries
    : allEntries.filter((e) => e.type === timelineFilter.value),
)

// ── Compétences ──────────────────────────────────────────────
const activeFilter = ref('all')
const filters = ['all', 'hard', 'soft', 'certifications']

// « pm » en premier : c'est la famille sur laquelle repose l'offre freelance.
// « ai » en deuxième : RAG, MCP et CI/CD sont ce qui distingue le plus le profil.
const hardSubFilters = ['all', 'pm', 'ai', 'dev', 'design', 'data']
const activeHardSub = ref('all')

watch(activeFilter, (val) => {
  if (val !== 'hard') activeHardSub.value = 'all'
})

const filterLabel = (f) =>
  f === 'all' ? t('about.skills_filterAll') : t(`about.skills_${f}_label`)

const visibleCategories = computed(() =>
  activeFilter.value === 'all' ? ['hard', 'soft', 'certifications'] : [activeFilter.value],
)

const visibleHardSubs = computed(() =>
  activeHardSub.value === 'all' ? ['pm', 'ai', 'dev', 'design', 'data'] : [activeHardSub.value],
)

// Chaque famille de compétences a sa couleur, toutes vérifiées >= 4.5:1.
const categoryColor = {
  hard: 'text-accent',
  soft: 'text-ochre-deep',
  certifications: 'text-positive',
}

const getSkills = (cat) => {
  const raw = tm(`about.skills_${cat}`)
  return Array.isArray(raw) ? raw : []
}

const getHardSkills = (sub) => {
  const raw = tm(`about.skills_hard_${sub}`)
  return Array.isArray(raw) ? raw : []
}

const getAllHardSkills = () =>
  ['pm', 'ai', 'dev', 'design', 'data'].flatMap((sub) => getHardSkills(sub))
</script>

<template>
  <div class="relative z-10">

    <section class="max-w-4xl mx-auto px-6 pt-16 pb-14 md:pt-24">
      <h1 class="text-5xl md:text-6xl text-ink mb-10">
        {{ $t('about.title') }}
      </h1>

      <div class="flex flex-col sm:flex-row gap-8 sm:gap-10 sm:items-start">
        <!-- Affiché à 160 px : la source fait 400 px, donc encore net sur
             écran haute densité. Dimensions explicites pour éviter tout
             décalage de mise en page au chargement. -->
        <picture class="shrink-0">
          <source srcset="/portrait.webp" type="image/webp">
          <img
            src="/portrait.jpg"
            alt="Portrait de Bastien Roc"
            width="160"
            height="160"
            class="w-40 h-40 object-cover border border-line-soft"
          >
        </picture>

        <p class="max-w-2xl text-lg text-ink-muted leading-relaxed border-l-2 border-accent pl-6">
          {{ $t('about.path_description') }}
        </p>
      </div>

      <dl class="flex flex-wrap gap-x-14 gap-y-6 mt-10 pt-8 border-t border-line-soft">
        <div>
          <dt class="text-sm text-ink-muted mb-1">{{ $t('about.location_label') }}</dt>
          <dd class="font-medium text-ink">{{ $t('about.location_value') }}</dd>
        </div>
        <div>
          <dt class="text-sm text-ink-muted mb-1">{{ $t('about.languages_label') }}</dt>
          <dd class="font-medium text-ink">
            <span v-for="(lang, i) in tm('about.languages')" :key="i">
              <span v-if="i > 0" class="text-ink-muted"> · </span>{{ lang }}
            </span>
          </dd>
        </div>
      </dl>
    </section>

    <!-- ── Façon de travailler ────────────────────────────── -->
    <section class="max-w-4xl mx-auto px-6 pb-20">
      <div class="reveal mb-12 max-w-2xl">
        <h2 class="text-3xl md:text-4xl text-ink mb-4">{{ $t('about.method_title') }}</h2>
        <p class="text-lg text-ink-muted leading-relaxed">{{ $t('about.method_intro') }}</p>
      </div>

      <ol class="border-t border-line-soft">
        <li
          v-for="(key, i) in method"
          :key="key"
          class="reveal grid md:grid-cols-12 gap-2 md:gap-6 py-8 border-b border-line-soft"
        >
          <p class="md:col-span-1 font-display text-2xl text-accent leading-none">
            {{ String(i + 1).padStart(2, '0') }}
          </p>
          <h3 class="md:col-span-5 text-lg text-ink leading-snug">
            {{ $t(`about.method.${key}.title`) }}
          </h3>
          <p class="md:col-span-6 text-ink-muted leading-relaxed">
            {{ $t(`about.method.${key}.desc`) }}
          </p>
        </li>
      </ol>
    </section>

    <!-- ── Parcours ───────────────────────────────────────── -->
    <section class="bg-surface-2 border-y border-line-soft">
      <div class="max-w-4xl mx-auto px-6 py-20">
        <h2 class="text-3xl md:text-4xl text-ink mb-8">
          {{ $t('about.path_title') }}
        </h2>

        <div class="flex flex-wrap gap-2 mb-10" role="group" aria-label="Filtrer le parcours">
          <button
            v-for="f in timelineFilters"
            :key="f"
            @click="timelineFilter = f"
            :aria-pressed="timelineFilter === f"
            class="px-3 py-1.5 border text-sm transition-colors"
            :class="timelineFilter === f
              ? 'bg-accent text-accent-ink border-accent'
              : 'border-line text-ink-muted hover:text-accent hover:border-accent'"
          >
            {{ $t(`about.timeline_${f === 'all' ? 'filterAll' : f}`) }}
          </button>
        </div>

        <ol class="border-t border-line-soft">
          <li
            v-for="entry in visibleEntries"
            :key="entry.key"
            class="grid md:grid-cols-12 gap-2 md:gap-6 py-8 border-b border-line-soft"
          >
            <div class="md:col-span-3">
              <p class="text-sm text-accent">{{ $t(`about.${entry.key}.date`) }}</p>
              <p v-if="entry.type !== 'pro'" class="text-xs text-ink-muted mt-1">
                {{ $t(`about.timeline_${entry.type}`) }}
              </p>
            </div>

            <div class="md:col-span-9">
              <h3 class="text-lg text-ink mb-1">
                {{ $t(`about.${entry.key}.role`) }}
              </h3>
              <p class="text-sm text-ink-muted mb-3">
                {{ $t(`about.${entry.key}.${entry.type === 'pro' ? 'company' : 'org'}`) }}
              </p>

              <!-- Affiché dès qu'une description existe, et plus seulement pour
                   les expériences : le mémoire documente aussi la formation. -->
              <p v-if="te(`about.${entry.key}.desc`)" class="text-ink-muted leading-relaxed mb-4">
                {{ $t(`about.${entry.key}.desc`) }}
              </p>

              <ul v-if="entry.type !== 'scolaire'" class="flex flex-wrap gap-x-4 gap-y-1.5">
                <li
                  v-for="task in tm(`about.${entry.key}.tasks`)"
                  :key="task"
                  class="flex gap-2 text-sm text-ink-muted"
                >
                  <span class="text-accent" aria-hidden="true">-</span>
                  <span>{{ task }}</span>
                </li>
              </ul>
            </div>
          </li>
        </ol>
      </div>
    </section>

    <!-- ── Compétences ────────────────────────────────────── -->
    <section id="skills" class="max-w-4xl mx-auto px-6 py-20 md:py-24 scroll-mt-20">
      <h2 class="text-3xl md:text-4xl text-ink mb-8">
        {{ $t('about.skills_title') }}
      </h2>

      <div class="flex flex-wrap gap-2 mb-4" role="group" aria-label="Filtrer les compétences">
        <button
          v-for="f in filters"
          :key="f"
          @click="activeFilter = f"
          :aria-pressed="activeFilter === f"
          class="px-3 py-1.5 border text-sm transition-colors"
          :class="activeFilter === f
            ? 'bg-accent text-accent-ink border-accent'
            : 'border-line text-ink-muted hover:text-accent hover:border-accent'"
        >
          {{ filterLabel(f) }}
        </button>
      </div>

      <div v-if="activeFilter === 'hard'" class="flex flex-wrap gap-2 mb-8">
        <button
          v-for="sub in hardSubFilters"
          :key="sub"
          @click="activeHardSub = sub"
          :aria-pressed="activeHardSub === sub"
          class="px-2.5 py-1 border text-xs transition-colors"
          :class="activeHardSub === sub
            ? 'border-accent text-accent'
            : 'border-line-soft text-ink-muted hover:border-accent'"
        >
          {{ sub === 'all' ? $t('about.skills_filterAll') : $t(`about.skills_hard_${sub}_label`) }}
        </button>
      </div>

      <div class="space-y-10 mt-8">
        <div v-for="cat in visibleCategories" :key="cat">
          <h3 :class="['text-sm font-semibold mb-4 pb-2 border-b border-line-soft', categoryColor[cat]]">
            {{ $t(`about.skills_${cat}_label`) }}
          </h3>

          <template v-if="cat === 'hard'">
            <ul v-if="activeFilter !== 'hard'" class="flex flex-wrap gap-2">
              <li
                v-for="skill in getAllHardSkills()"
                :key="skill"
                class="px-3 py-1.5 border border-line-soft text-sm text-ink"
              >{{ skill }}</li>
            </ul>

            <div v-else class="space-y-6">
              <div v-for="sub in visibleHardSubs" :key="sub">
                <p v-if="activeHardSub === 'all'" class="text-xs text-ink-muted mb-2">
                  {{ $t(`about.skills_hard_${sub}_label`) }}
                </p>
                <ul class="flex flex-wrap gap-2">
                  <li
                    v-for="skill in getHardSkills(sub)"
                    :key="skill"
                    class="px-3 py-1.5 border border-line-soft text-sm text-ink"
                  >{{ skill }}</li>
                </ul>
              </div>
            </div>
          </template>

          <ul v-else class="flex flex-wrap gap-2">
            <li
              v-for="skill in getSkills(cat)"
              :key="skill"
              class="px-3 py-1.5 border border-line-soft text-sm text-ink"
            >{{ skill }}</li>
          </ul>
        </div>
      </div>
    </section>

  </div>
</template>
