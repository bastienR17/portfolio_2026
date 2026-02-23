import * as THREE from 'three'

export function useEnvironment(scene, colors) {
  let earthGroup, sun, moon

 

  const createLowPolyTree = () => {
    const tree = new THREE.Group()
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.5, 0.7, 3, 6), 
      new THREE.MeshStandardMaterial({ color: colors.light.treeTrunk, flatShading: true })
    )
    trunk.position.y = 1.5
    trunk.name = "trunkMesh"

    const leaves = new THREE.Mesh(
      new THREE.IcosahedronGeometry(2.5, 0), 
      new THREE.MeshStandardMaterial({ color: colors.light.treeLeaves, flatShading: true })
    )
    leaves.position.y = 4
    leaves.name = "leavesMesh"

    tree.add(trunk, leaves)
    return tree
  }

  const createLowPolyHouse = () => {
    const house = new THREE.Group()
    const walls = new THREE.Mesh(
      new THREE.BoxGeometry(4, 3, 4), 
      new THREE.MeshStandardMaterial({ color: colors.light.houseWall, flatShading: true })
    )
    walls.position.y = 1.5
    walls.name = "wallMesh"

    const roof = new THREE.Mesh(
      new THREE.ConeGeometry(3.5, 2.5, 4), 
      new THREE.MeshStandardMaterial({ color: colors.light.houseRoof, flatShading: true })
    )
    roof.position.y = 4.25
    roof.rotation.y = Math.PI / 4
    roof.name = "roofMesh"

    const win = new THREE.Mesh(
      new THREE.PlaneGeometry(0.8, 1), 
      new THREE.MeshStandardMaterial({ 
        color: colors.light.window, 
        emissive: new THREE.Color(0x000000), 
        emissiveIntensity: 0 
      })
    )
    win.position.set(0, 1.5, 2.01)
    win.name = "windowMesh"

    house.add(walls, roof, win)
    return house
  }

  // --- NOUVEAU : Création du Soleil et de la Lune ---

  const createCelestialBodies = (screenBounds) => {
    // 1. LE SOLEIL
    const sunGeo = new THREE.IcosahedronGeometry(screenBounds.h * 0.08, 1)
    const sunMat = new THREE.MeshBasicMaterial({ color: colors.light.sun })
    sun = new THREE.Mesh(sunGeo, sunMat)
    
    // 2. LA LUNE (Groupe avec masque pour l'effet croissant)
    moon = new THREE.Group()
    const moonSize = screenBounds.h * 0.07
    
    const moonVisible = new THREE.Mesh(
      new THREE.IcosahedronGeometry(moonSize, 1),
      new THREE.MeshStandardMaterial({ 
        color: colors.dark.moon, 
        flatShading: true, 
        emissive: colors.dark.moon, 
        emissiveIntensity: 0.2 
      })
    )
    
    const mask = new THREE.Mesh(
      new THREE.IcosahedronGeometry(moonSize * 1.1, 1),
      new THREE.MeshBasicMaterial({ color: colors.dark.bg })
    )
    mask.position.set(moonSize * 0.4, 0, 2)
    
    moon.add(moonVisible, mask)
    moon.rotation.z = Math.PI / 6

    scene.add(sun, moon)
  }

  // --- Fonctions Principales ---

  const createWorld = (screenBounds, groundY) => {
    earthGroup = new THREE.Group()
    
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(screenBounds.w * 3, 200),
      new THREE.MeshStandardMaterial({ color: colors.light.ground, flatShading: true, roughness: 1 })
    )
    ground.rotation.x = -Math.PI / 2
    ground.position.y = groundY
    ground.name = "groundMesh"
    earthGroup.add(ground)

    for (let i = 0; i < 15; i++) {
      const tree = createLowPolyTree()
      tree.position.set((Math.random() - 0.5) * screenBounds.w * 1.2, groundY, (Math.random() - 0.5) * 60 - 10)
      tree.scale.setScalar(0.6 + Math.random() * 0.6)
      earthGroup.add(tree)
    }

    for (let i = 0; i < 4; i++) {
      const house = createLowPolyHouse()
      house.position.set((Math.random() - 0.5) * screenBounds.w * 0.9, groundY, (Math.random() * -40) - 5)
      earthGroup.add(house)
    }

    earthGroup.position.z = -5
    scene.add(earthGroup)

    // On initialise les astres
    createCelestialBodies(screenBounds)
  }

  const updateEnvironment = (isDark, theme, weatherState, screenBounds) => {
    if (!earthGroup) return

    // 1. Mise à jour du SOLEIL
    if (sun) {
      sun.visible = !isDark
      sun.position.set(screenBounds.w * 0.40, screenBounds.h * 0.5, -150)
      sun.rotation.y += 0.005
    }

    // 2. Mise à jour de la LUNE
    if (moon) {
      moon.visible = isDark
      moon.position.set(-screenBounds.w * 0.40, screenBounds.h * 0.5, -150)
      moon.rotation.y += 0.002
      // Mise à jour de la couleur du masque pour qu'il se fonde dans le ciel
      if (moon.children[1]) moon.children[1].material.color.set(theme.bg)
    }

    // 3. Mise à jour du VILLAGE
    earthGroup.traverse(m => {
      if (!m.isMesh) return
      
      if (m.name === "groundMesh") m.material.color.set(theme.ground)
      if (m.name === "trunkMesh") m.material.color.set(theme.treeTrunk)
      if (m.name === "leavesMesh") m.material.color.set(theme.treeLeaves)
      if (m.name === "wallMesh") m.material.color.set(theme.houseWall)
      if (m.name === "roofMesh") m.material.color.set(theme.houseRoof)
      
      if (m.name === "windowMesh") {
        m.material.color.set(theme.window)
        if (isDark) {
          m.material.emissive.set(theme.window)
          m.material.emissiveIntensity = 1.5
        } else {
          m.material.emissive.set(0x000000)
          m.material.emissiveIntensity = 0
        }
      }
    })
  }

  return { createWorld, updateEnvironment }
}