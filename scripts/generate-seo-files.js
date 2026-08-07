/**
 * Génère public/robots.txt et public/sitemap.xml à partir de src/config/site.js.
 *
 * Lancé automatiquement par le script `prebuild`, donc le domaine n'a jamais
 * besoin d'être écrit en dur dans ces deux fichiers : changer SITE_URL suffit.
 */
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { SITE_URL, SITEMAP_ROUTES } from '../src/config/site.js'

const out = (name) => fileURLToPath(new URL(`../public/${name}`, import.meta.url))
const lastmod = new Date().toISOString().split('T')[0]

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${SITEMAP_ROUTES.map(
  ({ path, priority, changefreq }) => `  <url>
    <loc>${SITE_URL}${path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`,
).join('\n')}
</urlset>
`

const robots = `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`

writeFileSync(out('sitemap.xml'), sitemap, 'utf8')
writeFileSync(out('robots.txt'), robots, 'utf8')

console.log(`SEO files generated for ${SITE_URL} (${SITEMAP_ROUTES.length} routes)`)
