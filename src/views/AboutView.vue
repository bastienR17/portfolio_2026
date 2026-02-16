<template>
  <section class="max-w-4xl mx-auto px-4 py-16">
    <h2 class="text-4xl font-bold text-terracotta mb-8">{{ $t('about.title') }}</h2>
    
    <div class="grid gap-12 text-lg text-gray-700 dark:text-gray-300">
      <div class="space-y-4">
        <p class="font-bold text-2xl text-dark-soft dark:text-white">
          {{ $t('about.path_title') }}
        </p>
        <p>{{ $t('about.path_description') }}</p>
      </div>

      <div class="border-l-4 border-ochre pl-6 space-y-10">
        <div class="relative">
          <span class="absolute -left-[1.85rem] top-1.5 w-4 h-4 bg-ochre rounded-full"></span>
          <h3 class="font-bold text-xl text-dark-soft dark:text-white">
            {{ $t('about.exp1.role') }}
          </h3>
          <p class="text-sm text-terracotta font-mono">
            {{ $t('about.exp1.company') }} | {{ $t('about.exp1.date') }}
          </p>
          <p class="mt-2 text-gray-600 dark:text-gray-400">
            {{ $t('about.exp1.desc') }}
          </p>
        </div>
        
        <div class="relative">
          <span class="absolute -left-[1.85rem] top-1.5 w-4 h-4 bg-ochre rounded-full"></span>
          <h3 class="font-bold text-xl text-dark-soft dark:text-white">
            {{ $t('about.exp2.role') }}
          </h3>
          <p class="text-sm text-terracotta font-mono">
            {{ $t('about.exp2.company') }} | {{ $t('about.exp2.date') }}
          </p>
          <p class="mt-2 text-gray-600 dark:text-gray-400">
            {{ $t('about.exp2.desc') }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>