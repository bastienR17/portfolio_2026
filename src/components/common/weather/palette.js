/**
 * Palette du décor 3D, alignée sur les couleurs de marque définies dans
 * Main.css (cream #FFF9F5, terracotta #E2725B, dark-soft #2D2926, ochre #F4D06F).
 *
 * Les teintes restent volontairement peu contrastées : le décor passe derrière
 * des cartes en verre dépoli et ne doit jamais concurrencer le texte.
 */
export const palette = {
  light: {
    skyTop: '#EFE2D6',
    skyHorizon: '#FFF9F5', // identique au fond de page : l'horizon s'y fond
    glow: '#C44127',
    glowStrength: 0.12,
    fog: '#FBF3EC',
    ridges: ['#E4D6C9', '#D3C0B0', '#BFA795'],
    turbine: '#C4AE9D',
    particle: '#B9A392',
  },
  dark: {
    skyTop: '#0A0D13',
    skyHorizon: '#10131A', // identique au fond de page sombre
    glow: '#E2725B',
    glowStrength: 0.09,
    fog: '#0E1117',
    // Les crêtes s'ÉCLAIRCISSENT en se rapprochant, alors qu'en thème clair
    // elles s'assombrissent : dans les deux cas elles s'écartent du ciel.
    // L'ancienne rampe (#1C212B, #161A23, #0D1015) traversait la luminance du
    // ciel et la crête la plus proche disparaissait — rapport 1,03, invisible.
    // Le brouillard n'avait alors plus rien à voiler et toutes les ambiances
    // se ressemblaient. La rampe actuelle donne 1,53 par temps clair contre
    // 1,16 sous l'orage : une vraie amplitude, tout en restant discrète.
    ridges: ['#1A2029', '#242B39', '#31394B'],
    turbine: '#3A4256',
    particle: '#6B7488',
  },
}

/**
 * Intensité du halo d'horizon selon la météo, en multiple de la valeur du
 * thème. C'est le levier le plus lisible en mode sombre : une lueur chaude sur
 * un ciel presque noir se remarque bien mieux qu'un écart de brouillard.
 */
export const weatherGlow = {
  clear: 1.4,
  clouds: 0.8,
  snow: 0.5,
  rain: 0.35,
  storm: 0.12,
}

/**
 * Densité de brouillard par état météo. C'est le principal levier d'ambiance :
 * plus il y a de brouillard, plus les crêtes lointaines s'effacent.
 */
export const fogDensity = {
  clear: 0.0014,
  clouds: 0.0032,
  rain: 0.0042,
  storm: 0.0052,
  snow: 0.0038,
}

/**
 * Dérive lente des plans de crêtes, du plus lointain au plus proche.
 * Oscillation et non défilement continu : la géométrie n'a jamais besoin de
 * boucler et aucun bord ne peut apparaître. Les périodes sont volontairement
 * non multiples entre elles pour que les plans ne se resynchronisent jamais.
 *
 * `factorX` est une fraction de la demi-largeur visible, pas une distance :
 * une amplitude fixe vaudrait 4 % de l'écran sur un moniteur large et plus de
 * 60 % sur un mobile.
 */
export const ridgeDrift = [
  { factorX: 0.03, periodX: 131, ampY: 2.0, periodY: 97, phase: 0.0 },
  { factorX: 0.055, periodX: 103, ampY: 3.0, periodY: 79, phase: 1.7 },
  { factorX: 0.09, periodX: 87, ampY: 4.0, periodY: 67, phase: 3.4 },
]

/**
 * Les éoliennes sont posées vers z ≈ -200, entre la crête lointaine et la
 * médiane : leur facteur est interpolé entre les deux pour que la parallaxe
 * reste cohérente avec leur profondeur réelle.
 */
export const turbineDrift = { factorX: 0.037, periodX: 117, phase: 0.9 }

/**
 * Réglage des particules par état météo.
 *
 * `clear` et `clouds` sont volontairement bien séparés : ce sont les deux
 * états dans lesquels Paris se trouve le plus souvent, et à 0,14 contre 0,18
 * d'opacité ils étaient indiscernables. La quasi-totalité des visiteurs ne
 * voyait donc jamais la météo changer quoi que ce soit.
 */
export const particleProfile = {
  clear:  { opacity: 0.12, speed: 0.03, sway: 0.6,  size: 0.5 },
  clouds: { opacity: 0.26, speed: 0.05, sway: 0.5,  size: 0.6 },
  rain:   { opacity: 0.32, speed: 0.85, sway: 0.06, size: 0.42 },
  storm:  { opacity: 0.4,  speed: 1.25, sway: 0.05, size: 0.45 },
  snow:   { opacity: 0.45, speed: 0.16, sway: 1.0,  size: 0.7 },
}
