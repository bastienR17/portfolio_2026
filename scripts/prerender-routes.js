/**
 * Écrit un fichier HTML par route publique, avec ses vraies balises de tête,
 * plus une vraie page 404.
 *
 * Le build ne produisait qu'un seul dist/index.html, servi tel quel pour les
 * six routes, avec les balises de la page d'accueil figées dedans. useSeo() les
 * corrige — mais seulement une fois le JavaScript exécuté. Or LinkedIn,
 * WhatsApp, Slack, Facebook et iMessage ne l'exécutent pas : partager
 * /prestations affichait la carte de l'accueil. C'est le canal principal d'une
 * activité freelance, donc ça compte plus que n'importe quel réglage de balise.
 *
 * Chaque fichier écrit reste l'application complète : seule la tête change.
 *
 * Lancé par le script `postbuild`, après vite build.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { SITE, SITE_URL, SITEMAP_ROUTES } from '../src/config/site.js'

const root = fileURLToPath(new URL('..', import.meta.url))
const dist = join(root, 'dist')

const fr = JSON.parse(readFileSync(join(root, 'src/locales/fr.json'), 'utf8'))
const template = readFileSync(join(dist, 'index.html'), 'utf8')

/**
 * Garde-fou : depuis que wrangler ne rabat plus les URL inconnues sur
 * index.html, une route déclarée au routeur mais absente d'ici ne serait plus
 * servie du tout — elle renverrait une 404 sèche. On préfère casser le build.
 */
const routerSource = readFileSync(join(root, 'src/router/index.js'), 'utf8')
const declared = [...routerSource.matchAll(/path:\s*'([^']+)'/g)]
  .map((m) => m[1])
  .filter((p) => !p.includes(':')) // on ignore la route attrape-tout
const missing = declared.filter((p) => !SITEMAP_ROUTES.some((r) => r.path === p))
if (missing.length) {
  throw new Error(
    `prerender: routes déclarées dans le routeur mais absentes de SITEMAP_ROUTES : ${missing.join(', ')}.\n` +
      `Sans entrée ici, elles ne seraient plus servies. Les ajouter dans src/config/site.js.`,
  )
}

/** Le `&` de « AMOA & cadrage » doit être encodé, en attribut comme en texte. */
const esc = (s) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

/**
 * Remplace une balise unique et échoue si elle est introuvable. Un silence ici
 * livrerait des pages aux mauvaises métadonnées sans que rien ne le signale —
 * exactement le problème qu'on cherche à corriger.
 */
const replaceOnce = (html, pattern, replacement, label, route) => {
  if (!pattern.test(html)) {
    throw new Error(
      `prerender: balise « ${label} » introuvable pour ${route}.\n` +
        `Le gabarit index.html a dû changer : adapter scripts/prerender-routes.js.`,
    )
  }
  return html.replace(pattern, replacement)
}

/**
 * Fil d'Ariane. Les six pages portaient jusqu'ici le même bloc Person, sans
 * rien qui situe la page dans le site. Deux niveaux suffisent : le site est
 * plat, inventer une hiérarchie serait faux.
 */
const breadcrumb = (name, url) =>
  JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name, item: url },
    ],
  })

const buildPage = ({ title, description, url, route, noindex = false, crumb = null }) => {
  let html = template
  const swap = (pattern, replacement, label) =>
    (html = replaceOnce(html, pattern, replacement, label, route))

  swap(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`, 'title')
  swap(
    /<meta name="description" content="[^"]*">/,
    `<meta name="description" content="${esc(description)}">`,
    'description',
  )
  swap(
    /<meta name="robots" content="[^"]*">/,
    `<meta name="robots" content="${noindex ? 'noindex, follow' : 'index, follow'}">`,
    'robots',
  )
  // Une page d'erreur n'a pas d'URL propre : lui donner une canonique
  // reviendrait à désigner une adresse à indexer.
  swap(
    /<link rel="canonical" href="[^"]*">/,
    noindex ? '' : `<link rel="canonical" href="${esc(url)}">`,
    'canonical',
  )
  swap(
    /<meta property="og:url" content="[^"]*">/,
    `<meta property="og:url" content="${esc(url)}">`,
    'og:url',
  )
  swap(
    /<meta property="og:title" content="[^"]*">/,
    `<meta property="og:title" content="${esc(title)}">`,
    'og:title',
  )
  swap(
    /<meta property="og:description" content="[^"]*">/,
    `<meta property="og:description" content="${esc(description)}">`,
    'og:description',
  )
  swap(
    /<meta name="twitter:title" content="[^"]*">/,
    `<meta name="twitter:title" content="${esc(title)}">`,
    'twitter:title',
  )
  swap(
    /<meta name="twitter:description" content="[^"]*">/,
    `<meta name="twitter:description" content="${esc(description)}">`,
    'twitter:description',
  )

  if (crumb) {
    html = html.replace(
      '</head>',
      `  <script type="application/ld+json">${crumb}</script>\n  </head>`,
    )
  }
  return html
}

const write = (target, html) => {
  mkdirSync(dirname(target), { recursive: true })
  writeFileSync(target, html, 'utf8')
}

let written = 0

for (const { path, seoKey, noindex } of SITEMAP_ROUTES) {
  const entry = fr.seo?.[seoKey]
  if (!entry) throw new Error(`prerender: clé seo.${seoKey} absente de fr.json`)

  const url = `${SITE_URL}${path}`
  // Le libellé de navigation quand il existe, sinon la partie utile du titre.
  const name = fr.nav?.[seoKey] ?? entry.title.split(' - ')[0]

  const html = buildPage({
    title: entry.title,
    description: entry.description,
    url,
    route: path,
    noindex,
    crumb: path === '/' ? null : breadcrumb(name, url),
  })

  if (path === '/') {
    write(join(dist, 'index.html'), html)
  } else {
    // Les deux dispositions, parce que les hébergeurs statiques ne résolvent
    // pas `/prestations` de la même façon : les uns cherchent
    // `prestations.html`, les autres `prestations/index.html`.
    write(join(dist, `${path}.html`), html)
    write(join(dist, path, 'index.html'), html)
  }
  written++
}

// Page 404 réelle. Auparavant toute URL morte renvoyait index.html avec un
// code 200 : autant de « soft 404 » aux yeux de Google, indexables tant que le
// JavaScript n'avait pas posé le noindex.
const nf = fr.seo.notfound
write(
  join(dist, '404.html'),
  buildPage({
    title: nf.title,
    description: nf.description,
    url: `${SITE_URL}/404`,
    route: '404',
    noindex: true,
  }),
)

console.log(`Prerender: ${written} routes + 404.html (${SITE.url})`)
