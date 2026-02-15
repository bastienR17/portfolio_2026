<template>
  <button 
    @click="toggleFont" 
    class="fixed bottom-8 right-8 flex items-center justify-center min-w-[70px] h-12 px-4 rounded-full border-2 border-terracotta bg-white dark:bg-gray-800 text-terracotta dark:text-cream shadow-2xl hover:scale-110 active:scale-95 transition-all z-[999]"
  >
    <span class="text-xs font-black tracking-widest">
      {{ isDyslexic ? 'LEX' : 'DYS' }}
    </span>
  </button>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const isDyslexic = ref(false)

const toggleFont = () => {
  isDyslexic.value = !isDyslexic.value
  document.body.classList.toggle('font-dys', isDyslexic.value)
  localStorage.setItem('font-preference', isDyslexic.value ? 'dys' : 'standard')
}

onMounted(() => {
  if (localStorage.getItem('font-preference') === 'dys') {
    isDyslexic.value = true
    document.body.classList.add('font-dys')
  }
})
</script>