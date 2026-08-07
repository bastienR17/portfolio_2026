import { ref } from 'vue'

/** Les cinq ambiances du décor. Source unique : le panneau de debug et le
 *  pont de développement s'y réfèrent plutôt que de recopier la liste. */
export const WEATHER_STATES = ['clear', 'clouds', 'rain', 'storm', 'snow']

/**
 * Codes météo WMO renvoyés par Open-Meteo, regroupés par ambiance.
 * Les ensembles sont disjoints : le premier groupe qui contient le code gagne,
 * tout le reste retombe sur `clear`.
 */
const CODES = {
  storm: [95, 96, 99],
  snow: [71, 73, 75, 77, 85, 86],
  rain: [51, 53, 55, 61, 63, 65, 80, 81, 82],
  clouds: [1, 2, 3],
}

const stateFromCode = (code) =>
  WEATHER_STATES.find((state) => CODES[state]?.includes(code)) ?? 'clear'

export function useWeatherLogic() {
  const weatherState = ref('clear')

  // Détail du dernier appel, lu uniquement par le panneau de debug. En
  // production personne ne s'y abonne : c'est une ref inerte.
  const weatherInfo = ref({
    status: 'idle', // idle | loading | ok | error
    code: null,
    temperature: null,
    source: 'api', // bascule sur 'manuel' si on force une ambiance en dev
    error: null,
  })

  const fetchWeatherData = async () => {
    // Coordonnées de Paris
    const lat = 48.8566
    const lon = 2.3522

    weatherInfo.value = { ...weatherInfo.value, status: 'loading', error: null }

    try {
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`,
      )
      const weatherData = await weatherRes.json()
      const { weathercode, temperature } = weatherData.current_weather

      weatherState.value = stateFromCode(weathercode)
      weatherInfo.value = {
        status: 'ok',
        code: weathercode,
        temperature,
        source: 'api',
        error: null,
      }
    } catch (e) {
      console.error('Erreur météo:', e)
      weatherState.value = 'clear' // Sécurité
      weatherInfo.value = {
        status: 'error',
        code: null,
        temperature: null,
        source: 'api',
        error: String(e?.message ?? e),
      }
    }
  }

  return { weatherState, weatherInfo, fetchWeatherData }
}
