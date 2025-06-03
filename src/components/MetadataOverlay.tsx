import type { Photo } from '../types'

interface MetadataOverlayProps {
  photo: Photo
}

export default function MetadataOverlay({ photo }: MetadataOverlayProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return null
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatTime = (dateString?: string) => {
    if (!dateString) return null
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  return (
    <div className="photo-metadata">
      {/* Photo Information */}
      <div className="photo-info">
        {photo.metadata?.description && (
          <p className="photo-description">{photo.metadata.description}</p>
        )}
        
        <div className="photo-details">
          {photo.metadata?.dateTaken && (
            <div className="detail-item">
              <span className="detail-label">Date</span>
              <span className="detail-value">{formatDate(photo.metadata.dateTaken)}</span>
            </div>
          )}
          
          {photo.metadata?.dateTaken && (
            <div className="detail-item">
              <span className="detail-label">Time</span>
              <span className="detail-value">{formatTime(photo.metadata.dateTaken)}</span>
            </div>
          )}
          
          {photo.metadata?.location && (
            <div className="detail-item">
              <span className="detail-label">Location</span>
              <span className="detail-value">{photo.metadata.location}</span>
            </div>
          )}
          
          {photo.metadata?.camera && (
            <div className="detail-item">
              <span className="detail-label">Camera</span>
              <span className="detail-value">{photo.metadata.camera}</span>
            </div>
          )}
          
          {photo.metadata?.dimensions && (
            <div className="detail-item">
              <span className="detail-label">Resolution</span>
              <span className="detail-value">
                {photo.metadata.dimensions.width} × {photo.metadata.dimensions.height}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}