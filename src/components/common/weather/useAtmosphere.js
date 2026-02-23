import * as THREE from 'three'

export function useAtmosphere(scene, colors) {
  let cloudGroup = new THREE.Group()
  let rainSystem, snowSystem
  let rainVelocities = [], snowVelocities = []
  const tempVect = new THREE.Vector3() 
  
  scene.add(cloudGroup)

  // --- 1. GÉNÉRATION DES NUAGES ---
  const createClouds = (count, screenBounds) => {
    const cloudMat = new THREE.MeshLambertMaterial({ 
      color: 0xffffff, 
      transparent: true, 
      opacity: 0.8, 
      flatShading: true 
    })

    for (let i = 0; i < count; i++) {
      const meshGroup = new THREE.Group()
      const geo = new THREE.IcosahedronGeometry(6, 1)
      
      for (let j = 0; j < 3; j++) {
        const part = new THREE.Mesh(geo, cloudMat)
        part.position.set(j * 5, Math.random() * 3, Math.random() * 3)
        meshGroup.add(part)
      }

      const zPos = -20 - Math.random() * 100
      meshGroup.position.set(
        (Math.random() - 0.5) * screenBounds.w * 3,
        (0.25 + Math.random() * 0.35) * screenBounds.h,
        zPos
      )

      meshGroup.userData = { speed: (0.02 + Math.random() * 0.04) }
      cloudGroup.add(meshGroup)
    }
  }

  // --- 2. GÉNÉRATION DE LA PLUIE (MODIFIÉE) ---
  const createRain = (count, screenBounds) => {

    const adjustedCount = Math.floor(count / 2)
    const geo = new THREE.BufferGeometry()
    const pos = new Float32Array(adjustedCount * 3)
    
    for (let i = 0; i < adjustedCount; i++) {
      pos[i*3] = (Math.random() - 0.5) * screenBounds.w
      pos[i*3+1] = Math.random() * screenBounds.h
      pos[i*3+2] = (Math.random() - 0.5) * 100
      
      rainVelocities.push(0.25 + Math.random() * 0.5) 
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    
    rainSystem = new THREE.Points(geo, new THREE.PointsMaterial({ 
      color: colors.light.rain, 
      size: 0.8, 
      transparent: true, 
      opacity: 0.5 
    }))
    scene.add(rainSystem)
  }

  // --- 3. GÉNÉRATION DE LA NEIGE ---
  const createSnow = (count, screenBounds) => {
    const geo = new THREE.BufferGeometry()
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i*3] = (Math.random() - 0.5) * screenBounds.w
      pos[i*3+1] = Math.random() * screenBounds.h
      pos[i*3+2] = (Math.random() - 0.5) * 100
      snowVelocities.push(0.1 + Math.random() * 0.2) 
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    snowSystem = new THREE.Points(geo, new THREE.PointsMaterial({ 
      color: 0xffffff, 
      size: 0.6, 
      transparent: true, 
      opacity: 0.8 
    }))
    scene.add(snowSystem)
  }

  // --- 4. MISE À JOUR ---
  const update = (weatherState, screenBounds, groundY, isDark) => {
    const time = Date.now() * 0.001

    // Update Nuages
    cloudGroup.visible = (weatherState !== 'clear')
    cloudGroup.children.forEach(c => {
      c.position.x -= c.userData.speed
      if (c.position.x < -screenBounds.w * 1.5) c.position.x = screenBounds.w * 1.5
    })


    if (rainSystem) {
      rainSystem.visible = (weatherState === 'rain' || weatherState === 'storm')
      
      if (rainSystem.visible) {
        const targetColor = isDark ? colors.dark.rain : colors.light.rain
        rainSystem.material.color.set(targetColor)
        rainSystem.material.opacity = isDark ? 0.8 : 0.5

        const pos = rainSystem.geometry.attributes.position.array
        for (let i = 0; i < pos.length / 3; i++) {
          const multiplier = (weatherState === 'storm' ? 1.2 : 1.0)
          pos[i*3+1] -= rainVelocities[i] * multiplier

          if (pos[i*3+1] < groundY) {
            if (cloudGroup.children.length > 0) {
              const cloud = cloudGroup.children[Math.floor(Math.random() * cloudGroup.children.length)]
              cloud.getWorldPosition(tempVect)
              
              pos[i*3] = tempVect.x + (Math.random() - 0.5) * 12
              pos[i*3+1] = tempVect.y - 1
              pos[i*3+2] = tempVect.z + (Math.random() - 0.5) * 5
            } else {
              pos[i*3+1] = screenBounds.h
            }
          }
        }
        rainSystem.geometry.attributes.position.needsUpdate = true
      }
    }

    // Update Neige
    if (snowSystem) {
      snowSystem.visible = (weatherState === 'snow')
      if (snowSystem.visible) {
        const pos = snowSystem.geometry.attributes.position.array
        for (let i = 0; i < pos.length / 3; i++) {
          pos[i*3+1] -= snowVelocities[i]
          pos[i*3] += Math.sin(time + i) * 0.02
          if (pos[i*3+1] < groundY) pos[i*3+1] = screenBounds.h
        }
        snowSystem.geometry.attributes.position.needsUpdate = true
      }
    }
  }

  return { createClouds, createRain, createSnow, update }
}