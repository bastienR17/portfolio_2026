<script setup>
/**
 * Panneau de diagnostic, strictement réservé au développement.
 *
 * Il n'est jamais importé statiquement : App.vue le charge derrière un
 * `import.meta.env.DEV` remplacé littéralement par `false` au build, donc
 * Rollup élimine l'import dynamique et ce fichier ne produit aucun chunk.
 *
 * Il ne pilote que ce qu'il peut piloter sans désynchroniser l'application :
 * la météo (dont l'override est déjà le mécanisme prévu) et la langue (via
 * setLocale, le vrai point d'entrée partagé). Le thème et la police adaptée
 * appartiennent chacun à un composant qui garde son propre état local : les
 * forcer ici laisserait les vrais boutons désynchronisés, on se contente donc
 * de les afficher.
 */
import { onMounted, onBeforeUnmount, reactive, ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { setLocale } from '../../i18n'
import { WEATHER_STATES } from './weather/useWeatherLogic'

const { locale } = useI18n()

const open = ref(localStorage.getItem('debug-panel') === 'open')

const toggle = () => {
  open.value = !open.value
  localStorage.setItem('debug-panel', open.value ? 'open' : 'closed')
}

// Libellés WMO des codes qu'on sait interpréter, pour lire le retour d'API
// sans aller chercher la table ailleurs.
const CODE_LABELS = {
  0: 'ciel dégagé',
  1: 'peu nuageux',
  2: 'partiellement nuageux',
  3: 'couvert',
  45: 'brouillard',
  48: 'brouillard givrant',
  51: 'bruine faible',
  53: 'bruine',
  55: 'bruine forte',
  61: 'pluie faible',
  63: 'pluie',
  65: 'pluie forte',
  71: 'neige faible',
  73: 'neige',
  75: 'neige forte',
  77: 'grains de neige',
  80: 'averses faibles',
  81: 'averses',
  82: 'averses violentes',
  85: 'averses de neige',
  86: 'averses de neige fortes',
  95: 'orage',
  96: 'orage et grêle',
  99: 'orage violent',
}

const state = reactive({
  bridge: false,
  weather: null,
  info: null,
  fps: 0,
  animating: false,
  reducedMotion: false,
  fog: null,
  particleOpacity: null,
  particleSize: null,
  triangles: 0,
  drawCalls: 0,
  geometries: 0,
  dark: false,
  dys: false,
  revealReady: false,
  viewport: '',
})

let timer = null
let lastFrame = 0
let lastStamp = 0

const sample = () => {
  const bridge = window.__scene3d
  state.bridge = !!bridge

  state.dark = document.documentElement.classList.contains('dark')
  state.dys = document.documentElement.classList.contains('font-dys')
  state.revealReady = document.documentElement.classList.contains('reveal-ready')
  state.viewport = `${window.innerWidth}×${window.innerHeight}`

  if (!bridge) return

  state.weather = bridge.weatherState?.value ?? null
  state.info = bridge.weatherInfo?.value ?? null
  state.animating = bridge.isAnimating
  state.reducedMotion = bridge.reducedMotion

  const scene = bridge.scene
  const renderer = bridge.renderer

  if (scene) {
    state.fog = scene.fog ? scene.fog.density : null
    // Les particules d'ambiance sont le seul objet Points de la scène.
    const points = scene.children.find((o) => o.isPoints)
    state.particleOpacity = points ? points.material.opacity : null
    state.particleSize = points ? points.material.size : null
  }

  if (renderer) {
    // renderer.info.render.frame s'incrémente à chaque render() : on mesure la
    // cadence réelle de la scène sans rien ajouter dans la boucle de rendu.
    const frame = renderer.info.render.frame
    const now = performance.now()
    if (lastStamp) {
      const dt = (now - lastStamp) / 1000
      if (dt > 0) state.fps = Math.round((frame - lastFrame) / dt)
    }
    lastFrame = frame
    lastStamp = now

    state.triangles = renderer.info.render.triangles
    state.drawCalls = renderer.info.render.calls
    state.geometries = renderer.info.memory.geometries
  }
}

const onKey = (e) => {
  if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'd') {
    e.preventDefault()
    toggle()
  }
}

