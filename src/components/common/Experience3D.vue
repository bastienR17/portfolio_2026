<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'
import * as THREE from 'three'

const container = ref(null)
let scene, camera, renderer, animationId
let rainSystem, cloudGroup
let sun, moon // Moon devient un Groupe maintenant
let isDark = ref(false)

// --- Configuration ---
const rainCount = 1500 
const cloudCount = 5 

// --- Couleurs du thème ---
const colors = {
  light: {
    bg: '#E0F2FE',
    rain: '#3B82F6',
    cloud: '#FFFFFF',
    sun: '#FDE047'
  },
  dark: {
    bg: '#111827', // Cette couleur est cruciale pour le masque de la lune
    rain: '#E2725B',
    moon: '#F3F4F6'
  }
}

// --- Initialisation de la scène ---
const init = () => {
  scene = new THREE.Scene()
  scene.background = new THREE.Color(colors.dark.bg)

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
  camera.position.z = 100

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

// --- Création du Soleil et de la Lune (Modifié) ---
const createCelestialBodies = () => {
  // SOLEIL (Mode clair) - Inchangé
  const sunGeo = new THREE.IcosahedronGeometry(12, 1)
  const sunMat = new THREE.MeshBasicMaterial({ color: colors.light.sun })
  sun = new THREE.Mesh(sunGeo, sunMat)
  sun.position.set(60, 45, -50)
  scene.add(sun)

  // LUNE (Mode sombre) - C'est ici que ça change !
  // On crée un groupe pour contenir la lune et son masque
  moon = new THREE.Group()

  // 1. La partie visible de la lune (sphère argentée)
  const moonVisibleGeo = new THREE.IcosahedronGeometry(10, 1) // Low-poly
  const moonVisibleMat = new THREE.MeshStandardMaterial({ 
    color: colors.dark.moon,
    flatShading: true,
    emissive: colors.dark.moon,
    emissiveIntensity: 0.2
  })
  const moonVisible = new THREE.Mesh(moonVisibleGeo, moonVisibleMat)
  moon.add(moonVisible)

  // 2. Le masque (sphère couleur du fond qui cache une partie)
  // Légèrement plus grande (taille 11 vs 10) pour bien couvrir
  const maskGeo = new THREE.IcosahedronGeometry(11, 1) 
  const maskMat = new THREE.MeshBasicMaterial({
      color: colors.dark.bg // IMPORTANT : Exactement la couleur du fond sombre
  })
  const mask = new THREE.Mesh(maskGeo, maskMat)
  // On décale le masque vers la droite et un peu en avant pour créer le croissant
  mask.position.set(4, 0, 2)
  moon.add(mask)

  // Position globale du groupe Lune en haut à gauche
  moon.position.set(-60, 45, -50)
  // On incline un peu le groupe pour un joli angle de croissant
  moon.rotation.z = Math.PI / 6 
  moon.rotation.y = -Math.PI / 8

  scene.add(moon)
}

// --- Création de la pluie (Inchangé) ---
const createRain = () => {
  const rainGeo = new THREE.BufferGeometry()
  const positions = new Float32Array(rainCount * 3)
  const velocities = new Float32Array(rainCount)

  for (let i = 0; i < rainCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 200
    positions[i * 3 + 1] = Math.random() * 200 - 100
    positions[i * 3 + 2] = (Math.random() - 0.5) * 100
    velocities[i] = 0.5 + Math.random() * 1.5
  }

  rainGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  rainGeo.setAttribute('velocity', new THREE.BufferAttribute(velocities, 1))

  const rainMat = new THREE.PointsMaterial({
    color: colors.dark.rain,
    size: 0.8,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
  })

  rainSystem = new THREE.Points(rainGeo, rainMat)
  scene.add(rainSystem)
}

// --- Création des nuages (Inchangé) ---
const createClouds = () => {
  cloudGroup = new THREE.Group()
  const cloudMat = new THREE.MeshLambertMaterial({ 
    color: colors.light.cloud, 
    transparent: true, 
    opacity: 0.9,
    flatShading: true 
  })

  const buildOneCloud = (x, y, z, scale) => {
    const meshGroup = new THREE.Group();
    const geo = new THREE.IcosahedronGeometry(5, 1);
    
    const sphere1 = new THREE.Mesh(geo, cloudMat)
    sphere1.position.set(0, 0, 0)
    
    const sphere2 = new THREE.Mesh(geo, cloudMat)
    sphere2.position.set(6, -2, 0)
    sphere2.scale.set(0.8, 0.8, 0.8)

    const sphere3 = new THREE.Mesh(geo, cloudMat)
    sphere3.position.set(-5, -1, 2)
    sphere3.scale.set(0.9, 0.9, 0.9)

    meshGroup.add(sphere1, sphere2, sphere3)
    meshGroup.position.set(x, y, z)
    meshGroup.scale.set(scale, scale, scale)
    meshGroup.userData = { speed: 0.02 + Math.random() * 0.03 }
    return meshGroup
  }

  for(let i = 0; i < cloudCount; i++) {
    const x = (Math.random() - 0.5) * 150
    const y = 40 + Math.random() * 30
    const z = (Math.random() - 0.5) * 80 - 20
    const scale = 0.8 + Math.random() * 1.2
    cloudGroup.add(buildOneCloud(x, y, z, scale))
  }
  scene.add(cloudGroup)
}

// --- Boucle d'animation ---
const animate = () => {
  animationId = requestAnimationFrame(animate)

  // Animation Pluie
  const positions = rainSystem.geometry.attributes.position.array
  const velocities = rainSystem.geometry.attributes.velocity.array
  for (let i = 0; i < rainCount; i++) {
    positions[i * 3 + 1] -= velocities[i]
    if (positions[i * 3 + 1] < -80) {
      positions[i * 3 + 1] = 80 
      positions[i * 3] = (Math.random() - 0.5) * 200
      positions[i * 3 + 2] = (Math.random() - 0.5) * 100
    }
  }
  rainSystem.geometry.attributes.position.needsUpdate = true
  rainSystem.rotation.y += 0.0005

  // Animation Nuages
  if (!isDark.value && cloudGroup.visible) {
    cloudGroup.children.forEach(cloud => {
      cloud.position.x -= cloud.userData.speed
      if(cloud.position.x < -120) cloud.position.x = 120
    })
  }

  // Rotation douce des astres (le groupe entier tourne)
  if (sun && sun.visible) sun.rotation.y += 0.005
  if (moon && moon.visible) moon.rotation.y += 0.002 // Plus lent pour la lune

  renderer.render(scene, camera)
}

// --- Thème ---
const checkTheme = () => {
  isDark.value = document.documentElement.classList.contains('dark')

  if (isDark.value) {
    scene.background.set(colors.dark.bg)
    rainSystem.material.color.set(colors.dark.rain)
    rainSystem.material.size = 0.8
    cloudGroup.visible = false
    sun.visible = false
    moon.visible = true
  } else {
    scene.background.set(colors.light.bg)
    rainSystem.material.color.set(colors.light.rain)
    rainSystem.material.size = 0.6
    cloudGroup.visible = true
    sun.visible = true
    moon.visible = false
  }
}

const onWindowResize = () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

const themeObserver = new MutationObserver(() => checkTheme())

onMounted(() => {
  init()
  window.addEventListener('resize', onWindowResize)
  themeObserver.observe(document.documentElement, { attributes: true })
})

onBeforeUnmount(() => {
  cancelAnimationFrame(animationId)
  window.removeEventListener('resize', onWindowResize)
  themeObserver.disconnect()
  // Nettoyage mémoire
  rainSystem.geometry.dispose()
  rainSystem.material.dispose()
  sun.geometry.dispose()
  sun.material.dispose()
  // On doit maintenant parcourir le groupe de la lune pour tout nettoyer
  moon.traverse(child => {
      if(child.isMesh) {
          child.geometry.dispose()
          child.material.dispose()
      }
  })
  cloudGroup.traverse(child => {
      if(child.isMesh) {
          child.geometry.dispose()
          child.material.dispose()
      }
  })
})
</script>

<template>
  <div ref="container" class="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none" />
</template>