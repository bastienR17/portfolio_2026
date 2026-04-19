<script setup>
const props = defineProps(['project'])
</script>

<template>
  <div class="group relative flex flex-col h-full overflow-hidden transition-all duration-500 border rounded-2xl backdrop-blur-md bg-white/30 dark:bg-gray-900/40 border-gray-900 dark:border-gray-800 hover:bg-white/50 dark:hover:bg-gray-800/60 hover:shadow-2xl hover:shadow-terracotta/10">
    
    <div class="relative h-48 overflow-hidden bg-white/10 dark:bg-gray-950/20">
      <img 
        :src="`https://opengraph.githubassets.com/1/${project.owner.login}/${project.name}`" 
        :alt="project.name"
        class="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
      />
      <span v-if="project.language" class="absolute px-3 py-1 text-xs font-bold shadow-lg top-3 right-3 rounded-full backdrop-blur-md bg-white/90 dark:bg-gray-900/90 text-dark-soft dark:text-cream border border-gray-900 dark:border-gray-800">
        {{ project.language }}
      </span>
    </div>

    <div class="flex flex-col flex-grow p-6 text-left">
      <h3 class="mb-3 text-xl font-bold capitalize transition-colors text-dark-soft dark:text-white group-hover:text-terracotta">
        {{ project.name.replace(/-/g, ' ') }}
      </h3>
      
      <p v-if="project.description" class="mb-4 text-sm line-clamp-2 text-dark-soft/70 dark:text-cream/70">
        {{ project.description }}
      </p>

      <div class="flex items-center justify-between pt-6 mt-auto border-t border-gray-900/20 dark:border-gray-800/50">
        <span class="font-mono text-xs text-gray-500 dark:text-gray-400">
          {{ new Date(project.updated_at).toLocaleDateString() }}
        </span>
        
        <a 
          :href="project.html_url" 
          target="_blank" 
          class="inline-flex items-center font-bold transition-all text-terracotta hover:gap-3"
        >
          {{ $t('projects.detail') }} <span class="ml-1">→</span>
        </a>
      </div>
    </div>
  </div>
</template>