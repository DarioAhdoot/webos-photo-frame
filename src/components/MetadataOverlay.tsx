import type { Photo } from '../types'

interface MetadataOverlayProps {
  photo: Photo
  showWeather: boolean
}

export default function MetadataOverlay({ photo, showWeather }: MetadataOverlayProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return null
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
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
            {/* TODO: Implement weather data */}
            <div className="text-sm opacity-75">Weather data coming soon</div>
          </div>
        )}
      </div>
    </div>
  )
}