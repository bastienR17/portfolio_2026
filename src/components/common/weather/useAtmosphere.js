import { BufferAttribute, BufferGeometry, Color, Points, PointsMaterial } from 'three'
import { palette, fogDensity, particleProfile } from './palette'

const COUNT = 450
const LERP = 0.05

/**
 * Densité de brouillard au tout premier rendu, une vingtaine de fois celle d'un
 * temps clair : les crêtes lointaines et les éoliennes sont noyées, et le LERP
 * ci-dessous les fait émerger en deux secondes environ. Le décor s'installe au
 * lieu d'apparaître net d'un coup, pendant que le canvas finit son fondu
 * (voir revealScene dans Experience3D.vue).
 *
 * Aucune animation supplémentaire n'est nécessaire : l'interpolation vers la
 * densité de la météo courante tourne déjà à chaque image, il suffit de partir
 * de plus haut.
 */
const MIST_START = 0.028

/**
 * Une seule nappe de particules fines, dont le comportement change selon la
 * météo : poussière en suspension par temps clair, chute verticale sous la
 * pluie, dérive lente sous la neige.
 *
 * L'ancienne version empilait nuages en icosaèdres, pluie et neige en trois
 * systèmes distincts — beaucoup plus lourd et beaucoup plus littéral.
 */
export function useAtmosphere(scene) {
  let points = null
  const speeds = new Float32Array(COUNT)
  const phases = new Float32Array(COUNT)

  const colorLight = new Color(palette.light.particle)
  const colorDark = new Color(palette.dark.particle)

  // En mouvement réduit, Experience3D ne rend qu'une seule image : le LERP
  // n'aurait jamais l'occasion de dissiper la brume, qui resterait à l'écran
  // pour de bon. On démarre alors directement à la densité de croisière.
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // Valeurs courantes, interpolées pour que le changement de météo ou de thème
  // ne se voie pas comme une coupure.
  const current = {
    opacity: 0.14,
    speed: 0.03,
    sway: 0.6,
    size: 0.5,
    density: reducedMotion ? fogDensity.clear : MIST_START,
  }

  const create = (bounds) => {
    const geo = new BufferGeometry()
    const pos = new Float32Array(COUNT * 3)

    for (let i = 0; i < COUNT; i++) {
      pos[i * 3] = (Math.random() - 0.5) * bounds.w * 1.6
      pos[i * 3 + 1] = (Math.random() - 0.5) * bounds.h * 1.6
      pos[i * 3 + 2] = -20 - Math.random() * 160
      speeds[i] = 0.5 + Math.random()
      phases[i] = Math.random() * Math.PI * 2
    }

    geo.setAttribute('position', new BufferAttribute(pos, 3))

    points = new Points(
      geo,
      new PointsMaterial({
        color: colorLight,
        size: current.size,
        transparent: true,
        opacity: current.opacity,
        depthWrite: false,
        sizeAttenuation: true,
      }),
    )
    scene.add(points)
  }

  const update = ({ weather, bounds, isDark, elapsed, delta }) => {
    if (!points) return

    // Les déplacements sont exprimés par seconde, pas par image. Sans ça la
    // neige tombe deux fois plus vite sur un écran 120 Hz que sur un 60 Hz, et
    // plafonner la boucle ralentirait tout d'autant.
    const step = delta * 60

    const profile = particleProfile[weather] ?? particleProfile.clear
    const targetDensity = fogDensity[weather] ?? fogDensity.clear

    current.opacity += (profile.opacity - current.opacity) * LERP
    current.speed += (profile.speed - current.speed) * LERP
    current.sway += (profile.sway - current.sway) * LERP
    current.size += (profile.size - current.size) * LERP
    current.density += (targetDensity - current.density) * LERP

    if (scene.fog) scene.fog.density = current.density

    points.material.opacity = current.opacity
    points.material.size = current.size
    points.material.color.lerp(isDark ? colorDark : colorLight, LERP)

    const top = bounds.h * 0.8
    const bottom = -bounds.h * 0.8
    const pos = points.geometry.attributes.position.array

    for (let i = 0; i < COUNT; i++) {
      const y = i * 3 + 1
      pos[y] -= current.speed * speeds[i] * step
      pos[i * 3] += Math.sin(elapsed * 0.6 + phases[i]) * current.sway * 0.02 * step

      if (pos[y] < bottom) {
        pos[y] = top
        pos[i * 3] = (Math.random() - 0.5) * bounds.w * 1.6
      }
    }

    points.geometry.attributes.position.needsUpdate = true
  }

  return { create, update }
}
