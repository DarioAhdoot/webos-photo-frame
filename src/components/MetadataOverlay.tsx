import { useWeather } from '../hooks/useWeather'
import { useCurrentTime } from '../hooks/useCurrentTime'
import { WeatherService } from '../services/WeatherService'
import type { Photo } from '../types'

interface MetadataOverlayProps {
  photo: Photo
  showWeather: boolean
  showTime: boolean
}

export default function MetadataOverlay({ photo, showWeather, showTime }: MetadataOverlayProps) {
  const { weather, isLoading: weatherLoading, error: weatherError } = useWeather(showWeather)
  const currentTime = useCurrentTime(showTime)

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
      <div className="space-y-4">
        {/* Current Time Information - Top Priority */}
        {showTime && (
          <div className="time-info">
            <div className="space-y-1">
              <div className="text-4xl font-bold">{currentTime.time}</div>
              <div className="text-base opacity-75">{currentTime.date}</div>
              <div className="text-xs opacity-60">🌍 {currentTime.timezone}</div>
            </div>
          </div>
        )}

        {/* Weather Information - Second Priority */}
        {showWeather && (
          <div className="weather-info">
            {weatherLoading && (
              <div className="text-sm opacity-75">Loading weather...</div>
            )}
            
            {weatherError && (
              <div className="text-xs opacity-60">Weather unavailable</div>
            )}
            
            {weather && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{weather.icon}</span>
                  <div>
                    <div className="text-lg font-semibold">
                      {formatTemperature(weather.temperature)}
                    </div>
                    <div className="text-xs opacity-75">
                      Feels like {formatTemperature(weather.feelsLike)}
                    </div>
                  </div>
                </div>
                
                <div className="text-xs opacity-75">
                  <div>{weather.condition}</div>
                  <div>📍 {weather.location}</div>
                  <div>💨 {weather.windSpeed} km/h • 💧 {weather.humidity}%</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Photo Information - Third Priority */}
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
      </div>
    </div>
  )
}