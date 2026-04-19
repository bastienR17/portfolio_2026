<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'

const { t, tm } = useI18n()

// ── Timeline filter ──────────────────────────────────────────
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
    : allEntries.filter(e => e.type === timelineFilter.value)
)

// ── Skills filter ────────────────────────────────────────────
const activeFilter = ref('all')
const filters = ['all', 'hard', 'soft', 'certifications']

const hardSubFilters = ['all', 'dev', 'design', 'data']
const activeHardSub = ref('all')

watch(activeFilter, (val) => {
  if (val !== 'hard') activeHardSub.value = 'all'
})

const filterLabel = (f) =>
  f === 'all' ? t('about.skills_filterAll') : t(`about.skills_${f}_label`)

const visibleCategories = computed(() =>
  activeFilter.value === 'all' ? ['hard', 'soft', 'certifications'] : [activeFilter.value]
)

const visibleHardSubs = computed(() =>
  activeHardSub.value === 'all' ? ['dev', 'design', 'data'] : [activeHardSub.value]
)

const categoryStyle = {
  hard: {
    badge: 'bg-terracotta/10 text-terracotta border border-terracotta/25 hover:bg-terracotta/20',
    heading: 'text-terracotta',
    subBadgeActive: 'bg-terracotta text-white shadow-md',
    subBadgeInactive: 'bg-white/40 dark:bg-gray-700/40 text-dark-soft dark:text-gray-300 hover:bg-white/60 dark:hover:bg-gray-700/60 border border-white/20',
  },
  soft: {
    badge: 'bg-ochre/10 text-[#B45309] border border-[#B45309]/25 hover:bg-ochre/20',
    heading: 'text-[#B45309]',
  },
  certifications: {
    badge: 'bg-emerald-50/30 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-300/30 hover:bg-emerald-100/40',
    heading: 'text-emerald-600 dark:text-emerald-400',
  },
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
  ['dev', 'design', 'data'].flatMap(sub => getHardSkills(sub))

const scrollToSkills = () => {
  document.getElementById('skills')?.scrollIntoView({ behavior: 'smooth' })
}

onMounted(async () => {
  await nextTick()
  const observer = new IntersectionObserver(
    (entries) => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target) } }),
    { threshold: 0.1 }
  )
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el))
})
</script>

