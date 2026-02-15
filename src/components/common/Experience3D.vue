<script setup>
import { onMounted, onBeforeUnmount, ref, nextTick } from 'vue'
import * as THREE from 'three'

const container = ref(null)
let scene, camera, renderer, animationId
let rainSystem, cloudGroup
let sun, moon 
let isDark = ref(false)

let screenBounds = { w: 0, h: 0 }

// --- Paramètres de météo réactifs ---
const rainCount = ref(0)
const cloudCount = ref(3)
const city = ref('')

const updateScreenBounds = () => {
  if (!camera) return
  const vFOV = (camera.fov * Math.PI) / 180
  const height = 2 * Math.tan(vFOV / 2) * 100 
  const width = height * camera.aspect
  screenBounds.w = width
  screenBounds.h = height
}

const colors = {
  light: { bg: '#E0F2FE', rain: '#1E3A8A', cloud: '#FFFFFF', sun: '#FDE047' },
  dark: { bg: '#111827', rain: '#E2725B', moon: '#F3F4F6' }
}

// --- LOGIQUE DE GÉOLOCALISATION ET MÉTÉO ---

const getGPSCoords = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) reject(new Error("Géolocalisation non supportée"));
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      (err) => reject(err),
      { timeout: 8000 } // On attend 8 secondes maximum
    );
  });
};

const fetchWeatherData = async () => {
  let lat, lon;

  try {
    // 1. Tentative de localisation précise (GPS/Wi-Fi)
    try {
      const coords = await getGPSCoords();
      lat = coords.lat;
      lon = coords.lon;
      city.value = "Position Précise";
    } catch (e) {
      // 2. Repli sur l'IP si le GPS échoue ou est refusé
      console.warn("GPS indisponible, repli sur l'IP...");
      const locRes = await fetch('https://ipapi.co/json/');
      const locData = await locRes.json();
      lat = locData.latitude;
      lon = locData.longitude;
      city.value = locData.city;
    }

    // 3. Récupérer la météo réelle via Open-Meteo
    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
    );
    const weatherData = await weatherRes.json();
    const code = weatherData.current_weather.weathercode;

    // 4. Traduction WMO -> Three.js
    if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) {
      rainCount.value = 800; // Pluie
      cloudCount.value = 6;
    } else if ([1, 2, 3].includes(code)) {
      rainCount.value = 0; // Nuageux
      cloudCount.value = 10;
    } else if ([45, 48].includes(code)) {
      rainCount.value = 200; // Brouillard
      cloudCount.value = 15;
    } else {
      rainCount.value = 0; // Beau temps
      cloudCount.value = 4;
    }

  } catch (error) {
    console.error("Échec météo total, mode par défaut.");
    rainCount.value = 400;
    cloudCount.value = 6;
    city.value = "Hors-ligne";
  }
}

// --- INITIALISATION THREE.JS ---

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

  if (rainCount.value > 0) createRain()
  if (cloudCount.value > 0) createClouds()
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
  const positions = new Float32Array(rainCount.value * 3)
  const velocities = new Float32Array(rainCount.value)

  for (let i = 0; i < rainCount.value; i++) {
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

  for(let i = 0; i < cloudCount.value; i++) {
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
    const speedFactor = isDark.value ? 0.15 : 0.35 

    for (let i = 0; i < rainCount.value; i++) {
      positions[i * 3 + 1] -= velocities[i] * speedFactor

      if (positions[i * 3 + 1] < -limitY) {
        if (!isDark.value && cloudGroup && cloudGroup.children.length > 0) {
          const randomCloud = cloudGroup.children[Math.floor(Math.random() * cloudGroup.children.length)]
          positions[i * 3]     = randomCloud.position.x + 6 + (Math.random() - 0.5) * 25 
          positions[i * 3 + 1] = randomCloud.position.y - 2 
          positions[i * 3 + 2] = randomCloud.position.z + (Math.random() - 0.5) * 10
        } else {
          positions[i * 3 + 1] = limitY
          positions[i * 3] = (Math.random() - 0.5) * screenBounds.w * 1.5
        }
      }
    }
    rainSystem.geometry.attributes.position.needsUpdate = true
  }

  if (!isDark.value && cloudGroup?.visible) {
    cloudGroup.children.forEach(cloud => {
      cloud.position.x -= cloud.userData.speed * 0.5
      if(cloud.position.x < -screenBounds.w * 0.6) cloud.position.x = screenBounds.w * 0.6
    })
  }

  if (sun?.visible) sun.rotation.y += 0.005
  if (moon?.visible) moon.rotation.y += 0.002
  renderer.render(scene, camera)
}

const checkTheme = () => {
  isDark.value = document.documentElement.classList.contains('dark')
  if (scene?.background) scene.background.set(isDark.value ? colors.dark.bg : colors.light.bg)

  if (rainSystem) {
    const mat = rainSystem.material
    mat.color.set(isDark.value ? colors.dark.rain : colors.light.rain)
    if (isDark.value) {
      mat.blending = THREE.AdditiveBlending 
      mat.size = 0.8
      mat.opacity = 0.8
    } else {
      mat.blending = THREE.NormalBlending 
      mat.size = 0.7 
      mat.opacity = 1.0 
    }
    mat.needsUpdate = true 
  }

  if (cloudGroup) cloudGroup.visible = !isDark.value
  if (sun) sun.visible = !isDark.value
  if (moon) {
    moon.visible = isDark.value
    if (moon.children[1]) moon.children[1].material.color.set(isDark.value ? colors.dark.bg : colors.light.bg)
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
  await fetchWeatherData()
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
  <div v-if="city" class="fixed bottom-4 right-4 text-xs font-mono opacity-40 select-none pointer-events-none z-50">
    LOC: {{ city.toUpperCase() }} // WEATHER_SYNC: OK
  </div>
  <div ref="container" class="fixed top-0 left-0 w-full h-full pointer-events-none" />
</template>