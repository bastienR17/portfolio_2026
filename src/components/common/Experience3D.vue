<script setup>
import { onMounted, onBeforeUnmount, ref, nextTick } from 'vue'
import { Clock, PerspectiveCamera, Scene, WebGLRenderer } from 'three'

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
    weatherState,
    weatherInfo,
    get scene() {
      return scene
    },
    get renderer() {
      return renderer
    },
    get isAnimating() {
      return animationId !== null
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

const init = () => {
  if (!container.value) return

  const { w, h } = viewportSize()

  scene = new Scene()
  camera = new PerspectiveCamera(75, w / h, 0.1, 1000)
  camera.position.set(0, 5, 100)

  renderer = new WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(w, h)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  container.value.appendChild(renderer.domElement)

  updateScreenBounds()
  groundY = -bounds.h * 0.55

  // Aucune source de lumière : ciel, crêtes et éoliennes sont des aplats
  // (shader et MeshBasicMaterial). La profondeur vient du brouillard, pas de
  // l'éclairage.
  env = useEnvironment(scene, camera)
  atmosphere = useAtmosphere(scene)
  storm = useStorm()
  turbines = useWindTurbines(scene, camera)

  env.createWorld(bounds, groundY)
  atmosphere.create(bounds)

  // Trois éoliennes posées entre la crête lointaine et la crête médiane, qui
  // masque leur base. On évite le centre de l'écran, occupé par le contenu.
  const zNear = -180
  const zFar = -215
  for (let i = 0; i < 3; i++) {
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

const animate = () => {
  animationId = requestAnimationFrame(animate)
  renderFrame()
}

/**
 * La boucle tournait même onglet masqué : un décor de fond n'a aucune raison
 * de consommer du GPU quand personne ne le regarde.
 */
const onVisibilityChange = () => {
  if (document.hidden) {
    if (animationId) {
      cancelAnimationFrame(animationId)
      animationId = null
    }
  } else if (!animationId && renderer && !prefersReducedMotion()) {
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
  if (animationId) cancelAnimationFrame(animationId)
  animationId = null
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
