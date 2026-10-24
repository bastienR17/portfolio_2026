/**
 * Dépôt public de chaque étude de cas, quand elle en a un.
 *
 * Source de vérité unique, partagée par deux consommateurs qui n'en ont pas
 * besoin pour la même raison :
 *
 *  - ProjectsView.vue y lit l'adresse du lien « voir le code » sous la fiche ;
 *  - scripts/fetch-github-repos.js en déduit les dépôts à EXCLURE de la
 *    section « Projets techniques », où ils feraient doublon avec la fiche
 *    éditoriale — qui dit du projet bien plus que ne le ferait sa carte.
 *
 * Pourquoi ici et pas dans les traductions : l'adresse est la même dans les
 * deux langues, et une URL recopiée par fichier de langue est une URL qui
 * finit par diverger.
 *
 * Pourquoi déduire l'exclusion plutôt que tenir une liste de noms à exclure :
 * fetch-github-repos.js écarte déjà les dépôts sans description au motif
 * qu'une liste noire « serait périmée au prochain projet ». Le raisonnement
 * vaut ici aussi. Écrire une fiche éditoriale suffit désormais à retirer le
 * dépôt de la liste synchronisée, et retirer la fiche suffit à l'y faire
 * revenir : jamais deux endroits à tenir d'accord.
 *
 * Le doublon que ce fichier supprime n'était pas théorique. DSFR-VScode n'a
 * longtemps eu que sa fiche, parce qu'il n'avait pas de description GitHub et
 * tombait donc sous le filtre des scaffolds. Le jour où la description a été
 * ajoutée — le 21 octobre 2026 — il est apparu deux fois sur la page, sans
 * qu'une ligne du projet ait changé.
 */
export const STUDY_REPOS = {
  dsfr: 'https://github.com/bastienR17/DSFR-VScode',
}

/**
 * Noms des dépôts ci-dessus, en minuscules.
 *
 * GitHub ignore la casse pour résoudre une adresse : `DSFR-VScode` et
 * `dsfr-vscode` désignent le même dépôt, mais l'API renvoie toujours la
 * graphie d'origine. Comparer en minuscules des deux côtés évite qu'une
 * majuscule recopiée de travers dans l'URL ci-dessus laisse passer le doublon
 * — en silence, puisque rien ne casse : la carte revient, c'est tout.
 */
export const STUDY_REPO_NAMES = new Set(
  Object.values(STUDY_REPOS).map((url) => url.replace(/\/+$/, '').split('/').pop().toLowerCase()),
)
