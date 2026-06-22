<script setup>
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Target, Users, Workflow, Bot, BadgeCheck, ArrowRight } from 'lucide-vue-next'

const router = useRouter()
const { tm } = useI18n()

// Les services pilotés depuis l'i18n : clé de traduction + icône associée
const services = [
  { key: 'amoa', icon: Target },
  { key: 'change', icon: Users },
  { key: 'agile', icon: Workflow },
  { key: 'ai', icon: Bot }
]

const steps = ['step1', 'step2', 'step3']
</script>

<template>
  <section class="max-w-6xl mx-auto py-24 px-4 relative z-10 transition-colors duration-500">

    <!-- En-tête -->
    <div class="mb-16 max-w-3xl">
      <span class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-terracotta/10 dark:bg-ochre/10 border border-terracotta/30 dark:border-ochre/20 text-terracotta dark:text-ochre text-xs font-black uppercase tracking-widest mb-6">
        <BadgeCheck class="w-4 h-4" />
        {{ $t('prestations.status_badge') }}
      </span>

      <h2 class="text-5xl font-extrabold text-dark-soft dark:text-white mb-6 tracking-tight">
        {{ $t('prestations.title') }}
      </h2>

      <p class="text-gray-600 dark:text-gray-400 text-lg font-medium leading-relaxed">
        {{ $t('prestations.intro') }}
      </p>
    </div>

    <!-- Services -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
      <div
        v-for="service in services"
        :key="service.key"
        class="group relative bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl p-8 rounded-3xl border border-white/30 dark:border-white/10 transition-all duration-300 shadow-lg hover:shadow-2xl hover:-translate-y-1 hover:border-terracotta/40"
      >
        <div class="flex items-center justify-center w-14 h-14 rounded-2xl bg-terracotta/10 dark:bg-ochre/10 text-terracotta dark:text-ochre mb-6 transition-transform group-hover:scale-110">
          <component :is="service.icon" class="w-7 h-7" />
        </div>

        <h3 class="text-2xl font-bold text-dark-soft dark:text-white mb-3 tracking-tight">
          {{ $t(`prestations.services.${service.key}.title`) }}
        </h3>

        <p class="text-gray-600 dark:text-gray-400 font-medium mb-6 leading-relaxed">
          {{ $t(`prestations.services.${service.key}.desc`) }}
        </p>

        <ul class="space-y-2.5">
          <li
            v-for="(item, i) in tm(`prestations.services.${service.key}.items`)"
            :key="i"
            class="flex items-start gap-3 text-sm text-dark-soft dark:text-gray-300 font-medium"
          >
            <span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-terracotta dark:bg-ochre shrink-0"></span>
            <span>{{ item }}</span>
          </li>
        </ul>
      </div>
    </div>

    <!-- Comment travailler ensemble -->
    <div class="mb-24">
      <h3 class="text-3xl font-extrabold text-dark-soft dark:text-white mb-12 tracking-tight text-center">
        {{ $t('prestations.how_title') }}
      </h3>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
        <div
          v-for="(step, index) in steps"
          :key="step"
          class="relative text-center px-4"
        >
          <div class="flex items-center justify-center w-12 h-12 mx-auto rounded-full bg-terracotta text-white font-black text-lg mb-5 shadow-lg">
            {{ index + 1 }}
          </div>
          <h4 class="text-lg font-bold text-dark-soft dark:text-white mb-2 tracking-tight">
            {{ $t(`prestations.${step}_label`) }}
          </h4>
          <p class="text-gray-600 dark:text-gray-400 font-medium text-sm leading-relaxed">
            {{ $t(`prestations.${step}_desc`) }}
          </p>
        </div>
      </div>
    </div>

    <!-- Cadre de la prestation + CTA -->
    <div class="bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl p-10 md:p-12 rounded-3xl border-2 border-dashed border-ochre/40 dark:border-ochre/20 shadow-xl">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">

        <div>
          <h3 class="text-2xl font-bold text-dark-soft dark:text-white mb-4 tracking-tight">
            {{ $t('prestations.status_title') }}
          </h3>
          <p class="text-gray-600 dark:text-gray-400 font-medium leading-relaxed mb-6">
            {{ $t('prestations.status_desc') }}
          </p>

          <div class="flex flex-wrap gap-x-10 gap-y-4">
            <div>
              <p class="text-[10px] uppercase tracking-widest text-gray-500 dark:text-ochre/60 font-black mb-1">
                {{ $t('prestations.status_label') }}
              </p>
              <p class="text-sm font-bold text-dark-soft dark:text-white">
                {{ $t('prestations.status_value') }}
              </p>
            </div>
            <div>
              <p class="text-[10px] uppercase tracking-widest text-gray-500 dark:text-ochre/60 font-black mb-1">
                {{ $t('prestations.siret_label') }}
              </p>
              <p class="text-sm font-bold text-dark-soft dark:text-white">
                {{ $t('prestations.siret_value') }}
              </p>
            </div>
          </div>
        </div>

        <div class="flex md:justify-end">
          <button
            @click="router.push('/contact')"
            class="group inline-flex items-center gap-3 px-8 py-4 rounded-full bg-terracotta text-white font-black uppercase tracking-wider shadow-lg hover:bg-ochre transition-all duration-300 hover:shadow-2xl active:scale-95"
          >
            {{ $t('prestations.cta') }}
            <ArrowRight class="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </div>

  </section>
</template>
