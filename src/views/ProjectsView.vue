<script setup>
import { ref, onMounted, computed } from 'vue'
import ProjectCard from '../components/projects/ProjectCard.vue'

const projects = ref([])
const loading = ref(true)
const limit = ref(6)
const sortBy = ref('updated')
const selectedStack = ref('All')

onMounted(async () => {
  try {
    const response = await fetch('https://api.github.com/users/Bastienr17/repos?sort=updated&per_page=100')
    const data = await response.json()
    // Sécurité : on s'assure que data est un tableau
    projects.value = Array.isArray(data) ? data.filter(repo => !repo.fork) : []
  } catch (error) {
    console.error("Erreur GitHub:", error)
    projects.value = []
  } finally {
    loading.value = false
  }
})

const availableStacks = computed(() => {
  const stacks = (projects.value || [])
    .map(p => p.language)
    .filter(lang => lang !== null) 
  return ['All', ...new Set(stacks)]
})

const filteredAndSortedProjects = computed(() => {
  let result = projects.value || [] // Fallback vide pour éviter le undefined
  if (selectedStack.value !== 'All') {
    result = result.filter(p => p.language === selectedStack.value)
  }
  result = [...result].sort((a, b) => {
    if (sortBy.value === 'stars') return (b.stargazers_count || 0) - (a.stargazers_count || 0)
    if (sortBy.value === 'name') return (a.name || "").localeCompare(b.name || "")
    return new Date(b.updated_at) - new Date(a.updated_at)
  })
  return result.slice(0, limit.value)
})
</script>

<template>
  <section class="max-w-6xl mx-auto py-24 px-4 relative z-10">
    
    <div class="mb-16">
      <h2 class="text-5xl font-extrabold text-dark-soft dark:text-white mb-8 text-left tracking-tight">
        {{ $t('projects.title') }}
      </h2>
      
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div class="flex flex-wrap gap-3">
          <button 
            v-for="stack in availableStacks" 
            :key="stack"
            @click="selectedStack = stack; limit = 6"
            :class="[
              selectedStack === stack 
                ? 'bg-terracotta text-white border-gray-900 shadow-lg scale-105' 
                : 'bg-white/20 dark:bg-white/5 text-dark-soft dark:text-white border-gray-900/30 hover:border-gray-900 backdrop-blur-md'
            ]"
            class="px-5 py-2 rounded-full border-2 text-sm font-bold transition-all duration-300 active:scale-95"
          >
            {{ stack === 'All' ? $t('projects.all') : stack }}
          </button>
        </div>

        <div class="flex items-center gap-3 self-end">
          <span class="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">
            {{ $t('projects.sortBy') }}
          </span>
          <select 
            v-model="sortBy" 
            class="bg-white/10 dark:bg-gray-900/40 backdrop-blur-md border-b-2 border-gray-900 dark:border-white/20 text-dark-soft dark:text-white text-sm py-2 px-4 focus:outline-none focus:border-terracotta cursor-pointer rounded-t-lg transition-colors"
          >
            <option value="updated" class="bg-gray-100 dark:bg-gray-800">{{ $t('projects.sortOptions.recent') }}</option>
            <option value="stars" class="bg-gray-100 dark:bg-gray-800">{{ $t('projects.sortOptions.stars') }}</option>
            <option value="name" class="bg-gray-100 dark:bg-gray-800">{{ $t('projects.sortOptions.name') }}</option>
          </select>
        </div>
      </div>
    </div>

    <div v-if="loading" class="flex flex-col items-center justify-center py-32">
      <div class="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-terracotta mb-4"></div>
      <p class="text-sm font-mono animate-pulse">{{ $t('projects.loading') }}</p>
    </div>

    <div v-else-if="filteredAndSortedProjects && filteredAndSortedProjects.length > 0">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        <ProjectCard 
          v-for="repo in filteredAndSortedProjects" 
          :key="repo.id" 
          :project="repo" 
          class="transition-all duration-500"
        />
      </div>

      <div v-if="limit < (projects || []).filter(p => selectedStack === 'All' || p.language === selectedStack).length" class="mt-20 text-center">
        <button 
          @click="limit += 6" 
          class="group relative px-12 py-4 rounded-full font-black text-dark-soft dark:text-white border-2 border-gray-900 dark:border-white/20 backdrop-blur-xl bg-white/10 hover:bg-terracotta hover:text-white hover:border-terracotta transition-all duration-300 shadow-xl"
        >
          {{ $t('projects.loadMore') }}
          <span class="inline-block ml-2 group-hover:translate-y-1 transition-transform">↓</span>
        </button>
      </div>
    </div>

    <div v-else class="py-32 text-center backdrop-blur-sm bg-white/5 rounded-3xl border-2 border-dashed border-gray-900/20">
      <p class="text-gray-500 dark:text-gray-400 font-medium">{{ $t('projects.noProject') }}</p>
    </div>
  </section>
</template>