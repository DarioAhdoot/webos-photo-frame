import { useWeather } from '../hooks/useWeather'
import { WeatherService } from '../services/WeatherService'
import type { Photo } from '../types'

interface MetadataOverlayProps {
  photo: Photo
  showWeather: boolean
}

export default function MetadataOverlay({ photo, showWeather }: MetadataOverlayProps) {
  const { weather, isLoading: weatherLoading, error: weatherError } = useWeather(showWeather)

  const formatDate = (dateString?: string) => {
    if (!dateString) return null
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatTemperature = (celsius: number) => {
    const fahrenheit = WeatherService.celsiusToFahrenheit(celsius)
    return `${celsius}°C / ${fahrenheit}°F`
  }

  return (
    <div className="metadata-overlay">
      <div className="flex justify-between items-end">
        <div className="photo-info">
          {photo.metadata?.description && (
            <p className="text-sm opacity-90 mb-2">{photo.metadata.description}</p>
          )}
          
          <div className="text-xs opacity-75 space-y-1">
            {photo.metadata?.dateTaken && (
              <div>📅 {formatDate(photo.metadata.dateTaken)}</div>
            )}
            
            {photo.metadata?.location && (
              <div>📍 {photo.metadata.location}</div>
            )}
            
            {photo.metadata?.camera && (
              <div>📷 {photo.metadata.camera}</div>
            )}
            
            {photo.metadata?.dimensions && (
              <div>
                📐 {photo.metadata.dimensions.width} × {photo.metadata.dimensions.height}
              </div>
            )}
          </div>
        </div>

        {showWeather && (
          <div className="weather-info text-right">
            {weatherLoading && (
              <div className="text-sm opacity-75">Loading weather...</div>
            )}
            
            {weatherError && (
              <div className="text-xs opacity-60">Weather unavailable</div>
            )}
            
            {weather && (
              <div className="space-y-1">
                <div className="flex items-center justify-end gap-2">
                  <span className="text-2xl">{weather.icon}</span>
                  <div className="text-right">
                    <div className="text-lg font-semibold">
                      {formatTemperature(weather.temperature)}
                    </div>
                    <div className="text-xs opacity-75">
                      Feels like {formatTemperature(weather.feelsLike)}
                    </div>
                  </div>
                </div>
                
                <div className="text-xs opacity-75 text-right">
                  <div>{weather.condition}</div>
                  <div>📍 {weather.location}</div>
                  <div>💨 {weather.windSpeed} km/h • 💧 {weather.humidity}%</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}