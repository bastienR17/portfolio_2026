<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'

// Mêmes cibles que celles qui prennent le focus clavier : un point qui
// grossirait sur du texte non cliquable serait trompeur.
const TARGET_SELECTOR = 'a, button, [role="button"], input, select, textarea'

const dot = ref(null)
const isHovering = ref(false)

let raf = null
let x = 0, y = 0, targetX = 0, targetY = 0
let attached = false

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches
const canHover = () =>
  window.matchMedia('(hover: hover) and (pointer: fine)').matches

// Décidé une fois, avant le montage : au doigt, au clavier seul ou en
// mouvement réduit, le composant ne rend rien et ne pose aucun écouteur.
const enabled = canHover() && !prefersReducedMotion()

const onPointerMove = (e) => {
  targetX = e.clientX
  targetY = e.clientY
  start()
}

// Écouteur délégué unique : se redéclenche à chaque élément survolé et dit
// donc à tout instant si le pointeur est sur une cible — pas de mouseout
// séparé à maintenir en cohérence.
const onPointerOver = (e) => {
  const target = e.target.closest?.(TARGET_SELECTOR)
  // Les liens de nav ont déjà leur propre indice de survol (le cercle tracé
  // à la main, voir .nav-circle dans Main.css) : le point qui grossit par
  // dessus s'y superposait et mangeait le texte des libellés courts.
  isHovering.value = !!target && !target.closest('.nav-circle')
}

const onWindowLeave = () => { if (dot.value) dot.value.style.opacity = '0' }
const onWindowEnter = () => { if (dot.value) dot.value.style.opacity = '1' }

// En deçà, l'écart restant avec la souris ne se voit plus à l'écran.
const EPSILON = 0.1

const draw = () => {
  if (dot.value) dot.value.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`
}

/**
 * Lissage exponentiel : léger retard sur la souris plutôt qu'une
 * téléportation à chaque event, pour un rendu magnétique.
 *
 * La boucle s'arrête dès que le point a rejoint sa cible et ne repart qu'au
 * mouvement suivant. Tant qu'elle tournait en continu, elle écrivait un
 * transform à chaque rafraîchissement d'écran — jusqu'à 120 fois par seconde
 * sur une souris immobile. Le thread principal n'atteignait alors jamais
 * l'état de repos, ce que les outils de mesure comptent comme du blocage.
 */
const tick = () => {
  const dx = targetX - x
  const dy = targetY - y

  if (Math.abs(dx) < EPSILON && Math.abs(dy) < EPSILON) {
    x = targetX
    y = targetY
    draw()
    raf = null
    return
  }

  x += dx * 0.2
  y += dy * 0.2
  draw()
  raf = requestAnimationFrame(tick)
}

const start = () => {
  if (raf === null) raf = requestAnimationFrame(tick)
}

onMounted(() => {
  if (!enabled) return
  attached = true
  x = targetX = window.innerWidth / 2
  y = targetY = window.innerHeight / 2
  // Posé une fois au centre, puis plus rien jusqu'au premier mouvement.
  draw()
  document.addEventListener('mousemove', onPointerMove, { passive: true })
  document.addEventListener('mouseover', onPointerOver, { passive: true })
  document.documentElement.addEventListener('mouseleave', onWindowLeave)
  document.documentElement.addEventListener('mouseenter', onWindowEnter)
})

onBeforeUnmount(() => {
  if (!attached) return
  document.removeEventListener('mousemove', onPointerMove)
  document.removeEventListener('mouseover', onPointerOver)
  document.documentElement.removeEventListener('mouseleave', onWindowLeave)
  document.documentElement.removeEventListener('mouseenter', onWindowEnter)
  if (raf !== null) cancelAnimationFrame(raf)
  raf = null
})
</script>

<template>
  <div
    v-if="enabled"
    ref="dot"
    aria-hidden="true"
    class="fixed top-0 left-0 rounded-full bg-accent pointer-events-none z-[999] print:hidden transition-[width,height] duration-200 ease-out"
    :class="isHovering ? 'w-7 h-7' : 'w-2.5 h-2.5'"
  />
</template>
