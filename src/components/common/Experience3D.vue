<script setup>
import { onMounted, onBeforeUnmount, ref, nextTick } from 'vue'
import { Clock, PerspectiveCamera, Scene, WebGLRenderer } from 'three'

import { isSoftwareRenderer } from '../../composables/canRender3D'
import { useWeatherLogic, WEATHER_STATES } from './weather/useWeatherLogic'
import { useEnvironment } from './weather/useEnvironment'
import { useAtmosphere } from './weather/useAtmosphere'
import { useStorm } from './weather/useStorm'
import { useWindTurbines } from './weather/useWindTurbines'

const container = ref(null)

let scene = null
let camera = null
let renderer = null
let animationId = null
let bounds = { w: 0, h: 0 }
let groundY = 0
let flash = 0

const clock = new Clock()
const { weatherState, weatherInfo, fetchWeatherData } = useWeatherLogic()

let env = null
let atmosphere = null
let storm = null
let turbines = null

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Cède la main au navigateur entre deux étapes de construction, pour que
 * chaque étape reste une tâche courte plutôt qu'un seul bloc synchrone long. */
const nextFrame = () => new Promise((resolve) => requestAnimationFrame(resolve))

// Pont de développement : lu par DebugPanel.vue, et utilisable directement
// depuis la console. `import.meta.env.DEV` vaut littéralement false au build,
// donc tout ce bloc disparaît du bundle de production.
if (import.meta.env.DEV) {
  const setWeather = (state) => {
    if (!WEATHER_STATES.includes(state)) return
    weatherState.value = state
    weatherInfo.value = { ...weatherInfo.value, source: 'manuel' }
  }

  // Des accesseurs plutôt que les valeurs : scene et renderer n'existent
  // qu'après init(), bien après l'exécution de ce bloc.
  window.__scene3d = {
    setWeather,
    refetchWeather: fetchWeatherData,
    // Avance d'une image à la main : utile pour inspecter une ambiance sans
    // attendre le fondu, ou dans un contexte sans requestAnimationFrame.
    // Enveloppé dans une lambda : renderFrame est un const déclaré plus bas,
    // le référencer directement ici le lirait avant son initialisation.
    step: () => renderFrame(),
    weatherState,
    weatherInfo,
    get scene() {
      return scene
    },
    get renderer() {
      return renderer
    },
    get isAnimating() {
      return isAnimating()
    },
    get reducedMotion() {
      return prefersReducedMotion()
    },
  }
  window.setWeather = setWeather
}

const mapLinear = (x, a, b, c, d) => c + (d - c) * ((x - a) / (b - a))

/**
 * Dimensions du viewport bornées à au moins 1px.
 * Si le conteneur est mesuré à 0×0 (monté masqué, volet non affiché), le
 * rapport 0/0 donne un aspect NaN qui se propage à toute la géométrie et
 * produit des `Computed radius is NaN` côté three.js.
 */
const viewportSize = () => ({
  w: Math.max(window.innerWidth || 0, 1),
  h: Math.max(window.innerHeight || 0, 1),
})

const updateScreenBounds = () => {
  if (!camera) return
  const vFOV = (camera.fov * Math.PI) / 180
  const h = 2 * Math.tan(vFOV / 2) * 100
  bounds.w = h * camera.aspect
  bounds.h = h
}

const onWindowResize = () => {
  if (!camera || !renderer) return
  const { w, h } = viewportSize()
  camera.aspect = w / h
  camera.updateProjectionMatrix()
  renderer.setSize(w, h)
  updateScreenBounds()
  env?.resize()
}

const init = async () => {
  if (!container.value) return

  const { w, h } = viewportSize()

  scene = new Scene()
  camera = new PerspectiveCamera(75, w / h, 0.1, 1000)
  camera.position.set(0, 5, 100)

  // Décor flouté par le brouillard : l'antialiasing MSAA (coûteux sur GPU
  // intégré) n'apporte rien de visible ici. Ratio de pixels plafonné à 1.5 —
  // sur un écran Retina (dpr 2-3), ça retire jusqu'à 55 % des pixels à
  // calculer par frame sans perte perceptible sur un fond animé.
  renderer = new WebGLRenderer({ antialias: false, alpha: true })

  // Rendu WebGL assuré par le processeur faute de GPU : chaque image y coûte
  // des dizaines de millisecondes de thread principal. On s'arrête avant de
  // construire quoi que ce soit — le décor est décoratif, la page s'en passe.
  if (isSoftwareRenderer(renderer.getContext())) {
    renderer.dispose()
    renderer = null
    return
  }

  renderer.setSize(w, h)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
  container.value.appendChild(renderer.domElement)

  // Le décor prend la main : le dégradé de repli n'a plus lieu d'être. Posé
  // ici et pas plus tôt, une fois passés tous les cas de renoncement.
  document.documentElement.classList.remove('no-3d')

  updateScreenBounds()
  groundY = -bounds.h * 0.55

  // Aucune source de lumière : ciel, crêtes et éoliennes sont des aplats
  // (shader et MeshBasicMaterial). La profondeur vient du brouillard, pas de
  // l'éclairage.
  env = useEnvironment(scene, camera)
  atmosphere = useAtmosphere(scene)
  storm = useStorm()
  turbines = useWindTurbines(scene, camera)

  // Construction étalée sur plusieurs frames : la scène complète (ciel,
  // crêtes shadées, particules, éoliennes) reste sous les 50 ms par étape
  // au lieu d'un seul bloc synchrone qui bloquait le thread principal.
  await env.createWorld(bounds, groundY)
  await nextFrame()
  atmosphere.create(bounds)

  // Trois éoliennes posées entre la crête lointaine et la crête médiane, qui
  // masque leur base. On évite le centre de l'écran, occupé par le contenu.
  const zNear = -180
  const zFar = -215
  for (let i = 0; i < 3; i++) {
    await nextFrame()
    const z = zNear - Math.random() * Math.abs(zFar - zNear)
    const scale = mapLinear(z, zNear, zFar, 0.55, 0.35)
    let x = (Math.random() - 0.5) * bounds.w * 1.6
    if (x > -40 && x < 40) x += x > 0 ? 55 : -55
    turbines.createTurbine(x, groundY + bounds.h * 0.13, z, scale)
  }

  if (prefersReducedMotion()) renderFrame()
  else animate()
}

