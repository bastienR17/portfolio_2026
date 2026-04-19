<script setup>
import { ref } from 'vue'
import { Copy, Check, Mail, Linkedin, Github } from 'lucide-vue-next'

const email = 'Bastienroc@free.fr'
const isCopied = ref(false)

const copyEmail = async () => {
  try {
    await navigator.clipboard.writeText(email)
    isCopied.value = true
    setTimeout(() => { isCopied.value = false }, 2000)
  } catch (err) {
    console.error('Erreur :', err)
  }
}
</script>

<template>
  <section class="max-w-2xl mx-auto px-4 py-16 text-center transition-colors duration-500">
    
    <h2 class="text-4xl font-bold text-dark-soft dark:text-cream mb-4 tracking-tight">
      {{ $t('contact.title') }}
    </h2>
    
    <p class="text-gray-600 dark:text-gray-400 mb-10 text-lg font-medium">
      {{ $t('contact.subtitle') }}
    </p>
    
    <div class="group relative bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl p-10 rounded-3xl border-2 border-dashed border-ochre/40 dark:border-ochre/20 transition-all duration-500 shadow-xl hover:shadow-2xl hover:border-solid hover:border-terracotta active:scale-[0.98]">
      
      <p class="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-ochre/60 mb-6 font-black flex items-center justify-center gap-2">
        <Mail class="w-4 h-4" />
        {{ $t('contact.email_label') }}
      </p>
      
      <button 
        @click="copyEmail"
        class="relative inline-flex items-center justify-center w-full focus:outline-none group/btn"
      >
        <Transition mode="out-in" name="pop">
          <div v-if="isCopied" class="flex items-center gap-3 text-2xl md:text-3xl font-black text-terracotta dark:text-ochre transition-colors">
            <Check class="w-8 h-8 stroke-[3px]" />
            <span>{{ $t('contact.copied') || 'Copié !' }}</span>
          </div>

          <div v-else class="flex items-center gap-3 text-2xl md:text-3xl font-bold text-terracotta dark:text-orange-400 group-hover/btn:text-dark-soft dark:group-hover/btn:text-white transition-colors cursor-pointer">
            <span class="break-all">{{ email }}</span>
            <Copy class="w-5 h-5 opacity-0 group-hover/btn:opacity-100 transition-all translate-x-2 group-hover/btn:translate-x-0 hidden md:block" />
          </div>
        </Transition>
      </button>

      <div class="grid grid-cols-2 gap-4 mt-8 border-t border-gray-200 dark:border-white/10 pt-8">
        <a href="https://www.linkedin.com/in/bastien-roc/" target="_blank"
           class="group/card flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/40 dark:bg-gray-700/30 border border-white/30 dark:border-white/10 hover:bg-[#0A66C2]/10 hover:border-[#0A66C2]/30 transition-all duration-200 hover:-translate-y-0.5">
          <Linkedin class="w-6 h-6 text-[#0A66C2] transition-transform group-hover/card:scale-110" />
          <span class="font-black text-sm text-dark-soft dark:text-white">LinkedIn</span>
          <span class="text-xs text-gray-400 font-medium">Bastien Roc</span>
        </a>
        <a href="https://github.com/bastienR17" target="_blank"
           class="group/card flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/40 dark:bg-gray-700/30 border border-white/30 dark:border-white/10 hover:bg-gray-800/10 dark:hover:bg-white/10 hover:border-gray-400/30 transition-all duration-200 hover:-translate-y-0.5">
          <Github class="w-6 h-6 text-dark-soft dark:text-white transition-transform group-hover/card:scale-110" />
          <span class="font-black text-sm text-dark-soft dark:text-white">GitHub</span>
          <span class="text-xs text-gray-400 font-medium">bastienR17</span>
        </a>
      </div>
    </div>

    <p class="mt-8 text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-700">
      Click to copy to clipboard
    </p>

  </section>
</template>

<style scoped>
/* Animation élastique pour le changement de texte */
.pop-enter-active {
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.pop-leave-active {
  transition: all 0.2s ease-in;
}
.pop-enter-from, .pop-leave-to {
  opacity: 0;
  transform: scale(0.8) translateY(10px);
}

/* Effet de lueur spécifique au mode sombre */
.dark .group:hover {
  box-shadow: 0 0 40px -10px rgba(244, 208, 111, 0.1);
}
</style>