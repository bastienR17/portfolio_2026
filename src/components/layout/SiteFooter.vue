<script setup>
const year = new Date().getFullYear()
</script>

<template>
  <footer class="relative z-10 mt-24 bg-page border-t border-line-soft">
    <div class="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-3">

      <p class="text-sm text-ink-muted text-center sm:text-left">
        © {{ year }} Bastien Roc - {{ $t('footer.rights') }}
      </p>

      <router-link
        to="/mentions-legales"
        class="no-active inline-block py-1 text-sm text-ink-muted hover:text-accent transition-colors underline-offset-4 hover:underline"
      >
        {{ $t('footer.legal') }}
      </router-link>

    </div>
  </footer>
</template>
