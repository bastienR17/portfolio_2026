<template>
  <section class="max-w-4xl mx-auto px-4 py-16 relative z-10">
    <div class="mb-12">
      <h2 class="text-4xl font-black text-terracotta uppercase tracking-tighter">
        {{ $t('about.title') }}
      </h2>
      <div class="h-1 w-20 bg-ochre mt-2"></div>
    </div>
    
    <div class="grid gap-16">
      <div class="bg-white/30 dark:bg-gray-800/40 backdrop-blur-md p-8 rounded-3xl border border-white/20 dark:border-white/5 shadow-xl">
        <p class="font-black text-2xl text-dark-soft dark:text-white mb-4 flex items-center gap-3">
          <span class="text-ochre">/</span> {{ $t('about.path_title') }}
        </p>
        <p class="text-lg leading-relaxed text-gray-700 dark:text-gray-300">
          {{ $t('about.path_description') }}
        </p>
      </div>

      <div class="relative ml-6">
        <div class="absolute left-0 top-[85px] bottom-[85px] w-0.5 bg-ochre/20 dark:bg-ochre/30">
          <div class="absolute -top-1 -left-[3px] w-2 h-2 bg-ochre rounded-full shadow-sm"></div>
          <div class="absolute -bottom-1 -left-[3px] w-2 h-2 bg-ochre rounded-full shadow-sm"></div>
        </div>

        <div class="space-y-12 pl-10">
          
          <div class="relative group">
            <span class="absolute -left-[51px] top-1/2 -translate-y-1/2 w-5 h-5 bg-white dark:bg-gray-900 border-4 border-ochre rounded-full group-hover:scale-125 transition-all duration-300 shadow-lg z-10"></span>
            
            <div class="bg-white/20 dark:bg-gray-800/30 hover:bg-white/40 dark:hover:bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-white/10 dark:border-white/5 transition-all duration-300 shadow-sm">
              <span class="text-xs font-black text-terracotta dark:text-ochre uppercase tracking-widest font-mono">
                 {{ $t('about.exp1.date') }}
              </span>
              <h3 class="font-bold text-xl text-dark-soft dark:text-white mt-1">
                {{ $t('about.exp1.role') }}
              </h3>
              <p class="text-sm font-bold text-[#B45309] mb-4 uppercase tracking-wide">
                {{ $t('about.exp1.company') }}
              </p>
              <p class="text-gray-600 dark:text-gray-300 leading-relaxed">
                {{ $t('about.exp1.desc') }}
              </p>
            </div>
          </div>
          
          <div class="relative group">
            <span class="absolute -left-[51px] top-1/2 -translate-y-1/2 w-5 h-5 bg-white dark:bg-gray-900 border-4 border-ochre rounded-full group-hover:scale-125 transition-all duration-300 shadow-lg z-10"></span>
            
            <div class="bg-white/20 dark:bg-gray-800/30 hover:bg-white/40 dark:hover:bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-white/10 dark:border-white/5 transition-all duration-300 shadow-sm">
              <span class="text-xs font-black text-terracotta dark:text-ochre uppercase tracking-widest font-mono">
                 {{ $t('about.exp2.date') }}
              </span>
              <h3 class="font-bold text-xl text-dark-soft dark:text-white mt-1">
                {{ $t('about.exp2.role') }}
              </h3>
              <p class="text-sm font-bold text-ochre mb-4 uppercase tracking-wide">
                {{ $t('about.exp2.company') }}
              </p>
              <p class="text-gray-600 dark:text-gray-300 leading-relaxed">
                {{ $t('about.exp2.desc') }}
              </p>
            </div>
          </div>

          <div class="relative group">
            <span class="absolute -left-[51px] top-1/2 -translate-y-1/2 w-5 h-5 bg-white dark:bg-gray-900 border-4 border-ochre rounded-full group-hover:scale-125 transition-all duration-300 shadow-lg z-10"></span>
            
            <div class="bg-white/20 dark:bg-gray-800/30 hover:bg-white/40 dark:hover:bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-white/10 dark:border-white/5 transition-all duration-300 shadow-sm">
              <span class="text-xs font-black text-terracotta dark:text-ochre uppercase tracking-widest font-mono">
                 {{ $t('about.exp3.date') }}
              </span>
              <h3 class="font-bold text-xl text-dark-soft dark:text-white mt-1">
                {{ $t('about.exp3.role') }}
              </h3>
              <p class="text-sm font-bold text-ochre mb-4 uppercase tracking-wide">
                {{ $t('about.exp3.company') }}
              </p>
              <p class="text-gray-600 dark:text-gray-300 leading-relaxed">
                {{ $t('about.exp3.desc') }}
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  </section>
</template>