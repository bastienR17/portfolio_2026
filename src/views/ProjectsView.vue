<script setup>
import { ref, onMounted, computed } from 'vue'
import ProjectCard from '../components/projects/ProjectCard.vue'

const projects = ref([])
const loading = ref(true)
const limit = ref(6)
const sortBy = ref('updated')
const selectedStack = ref('All') // Stack sélectionnée

onMounted(async () => {
  try {
    const response = await fetch('https://api.github.com/users/Bastienr17/repos?sort=updated&per_page=100')
    const data = await response.json()
    projects.value = data.filter(repo => !repo.fork)
  } catch (error) {
    console.error("Erreur GitHub:", error)
  } finally {
    loading.value = false
  }
})

// 1. Extraire dynamiquement la liste des langages (Stacks) uniques
const availableStacks = computed(() => {
  const stacks = projects.value
    .map(p => p.language)
    .filter(lang => lang !== null) // On enlève les projets sans langage défini
  
  return ['All', ...new Set(stacks)] // On garde uniquement les valeurs uniques
})

// 2. Filtrer ET Trier les projets
const filteredAndSortedProjects = computed(() => {
  let result = projects.value

  // Filtre par Stack
  if (selectedStack.value !== 'All') {
    result = result.filter(p => p.language === selectedStack.value)
  }

  // Tri
  result = [...result].sort((a, b) => {
    if (sortBy.value === 'stars') return b.stargazers_count - a.stargazers_count
    if (sortBy.value === 'name') return a.name.localeCompare(b.name)
    return new Date(b.updated_at) - new Date(a.updated_at)
  })

  return result.slice(0, limit.value)
})
</script>

<template>
  <section class="max-w-6xl mx-auto py-16 px-4">
    <div class="mb-12">
      <h2 class="text-4xl font-bold text-dark-soft mb-6 text-left">Mes Réalisations</h2>
      
      <div class="flex flex-col gap-6">
        <div class="flex flex-wrap gap-2">
          <button 
            v-for="stack in availableStacks" 
            :key="stack"
            @click="selectedStack = stack; limit = 6"
            :class="[
              selectedStack === stack 
                ? 'bg-terracotta text-white border-terracotta shadow-md' 
                : 'bg-cream text-dark-soft border-ochre/30 hover:border-terracotta'
            ]"
            class="px-4 py-1.5 rounded-full border-2 text-sm font-medium transition-all"
          >
            {{ stack }}
          </button>
        </div>

        <div class="flex justify-end items-center gap-3">
          <span class="text-xs font-bold text-gray-400 uppercase">Ordre :</span>
          <select v-model="sortBy" class="bg-transparent border-b-2 border-ochre text-sm py-1 focus:outline-none focus:border-terracotta cursor-pointer">
            <option value="updated">Récents</option>
            <option value="stars">Stars</option>
            <option value="name">Nom</option>
          </select>
        </div>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-terracotta"></div>
    </div>

    <div v-else-if="filteredAndSortedProjects.length > 0">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <ProjectCard 
          v-for="repo in filteredAndSortedProjects" 
          :key="repo.id" 
          :project="repo" 
        />
      </div>

      <div v-if="limit < projects.filter(p => selectedStack === 'All' || p.language === selectedStack).length" class="mt-16 text-center">
        <button @click="limit += 6" class="border-2 border-terracotta text-terracotta px-10 py-3 rounded-full font-bold hover:bg-terracotta hover:text-white transition-all">
          En voir plus
        </button>
      </div>
    </div>

    <div v-else class="py-20 text-center text-gray-500">
      Aucun projet trouvé pour cette catégorie.
    </div>
  </section>
</template>