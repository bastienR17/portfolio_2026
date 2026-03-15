import * as THREE from 'three'

export function useWindTurbines(scene) {
  const rotors = []
  const lights = []

  const createTurbine = (x, z, groundY, scale = 1) => {
    const group = new THREE.Group()

    // 1. Mât
    const poleGeo = new THREE.CylinderGeometry(0.4 * scale, 0.7 * scale, 35 * scale, 8)
    const poleMat = new THREE.MeshStandardMaterial({ color: '#f3f4f6' })
    const pole = new THREE.Mesh(poleGeo, poleMat)
    pole.position.y = 17.5 * scale
    group.add(pole)

    // 2. Nacelle (Moteur)
    const engineGeo = new THREE.BoxGeometry(1.5 * scale, 1.5 * scale, 3 * scale)
    const engine = new THREE.Mesh(engineGeo, poleMat)
    engine.position.y = 35 * scale
    group.add(engine)

    // 3. Loupiote rouge (MeshBasicMaterial pour qu'elle brille sans lumière)
    const lightGeo = new THREE.SphereGeometry(0.3 * scale, 8, 8)
    const lightMat = new THREE.MeshBasicMaterial({ color: '#ff0000' })
    const redDot = new THREE.Mesh(lightGeo, lightMat)
    redDot.position.set(0, 36 * scale, 0)
    group.add(redDot)
    lights.push(redDot)

    // 4. Rotor
    const rotorGroup = new THREE.Group()
    rotorGroup.position.set(0, 35 * scale, 1.6 * scale)
    const bladeGeo = new THREE.BoxGeometry(0.8 * scale, 12 * scale, 0.2 * scale)
    const bladeMat = new THREE.MeshStandardMaterial({ color: '#ffffff' })
    for (let i = 0; i < 3; i++) {
      const blade = new THREE.Mesh(bladeGeo, bladeMat)
      const pivot = new THREE.Group()
      blade.position.y = 6 * scale
      pivot.rotation.z = (Math.PI * 2 / 3) * i
      pivot.add(blade)
      rotorGroup.add(pivot)
    }
    group.add(rotorGroup)

    group.position.set(x, groundY, z)
    scene.add(group)

    rotors.push({ mesh: rotorGroup, speed: 0.015 + Math.random() * 0.01 })
  }

  const update = (weather, isDark, elapsed) => {
    const multiplier = weather === 'storm' ? 4 : 1
    rotors.forEach(r => {
      r.mesh.rotation.z += r.speed * multiplier
    })

    lights.forEach(light => {
      if (isDark) {
        // Clignote toutes les secondes environ
        light.visible = Math.sin(elapsed * 4) > 0 
      } else {
        light.visible = false
      }
    })
  }

  return { createTurbine, update }
}