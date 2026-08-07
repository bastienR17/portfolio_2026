/**
 * Vérifie que chaque message des fichiers de langue compile, et que les deux
 * langues déclarent exactement les mêmes clés.
 *
 * Pourquoi : vue-i18n ne compile un message qu'au premier appel qui l'utilise.
 * Un message invalide passe donc le build, passe les tests des autres pages, et
 * ne casse que la page qui l'affiche — au moment où un visiteur l'ouvre.
 *
 * C'est exactement ce qui est arrivé aux mentions légales : « @ » ouvre un lien
 * vers un autre message, donc « contact@bastienroc.fr » est devenu invalide en
 * passant à vue-i18n 11, et la page entière ne s'affichait plus. Aucune erreur
 * au build, aucune erreur sur les cinq autres pages.
 *
 * On utilise le vrai compilateur de vue-i18n, pas une liste de caractères
 * suspects : c'est lui qui décide, et lui seul.
 *
 * Lancé par le script `prebuild`, avant la construction du bundle.
 */
import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'
import { baseCompile } from '@intlify/message-compiler'

const localesDir = fileURLToPath(new URL('../src/locales', import.meta.url))
const files = readdirSync(localesDir).filter((f) => f.endsWith('.json'))

/** Aplatit l'arbre en couples chemin -> texte, tableaux compris. */
const flatten = function* (node, path = '') {
  if (typeof node === 'string') yield [path, node]
  else if (Array.isArray(node)) for (const [i, v] of node.entries()) yield* flatten(v, `${path}[${i}]`)
  else if (node && typeof node === 'object')
    for (const [k, v] of Object.entries(node)) yield* flatten(v, path ? `${path}.${k}` : k)
}

const problems = []
const keysByLocale = {}

for (const file of files) {
  const locale = file.replace(/\.json$/, '')
  const data = JSON.parse(readFileSync(join(localesDir, file), 'utf8'))
  const keys = []

  for (const [path, message] of flatten(data)) {
    keys.push(path)
    const errors = []
    try {
      baseCompile(message, { onError: (e) => errors.push(e.message.split('\n')[0]) })
    } catch (e) {
      errors.push(String(e.message).split('\n')[0])
    }
    for (const error of errors) {
      problems.push(`${file} — ${path}\n    ${JSON.stringify(message)}\n    ${error}`)
    }
  }
  keysByLocale[locale] = keys
}

// Parité des clés : une clé absente d'une langue s'affiche en clair à l'écran.
const [reference, ...others] = Object.keys(keysByLocale)
for (const locale of others) {
  const missing = keysByLocale[reference].filter((k) => !keysByLocale[locale].includes(k))
  const extra = keysByLocale[locale].filter((k) => !keysByLocale[reference].includes(k))
  if (missing.length) problems.push(`${locale}.json — clés absentes : ${missing.join(', ')}`)
  if (extra.length) problems.push(`${locale}.json — clés en trop : ${extra.join(', ')}`)
}

if (problems.length) {
  console.error(`\nMessages invalides (${problems.length}) :\n`)
  problems.forEach((p) => console.error(`  ${p}\n`))
  console.error(
    "Un « @ » littéral s'échappe en l'écrivant {'@'}, de même pour « | ».\n" +
      'Une adresse e-mail a plutôt sa place dans src/config/site.js.\n',
  )
  process.exit(1)
}

const total = Object.values(keysByLocale)[0].length
console.log(`Locales : ${files.length} langues, ${total} messages, tous compilables`)
