import { watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { SITE } from '../config/site'

/**
 * Récupère la balise du <head> correspondant au sélecteur, ou la crée.
 * Les balises statiques d'index.html servent de valeur par défaut avant
 * l'hydratation : on les met à jour plutôt que d'en ajouter des doublons.
 */
function headTag(selector, create) {
  let el = document.head.querySelector(selector)
  if (!el) {
    el = create()
    document.head.appendChild(el)
  }
  return el
}

const setMetaName = (name, content) =>
  headTag(`meta[name="${name}"]`, () => {
    const el = document.createElement('meta')
    el.setAttribute('name', name)
    return el
  }).setAttribute('content', content)

const setMetaProperty = (property, content) =>
  headTag(`meta[property="${property}"]`, () => {
    const el = document.createElement('meta')
    el.setAttribute('property', property)
    return el
  }).setAttribute('content', content)

const setCanonical = (href) =>
  headTag('link[rel="canonical"]', () => {
    const el = document.createElement('link')
    el.setAttribute('rel', 'canonical')
    return el
  }).setAttribute('href', href)

/**
 * Synchronise le <head> avec la route courante et la langue active.
 * Appelé une seule fois depuis App.vue.
 *
 * Le watch dépend aussi de la locale : sans ça, un passage FR → EN laisserait
 * un title et une description dans la langue précédente.
 */
export function useSeo() {
  // Au prérendu, la tête est écrite par scripts/prerender-routes.js à partir
  // des mêmes clés de traduction : il n'y a pas de <head> à manipuler ici, et
  // `document` n'existe pas dans Node. Côté navigateur, `import.meta.env.SSR`
  // vaut false et cette garde disparaît du bundle.
  if (import.meta.env.SSR) return

  const route = useRoute()
  const { t, locale } = useI18n()

  const apply = () => {
    const key = route.meta?.seoKey
    if (!key) return

    const title = t(`seo.${key}.title`)
    const description = t(`seo.${key}.description`)
    const url = `${SITE.url}${route.path}`

    document.title = title
    document.documentElement.setAttribute('lang', locale.value)

    setMetaName('description', description)
    // Une page d'erreur ne doit pas se retrouver dans l'index : sans ça, chaque
    // URL morte devenait une page indexable renvoyant un 200.
    setMetaName('robots', route.meta?.noindex ? 'noindex, follow' : 'index, follow')
    setCanonical(url)

    setMetaProperty('og:title', title)
    setMetaProperty('og:description', description)
    setMetaProperty('og:url', url)
    setMetaProperty('og:image', SITE.ogImage.url)
    setMetaProperty('og:type', 'website')
    setMetaProperty('og:locale', locale.value === 'fr' ? 'fr_FR' : 'en_US')

    // Les dimensions ne changent jamais d'une route à l'autre, mais une
    // balise posée une fois par index.html disparaîtrait si un aperçu était
    // reconstruit à partir du DOM courant. Les réaffirmer ne coûte rien.
    setMetaProperty('og:site_name', SITE.name)
    setMetaProperty('og:image:width', SITE.ogImage.width)
    setMetaProperty('og:image:height', SITE.ogImage.height)
    // Seule valeur de l'image qui suive la langue : c'est une phrase, pas une
    // dimension.
    setMetaProperty('og:image:alt', t('seo.ogImageAlt'))

    setMetaName('twitter:card', 'summary_large_image')
    setMetaName('twitter:title', title)
    setMetaName('twitter:description', description)
    setMetaName('twitter:image', SITE.ogImage.url)
    setMetaName('twitter:image:alt', t('seo.ogImageAlt'))
  }

  watch([() => route.path, locale], apply, { immediate: true })
}
