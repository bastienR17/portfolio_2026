import { onMounted, onBeforeUnmount, nextTick } from 'vue'

const READY_CLASS = 'reveal-ready'
const FAILSAFE_MS = 2000

/**
 * Révèle les éléments `.reveal` quand ils entrent dans le viewport.
 *
 * Le contenu est visible par défaut : la classe `.reveal-ready` n'est posée sur
 * <html> que si l'animation peut réellement se jouer. Sans JS, sans
 * IntersectionObserver ou en mouvement réduit, rien n'est jamais masqué —
 * une page de conversion ne doit pas pouvoir finir blanche à cause d'une
 * animation décorative.
 */
export function useReveal(threshold = 0.1) {
  let observer = null
  let failsafe = null

  // Décidé de façon synchrone, avant que les éléments ne soient peints, pour
  // éviter un flash « visible puis masqué ».
  const canAnimate =
    'IntersectionObserver' in window &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (canAnimate) document.documentElement.classList.add(READY_CLASS)

  const revealAll = (targets) => targets.forEach((el) => el.classList.add('visible'))

  onMounted(async () => {
    if (!canAnimate) return
    await nextTick()

    const targets = document.querySelectorAll('.reveal')

    // Cascade : chaque élément reçoit son rang parmi les .reveal de son
    // parent direct (plafonné pour qu'une longue liste ne finisse pas avec
    // un délai à rallonge). Main.css traduit ce rang en transition-delay
    // via calc(var(--reveal-index, 0) * 80ms) — une grille de cartes se
    // révèle donc en cascade sans qu'aucune vue n'ait à s'en soucier.
    const MAX_STAGGER_INDEX = 6
    const siblingCounts = new Map()
    targets.forEach((el) => {
      const parent = el.parentElement
      const index = siblingCounts.get(parent) ?? 0
      el.style.setProperty('--reveal-index', Math.min(index, MAX_STAGGER_INDEX))
      siblingCounts.set(parent, index + 1)
    })

    observer = new IntersectionObserver((entries) => {
      // L'observer répond : le filet de sécurité n'a plus lieu d'être.
      clearTimeout(failsafe)
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('visible')
          observer.unobserve(e.target)
        }
      })
    }, { threshold })

    targets.forEach((el) => observer.observe(el))

    // Si l'observer ne se déclenche jamais (onglet ouvert en arrière-plan,
    // moteur qui ne calcule pas les intersections), on affiche tout.
    failsafe = setTimeout(() => revealAll(targets), FAILSAFE_MS)
  })

  onBeforeUnmount(() => {
    clearTimeout(failsafe)
    observer?.disconnect()
    observer = null
  })
}
