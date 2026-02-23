import { ref } from 'vue'

export function useWeatherLogic() {
  const weatherState = ref('clear')
  const city = ref('Paris') // Fixé par défaut

  const fetchWeatherData = async () => {
    try {
      // Coordonnées de Paris
      const lat = 48.8566
      const lon = 2.3522

      // Appel à Open-Meteo avec les coordonnées fixes
      const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`)
      const weatherData = await weatherRes.json()
      
      const code = weatherData.current_weather.weathercode

      if ([95, 96, 99].includes(code)) {
        weatherState.value = 'storm'
      } else if ([71, 73, 75, 77, 85, 86].includes(code)) {
        weatherState.value = 'snow'
      } else if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) {
        weatherState.value = 'rain'
      } else if ([1, 2, 3].includes(code)) {
        weatherState.value = 'clouds'
      } else {
        weatherState.value = 'clear'
      }

    } catch (e) {
      console.error("Erreur météo:", e)
      weatherState.value = 'clear' // Sécurité
    }
  }

  return { weatherState, city, fetchWeatherData }
}