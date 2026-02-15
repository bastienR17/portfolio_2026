<script setup>
import { onMounted, onBeforeUnmount, ref, nextTick } from 'vue'
import * as THREE from 'three'

const container = ref(null)
let scene, camera, renderer, animationId
let rainSystem, cloudGroup, earthGroup
let sun, moon 
let isDark = ref(false)
let groundLevelY = ref(0) 

let screenBounds = { w: 0, h: 0 }

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
  
  groundLevelY.value = -screenBounds.h * 0.45
  
  if (earthGroup) {
      const ground = earthGroup.getObjectByName('groundMesh');
      if (ground) ground.position.y = groundLevelY.value;
  }
}

const colors = {
  light: { 
    bg: '#E0F2FE', rain: '#1E3A8A', cloud: '#FFFFFF', sun: '#FDE047',
    ground: '#4ADE80', treeTrunk: '#78350F', treeLeaves: '#22C55E', houseWall: '#F3F4F6', houseRoof: '#EF4444',
    window: '#334155' // Fenêtre éteinte
  },
  dark: { 
    bg: '#111827', rain: '#E2725B', moon: '#F3F4F6',
    ground: '#064E3B', treeTrunk: '#451a03', treeLeaves: '#065F46', houseWall: '#374151', houseRoof: '#991B1B',
    window: '#FDE047' // Fenêtre allumée (jaune)
  }
}

// --- LOGIQUE MÉTÉO ---

const getGPSCoords = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) reject(new Error("Non supporté"));
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      (err) => reject(err),
      { timeout: 5000 }
    );
  });
};

const fetchWeatherData = async () => {
  let lat, lon;
  try {
    try {
      const coords = await getGPSCoords();
      lat = coords.lat; lon = coords.lon;
      city.value = "Position Précise";
    } catch (e) {
      const locRes = await fetch('https://ipapi.co/json/');
      const locData = await locRes.json();
      lat = locData.latitude; lon = locData.longitude;
      city.value = locData.city || 'Localisation IP';
    }
    const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
    const weatherData = await weatherRes.json();
    const code = weatherData.current_weather.weathercode;
    
    if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) { 
      rainCount.value = 800; cloudCount.value = 8;
    } else if ([1, 2, 3].includes(code)) { 
      rainCount.value = 0; cloudCount.value = 12; 
    } else if ([45, 48].includes(code)) { 
      rainCount.value = 200; cloudCount.value = 15; 
    } else { 
      rainCount.value = 0; cloudCount.value = 5; 
    }
  } catch (error) {
    rainCount.value = 400; cloudCount.value = 6; city.value = "Hors-ligne";
  }
}

// --- MONDE ET ASSETS ---

const createLowPolyTree = () => {
  const tree = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.7, 3, 6), new THREE.MeshStandardMaterial({ color: colors.light.treeTrunk, flatShading: true }));
  trunk.position.y = 1.5; trunk.name = "trunkMesh";
  const leaves = new THREE.Mesh(new THREE.IcosahedronGeometry(2.5, 0), new THREE.MeshStandardMaterial({ color: colors.light.treeLeaves, flatShading: true }));
  leaves.position.y = 4; leaves.name = "leavesMesh";
  tree.add(trunk, leaves);
  return tree;
}

const createLowPolyHouse = () => {
  const house = new THREE.Group();
  
  // Murs
  const walls = new THREE.Mesh(new THREE.BoxGeometry(4, 3, 4), new THREE.MeshStandardMaterial({ color: colors.light.houseWall, flatShading: true }));
  walls.position.y = 1.5; walls.name = "wallMesh";
  
  // Toit
  const roof = new THREE.Mesh(new THREE.ConeGeometry(3.5, 2.5, 4), new THREE.MeshStandardMaterial({ color: colors.light.houseRoof, flatShading: true }));
  roof.position.y = 4.25; roof.rotation.y = Math.PI / 4; roof.name = "roofMesh";
  
  // Fenêtre
  const windowGeo = new THREE.PlaneGeometry(0.8, 1);
  const windowMat = new THREE.MeshStandardMaterial({ 
    color: colors.light.window,
    emissive: new THREE.Color(0x000000), // Éteint par défaut
    emissiveIntensity: 0
  });
  const windowMesh = new THREE.Mesh(windowGeo, windowMat);
  windowMesh.position.set(0, 1.5, 2.01); // Juste devant le mur
  windowMesh.name = "windowMesh";

  house.add(walls, roof, windowMesh);
  return house;
}

