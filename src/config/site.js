/**
 * Source de vérité unique pour tout ce qui dépend du domaine.
 *
 * Changer SITE_URL suffit à mettre à jour d'un coup : les balises canonical,
 * les Open Graph / Twitter Card, le sitemap et le JSON-LD.
 * Pas de domaine en dur ailleurs dans le projet.
 */
export const SITE_URL = 'https://bastienroc.fr'

export const SITE = {
  url: SITE_URL,
  name: 'Bastien Roc',
  email: 'contact@bastienroc.fr',
  locale: 'fr_FR',
  ogImage: `${SITE_URL}/og-image.jpg`,
  social: {
    linkedin: 'https://www.linkedin.com/in/bastien-roc/',
    github: 'https://github.com/bastienR17',
  },
  /**
   * Le format et le poids sont annoncés à côté du lien : un fichier en
   * téléchargement doit dire ce qu'il est avant d'être ouvert (règle Opquast
   * n° 135). Le poids est déclaré ici plutôt que dans les traductions pour
   * n'exister qu'une fois, et generate-seo-files.js casse le build s'il ne
   * correspond plus au fichier réel — un CV se remplace souvent, et une
   * indication fausse est pire que pas d'indication.
   */
  cv: {
    path: '/docs/RB_CV_2026.pdf',
    filename: 'CV_Bastien_Roc.pdf',
    format: 'PDF',
    sizeKb: 24,
  },
}

/**
 * Routes exposées au crawl. Sert à la fois à générer le sitemap et à écrire un
 * fichier HTML par route au build (scripts/prerender-routes.js).
 *
 * `seoKey` pointe vers seo.<clé>.title / .description dans les locales, comme
 * le `meta.seoKey` du routeur.
 * À tenir à jour avec src/router/index.js quand une route publique est ajoutée.
 *
 * `noindex: true` retire une route de Google (balise robots + absente du
 * sitemap) sans la retirer du site : la page reste en ligne, atteignable
 * depuis la nav ou un lien direct, mais Google Search Console/résultats ne
 * la remontent plus. À tenir en cohérence avec src/router/index.js, qui
 * porte le même flag pour le passage côté client (useSeo.js).
 */
export const SITEMAP_ROUTES = [
  { path: '/', seoKey: 'home', view: 'HomeView.vue', priority: '1.0', changefreq: 'monthly' },
  { path: '/prestations', seoKey: 'prestations', view: 'PrestationsView.vue', priority: '0.9', changefreq: 'monthly' },
  { path: '/about', seoKey: 'about', view: 'AboutView.vue', priority: '0.8', changefreq: 'monthly' },
  { path: '/projects', seoKey: 'projects', view: 'ProjectsView.vue', priority: '0.7', changefreq: 'weekly' },
  { path: '/contact', seoKey: 'contact', view: 'ContactView.vue', priority: '0.7', changefreq: 'yearly' },
  { path: '/mentions-legales', seoKey: 'legal', view: 'LegalView.vue', priority: '0.2', changefreq: 'yearly' },
]
