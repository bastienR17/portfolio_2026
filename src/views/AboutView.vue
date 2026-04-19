<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { t, tm } = useI18n()

const activeFilter = ref('all')
const filters = ['all', 'hard', 'soft', 'certifications']

const filterLabel = (f) =>
  f === 'all' ? t('about.skills_filterAll') : t(`about.skills_${f}_label`)

const visibleCategories = computed(() =>
  activeFilter.value === 'all' ? ['hard', 'soft', 'certifications'] : [activeFilter.value]
)

const categoryStyle = {
  hard: {
    badge: 'bg-terracotta/10 text-terracotta border border-terracotta/25 hover:bg-terracotta/20',
    heading: 'text-terracotta',
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

const scrollToSkills = () => {
  document.getElementById('skills')?.scrollIntoView({ behavior: 'smooth' })
}

onMounted(() => {
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

      <!-- Timeline expériences -->
      <div class="relative ml-6">
        <div class="absolute left-0 top-[85px] bottom-[85px] w-0.5 bg-ochre/20 dark:bg-ochre/30">
          <div class="absolute -top-1 -left-[3px] w-2 h-2 bg-ochre rounded-full shadow-sm"></div>
          <div class="absolute -bottom-1 -left-[3px] w-2 h-2 bg-ochre rounded-full shadow-sm"></div>
        </div>

        <div class="space-y-12 pl-10">

          <div class="reveal relative group">
            <span class="absolute -left-[51px] top-1/2 -translate-y-1/2 w-5 h-5 bg-white dark:bg-gray-900 border-4 border-ochre rounded-full group-hover:scale-125 transition-all duration-300 shadow-lg z-10"></span>
            <div class="bg-white/20 dark:bg-gray-800/30 hover:bg-white/40 dark:hover:bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-white/10 dark:border-white/5 transition-all duration-300 shadow-sm">
              <span class="text-xs font-black text-terracotta dark:text-[#B45309] uppercase tracking-widest font-mono">{{ $t('about.exp1.date') }}</span>
              <h3 class="font-bold text-xl text-dark-soft dark:text-white mt-1">{{ $t('about.exp1.role') }}</h3>
              <p class="text-sm font-bold text-[#B45309] mb-4 uppercase tracking-wide">{{ $t('about.exp1.company') }}</p>
              <p class="text-gray-600 dark:text-gray-300 leading-relaxed">{{ $t('about.exp1.desc') }}</p>
            </div>
          </div>

          <div class="reveal relative group">
            <span class="absolute -left-[51px] top-1/2 -translate-y-1/2 w-5 h-5 bg-white dark:bg-gray-900 border-4 border-ochre rounded-full group-hover:scale-125 transition-all duration-300 shadow-lg z-10"></span>
            <div class="bg-white/20 dark:bg-gray-800/30 hover:bg-white/40 dark:hover:bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-white/10 dark:border-white/5 transition-all duration-300 shadow-sm">
              <span class="text-xs font-black text-terracotta dark:text-[#B45309] uppercase tracking-widest font-mono">{{ $t('about.exp2.date') }}</span>
              <h3 class="font-bold text-xl text-dark-soft dark:text-white mt-1">{{ $t('about.exp2.role') }}</h3>
              <p class="text-sm font-bold text-[#B45309] mb-4 uppercase tracking-wide">{{ $t('about.exp2.company') }}</p>
              <p class="text-gray-600 dark:text-gray-300 leading-relaxed">{{ $t('about.exp2.desc') }}</p>
            </div>
          </div>

          <div class="reveal relative group">
            <span class="absolute -left-[51px] top-1/2 -translate-y-1/2 w-5 h-5 bg-white dark:bg-gray-900 border-4 border-ochre rounded-full group-hover:scale-125 transition-all duration-300 shadow-lg z-10"></span>
            <div class="bg-white/20 dark:bg-gray-800/30 hover:bg-white/40 dark:hover:bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-white/10 dark:border-white/5 transition-all duration-300 shadow-sm">
              <span class="text-xs font-black text-terracotta dark:text-[#B45309] uppercase tracking-widest font-mono">{{ $t('about.exp3.date') }}</span>
              <h3 class="font-bold text-xl text-dark-soft dark:text-white mt-1">{{ $t('about.exp3.role') }}</h3>
              <p class="text-sm font-bold text-[#B45309] mb-4 uppercase tracking-wide">{{ $t('about.exp3.company') }}</p>
              <p class="text-gray-600 dark:text-gray-300 leading-relaxed">{{ $t('about.exp3.desc') }}</p>
            </div>
          </div>

        </div>
      </div>

      <!-- Section compétences -->
      <div id="skills" class="reveal bg-white/30 dark:bg-gray-800/40 backdrop-blur-md p-8 rounded-3xl border border-white/20 dark:border-white/5 shadow-xl">
        <p class="font-black text-2xl text-dark-soft dark:text-white mb-6 flex items-center gap-3">
          <span class="text-[#B45309]">/</span> {{ $t('about.skills_title') }}
        </p>

        <!-- Filtres -->
        <div class="flex flex-wrap gap-3 mb-8">
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

        <!-- Badges par catégorie -->
        <div class="space-y-6">
          <div v-for="cat in visibleCategories" :key="cat">
            <p :class="['text-xs font-black uppercase tracking-widest mb-3', categoryStyle[cat].heading]">
              {{ $t(`about.skills_${cat}_label`) }}
            </p>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="skill in getSkills(cat)"
                :key="skill"
                :class="['px-3 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 cursor-default', categoryStyle[cat].badge]"
              >
                {{ skill }}
              </span>
            </div>
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
</style>