const renderFrame = () => {
  if (!renderer || !scene || !atmosphere || !env) return

  const isDark = document.documentElement.classList.contains('dark')
  const delta = Math.min(clock.getDelta(), 0.1)
  const elapsed = clock.getElapsedTime()
  const weather = weatherState.value

  flash = storm.update(weather, delta)

  const ctx = { isDark, weather, bounds, groundY, elapsed, delta, flash }

  env.update(ctx)
  atmosphere.update(ctx)
  turbines.update(ctx)

  renderer.render(scene, camera)
}

/**
 * Un décor de fond n'a rien à gagner à 60 images par seconde : le mouvement y
 * est lent par construction. On plafonne à 30, ce qui divise par deux le temps
 * passé sur le thread principal et sur le GPU. Les déplacements étant exprimés
 * par seconde, l'aspect ne change pas.
 *
 * L'attente se fait sur un setTimeout et non sur un requestAnimationFrame
 * qu'on annulerait trois fois sur quatre : réclamer une image au navigateur
 * pour n'y rien dessiner l'empêche de laisser le thread principal au repos.
 * Le requestAnimationFrame final garde malgré tout le rendu aligné sur le
 * rafraîchissement de l'écran, et reste suspendu onglet masqué.
 */
const TARGET_FPS = 30
const FRAME_INTERVAL = 1000 / TARGET_FPS

let frameTimer = null
let lastRenderAt = 0

const isAnimating = () => animationId !== null || frameTimer !== null

const scheduleNextFrame = () => {
  // Décompté depuis le début du rendu précédent : le temps passé à dessiner
  // est déduit de l'attente, sinon la cadence dérive sous les 30 images.
  const wait = Math.max(0, FRAME_INTERVAL - (performance.now() - lastRenderAt))
  frameTimer = setTimeout(() => {
    frameTimer = null
    animationId = requestAnimationFrame(() => {
      animationId = null
      lastRenderAt = performance.now()
      renderFrame()
      scheduleNextFrame()
    })
  }, wait)
}

const animate = () => {
  if (isAnimating()) return
  // La toute première image compile les shaders — de loin la plus coûteuse.
  // On la programme au lieu de la rendre ici, sinon elle s'agrège à la tâche
  // appelante (la fin de init()) et en fait une tâche longue.
  lastRenderAt = performance.now() - FRAME_INTERVAL
  scheduleNextFrame()
}

const stopAnimating = () => {
  if (animationId !== null) cancelAnimationFrame(animationId)
  if (frameTimer !== null) clearTimeout(frameTimer)
  animationId = null
  frameTimer = null
}

/**
 * La boucle tournait même onglet masqué : un décor de fond n'a aucune raison
 * de consommer du GPU quand personne ne le regarde.
 */
const onVisibilityChange = () => {
  if (document.hidden) {
    stopAnimating()
  } else if (!isAnimating() && renderer && !prefersReducedMotion()) {
    clock.getDelta() // absorbe le temps écoulé pendant la pause
    animate()
  }
}

onMounted(async () => {
  await nextTick()
  await fetchWeatherData()
  await nextTick()
  init()
  window.addEventListener('resize', onWindowResize)
  document.addEventListener('visibilitychange', onVisibilityChange)
})

onBeforeUnmount(() => {
  stopAnimating()
  // Le canvas s'en va avec le composant : le fond de repli reprend le relais.
  document.documentElement.classList.add('no-3d')
  window.removeEventListener('resize', onWindowResize)
  document.removeEventListener('visibilitychange', onVisibilityChange)
  if (import.meta.env.DEV) {
    delete window.setWeather
    delete window.__scene3d
  }
  if (renderer) renderer.dispose()
})
</script>

<template>
  <div
    ref="container"
    aria-hidden="true"
    class="fixed top-0 left-0 w-full h-full -z-50 pointer-events-none"
  />
</template>
