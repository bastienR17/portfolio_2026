<script setup>
import { ArrowUpRight } from 'lucide-vue-next'

defineProps({
  project: { type: Object, required: true },
})
</script>

<template>
  <article class="group flex flex-col h-full overflow-hidden bg-surface border border-line-soft hover:border-line transition-colors">

    <div class="relative h-44 overflow-hidden bg-surface-2 border-b border-line-soft">
      <img
        :src="`https://opengraph.githubassets.com/1/${project.owner.login}/${project.name}`"
        :alt="$t('projects.repo_alt', { name: project.name })"
        loading="lazy"
        class="object-cover w-full h-full"
      >
      <span
        v-if="project.language"
        class="absolute top-3 right-3 px-2 py-0.5 text-xs font-medium bg-surface border border-line text-ink"
      >
        {{ project.language }}
      </span>
    </div>

    <div class="flex flex-col flex-grow p-5 text-left">
      <h3 class="mb-2 text-lg capitalize text-ink">
        {{ project.name.replace(/-/g, ' ') }}
      </h3>

      <p v-if="project.description" class="mb-4 text-sm line-clamp-2 text-ink-muted">
        {{ project.description }}
      </p>

      <div class="flex items-center justify-between pt-4 mt-auto border-t border-line-soft">
        <time :datetime="project.updated_at" class="text-xs text-ink-muted">
          {{ new Date(project.updated_at).toLocaleDateString() }}
        </time>

        <a
          :href="project.html_url"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-1 py-1 text-sm font-medium text-accent hover:underline underline-offset-4"
        >
          {{ $t('projects.detail') }}
          <span class="sr-only">({{ $t('accessibility.new_window') }})</span>
          <ArrowUpRight class="w-4 h-4" aria-hidden="true" />
        </a>
      </div>
    </div>
  </article>
</template>
