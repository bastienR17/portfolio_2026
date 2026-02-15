<script setup>
import { onMounted, onBeforeUnmount, ref, nextTick } from 'vue'
import * as THREE from 'three'

const container = ref(null)
let scene, camera, renderer, animationId
let rainSystem, cloudGroup
let sun, moon 
let isDark = ref(false)

let screenBounds = { w: 0, h: 0 }

const updateScreenBounds = () => {
  if (!camera) return
  const vFOV = (camera.fov * Math.PI) / 180
  const height = 2 * Math.tan(vFOV / 2) * 100 
  const width = height * camera.aspect
  screenBounds.w = width
  screenBounds.h = height
}

const rainCount = 400
const cloudCount = 6 

const colors = {
  light: { 
    bg: '#E0F2FE', 
    rain: '#1E3A8A', // Bleu marine profond
    cloud: '#FFFFFF', 
    sun: '#FDE047' 
  },
  dark: { 
    bg: '#111827', 
    rain: '#E2725B', 
    moon: '#F3F4F6' 
  }
}

const init = () => {
  if (!container.value) return 

  scene = new THREE.Scene()
  scene.background = new THREE.Color(colors.dark.bg)

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
  camera.position.z = 100
  
  updateScreenBounds()

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  
  container.value.appendChild(renderer.domElement)

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
  scene.add(ambientLight)
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.5)
  dirLight.position.set(10, 20, 10)
  scene.add(dirLight)

  createRain()
  createClouds()
  createCelestialBodies()
  
  checkTheme() 
  animate()
}

const createCelestialBodies = () => {
  const sunGeo = new THREE.IcosahedronGeometry(screenBounds.h * 0.08, 1)
  sun = new THREE.Mesh(sunGeo, new THREE.MeshBasicMaterial({ color: colors.light.sun }))
  
  moon = new THREE.Group()
  const moonSize = screenBounds.h * 0.07
  const moonVisible = new THREE.Mesh(
    new THREE.IcosahedronGeometry(moonSize, 1),
    new THREE.MeshStandardMaterial({ color: colors.dark.moon, flatShading: true, emissive: colors.dark.moon, emissiveIntensity: 0.2 })
  )
  const mask = new THREE.Mesh(
    new THREE.IcosahedronGeometry(moonSize * 1.1, 1),
    new THREE.MeshBasicMaterial({ color: colors.dark.bg })
  )
  mask.position.set(moonSize * 0.4, 0, 2)
  moon.add(moonVisible, mask)

  sun.position.set(screenBounds.w * 0.35, screenBounds.h * 0.3, -50)
  moon.position.set(-screenBounds.w * 0.35, screenBounds.h * 0.3, -50)
  moon.rotation.z = Math.PI / 6
  scene.add(sun, moon)
}

const createRain = () => {
  const rainGeo = new THREE.BufferGeometry()
  const positions = new Float32Array(rainCount * 3)
  const velocities = new Float32Array(rainCount)

  for (let i = 0; i < rainCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * screenBounds.w * 1.5
    positions[i * 3 + 1] = (Math.random() - 0.5) * screenBounds.h * 2
    positions[i * 3 + 2] = (Math.random() - 0.5) * 100
    velocities[i] = 0.5 + Math.random() * 1.5
  }

  rainGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  rainGeo.setAttribute('velocity', new THREE.BufferAttribute(velocities, 1))
  
  rainSystem = new THREE.Points(rainGeo, new THREE.PointsMaterial({ 
    color: colors.dark.rain, 
    size: 0.7, 
    transparent: true, 
    opacity: 0.8, 
    blending: THREE.AdditiveBlending 
  }))
  scene.add(rainSystem)
}

const createClouds = () => {
  cloudGroup = new THREE.Group()
  const cloudMat = new THREE.MeshLambertMaterial({ color: colors.light.cloud, transparent: true, opacity: 0.9, flatShading: true })

  for(let i = 0; i < cloudCount; i++) {
    const meshGroup = new THREE.Group()
    const geo = new THREE.IcosahedronGeometry(5, 1)
    for(let j=0; j<3; j++) {
      const part = new THREE.Mesh(geo, cloudMat)
      part.position.set(j*6, Math.random()*2, 0)
      meshGroup.add(part)
    }
    meshGroup.position.set((Math.random() - 0.5) * screenBounds.w, (0.2 + Math.random() * 0.15) * screenBounds.h, -20)
    meshGroup.userData = { speed: 0.02 + Math.random() * 0.05 }
    cloudGroup.add(meshGroup)
  }
  scene.add(cloudGroup)
}

