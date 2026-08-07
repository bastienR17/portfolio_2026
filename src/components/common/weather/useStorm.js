const DECAY = 3.5 // retour à zéro en ~0,3 s
const STRIKES_PER_SECOND = 0.25

/**
 * Éclairs d'orage, exprimés sous forme d'une intensité 0 → 1 qui décroît.
 *
 * L'ancienne version repeignait directement `scene.background` en blanc : comme
 * la boucle de rendu réassignait le fond au début de chaque frame, le flash ne
 * durait qu'une seule image et ne se voyait pratiquement pas. Ici l'intensité
 * est un état, lue ensuite par le ciel et par la lumière.
 *
 * La probabilité est pondérée par le delta : la fréquence des éclairs ne dépend
 * plus du nombre d'images par seconde de la machine.
 */
export function useStorm() {
  let intensity = 0

  const update = (weatherState, delta) => {
    intensity = Math.max(0, intensity - delta * DECAY)

    if (weatherState === 'storm' && Math.random() < delta * STRIKES_PER_SECOND) {
      intensity = 0.65 + Math.random() * 0.35
    }

    return intensity
  }

  return { update }
}
