import { useEffect, useCallback } from 'react'
import { useAppStore } from '../stores/appStore'
import { useSettingsStore } from '../stores/settingsStore'
import PhotoDisplay from './PhotoDisplay'
import MetadataOverlay from './MetadataOverlay'

interface ScreensaverViewProps {
  onExit: () => void
}

export default function ScreensaverView({ onExit }: ScreensaverViewProps) {
  const { photos, currentPhotoIndex, nextPhoto } = useAppStore()
  const { settings } = useSettingsStore()

  // Handle keyboard events
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape' || event.key === ' ') {
      onExit()
    } else if (event.key === 'ArrowRight') {
      nextPhoto()
    }
  }, [onExit, nextPhoto])

  // Handle mouse/touch events
  const handleClick = useCallback(() => {
    onExit()
  }, [onExit])

  // Auto-advance slideshow
  useEffect(() => {
    if (photos.length === 0) return

    const interval = setInterval(() => {
      nextPhoto()
    }, settings.slideshow.interval * 1000)

    return () => clearInterval(interval)
  }, [photos.length, settings.slideshow.interval, nextPhoto])

  // Setup event listeners
  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress)
    document.addEventListener('click', handleClick)

    return () => {
      document.removeEventListener('keydown', handleKeyPress)
      document.removeEventListener('click', handleClick)
    }
  }, [handleKeyPress, handleClick])

  if (photos.length === 0) {
    return (
      <div className="screensaver-container">
        <div className="flex items-center justify-center h-full">
          <div className="text-white text-center">
            <div className="text-6xl mb-4">📷</div>
            <div className="text-xl">No photos available</div>
            <div className="text-sm mt-2 opacity-75">Press ESC to return to settings</div>
          </div>
        </div>
      </div>
    )
  }

  const currentPhoto = photos[currentPhotoIndex]
  
  if (!currentPhoto) {
    return (
      <div className="screensaver-container">
        <div className="flex items-center justify-center h-full">
          <div className="text-white text-center">
            <div className="text-6xl mb-4">📷</div>
            <div className="text-xl">Loading photos...</div>
            <div className="text-sm mt-2 opacity-75">Press ESC to return to settings</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="screensaver-container">
      <PhotoDisplay 
        photo={currentPhoto} 
        transition={settings.slideshow.transition}
        layout={settings.layout.portraitLayout}
      />
      
      {settings.display.showMetadata && (
        <MetadataOverlay 
          photo={currentPhoto}
          showWeather={settings.display.showWeather}
        />
      )}
    </div>
  )
}