<template>
  <section class="max-w-4xl mx-auto px-4 py-16 relative z-10">
    <div class="mb-12 flex items-center justify-between flex-wrap gap-4">
      <div>
        <h2 class="text-4xl font-black text-terracotta uppercase tracking-tighter">
          {{ $t('about.title') }}
        </h2>
        <div class="h-1 w-20 bg-ochre mt-2"></div>
      </div>
      <button
        @click="scrollToSkills"
        class="flex items-center gap-2 px-4 py-2 bg-terracotta text-white rounded-full font-bold text-sm shadow-md hover:-translate-y-0.5 active:scale-95 transition-all duration-200"
      >
        ⚡ {{ $t('about.skills_title') }}
      </button>
    </div>

    <div class="grid gap-16">

      <!-- Carte parcours + description -->
      <div class="reveal bg-white/30 dark:bg-gray-800/40 backdrop-blur-md p-8 rounded-3xl border border-white/20 dark:border-white/5 shadow-xl">
        <p class="font-black text-2xl text-dark-soft dark:text-white mb-4 flex items-center gap-3">
          <span class="text-[#B45309]">/</span> {{ $t('about.path_title') }}
        </p>
        <p class="text-gray-600 dark:text-gray-300 leading-relaxed">
          {{ $t('about.path_description') }}
        </p>
      </div>

      <!-- Timeline -->
      <div>
        <!-- Filtres timeline -->
        <div class="flex flex-wrap gap-3 mb-8">
          <button
            v-for="f in timelineFilters"
            :key="f"
            @click="timelineFilter = f"
            :class="[
              'px-4 py-1.5 rounded-full text-sm font-bold transition-all duration-200',
              timelineFilter === f
                ? 'bg-terracotta text-white shadow-md'
                : 'bg-white/40 dark:bg-gray-700/40 text-dark-soft dark:text-gray-300 hover:bg-white/60 dark:hover:bg-gray-700/60 border border-white/20'
            ]"
          >
            {{ $t(`about.timeline_${f === 'all' ? 'filterAll' : f}`) }}
          </button>
        </div>

        <!-- Ligne verticale + entrées -->
        <div class="relative ml-6">
          <div class="absolute left-0 top-[85px] bottom-[85px] w-0.5 bg-ochre/20 dark:bg-ochre/30">
            <div class="absolute -top-1 -left-[3px] w-2 h-2 bg-ochre rounded-full shadow-sm"></div>
            <div class="absolute -bottom-1 -left-[3px] w-2 h-2 bg-ochre rounded-full shadow-sm"></div>
          </div>

          <TransitionGroup
            tag="div"
            name="entry"
            appear
            class="space-y-12 pl-10"
          >
            <div
              v-for="entry in visibleEntries"
              :key="entry.key"
              class="relative group"
            >
              <!-- Point centré sur la ligne : w-5 = 20px, left = pl-10(40px) - 49px = -9px du conteneur = centre sur la ligne à left:0+1px -->
              <span
                :class="[
                  'absolute -left-[49px] top-1/2 -translate-y-1/2 w-5 h-5 bg-white dark:bg-gray-900 rounded-full group-hover:scale-125 transition-all duration-300 shadow-lg z-10',
                  entry.type === 'pro'        ? 'border-4 border-ochre' :
                  entry.type === 'scolaire'   ? 'border-4 border-emerald-500/80' :
                                                'border-4 border-[#B45309]/70'
                ]"
              ></span>

              <div class="bg-white/20 dark:bg-gray-800/30 hover:bg-white/40 dark:hover:bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-white/10 dark:border-white/5 transition-all duration-300 shadow-sm">

                <!-- En-tête -->
                <div class="flex items-center gap-2 mb-1 flex-wrap">
                  <span
                    :class="[
                      'text-xs font-black uppercase tracking-widest font-mono',
                      entry.type === 'pro'      ? 'text-terracotta dark:text-[#B45309]' :
                      entry.type === 'scolaire' ? 'text-emerald-600 dark:text-emerald-400' :
                                                  'text-[#B45309]'
                    ]"
                  >{{ $t(`about.${entry.key}.date`) }}</span>
                  <span
                    v-if="entry.type !== 'pro'"
                    :class="[
                      'text-xs px-2 py-0.5 rounded-full font-bold',
                      entry.type === 'scolaire'
                        ? 'bg-emerald-50/40 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-300/30'
                        : 'bg-ochre/15 text-[#B45309] border border-[#B45309]/20'
                    ]"
                  >{{ $t(`about.timeline_${entry.type}`) }}</span>
                </div>

                <h3 class="font-bold text-xl text-dark-soft dark:text-white mt-1">
                  {{ $t(`about.${entry.key}.role`) }}
                </h3>
                <p
                  :class="[
                    'text-sm font-bold mb-4 uppercase tracking-wide',
                    entry.type === 'scolaire' ? 'text-emerald-600 dark:text-emerald-400' : 'text-[#B45309]'
                  ]"
                >
                  {{ $t(`about.${entry.key}.${entry.type === 'pro' ? 'company' : 'org'}`) }}
                </p>

                <p v-if="entry.type === 'pro'" class="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                  {{ $t(`about.${entry.key}.desc`) }}
                </p>

                <ul v-if="entry.type !== 'scolaire'" class="flex flex-wrap gap-2">
                  <li
                    v-for="task in tm(`about.${entry.key}.tasks`)"
                    :key="task"
                    :class="[
                      'text-xs px-3 py-1 rounded-full font-medium',
                      entry.type === 'pro'
                        ? 'bg-terracotta/10 text-terracotta border border-terracotta/20'
                        : 'bg-ochre/10 text-[#B45309] border border-[#B45309]/20'
                    ]"
                  >{{ task }}</li>
                </ul>

              </div>
            </div>
          </TransitionGroup>
        </div>
      </div>

      <!-- Section compétences -->
      <div id="skills" class="reveal bg-white/30 dark:bg-gray-800/40 backdrop-blur-md p-8 rounded-3xl border border-white/20 dark:border-white/5 shadow-xl">
        <p class="font-black text-2xl text-dark-soft dark:text-white mb-6 flex items-center gap-3">
          <span class="text-[#B45309]">/</span> {{ $t('about.skills_title') }}
        </p>

        <!-- Filtres niveau 1 -->
        <div class="flex flex-wrap gap-3 mb-4">
          <button
            v-for="f in filters"
            :key="f"
            @click="activeFilter = f"
            :class="[
              'px-4 py-1.5 rounded-full text-sm font-bold transition-all duration-200',
              activeFilter === f
                ? 'bg-terracotta text-white shadow-md'
                : 'bg-white/40 dark:bg-gray-700/40 text-dark-soft dark:text-gray-300 hover:bg-white/60 dark:hover:bg-gray-700/60 border border-white/20'
            ]"
          >
            {{ filterLabel(f) }}
          </button>
        </div>

        <!-- Filtres niveau 2 -->
        <transition name="slide-fade">
          <div v-if="activeFilter === 'hard'" class="flex flex-wrap gap-2 mb-6 pl-1">
            <button
              v-for="sub in hardSubFilters"
              :key="sub"
              @click="activeHardSub = sub"
              :class="[
                'px-3 py-1 rounded-full text-xs font-bold transition-all duration-200',
                activeHardSub === sub
                  ? categoryStyle.hard.subBadgeActive
                  : categoryStyle.hard.subBadgeInactive
              ]"
            >
              {{ sub === 'all' ? $t('about.skills_filterAll') : $t(`about.skills_hard_${sub}_label`) }}
            </button>
          </div>
        </transition>

        <!-- Badges par catégorie -->
        <div class="space-y-6">
          <div v-for="cat in visibleCategories" :key="cat">
            <p :class="['text-xs font-black uppercase tracking-widest mb-3', categoryStyle[cat].heading]">
              {{ $t(`about.skills_${cat}_label`) }}
            </p>

            <template v-if="cat === 'hard'">
              <div v-if="activeFilter !== 'hard'" class="flex flex-wrap gap-2">
                <span
                  v-for="skill in getAllHardSkills()"
                  :key="skill"
                  :class="['px-3 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 cursor-default', categoryStyle.hard.badge]"
                >{{ skill }}</span>
              </div>
              <div v-else class="space-y-4">
                <div v-for="sub in visibleHardSubs" :key="sub">
                  <p v-if="activeHardSub === 'all'" class="text-xs font-semibold text-terracotta/60 uppercase tracking-wider mb-2">
                    {{ $t(`about.skills_hard_${sub}_label`) }}
                  </p>
                  <div class="flex flex-wrap gap-2">
                    <span
                      v-for="skill in getHardSkills(sub)"
                      :key="skill"
                      :class="['px-3 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 cursor-default', categoryStyle.hard.badge]"
                    >{{ skill }}</span>
                  </div>
                </div>
              </div>
            </template>

            <template v-else>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="skill in getSkills(cat)"
                  :key="skill"
                  :class="['px-3 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 cursor-default', categoryStyle[cat].badge]"
                >{{ skill }}</span>
              </div>
            </template>

          </div>
        </div>
      </div>

    </div>
  </section>
</template>

<style scoped>
.reveal {
  opacity: 0;
  transform: translateY(28px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}
.reveal.visible {
  opacity: 1;
  transform: translateY(0);
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

.entry-enter-active,
.entry-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.entry-enter-from,
.entry-leave-to {
  opacity: 0;
  transform: translateX(-12px);
}
</style>
