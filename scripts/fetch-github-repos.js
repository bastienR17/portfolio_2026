/**
 * Fige la liste des dépôts GitHub dans src/data/github-repos.json.
 *
 * Pourquoi au build plutôt qu'à l'affichage : la page interrogeait
 * api.github.com depuis le navigateur du visiteur, à chaque visite. Trois
 * problèmes, dans cet ordre.
 *
 * 1. Vie privée. L'adresse IP de chaque visiteur partait chez un sous-traitant
 *    hors UE pour afficher une liste qui change trois fois par an. C'est le
 *    raisonnement qui a déjà fait rapatrier les polices depuis leur CDN (voir
 *    l'en-tête de Main.css) ; il ne valait pas moins ici.
 * 2. Quota. L'API non authentifiée est plafonnée à 60 requêtes par heure et par
 *    IP. Derrière un NAT d'entreprise — précisément le public visé — la page
 *    pouvait arriver vide sans que rien ne soit cassé.
 * 3. Robustesse à l'indexation. Le site reste une application cliente — le
 *    prérendu de postbuild ne réécrit que les balises de tête, le corps est
 *    vide pour toutes les routes — donc les dépôts ne sont pas pour autant
 *    dans le HTML. Ce qui change : leur affichage ne dépend plus d'un appel
 *    réseau vers un tiers pendant le rendu du robot, qui peut le temporiser
 *    ou le plafonner comme n'importe quelle autre adresse.
 *
 * Le filtrage vit ici plutôt que dans la vue : ce qui peut être décidé une
 * fois au build n'a pas à être rejoué dans chaque navigateur.
 *
 * Lancé par `prebuild`, avant la construction du bundle.
 */
