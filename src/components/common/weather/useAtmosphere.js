import { BufferAttribute, BufferGeometry, Color, Points, PointsMaterial } from 'three'
import { palette, fogDensity, particleProfile } from './palette'

const COUNT = 450
const LERP = 0.05

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

  // Valeurs courantes, interpolées pour que le changement de météo ou de thème
  // ne se voie pas comme une coupure.
  const current = { opacity: 0.14, speed: 0.03, sway: 0.6, size: 0.5, density: fogDensity.clear }

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

  const update = ({ weather, bounds, isDark, elapsed }) => {
    if (!points) return

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
      pos[y] -= current.speed * speeds[i]
      pos[i * 3] += Math.sin(elapsed * 0.6 + phases[i]) * current.sway * 0.02

      if (pos[y] < bottom) {
        pos[y] = top
        pos[i * 3] = (Math.random() - 0.5) * bounds.w * 1.6
      }
    }

    points.geometry.attributes.position.needsUpdate = true
  }

  return { create, update }
}
