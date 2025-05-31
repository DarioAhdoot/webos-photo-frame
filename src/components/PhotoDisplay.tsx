import { useState, useEffect } from 'react'
import type { Photo } from '../types'

interface PhotoDisplayProps {
  photo: Photo
  transition: 'fade' | 'slide' | 'none'
  layout: 'single' | 'dual' | 'blurred-bg'
}

export default function PhotoDisplay({ photo, transition, layout }: PhotoDisplayProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageSrc, setImageSrc] = useState<string>('')

  useEffect(() => {
    setImageLoaded(false)
    setImageSrc(photo.url)
  }, [photo.id])

  const handleImageLoad = () => {
    setImageLoaded(true)
  }

  const getTransitionClass = () => {
    if (!imageLoaded) return 'opacity-0'
    
    switch (transition) {
      case 'fade':
        return 'animate-fade-in'
      case 'slide':
        return 'animate-slide-left'
      default:
        return 'opacity-100'
    }
  }

  const isPortrait = photo.metadata?.dimensions 
    ? photo.metadata.dimensions.height > photo.metadata.dimensions.width
    : false

  if (layout === 'blurred-bg' && isPortrait) {
    return (
      <div className="photo-display relative">
        {/* Blurred background */}
        <div 
          className="absolute inset-0 bg-cover bg-center filter blur-lg scale-110"
          style={{ backgroundImage: `url(${imageSrc})` }}
        />
        {/* Main photo */}
        <div className="relative z-10 flex items-center justify-center h-full">
          <img
            src={imageSrc}
            alt={photo.metadata?.title || 'Photo'}
            className={`photo-image ${getTransitionClass()}`}
            onLoad={handleImageLoad}
            style={{ maxHeight: '90%' }}
          />
        </div>
      </div>
    )
  }

  // TODO: Implement dual layout for portrait photos
  // For now, default to single photo display
  return (
    <div className="photo-display">
      <img
        src={imageSrc}
        alt={photo.metadata?.title || 'Photo'}
        className={`photo-image ${getTransitionClass()}`}
        onLoad={handleImageLoad}
      />
    </div>
  )
}