const animate = () => {
  animationId = requestAnimationFrame(animate)

  if (rainSystem) {
    const positions = rainSystem.geometry.attributes.position.array
    const velocities = rainSystem.geometry.attributes.velocity.array
    const limitY = screenBounds.h * 0.6
    
    // --- VITESSE CALIBRÉE ---
    // Dark: 0.3 (zen) | Light: 0.7 (plus naturel)
    const speedFactor = isDark.value ? 0.3 : 0.5 

    for (let i = 0; i < rainCount; i++) {
      positions[i * 3 + 1] -= velocities[i] * speedFactor

      if (positions[i * 3 + 1] < -limitY) {
        if (!isDark.value && cloudGroup && cloudGroup.children.length > 0) {
          // --- MODE CLAIR : Renaissance précise sous les nuages ---
          const randomCloud = cloudGroup.children[Math.floor(Math.random() * cloudGroup.children.length)]
          // Zone resserrée (* 8) et légèrement sous le nuage (-2)
          positions[i * 3] = randomCloud.position.x + (Math.random() - 0.5) * 8
          positions[i * 3 + 1] = randomCloud.position.y - 2
          positions[i * 3 + 2] = randomCloud.position.z
        } else {
          // --- MODE SOMBRE : Renaissance globale ---
          positions[i * 3 + 1] = limitY
          positions[i * 3] = (Math.random() - 0.5) * screenBounds.w * 1.5
        }
      }
    }
    rainSystem.geometry.attributes.position.needsUpdate = true
  }

  // Animation Nuages (Légèrement ralentis pour la cohérence)
  if (!isDark.value && cloudGroup?.visible) {
    cloudGroup.children.forEach(cloud => {
      cloud.position.x -= cloud.userData.speed * 0.8
      if(cloud.position.x < -screenBounds.w * 0.6) cloud.position.x = screenBounds.w * 0.6
    })
  }

  if (sun?.visible) sun.rotation.y += 0.005
  if (moon?.visible) moon.rotation.y += 0.002
  renderer.render(scene, camera)
}

const checkTheme = () => {
  isDark.value = document.documentElement.classList.contains('dark')
  
  if (scene?.background) {
    scene.background.set(isDark.value ? colors.dark.bg : colors.light.bg)
  }

  if (rainSystem) {
    const mat = rainSystem.material
    mat.color.set(isDark.value ? colors.dark.rain : colors.light.rain)

    if (isDark.value) {
      mat.blending = THREE.AdditiveBlending 
      mat.size = 0.8
      mat.opacity = 0.8
    } else {
      mat.blending = THREE.NormalBlending 
      mat.size = 0.6 
      mat.opacity = 1.0 
    }
    mat.needsUpdate = true 
  }

  if (cloudGroup) cloudGroup.visible = !isDark.value
  if (sun) sun.visible = !isDark.value
  if (moon) {
    moon.visible = isDark.value
    if (moon.children[1]) {
      moon.children[1].material.color.set(isDark.value ? colors.dark.bg : colors.light.bg)
    }
  }
}

const onWindowResize = () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
  updateScreenBounds()
  if (sun) sun.position.set(screenBounds.w * 0.35, screenBounds.h * 0.3, -50)
  if (moon) moon.position.set(-screenBounds.w * 0.35, screenBounds.h * 0.3, -50)
}

const themeObserver = new MutationObserver(() => checkTheme())

onMounted(async () => {
  await nextTick() 
  init()
  window.addEventListener('resize', onWindowResize)
  themeObserver.observe(document.documentElement, { attributes: true })
})

onBeforeUnmount(() => {
  cancelAnimationFrame(animationId)
  window.removeEventListener('resize', onWindowResize)
  themeObserver.disconnect()
})
</script>

<template>
  <div ref="container" class="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none" />
</template>