const createWorld = () => {
  earthGroup = new THREE.Group();
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(screenBounds.w * 3, 200),
    new THREE.MeshStandardMaterial({ color: colors.light.ground, flatShading: true, roughness: 1 })
  );
  ground.rotation.x = -Math.PI / 2; ground.position.y = groundLevelY.value; ground.name = "groundMesh";
  earthGroup.add(ground);

  for (let i = 0; i < 15; i++) {
    const tree = createLowPolyTree();
    tree.position.set((Math.random() - 0.5) * screenBounds.w * 1.2, groundLevelY.value, (Math.random() - 0.5) * 60 - 10);
    tree.scale.setScalar(0.6 + Math.random() * 0.6);
    earthGroup.add(tree);
  }

  for (let i = 0; i < 4; i++) {
    const house = createLowPolyHouse();
    house.position.set((Math.random() - 0.5) * screenBounds.w * 0.9, groundLevelY.value, (Math.random() * -40) - 5);
    house.rotation.y = (Math.random() - 0.5) * 0.8;
    earthGroup.add(house);
  }
  earthGroup.position.z = -5;
  scene.add(earthGroup);
}

const createRain = () => {
  if (rainCount.value <= 0) return;
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
    color: colors.dark.rain, size: 0.7, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending 
  }))
  scene.add(rainSystem)
}

const createClouds = () => {
  if (cloudCount.value <= 0) return;
  cloudGroup = new THREE.Group()
  const cloudMat = new THREE.MeshLambertMaterial({ color: colors.light.cloud, transparent: true, opacity: 0.9, flatShading: true })

  for(let i = 0; i < cloudCount.value; i++) {
    const meshGroup = new THREE.Group()
    const geo = new THREE.IcosahedronGeometry(6, 1)
    
    for(let j=0; j<3; j++) {
      const part = new THREE.Mesh(geo, cloudMat); 
      part.position.set(j*5, Math.random()*3, Math.random()*3); 
      meshGroup.add(part)
    }

    const zPos = -20 - Math.random() * 100;
    const depthFactor = Math.abs(zPos) / 20;

    meshGroup.position.set(
      (Math.random() - 0.5) * screenBounds.w * 3,
      (0.25 + Math.random() * 0.35) * screenBounds.h,
      zPos
    )

    meshGroup.userData = { 
      speed: (0.02 + Math.random() * 0.04) / (depthFactor * 0.5) 
    };

    const scale = 1.3 / (depthFactor * 0.6);
    meshGroup.scale.setScalar(Math.max(scale, 0.4));

    cloudGroup.add(meshGroup)
  }
  scene.add(cloudGroup)
}

const createCelestialBodies = () => {
  sun = new THREE.Mesh(new THREE.IcosahedronGeometry(screenBounds.h * 0.08, 1), new THREE.MeshBasicMaterial({ color: colors.light.sun }))
  sun.position.set(screenBounds.w * 0.35, screenBounds.h * 0.3, -80);
  
  moon = new THREE.Group()
  const moonSize = screenBounds.h * 0.07
  const moonVisible = new THREE.Mesh(new THREE.IcosahedronGeometry(moonSize, 1), new THREE.MeshStandardMaterial({ color: colors.dark.moon, flatShading: true, emissive: colors.dark.moon, emissiveIntensity: 0.2 }))
  const mask = new THREE.Mesh(new THREE.IcosahedronGeometry(moonSize * 1.1, 1), new THREE.MeshBasicMaterial({ color: colors.dark.bg }))
  mask.position.set(moonSize * 0.4, 0, 2); 
  moon.add(moonVisible, mask)
  moon.position.set(-screenBounds.w * 0.35, screenBounds.h * 0.3, -80);
  moon.rotation.z = Math.PI / 6; 
  
  scene.add(sun, moon)
}

// --- BOUCLE D'ANIMATION ---

