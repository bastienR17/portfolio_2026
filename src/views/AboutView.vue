<template>
  <section class="max-w-4xl mx-auto px-4 py-16">
    <h2 class="text-4xl font-bold text-terracotta mb-8">{{ $t('nav.about') }}</h2>
    
    <div class="grid gap-12 text-lg text-gray-700">
      <div class="space-y-4">
        <p class="font-bold text-2xl text-dark-soft">Mon Parcours</p>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
      </div>

      <div class="border-l-4 border-ochre pl-6 space-y-6">
        <div class="relative">
          <span class="absolute -left-8 top-1 w-4 h-4 bg-ochre rounded-full"></span>
          <h3 class="font-bold text-xl text-dark-soft">Alternance : Titre du Poste</h3>
          <p class="text-sm text-terracotta font-mono">Entreprise | 2023 - 2024</p>
          <p class="mt-2 text-gray-600">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
        </div>
        
        <div class="relative">
          <span class="absolute -left-8 top-1 w-4 h-4 bg-ochre rounded-full"></span>
          <h3 class="font-bold text-xl text-dark-soft">Alternance : Titre du Poste précédent</h3>
          <p class="text-sm text-terracotta font-mono">Entreprise | 2022 - 2023</p>
          <p class="mt-2 text-gray-600">Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
        </div>
      </div>
    </div>
  </section>
</template>