onMounted(() => {
  sample()
  timer = setInterval(sample, 250)
  window.addEventListener('keydown', onKey)
})

onBeforeUnmount(() => {
  clearInterval(timer)
  window.removeEventListener('keydown', onKey)
})

const setWeather = (s) => window.__scene3d?.setWeather(s)
const refetch = () => window.__scene3d?.refetchWeather()

const statusColor = computed(
  () =>
    ({ ok: '#7CD992', error: '#FF8A7A', loading: '#F4D06F', idle: '#9AA3B2' })[
      state.info?.status
    ] ?? '#9AA3B2',
)

const fpsColor = computed(() =>
  !state.animating ? '#9AA3B2' : state.fps >= 50 ? '#7CD992' : state.fps >= 25 ? '#F4D06F' : '#FF8A7A',
)
</script>

<template>
  <div class="dbg">
    <button class="dbg-tab" type="button" @click="toggle">
      {{ open ? '× debug' : '⚙ debug' }}
    </button>

    <div v-if="open" class="dbg-body">
      <!-- ── Météo ──────────────────────────────────────────── -->
      <p class="dbg-h">Météo</p>

      <div class="dbg-row">
        <span class="dbg-k">état</span>
        <span class="dbg-v">
          {{ state.weather ?? '—' }}
          <em v-if="state.info?.source === 'manuel'" class="dbg-warn">forcé</em>
        </span>
      </div>
      <div class="dbg-row">
        <span class="dbg-k">API</span>
        <span class="dbg-v">
          <span :style="{ color: statusColor }">●</span>
          {{ state.info?.status ?? '—' }}
          <template v-if="state.info?.code != null">
            · code {{ state.info.code }}
            <em>{{ CODE_LABELS[state.info.code] ?? 'inconnu' }}</em>
          </template>
        </span>
      </div>
      <div v-if="state.info?.temperature != null" class="dbg-row">
        <span class="dbg-k">temp.</span>
        <span class="dbg-v">{{ state.info.temperature }} °C</span>
      </div>
      <div v-if="state.info?.error" class="dbg-row">
        <span class="dbg-k">erreur</span>
        <span class="dbg-v dbg-warn">{{ state.info.error }}</span>
      </div>

      <div class="dbg-btns">
        <button
          v-for="w in WEATHER_STATES"
          :key="w"
          type="button"
          :class="{ on: state.weather === w }"
          :disabled="!state.bridge"
          @click="setWeather(w)"
        >
          {{ w }}
        </button>
        <button type="button" :disabled="!state.bridge" @click="refetch">↻ API</button>
      </div>

      <!-- ── Scène 3D ───────────────────────────────────────── -->
      <p class="dbg-h">Scène 3D</p>

      <template v-if="state.bridge">
        <div class="dbg-row">
          <span class="dbg-k">fps</span>
          <span class="dbg-v" :style="{ color: fpsColor }">
            {{ state.animating ? state.fps : 'en pause' }}
          </span>
        </div>
        <div class="dbg-row">
          <span class="dbg-k">brouillard</span>
          <span class="dbg-v">{{ state.fog?.toFixed(5) ?? '—' }}</span>
        </div>
        <div class="dbg-row">
          <span class="dbg-k">particules</span>
          <span class="dbg-v">
            opacité {{ state.particleOpacity?.toFixed(3) ?? '—' }} · taille
            {{ state.particleSize?.toFixed(2) ?? '—' }}
          </span>
        </div>
        <div class="dbg-row">
          <span class="dbg-k">rendu</span>
          <span class="dbg-v">
            {{ state.drawCalls }} appels · {{ state.triangles }} tri ·
            {{ state.geometries }} géo
          </span>
        </div>
        <div v-if="state.reducedMotion" class="dbg-row">
          <span class="dbg-k">mouvement</span>
          <span class="dbg-v dbg-warn">réduit — une seule image rendue</span>
        </div>
      </template>
      <p v-else class="dbg-empty">
        Scène absente. Elle se charge en requestIdleCallback, laissez ~2 s.
      </p>

      <!-- ── Page ───────────────────────────────────────────── -->
      <p class="dbg-h">Page</p>

      <div class="dbg-row">
        <span class="dbg-k">langue</span>
        <span class="dbg-v">
          {{ locale }}
          <button class="dbg-mini" type="button" @click="setLocale(locale === 'fr' ? 'en' : 'fr')">
            passer en {{ locale === 'fr' ? 'en' : 'fr' }}
          </button>
        </span>
      </div>
      <div class="dbg-row">
        <span class="dbg-k">thème</span>
        <span class="dbg-v">{{ state.dark ? 'sombre' : 'clair' }}</span>
      </div>
      <div class="dbg-row">
        <span class="dbg-k">police</span>
        <span class="dbg-v">{{ state.dys ? 'dyslexie' : 'standard' }}</span>
      </div>
      <div class="dbg-row">
        <span class="dbg-k">reveal</span>
        <span class="dbg-v">
          {{ state.revealReady ? 'actif' : 'inactif — tout est visible' }}
        </span>
      </div>
      <div class="dbg-row">
        <span class="dbg-k">viewport</span>
        <span class="dbg-v">{{ state.viewport }}</span>
      </div>

      <p class="dbg-foot">Ctrl+Maj+D · absent du build de production</p>
    </div>
  </div>
