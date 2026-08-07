/**
 * Source de vérité unique pour tout ce qui dépend du domaine.
 *
 * Changer SITE_URL suffit à mettre à jour d'un coup : les balises canonical,
 * les Open Graph / Twitter Card, le sitemap et le JSON-LD.
 * Pas de domaine en dur ailleurs dans le projet.
 */
export const SITE_URL = 'https://portfolio-2026-zmnk.vercel.app'

export const SITE = {
  url: SITE_URL,
  name: 'Bastien Roc',
  email: 'bastien.roc@icloud.com',
  locale: 'fr_FR',
  ogImage: `${SITE_URL}/og-image.jpg`,
  social: {
    linkedin: 'https://www.linkedin.com/in/bastien-roc/',
    github: 'https://github.com/bastienR17',
  },
}

/**
 * Routes exposées au crawl, utilisées pour générer le sitemap.
 * À tenir à jour avec src/router/index.js quand une route publique est ajoutée.
 */
export const SITEMAP_ROUTES = [
  { path: '/', priority: '1.0', changefreq: 'monthly' },
  { path: '/prestations', priority: '0.9', changefreq: 'monthly' },
  { path: '/about', priority: '0.8', changefreq: 'monthly' },
  { path: '/projects', priority: '0.7', changefreq: 'weekly' },
  { path: '/contact', priority: '0.7', changefreq: 'yearly' },
  { path: '/mentions-legales', priority: '0.2', changefreq: 'yearly' },
]
