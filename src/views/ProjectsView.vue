<script setup>
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import ProjectCard from '../components/projects/ProjectCard.vue'
import { useReveal } from '../composables/useReveal'

const { tm, te } = useI18n()

useReveal()

// Études de cas et projets : contenu éditorial, piloté depuis l'i18n.
const cases = ['ministeres', 'sephora', 'sncf']
const studies = ['memoire', 'startup']

// ── Dépôts GitHub ────────────────────────────────────────────
const projects = ref([])
const loading = ref(true)
const failed = ref(false)
const limit = ref(6)
const sortBy = ref('updated')
const selectedStack = ref('All')

onMounted(async () => {
  try {
    const response = await fetch('https://api.github.com/users/Bastienr17/repos?sort=updated&per_page=100')
    const data = await response.json()
    projects.value = Array.isArray(data) ? data.filter((repo) => !repo.fork) : []
    failed.value = !Array.isArray(data)
  } catch {
    projects.value = []
    failed.value = true
  } finally {
    loading.value = false
  }
})

const availableStacks = computed(() => {
  const stacks = (projects.value || []).map((p) => p.language).filter(Boolean)
  return ['All', ...new Set(stacks)]
})

const matchingProjects = computed(() =>
  selectedStack.value === 'All'
    ? projects.value
    : projects.value.filter((p) => p.language === selectedStack.value),
)

const filteredAndSortedProjects = computed(() => {
  const result = [...matchingProjects.value].sort((a, b) => {
    if (sortBy.value === 'stars') return (b.stargazers_count || 0) - (a.stargazers_count || 0)
    if (sortBy.value === 'name') return (a.name || '').localeCompare(b.name || '')
    return new Date(b.updated_at) - new Date(a.updated_at)
  })
  return result.slice(0, limit.value)
})
</script>

