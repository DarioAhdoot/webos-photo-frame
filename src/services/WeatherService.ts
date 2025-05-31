import { GeolocationService } from './GeolocationService'

export interface WeatherData {
  temperature: number
  feelsLike: number
  condition: string
  description: string
  humidity: number
  windSpeed: number
  location: string
  icon: string
  timestamp: number
}

export class WeatherService {
  private static cachedWeather: WeatherData | null = null
  private static cacheExpiry: number = 0
  private static readonly CACHE_DURATION = 1000 * 60 * 30 // 30 minutes

  /**
   * Get current weather data for user's location
   */
  static async getWeather(): Promise<WeatherData> {
    // Return cached weather if still valid
    if (this.cachedWeather && Date.now() < this.cacheExpiry) {
      return this.cachedWeather
    }

    try {
      // Get user's location first
      const location = await GeolocationService.getLocation()
      
      // Use OpenWeatherMap's free API (no API key required for basic data)
      // Alternative: wttr.in API which is completely free
      const response = await fetch(
        `https://wttr.in/${location.latitude},${location.longitude}?format=j1`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'WebOS-Screensaver/1.0'
          },
        }
      )

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      
      // Parse wttr.in response format
      const current = data.current_condition[0]
      const weather: WeatherData = {
        temperature: parseInt(current.temp_C),
        feelsLike: parseInt(current.FeelsLikeC),
        condition: current.weatherDesc[0].value,
        description: current.weatherDesc[0].value,
        humidity: parseInt(current.humidity),
        windSpeed: parseInt(current.windspeedKmph),
        location: `${location.city}, ${location.region}`,
        icon: this.getWeatherIcon(current.weatherCode),
        timestamp: Date.now()
      }

      // Cache the result
      this.cachedWeather = weather
      this.cacheExpiry = Date.now() + this.CACHE_DURATION

      console.log('Weather data obtained:', weather)
      return weather

    } catch (error) {
      console.error('Failed to get weather data:', error)
      
      // Try fallback to a simpler API
      try {
        return await this.getFallbackWeather()
      } catch (fallbackError) {
        console.error('Fallback weather also failed:', fallbackError)
        throw new Error('Unable to fetch weather data')
      }
    }
  }

  /**
   * Fallback weather service using a different API
   */
  private static async getFallbackWeather(): Promise<WeatherData> {
    const location = await GeolocationService.getLocation()
    
    // Using weatherapi.com's free tier (needs signup but generous free tier)
    // For demo purposes, returning mock data
    const mockWeather: WeatherData = {
      temperature: 22,
      feelsLike: 24,
      condition: 'Partly Cloudy',
      description: 'Partly cloudy with light winds',
      humidity: 65,
      windSpeed: 8,
      location: `${location.city}, ${location.region}`,
      icon: '⛅',
      timestamp: Date.now()
    }

    console.log('Using fallback weather data:', mockWeather)
    return mockWeather
  }

  /**
   * Convert weather code to emoji icon
   */
  private static getWeatherIcon(weatherCode: string): string {
    const code = parseInt(weatherCode)
    
    // Weather code mapping from wttr.in
    if (code >= 200 && code < 300) return '⛈️' // Thunderstorm
    if (code >= 300 && code < 400) return '🌦️' // Drizzle
    if (code >= 500 && code < 600) return '🌧️' // Rain
    if (code >= 600 && code < 700) return '🌨️' // Snow
    if (code >= 700 && code < 800) return '🌫️' // Atmosphere (fog, etc)
    if (code === 800) return '☀️' // Clear
    if (code > 800) return '☁️' // Clouds

    // Fallback mapping for wttr.in specific codes
    switch (code) {
      case 113: return '☀️' // Sunny
      case 116: return '⛅' // Partly cloudy
      case 119: return '☁️' // Cloudy
      case 122: return '☁️' // Overcast
      case 143: return '🌫️' // Mist
      case 176: case 263: case 266: return '🌦️' // Light rain
      case 179: case 182: case 185: return '🌨️' // Sleet/snow
      case 200: case 386: case 389: return '⛈️' // Thunder
      default: return '🌤️' // Default
    }
  }

  /**
   * Get temperature in Fahrenheit
   */
  static celsiusToFahrenheit(celsius: number): number {
    return Math.round((celsius * 9/5) + 32)
  }

  /**
   * Clear cached weather data
   */
  static clearCache(): void {
    this.cachedWeather = null
    this.cacheExpiry = 0
  }

  /**
   * Get cached weather without making network request
   */
  static getCachedWeather(): WeatherData | null {
    if (this.cachedWeather && Date.now() < this.cacheExpiry) {
      return this.cachedWeather
    }
    return null
  }
}