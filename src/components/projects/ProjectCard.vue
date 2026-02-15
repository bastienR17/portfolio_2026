<script setup>
const props = defineProps(['project'])
</script>

<template>
  <div class="group bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-cream dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full">
    
    <div class="relative h-48 overflow-hidden bg-gray-100 dark:bg-gray-700">
      <img 
        :src="`https://opengraph.githubassets.com/1/${project.owner.login}/${project.name}`" 
        :alt="project.name"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      <span v-if="project.language" class="absolute top-3 right-3 bg-white/90 dark:bg-gray-900 text-dark-soft dark:text-cream text-xs font-bold px-3 py-1 rounded-full shadow-sm">
        {{ project.language }}
      </span>
    </div>

    <div class="p-6 flex flex-col flex-grow text-left">
      <h3 class="text-xl font-bold text-dark-soft dark:text-white group-hover:text-terracotta transition-colors capitalize">
        {{ project.name.replace(/-/g, ' ') }}
      </h3>
      
      <div class="flex items-center justify-between pt-6 border-t border-cream dark:border-gray-700 mt-auto">
        <span class="text-xs text-gray-500 dark:text-gray-400 font-mono">
          {{ new Date(project.updated_at).toLocaleDateString() }}
        </span>
        
        <a 
          :href="project.html_url" 
          target="_blank" 
          class="inline-flex items-center font-bold text-terracotta hover:gap-2 transition-all"
        >
          Voir le projet <span class="ml-1">→</span>
        </a>
      </div>
    </div>
  </div>
</template>