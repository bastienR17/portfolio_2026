import { BoxGeometry, Color, CylinderGeometry, Group, Mesh, MeshBasicMaterial } from 'three'
import { palette, turbineDrift } from './palette'

const LERP = 0.06
const TAU = Math.PI * 2
const REF_Z = -200 // profondeur de référence pour l'amplitude de dérive

/**
 * Éoliennes en silhouette sur les crêtes lointaines.
 *
 * Volontairement conservées : elles font le lien avec l'alternance aux
 * Ministères de la Transition Écologique. Mais elles sont désormais traitées en
 * aplat sombre pris dans le brouillard, sans la loupiote rouge clignotante qui
 * attirait l'œil sur un détail sans intérêt.
 */
export function useWindTurbines(scene, camera) {
  const rotors = []
  const materials = []

  // Toutes les éoliennes vivent dans un même groupe : elles dérivent ensemble,
  // à leur propre vitesse de parallaxe, sans se désolidariser du décor.
  const field = new Group()
  scene.add(field)

  const colorLight = new Color(palette.light.turbine)
  const colorDark = new Color(palette.dark.turbine)

  const createTurbine = (x, y, z, scale = 1) => {
    const group = new Group()
    const material = new MeshBasicMaterial({ color: colorLight, fog: true })
    materials.push(material)

    // Mât — plus élancé que la version précédente, pour une silhouette plus fine.
    const pole = new Mesh(
      new CylinderGeometry(0.22 * scale, 0.45 * scale, 34 * scale, 6),
      material,
    )
    pole.position.y = 17 * scale
    group.add(pole)

    const nacelle = new Mesh(
      new BoxGeometry(0.9 * scale, 0.9 * scale, 2.2 * scale),
      material,
    )
    nacelle.position.y = 34 * scale
    group.add(nacelle)

    const rotorGroup = new Group()
    rotorGroup.position.set(0, 34 * scale, 1.2 * scale)

    const bladeGeo = new BoxGeometry(0.45 * scale, 13 * scale, 0.12 * scale)
    for (let i = 0; i < 3; i++) {
      const blade = new Mesh(bladeGeo, material)
      const pivot = new Group()
      blade.position.y = 6.5 * scale
      pivot.rotation.z = ((Math.PI * 2) / 3) * i
      pivot.add(blade)
      rotorGroup.add(pivot)
    }
    group.add(rotorGroup)

    group.position.set(x, y, z)
    field.add(group)

    rotors.push({ mesh: rotorGroup, speed: 0.006 + Math.random() * 0.004 })
  }

  const update = ({ weather, isDark, elapsed, delta }) => {
    // Rotation lente : un décor ne doit pas capter le regard.
    // Vitesse par seconde et non par image, sinon la rotation dépend de la
    // fréquence de l'écran et du plafond de la boucle de rendu.
    const multiplier = (weather === 'storm' ? 2.2 : 1) * delta * 60
    rotors.forEach((r) => {
      r.mesh.rotation.z += r.speed * multiplier
    })

    // Même dérive que les crêtes, dosée pour la profondeur des éoliennes.
    const aspect = Number.isFinite(camera.aspect) ? camera.aspect : 1
    const halfW = Math.tan((camera.fov * Math.PI) / 360) * (camera.position.z - REF_Z) * aspect
    field.position.x =
      Math.sin((elapsed / turbineDrift.periodX) * TAU + turbineDrift.phase) *
      halfW *
      turbineDrift.factorX

    const target = isDark ? colorDark : colorLight
    materials.forEach((m) => m.color.lerp(target, LERP))
  }

  return { createTurbine, update }
}
