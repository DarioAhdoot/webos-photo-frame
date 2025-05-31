import { useState, useEffect } from 'react'
import { WeatherService } from '../services/WeatherService'
import type { WeatherData } from '../types'

interface UseWeatherResult {
  weather: WeatherData | null
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useWeather(enabled: boolean = true): UseWeatherResult {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchWeather = async () => {
    if (!enabled) return

    try {
      setIsLoading(true)
      setError(null)
      
      // Check if we have valid cached data first
      const cached = WeatherService.getCachedWeather()
      if (cached) {
        setWeather(cached)
        setIsLoading(false)
        return
      }

      const weatherData = await WeatherService.getWeather()
      setWeather(weatherData)
    } catch (err) {
      console.error('Weather fetch error:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch weather')
    } finally {
      setIsLoading(false)
    }
  }

  const refetch = () => {
    WeatherService.clearCache()
    fetchWeather()
  }

  useEffect(() => {
    if (enabled) {
      fetchWeather()
    }
  }, [enabled])

  return {
    weather,
    isLoading,
    error,
    refetch
  }
}