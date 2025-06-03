import { useWeather } from '../hooks/useWeather'
import { useCurrentTime } from '../hooks/useCurrentTime'

interface TimeWeatherBoxProps {
  showWeather: boolean
  showTime: boolean
}

export default function TimeWeatherBox({ showWeather, showTime }: TimeWeatherBoxProps) {
  const { weather, isLoading: weatherLoading } = useWeather(showWeather)
  const currentTime = useCurrentTime(showTime)

  if (!showTime && !showWeather) return null

  return (
    <div className="time-weather-box">
      {/* Time Display */}
      {showTime && (
        <div className="time-section">
          <div className="time-display">{currentTime.time}</div>
          <div className="date-display">{currentTime.date}</div>
        </div>
      )}

      {/* Weather Display */}
      {showWeather && weather && (
        <div className="weather-section">
          <div className="weather-main">
            <span className="weather-icon">{weather.icon}</span>
            <span className="weather-temp">{Math.round(weather.temperature)}°</span>
          </div>
          <div className="weather-condition">{weather.condition}</div>
          <div className="weather-location">{weather.location}</div>
        </div>
      )}

      {showWeather && weatherLoading && (
        <div className="weather-section">
          <div className="weather-loading">Loading weather...</div>
        </div>
      )}
    </div>
  )
}