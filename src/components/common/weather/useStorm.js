import * as THREE from 'three'

export function useStorm(scene, dirLight, colors) {
  
  // Fonction pour déclencher un éclair
  const triggerLightning = (isDark) => {
    // 1. Boost de la lumière principale
    dirLight.intensity = 5 
    
    // 2. Flash du ciel (on peint tout le fond en blanc/bleu très clair)
    const originalBg = isDark ? colors.dark.bg : colors.light.bg
    scene.background = new THREE.Color('#ffffff')

    // 3. Durée aléatoire très courte pour le flash
    setTimeout(() => {
      if (dirLight) dirLight.intensity = 0.6
      scene.background = new THREE.Color(originalBg)
    }, 50 + Math.random() * 100)
  }

  // Fonction de mise à jour appelée à chaque frame
  const updateStorm = (weatherState, isDark) => {
    if (weatherState !== 'storm') return

    // Probabilité de déclencher un éclair (environ 1% de chance par frame)
    if (Math.random() > 0.99) {
      triggerLightning(isDark)
    }
  }

  return { updateStorm }
}