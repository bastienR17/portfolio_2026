<script setup>
const year = new Date().getFullYear()
</script>

<template>
  <footer class="relative z-10 mt-24 border-t border-white/10 dark:border-white/5 backdrop-blur-md">
    <div class="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">

      <p class="text-xs text-gray-500 dark:text-gray-400 font-medium text-center sm:text-left">
        © {{ year }} Bastien Roc — {{ $t('footer.rights') }}
      </p>

      <router-link
        to="/mentions-legales"
        class="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 hover:text-terracotta dark:hover:text-ochre transition-colors"
      >
        {{ $t('footer.legal') }}
      </router-link>

    </div>
  </footer>
</template>
