/**
 * Génère public/robots.txt, public/sitemap.xml et public/llms.txt à partir de
 * src/config/site.js et des traductions françaises.
 *
 * Lancé automatiquement par le script `prebuild`, donc le domaine n'a jamais
 * besoin d'être écrit en dur dans ces deux fichiers : changer SITE_URL suffit.
 */
import { readFileSync, writeFileSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'
import { SITE, SITE_URL, SITEMAP_ROUTES } from '../src/config/site.js'

const out = (name) => fileURLToPath(new URL(`../public/${name}`, import.meta.url))
const root = fileURLToPath(new URL('..', import.meta.url))
const buildDate = new Date().toISOString().split('T')[0]

/**
 * Date du dernier commit ayant touché la vue ou les traductions.
 *
 * Toutes les routes portaient jusqu'ici la date du build : chaque déploiement
 * annonçait que les six pages avaient changé, y compris les mentions légales.
 * Un `lastmod` sur lequel on ne peut pas compter, Google l'ignore — autant
 * qu'il dise la vérité.
 *
 * Repli sur la date du build si git n'est pas disponible ou si le dépôt est
 * cloné sans historique : le résultat n'est alors pas pire qu'avant.
 */
const lastModified = (view) => {
  try {
    const date = execFileSync(
      'git',
      ['log', '-1', '--format=%cs', '--', `src/views/${view}`, 'src/locales'],
      { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] },
    ).trim()
    return /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : buildDate
  } catch {
    return buildDate
  }
}

// Une route noindex n'a rien à faire dans le sitemap : le sitemap est un
// signal « merci d'indexer ceci », l'inverse exact de robots: noindex.
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${SITEMAP_ROUTES.filter(({ noindex }) => !noindex)
  .map(
    ({ path, view, priority, changefreq }) => `  <url>
    <loc>${SITE_URL}${path}</loc>
    <lastmod>${lastModified(view)}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>
`

const robots = `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`

/**
 * llms.txt — la même information que le sitemap, mais lisible par un modèle.
 *
 * Le site est une application Vue : le HTML servi ne contient qu'un <div>
 * vide, et tout le contenu n'apparaît qu'une fois le JavaScript exécuté. Les
 * agents qui se contentent de lire la réponse HTTP — c'est le cas de la
 * plupart — ne voient donc que les balises de tête. Ce fichier leur donne en
 * texte brut ce que le visiteur voit à l'écran : les pages, ce qu'elles
 * contiennent, comment me joindre et où trouver le CV.
 *
 * Convention llmstxt.org : non normalisée, mais lue par plusieurs agents, et
 * sans coût ni risque puisqu'il s'agit d'un fichier statique de plus.
 *
 * Tout vient d'ici ou des traductions : rien à tenir à jour à la main quand
 * une page est ajoutée ou qu'une description change.
 */
const fr = JSON.parse(
  readFileSync(fileURLToPath(new URL('../src/locales/fr.json', import.meta.url)), 'utf8'),
)

const pages = SITEMAP_ROUTES.filter(({ noindex }) => !noindex)
  .map(({ path, seoKey }) => {
    const { title, description } = fr.seo[seoKey]
    return `- [${title}](${SITE_URL}${path}) : ${description}`
  })
  .join('\n')

const llms = `# ${SITE.name}

> ${fr.seo.home.description}

${fr.home.subtitle}

## Pages

${pages}

## Ressources

- [CV de ${SITE.name} (${SITE.cv.format}, ${SITE.cv.sizeKb} Ko)](${SITE_URL}${SITE.cv.path})

## Contact

- Email : ${SITE.email}
- LinkedIn : ${SITE.social.linkedin}
- GitHub : ${SITE.social.github}
`

writeFileSync(out('sitemap.xml'), sitemap, 'utf8')
writeFileSync(out('robots.txt'), robots, 'utf8')
writeFileSync(out('llms.txt'), llms, 'utf8')

/**
 * Garde-fou sur le poids annoncé du CV.
 *
 * Le lien de téléchargement affiche « PDF, 24 Ko » d'après SITE.cv.sizeKb.
 * Un CV se remplace plusieurs fois par an, et rien n'oblige à penser à cette
 * valeur en le remplaçant : au premier oubli, le site annoncerait un poids
 * faux — pire que ne rien annoncer. Ce script tourne déjà au prebuild et
 * écrit déjà dans public/ ; il est le mieux placé pour comparer les deux.
 *
 * Une tolérance de 1 Ko absorbe les arrondis sans laisser passer une vraie
 * dérive.
 */
const cvPath = fileURLToPath(new URL(`../public${SITE.cv.path}`, import.meta.url))
const actualKb = Math.round(statSync(cvPath).size / 1024)

if (Math.abs(actualKb - SITE.cv.sizeKb) > 1) {
  console.error(
    `Le CV pèse ${actualKb} Ko mais SITE.cv.sizeKb annonce ${SITE.cv.sizeKb} Ko.\n` +
      `Corriger la valeur dans src/config/site.js.`,
  )
  process.exit(1)
}

console.log(`SEO files generated for ${SITE_URL} (${SITEMAP_ROUTES.length} routes) — sitemap.xml, robots.txt, llms.txt`)
