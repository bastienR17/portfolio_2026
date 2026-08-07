import { BufferAttribute, BufferGeometry, Color, DoubleSide, FogExp2, Mesh, MeshBasicMaterial, PlaneGeometry, ShaderMaterial } from 'three'
import { palette, ridgeDrift as DRIFT } from './palette'

const SKY_Z = -320
const LERP = 0.06 // vitesse de fondu entre thème clair et sombre

/**
 * Dérive lente des crêtes, une entrée par plan (de la plus lointaine à la plus
 * proche). C'est une oscillation et non un défilement continu : la géométrie
 * n'a donc jamais besoin de boucler et aucun bord ne peut apparaître.
 *
 * Les périodes sont longues et volontairement non multiples entre elles, pour
 * que les plans ne se resynchronisent jamais et que le mouvement ne se lise pas
 * comme un va-et-vient. Plus un plan est proche, plus il bouge : c'est ce
 * décalage qui crée la profondeur.
 */
const MAX_FACTOR_X = Math.max(...DRIFT.map((d) => d.factorX))

const RIDGE_SEGMENTS = 200

/**
 * Vitesse de houle par plan (radians/seconde sur la composante dominante).
 * Le plan le plus proche ondule le plus vite : c'est ce qui donne la parallaxe.
 */
const SWELL_SPEED = [0.016, 0.024, 0.036]

/**
 * Profil de crête calculé dans le vertex shader : trois sinusoïdes dont les
 * phases avancent à des vitesses différentes, et dans des sens opposés.
 *
 * C'est ce décalage qui fait que la crête se déforme au lieu de simplement
 * glisser : translater la géométrie entière ne se voyait pas, car un décalage
 * de quelques pour cent de la longueur d'onde laisse une courbe lisse
 * pratiquement identique à elle-même.
 */
const ridgeVertexChunk = /* glsl */ `
  float t = uTime * uSpeed;
  float x = transformed.x;
  transformed.y = uBase
    + sin(x * 0.0055 + uSeed        + t)       * uAmp
    + sin(x * 0.0131 + uSeed * 2.1  - t * 1.3) * uAmp * 0.45
    + sin(x * 0.0307 + uSeed * 3.7  + t * 0.7) * uAmp * 0.2;
`

const skyVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const skyFragment = /* glsl */ `
  uniform vec3 topColor;
  uniform vec3 horizonColor;
  uniform vec3 glowColor;
  uniform float glowStrength;
  uniform float flash;
  varying vec2 vUv;

  void main() {
    float h = pow(clamp(vUv.y, 0.0, 1.0), 1.3);
    vec3 col = mix(horizonColor, topColor, h);

    // Lueur chaude resserrée sur l'horizon : le rappel terracotta de la marque.
    float glow = pow(1.0 - clamp(vUv.y, 0.0, 1.0), 3.5) * glowStrength;
    col = mix(col, glowColor, glow);

    gl_FragColor = vec4(col + flash, 1.0);
  }
`

/** Cibles instanciées une fois : rien ne doit allouer dans la boucle de rendu. */
const toTargets = (p) => ({
  top: new Color(p.skyTop),
  horizon: new Color(p.skyHorizon),
  fog: new Color(p.fog),
  ridges: p.ridges.map((c) => new Color(c)),
  glowStrength: p.glowStrength,
})

const TARGETS = { light: toTargets(palette.light), dark: toTargets(palette.dark) }

/**
 * Demi-dimensions du frustum à une profondeur donnée.
 * Sans ça, un plan placé loin derrière la caméra est dimensionné pour la
 * mauvaise distance et ne couvre qu'une fraction de l'écran.
 */
const frustumAt = (camera, z, minAspect = 1) => {
  const distance = camera.position.z - z
  const halfH = Math.tan((camera.fov * Math.PI) / 360) * distance
  // Un aspect non fini (conteneur mesuré à 0×0) contaminerait toute la
  // géométrie en NaN : on retombe sur le minimum plutôt que de propager.
  const aspect = Number.isFinite(camera.aspect) ? camera.aspect : minAspect
  return { halfH, halfW: halfH * Math.max(aspect, minAspect) }
}