import { writeFileSync, existsSync, readFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const USER = 'Bastienr17'
const API = `https://api.github.com/users/${USER}/repos?sort=updated&per_page=100`

/** Projets de groupe auxquels Bastien a réellement contribué : gardés bien que forkés. */
const FEATURED_FORKS = ['Tartiflette', 'Symfony_project_Ski_station']

/** Le dépôt éponyme porte le README de profil GitHub, ce n'est pas un projet. */
const PROFILE_REPO = 'bastienr17'

const outDir = fileURLToPath(new URL('../src/data', import.meta.url))
const outFile = `${outDir}/github-repos.json`

/**
 * Seuls les champs réellement affichés sont conservés : le reste de la réponse
 * (une centaine de clés par dépôt, dont plusieurs dizaines d'URL d'API) partirait
 * dans le bundle sans que personne ne le lise.
 */
const keep = (repo) => ({
  id: repo.id,
  name: repo.name,
  description: repo.description,
  languages: repo.languages,
  updated_at: repo.updated_at,
  html_url: repo.html_url,
  stargazers_count: repo.stargazers_count ?? 0,
})

/** Part d'octets en dessous de laquelle un langage relève de l'accessoire. */
const SHARE_THRESHOLD = 0.2

/**
 * Balisage et feuilles de style : présents dans presque tous les dépôts web,
 * donc sans pouvoir distinguant. Les afficher reviendrait à étiqueter la
 * moitié du portfolio « JavaScript · HTML · CSS » — trois badges qui ne disent
 * rien de plus qu'un seul. Ils reviennent quand ils sont tout ce que le dépôt
 * contient : un projet uniquement HTML/CSS mérite d'être nommé pour ce qu'il est.
 */
const PRESENTATION = new Set(['HTML', 'CSS', 'SCSS', 'Sass', 'Less', 'Stylus'])

/**
 * Un dépôt sans description est un scaffold ou un essai : leurs auteurs ne les
 * décrivent jamais. Le critère évite d'entretenir une liste noire de noms qui
 * serait périmée au prochain projet.
 */
const isShowable = (repo) =>
  (!repo.fork || FEATURED_FORKS.includes(repo.name)) &&
  repo.description?.trim() &&
  repo.name.toLowerCase() !== PROFILE_REPO

/**
 * Un incident chez GitHub ne doit pas empêcher de déployer une correction de
 * texte. On garde alors la dernière liste connue — vieille de quelques jours au
 * pire — et le build continue. Le fichier n'est versionné que pour ça : sans
 * lui, le premier build hors ligne produirait un site amputé d'une section.
 */
const previous = () => {
  if (!existsSync(outFile)) return null
  try {
    return JSON.parse(readFileSync(outFile, 'utf8'))
  } catch {
    return null
  }
}

const fallback = (reason) => {
  const kept = previous()
  if (kept) {
    console.warn(`GitHub repos: ${reason} — liste précédente conservée (${kept.length} dépôts)`)
    process.exit(0)
  }
  console.warn(`GitHub repos: ${reason} — aucune liste locale, la section sera vide`)
  mkdirSync(outDir, { recursive: true })
  writeFileSync(outFile, '[]\n', 'utf8')
  process.exit(0)
}

let response
try {
  response = await fetch(API, {
    headers: { Accept: 'application/vnd.github+json' },
    signal: AbortSignal.timeout(10_000),
  })
} catch (error) {
  fallback(`appel impossible (${error.message})`)
}

if (!response.ok) fallback(`réponse HTTP ${response.status}`)

const data = await response.json()
if (!Array.isArray(data)) fallback('réponse inattendue')

const showable = data.filter(isShowable)
if (!showable.length) fallback('aucun dépôt affichable dans la réponse')

/**
 * Établit la pile de chaque dépôt à partir de la répartition en octets.
 *
 * Le champ `language` de la liste ne renvoie qu'un seul nom, et il ment deux
 * fois. Il est absent sur les forks — c'est ainsi que PHP, langage des deux
 * projets de groupe, ne figurait dans aucun filtre. Et il réduit à une
 * étiquette des dépôts qui n'en méritent pas qu'une : le projet Symfony est à
 * 52 % de PHP contre 44 % de Twig, il est presque autant l'un que l'autre.
 *
 * L'endpoint /languages donne la répartition complète. On retient ce qui pèse
 * au moins SHARE_THRESHOLD, ordonné par part décroissante — la première entrée
 * reste donc le langage principal, celui qu'affiche GitHub.
 *
 * Une requête par dépôt, payée une fois au build. C'est précisément ce que le
 * passage au build rend possible : côté navigateur, il aurait fallu les refaire
 * à chaque visite, pour des badges.
 */
const resolveLanguages = async (repo) => {
  // Repli sur le langage unique de la liste, qui vaut mieux que rien si
  // l'appel échoue ou si le dépôt est vide.
  repo.languages = repo.language ? [repo.language] : []

  if (!repo.languages_url) return
  try {
    const res = await fetch(repo.languages_url, {
      headers: { Accept: 'application/vnd.github+json' },
      signal: AbortSignal.timeout(10_000),
    })
    if (!res.ok) return

    const bytes = await res.json()
    const total = Object.values(bytes).reduce((sum, n) => sum + n, 0)
    if (!total) return

    const ranked = Object.entries(bytes)
      .sort(([, a], [, b]) => b - a)
      .filter(([, n]) => n / total >= SHARE_THRESHOLD)
      .map(([name]) => name)

    const substantial = ranked.filter((name) => !PRESENTATION.has(name))
    // Si le dépôt n'est fait que de balisage et de style, c'est ce qu'il est :
    // on garde le classement complet plutôt que de le laisser sans pile.
    repo.languages = substantial.length ? substantial : ranked
  } catch {
    // La pile n'est qu'un badge et une entrée de filtre : elle ne vaut pas
    // qu'on renonce à toute la liste.
  }
}

await Promise.all(showable.map(resolveLanguages))

const repos = showable.map(keep)

mkdirSync(outDir, { recursive: true })
writeFileSync(outFile, `${JSON.stringify(repos, null, 2)}\n`, 'utf8')

console.log(`GitHub repos: ${repos.length} dépôts figés dans src/data/github-repos.json`)
