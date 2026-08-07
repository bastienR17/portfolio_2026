import { createI18n } from 'vue-i18n'
import fr from './locales/fr.json'

/**
 * Seul le français est embarqué dans le bundle d'entrée. L'anglais pèse
 * ~5,6 Ko gzip et concerne une minorité de visiteurs : il est chargé à la
 * demande, au premier changement de langue.
 */
const i18n = createI18n({
  legacy: false, // On utilise la Composition API
  locale: 'fr',
  fallbackLocale: 'fr',
  messages: { fr },
})

// Chargeurs explicites plutôt qu'un chemin construit : un import dynamique
// avec variable engloberait aussi fr.json, déjà présent dans l'entrée, et
// Rollup ne saurait plus le sortir du chunk.
const loaders = {
  en: () => import('./locales/en.json'),
}

const loaded = new Set(['fr'])

export async function setLocale(locale) {
  if (!loaded.has(locale) && loaders[locale]) {
    const messages = await loaders[locale]()
    i18n.global.setLocaleMessage(locale, messages.default)
    loaded.add(locale)
  }
  i18n.global.locale.value = locale
}

export default i18n