export function useEnvironment(scene, camera) {
  let sky = null
  const ridges = []

  // Couleurs courantes, interpolées vers la cible à chaque frame pour que le
  // basculement de thème soit fondu et non brutal.
  const current = {
    top: new Color(palette.light.skyTop),
    horizon: new Color(palette.light.skyHorizon),
    fog: new Color(palette.light.fog),
    ridges: palette.light.ridges.map((c) => new Color(c)),
  }

  const createSky = () => {
    const uniforms = {
      topColor: { value: current.top },
      horizonColor: { value: current.horizon },
      glowColor: { value: new Color(palette.light.glow) },
      glowStrength: { value: palette.light.glowStrength },
      flash: { value: 0 },
    }

    sky = new Mesh(
      new PlaneGeometry(1, 1),
      new ShaderMaterial({
        uniforms,
        vertexShader: skyVertex,
        fragmentShader: skyFragment,
        depthWrite: false,
        fog: false, // le ciel ne doit pas être mangé par son propre brouillard
      }),
    )
    sky.position.z = SKY_Z
    sky.renderOrder = -1
    scene.add(sky)
    resizeSky()
  }

  /** Dimensionne le plan de ciel pour couvrir le frustum à sa profondeur réelle. */
  const resizeSky = () => {
    if (!sky) return
    const { halfW, halfH } = frustumAt(camera, SKY_Z)
    sky.scale.set(halfW * 2.1, halfH * 2.1, 1) // 5 % de marge de chaque côté
  }

  /**
   * Trois plans de crêtes : le plus lointain est le plus clair et le plus haut,
   * le plus proche est le plus sombre. Combiné au brouillard, cela donne la
   * perspective atmosphérique.
   */
  const createRidges = (bounds, groundY) => {
    const layers = [
      { z: -220, amp: bounds.h * 0.1, lift: bounds.h * 0.2, seed: 1.7 },
      { z: -150, amp: bounds.h * 0.08, lift: bounds.h * 0.1, seed: 4.2 },
      { z: -80, amp: bounds.h * 0.07, lift: bounds.h * 0.02, seed: 8.9 },
    ]

    layers.forEach((layer, i) => {
      // Largeur calculée à la profondeur de la crête, avec un aspect minimum
      // généreux : la géométrie n'est pas régénérée au redimensionnement, elle
      // doit donc déjà couvrir les écrans très larges — et absorber la dérive.
      const { halfW: visibleHalfW, halfH } = frustumAt(camera, layer.z, 5)
      const halfW = visibleHalfW * (1 + MAX_FACTOR_X)
      // Le bas du ruban descend bien sous le champ visible : ni la houle ni la
      // dérive ne peuvent découvrir son arête inférieure.
      const bottom = -halfH * 2

      // Ruban de triangles construit à la main : contrairement à ShapeGeometry,
      // on sait quels sommets forment l'arête supérieure, donc le shader peut
      // les déplacer sans toucher au reste.
      const positions = new Float32Array((RIDGE_SEGMENTS + 1) * 2 * 3)
      const isTop = new Float32Array((RIDGE_SEGMENTS + 1) * 2)
      const indices = []

      for (let s = 0; s <= RIDGE_SEGMENTS; s++) {
        const x = -halfW + (halfW * 2 * s) / RIDGE_SEGMENTS
        const top = s * 2
        positions[top * 3] = x
        positions[top * 3 + 1] = groundY + layer.lift // remplacé par le shader
        isTop[top] = 1
        positions[(top + 1) * 3] = x
        positions[(top + 1) * 3 + 1] = bottom
        isTop[top + 1] = 0

        if (s < RIDGE_SEGMENTS) {
          const a = s * 2
          indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2)
        }
      }

      const geo = new BufferGeometry()
      geo.setAttribute('position', new BufferAttribute(positions, 3))
      geo.setAttribute('aTop', new BufferAttribute(isTop, 1))
      geo.setIndex(indices)

      const material = new MeshBasicMaterial({
        color: current.ridges[i],
        fog: true,
        side: DoubleSide, // évite toute question d'ordre des sommets
      })

      // onBeforeCompile plutôt qu'un ShaderMaterial : on garde le brouillard de
      // three.js gratuitement, c'est lui qui donne la profondeur.
      material.onBeforeCompile = (shader) => {
        shader.uniforms.uTime = { value: 0 }
        shader.uniforms.uAmp = { value: layer.amp }
        shader.uniforms.uSeed = { value: layer.seed }
        shader.uniforms.uBase = { value: groundY + layer.lift }
        shader.uniforms.uSpeed = { value: SWELL_SPEED[i] }

        shader.vertexShader = shader.vertexShader
          .replace(
            '#include <common>',
            `#include <common>
             uniform float uTime;
             uniform float uAmp;
             uniform float uSeed;
             uniform float uBase;
             uniform float uSpeed;
             attribute float aTop;`,
          )
          .replace(
            '#include <begin_vertex>',
            `#include <begin_vertex>
             if (aTop > 0.5) {${ridgeVertexChunk}}`,
          )

        material.userData.shader = shader
      }

      const mesh = new Mesh(geo, material)
      mesh.position.z = layer.z
      // Le shader déplace les sommets : la sphère englobante calculée sur le
      // CPU est fausse, on désactive donc le culling pour ce maillage.
      mesh.frustumCulled = false
      // La profondeur est relue à chaque frame pour recalculer l'amplitude :
      // un redimensionnement change le ratio, donc la largeur visible.
      mesh.userData.drift = { ...DRIFT[i], z: layer.z }
      scene.add(mesh)
      ridges.push(mesh)
    })
  }

  const createWorld = (bounds, groundY) => {
    scene.fog = new FogExp2(current.fog, 0.002)
    createSky()
    createRidges(bounds, groundY)
  }

  const update = ({ isDark, flash, elapsed }) => {
    const target = isDark ? TARGETS.dark : TARGETS.light
    const TAU = Math.PI * 2

    current.top.lerp(target.top, LERP)
    current.horizon.lerp(target.horizon, LERP)
    current.fog.lerp(target.fog, LERP)

    if (sky) {
      const glow = sky.material.uniforms.glowStrength
      glow.value += (target.glowStrength - glow.value) * LERP
      sky.material.uniforms.flash.value = flash * 0.16
    }

    ridges.forEach((mesh, i) => {
      current.ridges[i].lerp(target.ridges[i], LERP)
      mesh.material.color.copy(current.ridges[i])

      // La houle est calculée sur le GPU : côté CPU il n'y a qu'un uniform à
      // pousser, quel que soit le nombre de sommets.
      const shader = mesh.material.userData.shader
      if (shader) shader.uniforms.uTime.value = elapsed

      // Dérive d'ensemble, qui s'ajoute à la houle et écarte les plans entre eux.
      const d = mesh.userData.drift
      const ampX = frustumAt(camera, d.z).halfW * d.factorX
      mesh.position.x = Math.sin((elapsed / d.periodX) * TAU + d.phase) * ampX
      mesh.position.y = Math.sin((elapsed / d.periodY) * TAU + d.phase) * d.ampY
    })

    if (scene.fog) scene.fog.color.copy(current.fog)
  }

  return { createWorld, update, resize: resizeSky }
}