</template>

<style scoped>
/* Style autonome, volontairement étranger à la charte : on ne doit jamais
   confondre ce panneau avec un élément du site. */
.dbg {
  position: fixed;
  bottom: 0;
  left: 0;
  z-index: 2000;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 11px;
  line-height: 1.5;
}

.dbg-tab {
  display: block;
  padding: 4px 10px;
  background: #11141b;
  color: #cfd6e4;
  border: 1px solid #2a3040;
  border-left: 0;
  border-bottom: 0;
  cursor: pointer;
  font: inherit;
  opacity: 0.75;
}
.dbg-tab:hover {
  opacity: 1;
}

.dbg-body {
  width: 300px;
  max-height: 70vh;
  overflow-y: auto;
  padding: 8px 10px 10px;
  background: #11141b;
  color: #cfd6e4;
  border: 1px solid #2a3040;
  border-left: 0;
  border-bottom: 0;
}

.dbg-h {
  margin: 10px 0 4px;
  padding-bottom: 3px;
  border-bottom: 1px solid #2a3040;
  color: #8f9bb3;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 10px;
}
.dbg-h:first-child {
  margin-top: 0;
}

.dbg-row {
  display: flex;
  gap: 8px;
  padding: 1px 0;
}
.dbg-k {
  flex: 0 0 74px;
  color: #7a8497;
}
.dbg-v {
  flex: 1;
  word-break: break-word;
}
.dbg-v em {
  color: #8f9bb3;
  font-style: normal;
}
.dbg-warn {
  color: #ff8a7a;
}

.dbg-btns {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 7px;
}
.dbg-btns button {
  padding: 2px 7px;
  background: #171b25;
  color: #cfd6e4;
  border: 1px solid #2a3040;
  cursor: pointer;
  font: inherit;
}
.dbg-btns button:hover:not(:disabled) {
  border-color: #4a5568;
}
.dbg-btns button.on {
  background: #e2725b;
  border-color: #e2725b;
  color: #11141b;
}
.dbg-btns button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.dbg-mini {
  margin-left: 6px;
  padding: 0 5px;
  background: #171b25;
  color: #8f9bb3;
  border: 1px solid #2a3040;
  cursor: pointer;
  font: inherit;
  font-size: 10px;
}
.dbg-mini:hover {
  color: #cfd6e4;
}

.dbg-empty {
  color: #7a8497;
}

.dbg-foot {
  margin-top: 10px;
  padding-top: 6px;
  border-top: 1px solid #2a3040;
  color: #5c6474;
  font-size: 10px;
}
</style>
