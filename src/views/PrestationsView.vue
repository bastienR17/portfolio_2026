<script setup>
import { useI18n } from 'vue-i18n'
import { Target, Users, Workflow, Bot, ArrowRight } from 'lucide-vue-next'
import { useReveal } from '../composables/useReveal'

const { tm, te } = useI18n()

useReveal()

// Les services pilotés depuis l'i18n : clé de traduction + icône associée
const services = [
  { key: 'amoa', icon: Target },
  { key: 'change', icon: Users },
  { key: 'agile', icon: Workflow },
  { key: 'ai', icon: Bot },
]

const steps = ['step1', 'step2', 'step3']
</script>

<template>
  <div class="relative z-10">

    <!-- En-tête -->
    <section class="max-w-6xl mx-auto px-6 pt-16 pb-14 md:pt-24">
      <span class="tag-stamp text-ink mb-8">
        <span class="w-1.5 h-1.5 bg-accent rounded-full shrink-0" aria-hidden="true"></span>
        {{ $t('prestations.status_badge') }}
      </span>

      <h1 class="h-mega text-ink mb-6">
        {{ $t('prestations.title') }}
      </h1>

      <p class="max-w-2xl text-lg text-ink-muted leading-relaxed">
        {{ $t('prestations.intro') }}
      </p>
    </section>

    <!-- Services -->
    <section class="bg-surface-2 border-y border-line-soft">
      <div class="max-w-6xl mx-auto px-6 py-20">
        <div class="grid sm:grid-cols-2 gap-6">
          <article
            v-for="service in services"
            :key="service.key"
            class="reveal card-punch bg-surface p-8 md:odd:rotate-[0.4deg] md:even:-rotate-[0.4deg]"
          >
            <component :is="service.icon" class="w-5 h-5 text-accent mb-5" aria-hidden="true" />

            <h2 class="h-doc text-ink mb-3">
              {{ $t(`prestations.services.${service.key}.title`) }}
            </h2>

            <p class="text-ink-muted leading-relaxed mb-6">
              {{ $t(`prestations.services.${service.key}.desc`) }}
            </p>

            <ul class="space-y-2 border-t border-line-soft pt-5">
              <li
                v-for="(item, i) in tm(`prestations.services.${service.key}.items`)"
                :key="i"
                class="flex gap-3 text-sm text-ink-muted"
              >
                <span class="text-accent shrink-0" aria-hidden="true">-</span>
                <span>{{ item }}</span>
              </li>
            </ul>

            <!-- Preuve d'expertise quand il y en a une : une affirmation
                 adossée à un travail de recherche pèse plus qu'une liste. -->
            <p
              v-if="te(`prestations.services.${service.key}.note`)"
              class="mt-5 pt-5 border-t border-line-soft text-sm text-ink italic"
            >
              {{ $t(`prestations.services.${service.key}.note`) }}
            </p>
          </article>
        </div>
      </div>
    </section>

    <!-- Comment travailler ensemble -->
    <section class="max-w-6xl mx-auto px-6 py-20 md:py-24">
      <h2 class="reveal h-section text-ink mb-14 max-w-2xl">
        {{ $t('prestations.how_title') }}
      </h2>

      <ol class="grid md:grid-cols-3 gap-10 md:gap-12">
        <li
          v-for="(step, index) in steps"
          :key="step"
          class="reveal border-t-2 border-accent pt-5"
        >
          <p class="font-display text-3xl text-accent mb-3">0{{ index + 1 }}</p>
          <h3 class="text-lg text-ink mb-2">
            {{ $t(`prestations.${step}_label`) }}
          </h3>
          <p class="text-ink-muted leading-relaxed text-sm">
            {{ $t(`prestations.${step}_desc`) }}
          </p>
        </li>
      </ol>
    </section>

    <!-- Cadre de la prestation + CTA -->
    <section class="bg-surface-2 border-y border-line-soft">
      <div class="reveal max-w-6xl mx-auto px-6 py-20">
        <div class="grid md:grid-cols-2 gap-12 items-start">

          <div>
            <h2 class="h-doc text-ink mb-4">
              {{ $t('prestations.status_title') }}
            </h2>
            <p class="text-ink-muted leading-relaxed mb-8 max-w-lg">
              {{ $t('prestations.status_desc') }}
            </p>

            <dl class="grid grid-cols-2 gap-6 border-t border-line-soft pt-6 max-w-lg">
              <div>
                <dt class="text-sm text-ink-muted mb-1">{{ $t('prestations.status_label') }}</dt>
                <dd class="font-medium text-ink">{{ $t('prestations.status_value') }}</dd>
              </div>
              <div>
                <dt class="text-sm text-ink-muted mb-1">{{ $t('prestations.availability_label') }}</dt>
                <dd class="font-medium text-ink">{{ $t('prestations.availability_value') }}</dd>
              </div>
            </dl>
          </div>

          <div class="md:text-right">
            <router-link
              to="/contact"
              class="inline-flex items-center gap-2 px-6 py-3 bg-accent text-accent-ink font-medium hover:opacity-90 transition-opacity"
            >
              {{ $t('prestations.cta') }}
              <ArrowRight class="w-4 h-4" />
            </router-link>
          </div>
        </div>
      </div>
    </section>

  </div>
</template>
