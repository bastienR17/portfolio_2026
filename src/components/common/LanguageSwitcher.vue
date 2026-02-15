<template>
  <div class="flex items-center gap-2">
    <button 
      @click="$i18n.locale = 'fr'" 
      :class="{'font-bold border-b-2 border-terracotta': $i18n.locale === 'fr'}"
      class="px-2 py-1 text-sm hover:text-terracotta transition"
    >
      FR
    </button>
    <span class="text-gray-300">|</span>
    <button 
      @click="$i18n.locale = 'en'" 
      :class="{'font-bold border-b-2 border-terracotta': $i18n.locale === 'en'}"
      class="px-2 py-1 text-sm hover:text-terracotta transition"
    >
      EN
    </button>
  </div>
</template>