<script setup>
import { onMounted, onBeforeUnmount, ref, nextTick } from 'vue'
import * as THREE from 'three'

import { useWeatherLogic } from './weather/useWeatherLogic'
import { useEnvironment } from './weather/useEnvironment'
import { useAtmosphere } from './weather/useAtmosphere'
import { useStorm } from './weather/useStorm'
import { useWindTurbines } from './weather/useWindTurbines'

// Initialisation propre pour éviter les erreurs "any"
const container = ref(null)
let scene = null
let camera = null
let renderer = null
let animationId = null
let dirLight = null
let screenBounds = { w: 0, h: 0 }
const clock = new THREE.Clock() 

const { weatherState, city, fetchWeatherData } = useWeatherLogic()

const colors = {
  light: { bg: '#87CEEB', rain: '#1E3A8A', ground: '#4ADE80', sun: '#FDE047', treeTrunk: '#78350F', treeLeaves: '#22C55E', houseWall: '#F3F4F6', houseRoof: '#EF4444', window: '#334155' },
  dark: { bg: '#111827', rain: '#E2725B', moon: '#F3F4F6', ground: '#064E3B', treeTrunk: '#451a03', treeLeaves: '#065F46', houseWall: '#374151', houseRoof: '#991B1B', window: '#FDE047', stormBg: '#0f172a' }
}

// Initialisation des controllers à null
let env = null
let atmosphere = null
let stormController = null
let windTurbines = null

// --- UTILITAIRE DE PERSPECTIVE ---
const mapLinear = (x, a, b, c, d) => {
  return c + (d - c) * ((x - a) / (b - a))
}

// --- MODE DEBUG MÉTÉO ---
window.setWeather = (state) => {
  const validStates = ['clear', 'clouds', 'rain', 'storm', 'snow']
  if (validStates.includes(state) && weatherState) {
    weatherState.value = state
    console.log(`%c 🛠 Météo forcée : ${state.toUpperCase()} `, 'background: #333; color: #fff; padding: 2px 5px;')
  }
}

const updateScreenBounds = () => {
  if (!camera) return
  const vFOV = (camera.fov * Math.PI) / 180
  const h = 2 * Math.tan(vFOV / 2) * 100
  screenBounds.w = h * camera.aspect
  screenBounds.h = h
}

const onWindowResize = () => {
  if (!camera || !renderer) return
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
  updateScreenBounds()
}

const init = () => {
  if (!container.value) return

  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
  camera.position.set(0, 5, 100)
  
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  
  container.value.appendChild(renderer.domElement)

  updateScreenBounds()
  const groundY = -screenBounds.h * 0.55

  scene.add(new THREE.AmbientLight(0xffffff, 0.7))
  dirLight = new THREE.DirectionalLight(0xffffff, 0.6)
  dirLight.position.set(50, 50, 20)
  scene.add(dirLight)

  // On assigne nos controllers
  env = useEnvironment(scene, colors)
  atmosphere = useAtmosphere(scene, colors)
  stormController = useStorm(scene, dirLight, colors)
  windTurbines = useWindTurbines(scene)

  env.createWorld(screenBounds, groundY)
  atmosphere.createClouds(15, screenBounds)
  atmosphere.createRain(1000, screenBounds)
  atmosphere.createSnow(600, screenBounds)

  // --- GÉNÉRATION ÉOLIENNES (Réduites à 4 pour un look épuré) ---
  const turbineCount = 3
  const zProche = -40
  const zLoin = -120

  for (let i = 0; i < turbineCount; i++) {
    const z = zProche - Math.random() * (Math.abs(zLoin) - Math.abs(zProche))
    const scale = mapLinear(z, zProche, zLoin, 1.3, 0.5)
    let x = (Math.random() - 0.5) * 250 
    if (x > -30 && x < 30) x += x > 0 ? 40 : -40 

    if (windTurbines) windTurbines.createTurbine(x, z, groundY, scale)
  }
  
  animate()
}

const animate = () => {
  animationId = requestAnimationFrame(animate)
  if (!renderer || !scene || !atmosphere || !env) return

  const isDark = document.documentElement.classList.contains('dark')
  const groundY = -screenBounds.h * 0.55
  const elapsed = clock.getElapsedTime() 

  scene.background = new THREE.Color(isDark ? colors.dark.bg : colors.light.bg)

  atmosphere.update(weatherState.value, screenBounds, groundY, isDark)
  
  if (stormController) {
    stormController.updateStorm(weatherState.value, isDark)
  }

  if (windTurbines) {
    windTurbines.update(weatherState.value, isDark, elapsed)
  }

  env.updateEnvironment(isDark, isDark ? colors.dark : colors.light, weatherState.value, screenBounds)

  renderer.render(scene, camera)
}

onMounted(async () => {
  await nextTick()
  await fetchWeatherData()
  await nextTick()
  init()
  window.addEventListener('resize', onWindowResize)
})

onBeforeUnmount(() => {
  if (animationId) cancelAnimationFrame(animationId)
  window.removeEventListener('resize', onWindowResize)
  if (renderer) renderer.dispose()
})
</script>

<template>
  <div v-if="city" class="fixed bottom-4 right-4 text-[10px] font-mono opacity-40 z-50 mix-blend-difference pointer-events-none text-black dark:text-white uppercase italic">
    {{ city }} // {{ weatherState }}
  </div>
  <div ref="container" class="fixed top-0 left-0 w-full h-full -z-50 pointer-events-none" />
</template>