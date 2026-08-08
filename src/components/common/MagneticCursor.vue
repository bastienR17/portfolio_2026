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

const onPointerMove = (e) => { targetX = e.clientX; targetY = e.clientY }

// Écouteur délégué unique : se redéclenche à chaque élément survolé et dit
// donc à tout instant si le pointeur est sur une cible — pas de mouseout
// séparé à maintenir en cohérence.
const onPointerOver = (e) => {
  isHovering.value = !!e.target.closest?.(TARGET_SELECTOR)
}

const onWindowLeave = () => { if (dot.value) dot.value.style.opacity = '0' }
const onWindowEnter = () => { if (dot.value) dot.value.style.opacity = '1' }

const tick = () => {
  // Lissage exponentiel : léger retard sur la souris plutôt qu'une
  // téléportation à chaque event, pour un rendu magnétique.
  x += (targetX - x) * 0.2
  y += (targetY - y) * 0.2
  if (dot.value) dot.value.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`
  raf = requestAnimationFrame(tick)
}

onMounted(() => {
  if (!enabled) return
  attached = true
  x = targetX = window.innerWidth / 2
  y = targetY = window.innerHeight / 2
  document.addEventListener('mousemove', onPointerMove, { passive: true })
  document.addEventListener('mouseover', onPointerOver, { passive: true })
  document.documentElement.addEventListener('mouseleave', onWindowLeave)
  document.documentElement.addEventListener('mouseenter', onWindowEnter)
  raf = requestAnimationFrame(tick)
})

onBeforeUnmount(() => {
  if (!attached) return
  document.removeEventListener('mousemove', onPointerMove)
  document.removeEventListener('mouseover', onPointerOver)
  document.documentElement.removeEventListener('mouseleave', onWindowLeave)
  document.documentElement.removeEventListener('mouseenter', onWindowEnter)
  if (raf) cancelAnimationFrame(raf)
})
</script>

<template>
  <div
    v-if="enabled"
    ref="dot"
    aria-hidden="true"
    class="fixed top-0 left-0 rounded-full bg-accent pointer-events-none z-[999] transition-[width,height] duration-200 ease-out"
    :class="isHovering ? 'w-7 h-7' : 'w-2.5 h-2.5'"
  />
</template>