const animate = () => {
  animationId = requestAnimationFrame(animate)
  if (!renderer || !scene || !camera) return;

  if (rainSystem) {
    const positions = rainSystem.geometry.attributes.position.array
    const velocities = rainSystem.geometry.attributes.velocity.array
    const speedFactor = isDark.value ? 0.2 : 0.4 
    const collisionY = groundLevelY.value + 2;

    for (let i = 0; i < rainCount.value; i++) {
      positions[i * 3 + 1] -= velocities[i] * speedFactor
      if (positions[i * 3 + 1] < collisionY) {
        if (!isDark.value && cloudGroup?.children.length > 0) {
          const cloud = cloudGroup.children[Math.floor(Math.random() * cloudGroup.children.length)]
          positions[i * 3] = cloud.position.x + (Math.random() - 0.5) * 20 
          positions[i * 3 + 1] = cloud.position.y - 5; 
          positions[i * 3 + 2] = cloud.position.z + (Math.random() - 0.5) * 10
        } else {
          positions[i * 3 + 1] = screenBounds.h * 0.6; 
          positions[i * 3] = (Math.random() - 0.5) * screenBounds.w * 1.5
        }
      }
    }
    rainSystem.geometry.attributes.position.needsUpdate = true
  }

  if (cloudGroup && cloudGroup.visible) {
    cloudGroup.children.forEach(c => {
      c.position.x -= c.userData.speed * 0.5
      if(c.position.x < -screenBounds.w * 1.5) {
          c.position.x = screenBounds.w * 1.5
      }
    })
  }

  if (sun && sun.visible) sun.rotation.y += 0.005;
  if (moon && moon.visible) moon.rotation.y += 0.002

  renderer.render(scene, camera)
}

const checkTheme = () => {
  if (!scene) return
  isDark.value = document.documentElement.classList.contains('dark')
  const theme = isDark.value ? colors.dark : colors.light
  scene.background = new THREE.Color(theme.bg);
  
  if (earthGroup) {
    earthGroup.traverse(m => {
      if (!m.isMesh) return
      if (m.name === "groundMesh") m.material.color.set(theme.ground)
      if (m.name === "trunkMesh") m.material.color.set(theme.treeTrunk)
      if (m.name === "leavesMesh") m.material.color.set(theme.treeLeaves)
      if (m.name === "wallMesh") m.material.color.set(theme.houseWall)
      if (m.name === "roofMesh") m.material.color.set(theme.houseRoof)
      
      // Mise à jour de la fenêtre (Lumière ON/OFF)
      if (m.name === "windowMesh") {
        m.material.color.set(theme.window)
        if (isDark.value) {
          m.material.emissive.set(theme.window)
          m.material.emissiveIntensity = 1.5 // Brillance
        } else {
          m.material.emissive.set(0x000000)
          m.material.emissiveIntensity = 0 // Éteint
        }
      }
    })
  }

  if (rainSystem) {
    rainSystem.material.color.set(theme.rain)
    rainSystem.material.blending = isDark.value ? THREE.AdditiveBlending : THREE.NormalBlending
  }

  if (cloudGroup) cloudGroup.visible = !isDark.value
  if (sun) sun.visible = !isDark.value
  if (moon) {
    moon.visible = isDark.value
    if (moon.children[1]) moon.children[1].material.color.set(theme.bg)
  }
}

const onWindowResize = () => {
  if (!camera || !renderer) return
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
  updateScreenBounds()
  if (sun) sun.position.set(screenBounds.w * 0.35, screenBounds.h * 0.3, -80)
  if (moon) moon.position.set(-screenBounds.w * 0.35, screenBounds.h * 0.3, -80)
}

const init = () => {
  if (!container.value) return 
  scene = new THREE.Scene()
  scene.background = new THREE.Color(colors.light.bg)
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
  camera.position.set(0, 5, 100)
  
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  container.value.appendChild(renderer.domElement)

  updateScreenBounds()

  scene.add(new THREE.AmbientLight(0xffffff, 0.6))
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.6); dirLight.position.set(50, 50, 20); scene.add(dirLight)

  createWorld()
  createRain()
  createClouds()
  createCelestialBodies()
  
  checkTheme()
  animate()
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
  if (renderer) renderer.dispose();
})
</script>

<template>
  <div v-if="city" class="fixed bottom-4 right-4 text-[10px] font-mono opacity-40 select-none pointer-events-none z-50 text-dark-soft dark:text-cream mix-blend-difference">
    LOC: {{ city.toUpperCase() }} // SYNC: OK
  </div>
  
  <div ref="container" class="fixed top-0 left-0 w-full h-full -z-50 pointer-events-none" />
</template>