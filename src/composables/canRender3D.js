/**
 * Le décor 3D est purement décoratif, et il coûte cher : ~130 Ko de three.js,
 * une initialisation WebGL de plusieurs centaines de millisecondes et une
 * boucle de rendu permanente. Sur une machine qui ne peut pas le payer, ne pas
 * le monter du tout coûte bien moins qu'un rendu dégradé : la page garde son
 * fond uni, et le contenu arrive d'autant plus vite.
 */

/**
 * Chaînes renvoyées par les implémentations WebGL sans accélération
 * matérielle : machines de mesure (PageSpeed Insights, Lighthouse en CI),
 * machines virtuelles, navigateurs à GPU désactivé. Chaque image y est
 * rasterisée par le processeur, ce qui transforme un fond animé en tâches
 * longues à répétition.
 */
const SOFTWARE_RENDERERS = ['swiftshader', 'llvmpipe', 'softpipe', 'software', 'basic render']

/**
 * À interroger sur le contexte réellement utilisé par la scène, pas sur un
 * contexte jetable créé pour l'occasion : en ouvrir un second juste pour poser
 * la question coûte plus cher que ce que le test fait gagner sur les machines
 * qui, elles, passent le test.
 */
export function isSoftwareRenderer(gl) {
  if (!gl) return true
  const debug = gl.getExtension('WEBGL_debug_renderer_info')
  // Firefox restreint cette extension. Sans elle on accorde le bénéfice du
  // doute : priver du décor une machine parfaitement capable coûterait plus
  // cher que de le laisser tourner sur une machine douteuse.
  if (!debug) return false

  const renderer = String(gl.getParameter(debug.UNMASKED_RENDERER_WEBGL)).toLowerCase()
  return SOFTWARE_RENDERERS.some((name) => renderer.includes(name))
}

/**
 * Premier filtre, volontairement gratuit : uniquement des propriétés déjà
 * connues du navigateur, aucune allocation. Le verdict sur le GPU lui-même
 * est rendu plus tard, une fois le contexte de la scène ouvert.
 */
export function canRender3D() {
  if (typeof window === 'undefined') return false

  // Mode économie de données : l'intention de l'utilisateur prime sur le décor.
  if (navigator.connection?.saveData) return false

  // Pointeur grossier = tactile, donc mobile ou tablette. C'est là que les
  // ~130 Ko de three.js et leur demi-seconde d'évaluation coûtent le plus
  // cher, et là que le décor se voit le moins : l'écran est occupé par le
  // contenu, et le fond n'apparaît qu'en bordure. L'identité visuelle du site
  // tient sur sa typographie et sa mise en page, pas sur ce décor.
  if (window.matchMedia('(pointer: coarse)').matches) return false

  // Peu de cœurs ou peu de mémoire : le décor prendrait la place du contenu.
  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) return false
  if (navigator.deviceMemory && navigator.deviceMemory <= 4) return false

  return true
}
