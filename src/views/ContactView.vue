<template>
  <section class="max-w-2xl mx-auto px-4 py-16 text-center transition-colors duration-300">
    
    <h2 class="text-4xl font-bold text-dark-soft dark:text-white mb-4">
      {{ $t('contact.title') }}
    </h2>
    
    <p class="text-gray-600 dark:text-gray-400 mb-10 text-lg">
      {{ $t('contact.subtitle') }}
    </p>
    
    <div class="bg-white/40 dark:bg-gray-800/40 backdrop-blur-md p-10 rounded-3xl border-2 border-dashed border-ochre transition-all shadow-xl">
      <p class="text-sm uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2 font-black">
        {{ $t('contact.email_label') }}
      </p>
      
      <a href="mailto:Bastienroc@free.fr" class="text-2xl md:text-3xl font-bold text-terracotta hover:text-ochre transition-colors hover:underline decoration-ochre underline-offset-8">
        Bastienroc@free.fr
      </a>
      
      <div class="flex justify-center gap-6 mt-10">
        <a href="https://www.linkedin.com/in/bastien-roc/" class="text-dark-soft dark:text-gray-300 hover:text-terracotta transition font-black tracking-widest text-sm uppercase"> 
          LinkedIn 
        </a>
        <a href="https://github.com/bastienR17" class="text-dark-soft dark:text-gray-300 hover:text-terracotta transition font-black tracking-widest text-sm uppercase"> 
          GitHub
        </a>
      </div>
    </div>
  </section>
</template>