<template>
  <div class="relative z-10">

    <!-- En-tête -->
    <section class="max-w-6xl mx-auto px-6 pt-16 pb-14 md:pt-24">
      <h1 class="h-hero text-ink mb-6">
        {{ $t('projects.title') }}
      </h1>
      <p class="max-w-2xl text-lg text-ink-muted leading-relaxed">
        {{ $t('projects.intro') }}
      </p>
    </section>

    <!-- ─── Études de cas ───────────────────────────────────── -->
    <section class="bg-surface-2 border-y border-line-soft">
      <div class="max-w-6xl mx-auto px-6 py-20 md:py-24">
        <div class="reveal mb-14 max-w-2xl">
          <h2 class="h-section text-ink mb-4">{{ $t('projects.cases_title') }}</h2>
          <!-- Cadre honnête : ces missions ne sont pas des prestations clients. -->
          <p class="text-sm text-ink-muted leading-relaxed border-l-2 border-line pl-4">
            {{ $t('projects.cases_disclaimer') }}
          </p>
        </div>

        <div class="space-y-px bg-line-soft border border-line-soft">
          <article
            v-for="key in cases"
            :key="key"
            class="reveal bg-surface p-8 md:p-10"
          >
            <header class="pb-6 mb-6 border-b border-line-soft">
              <h3 class="text-xl md:text-2xl text-ink mb-2 tracking-tight">
                {{ $t(`projects.cases.${key}.org`) }}
              </h3>
              <p class="text-sm text-ink-muted">
                {{ $t(`projects.cases.${key}.role`) }}
                <span class="text-accent"> · </span>
                {{ $t(`projects.cases.${key}.period`) }}
              </p>
            </header>

            <div class="grid md:grid-cols-2 gap-x-12 gap-y-8">
              <div>
                <h4 class="text-sm font-semibold text-accent mb-2">{{ $t('projects.label_context') }}</h4>
                <p class="text-ink-muted leading-relaxed">{{ $t(`projects.cases.${key}.context`) }}</p>
              </div>

              <div>
                <h4 class="text-sm font-semibold text-accent mb-2">{{ $t('projects.label_mission') }}</h4>
                <p class="text-ink-muted leading-relaxed">{{ $t(`projects.cases.${key}.mission`) }}</p>
              </div>

              <div>
                <h4 class="text-sm font-semibold text-accent mb-3">{{ $t('projects.label_actions') }}</h4>
                <ul class="space-y-2">
                  <li
                    v-for="(item, i) in tm(`projects.cases.${key}.actions`)"
                    :key="i"
                    class="flex gap-3 text-sm text-ink-muted"
                  >
                    <span class="text-accent shrink-0" aria-hidden="true">-</span>
                    <span>{{ item }}</span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 class="text-sm font-semibold text-accent mb-3">{{ $t('projects.label_results') }}</h4>
                <ul class="space-y-2">
                  <li
                    v-for="(item, i) in tm(`projects.cases.${key}.results`)"
                    :key="i"
                    class="flex gap-3 text-sm text-ink font-medium"
                  >
                    <span class="text-accent shrink-0" aria-hidden="true">→</span>
                    <span>{{ item }}</span>
                  </li>
                </ul>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- ─── Projets ─────────────────────────────────────────── -->
    <section class="bg-page">
      <div class="max-w-6xl mx-auto px-6 py-20 md:py-24">
        <h2 class="reveal h-section text-ink mb-14 max-w-2xl">
          {{ $t('projects.studies_title') }}
        </h2>

        <div class="grid md:grid-cols-2 gap-px bg-line-soft border border-line-soft">
          <article
            v-for="key in studies"
            :key="key"
            class="reveal bg-surface p-8"
          >
            <h3 class="text-lg text-ink mb-2 leading-snug">
              {{ $t(`projects.studies.${key}.title`) }}
            </h3>
            <p class="text-sm text-ink-muted mb-5">
              {{ $t(`projects.studies.${key}.org`) }}
              <span class="text-accent"> · </span>
              {{ $t(`projects.studies.${key}.period`) }}
            </p>
            <p class="text-ink-muted leading-relaxed">
              {{ $t(`projects.studies.${key}.desc`) }}
            </p>

            <!-- La problématique de recherche, mise en exergue : c'est elle qui
                 montre l'angle du travail, pas le résumé. -->
            <blockquote
              v-if="te(`projects.studies.${key}.question`)"
              class="mt-5 pl-4 border-l-2 border-accent text-sm text-ink italic leading-relaxed"
            >
              {{ $t(`projects.studies.${key}.question`) }}
            </blockquote>
          </article>
        </div>
      </div>
    </section>

    <!-- ─── Dépôts GitHub ───────────────────────────────────── -->
    <section class="bg-surface-2 border-y border-line-soft">
      <div class="max-w-6xl mx-auto px-6 py-20 md:py-24">
        <div class="reveal mb-12 max-w-2xl">
          <h2 class="h-section text-ink mb-4">{{ $t('projects.repos_title') }}</h2>
          <p class="text-lg text-ink-muted leading-relaxed">{{ $t('projects.repos_intro') }}</p>
        </div>

        <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b border-line">
          <div class="flex flex-wrap gap-2">
            <button
              v-for="stack in availableStacks"
              :key="stack"
              @click="selectedStack = stack; limit = 6"
              :aria-pressed="selectedStack === stack"
              class="px-3 py-1.5 border text-sm transition-colors"
              :class="selectedStack === stack
                ? 'bg-accent text-accent-ink border-accent'
                : 'border-line text-ink-muted hover:text-accent hover:border-accent'"
            >
              {{ stack === 'All' ? $t('projects.all') : stack }}
            </button>
          </div>

          <div class="flex items-center gap-3 shrink-0">
            <label for="sort" class="text-sm text-ink-muted">{{ $t('projects.sortBy') }}</label>
            <select
              id="sort"
              v-model="sortBy"
              class="bg-surface border border-line text-ink text-sm py-2 px-3 cursor-pointer"
            >
              <option value="updated">{{ $t('projects.sortOptions.recent') }}</option>
              <option value="stars">{{ $t('projects.sortOptions.stars') }}</option>
              <option value="name">{{ $t('projects.sortOptions.name') }}</option>
            </select>
          </div>
        </div>

        <p v-if="loading" class="py-20 text-center text-ink-muted" role="status">
          {{ $t('projects.loading') }}
        </p>

        <template v-else-if="filteredAndSortedProjects.length">
          <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <ProjectCard
              v-for="repo in filteredAndSortedProjects"
              :key="repo.id"
              :project="repo"
            />
          </div>

          <p v-if="limit < matchingProjects.length" class="mt-12 text-center">
            <button
              @click="limit += 6"
              class="px-6 py-3 border border-line text-ink font-medium hover:border-accent hover:text-accent transition-colors"
            >
              {{ $t('projects.loadMore') }}
            </button>
          </p>
        </template>

        <p v-else class="py-20 text-center text-ink-muted border border-line-soft bg-surface">
          {{ failed ? $t('projects.loadError') : $t('projects.noProject') }}
        </p>
      </div>
    </section>

  </div>
</template>
