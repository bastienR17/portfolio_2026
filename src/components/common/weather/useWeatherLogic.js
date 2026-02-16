import { ref } from 'vue'

export function useWeatherLogic() {
  const weatherState = ref('clear')
  const city = ref('')

  const getGPSCoords = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) reject(new Error("Non supporté"))
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        (err) => reject(err),
        { timeout: 5000 }
      )
    })
  }

  const fetchWeatherData = async () => {
    try {
      let lat, lon
      try {
        const coords = await getGPSCoords()
        lat = coords.lat; lon = coords.lon
        city.value = "Position GPS"
      } catch {
        const res = await fetch('https://freeipapi.com/api/json')
        const data = await res.json()
        lat = data.latitude; lon = data.longitude
        city.value = data.cityName || 'Localisation IP'
      }

      const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`)
      const weatherData = await weatherRes.json()
      const code = weatherData.current_weather.weathercode

      if ([95, 96, 99].includes(code)) weatherState.value = 'storm'
      else if ([71, 73, 75, 77, 85, 86].includes(code)) weatherState.value = 'snow'
      else if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) weatherState.value = 'rain'
      else if ([1, 2, 3].includes(code)) weatherState.value = 'clouds'
      else weatherState.value = 'clear'
    } catch (e) {
      weatherState.value = 'clear'; city.value = "Paris (Démo)"
    }
  }

  return { weatherState, city, fetchWeatherData }
}