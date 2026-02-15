<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import * as THREE from 'three'

const containerRef = ref(null)
let renderer, scene, camera, particles, positions

onMounted(() => {
  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
  camera.position.z = 5

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  containerRef.value.appendChild(renderer.domElement)

  // 1. Création des particules (la pluie)
  const count = 1500 // Nombre de gouttes
  positions = new Float32Array(count * 3)

  for (let i = 0; i < count * 3; i++) {
    // On éparpille les points aléatoirement
    positions[i] = (Math.random() - 0.5) * 15 // X et Y
    if (i % 3 === 1) positions[i] = Math.random() * 10 // Départ en hauteur pour Y
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

  // 2. Style des gouttes (Couleur Terracotta)
  const material = new THREE.PointsMaterial({
    color: 0xE2725B,
    size: 0.03,
    transparent: true,
    opacity: 0.6,
    sizeAttenuation: true
  })

  particles = new THREE.Points(geometry, material)
  scene.add(particles)

  // 3. Animation de la chute
  const animate = () => {
    requestAnimationFrame(animate)
    
    const currentPositions = particles.geometry.attributes.position.array
    for (let i = 0; i < count; i++) {
      let yIndex = i * 3 + 1
      
      // Vitesse de chute
      currentPositions[yIndex] -= 0.02 
      
      // Si la goutte sort de l'écran par le bas, on la remonte en haut
      if (currentPositions[yIndex] < -5) {
        currentPositions[yIndex] = 5
      }
    }
    
    particles.geometry.attributes.position.needsUpdate = true
    renderer.render(scene, camera)
  }
  
  animate()
  window.addEventListener('resize', onWindowResize)
})

const onWindowResize = () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

onUnmounted(() => {
  window.removeEventListener('resize', onWindowResize)
  renderer?.dispose()
})
</script>

<template>
  <div ref="containerRef" class="fixed-background-3d"></div>
</template>

<style scoped>
.fixed-background-3d {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: -1;
  pointer-events: none;
  background: transparent !important;
}
</style>