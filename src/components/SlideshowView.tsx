import { useEffect, useCallback, useState } from 'react'
import { useAppStore } from '../stores/appStore'
import { useSettingsStore } from '../stores/settingsStore'
import { useAllPhotos } from '../hooks/usePhotoSources'
import { useCachedPhotoLoader } from '../hooks/useCachedPhotoLoader'
import { photoSourceManager } from '../services/PhotoSourceManager'
import PhotoDisplay from './PhotoDisplay'
import MetadataOverlay from './MetadataOverlay'
import FloatingSettingsButton from './FloatingSettingsButton'
import OfflineIndicator from './OfflineIndicator'

interface SlideshowViewProps {
  onExit: () => void
}

export default function SlideshowView({ onExit }: SlideshowViewProps) {
  const { photos, currentPhotoIndex, nextPhoto } = useAppStore()
  const { settings, photoSources } = useSettingsStore()
  const { isLoading, error } = useAllPhotos()
  const [clickToExitEnabled, setClickToExitEnabled] = useState(false)

  // Use the standard nextPhoto function which already loops
  const handleNextPhoto = useCallback(() => {
    nextPhoto() // Automatically restarts when reaching the end
  }, [nextPhoto])
  
  // Use cached photo loader for offline support
  const { getCachedPhotoUrl, isOffline } = useCachedPhotoLoader(
    photos, 
    currentPhotoIndex, 
    3 // Cache 3 images ahead
  )
  
  // Get offline source names for display
  const offlineSourceNames = photoSourceManager.getOfflineSourceNames(photoSources.filter(s => s.enabled))
  
  
  // Enable click-to-exit after a short delay to prevent accidental exits
  useEffect(() => {
    const timer = setTimeout(() => {
      setClickToExitEnabled(true)
    }, 1000) // 1 second delay
    
    return () => clearTimeout(timer)
  }, [])

  // Handle keyboard events
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    // WebOS back button keycode is 461 (0x1CD)
    if (event.keyCode === 461 || event.key === 'Escape' || event.key === ' ') {
      onExit()
    } else if (event.key === 'ArrowRight') {
      handleNextPhoto()
    }
  }, [onExit, handleNextPhoto])

  // Handle mouse/touch events (with delay to prevent accidental exits)
  const handleClick = useCallback((event: MouseEvent) => {
    // Don't exit if clicking on settings button or its container
    const target = event.target as Element
    if (target.closest('.floating-settings-button')) {
      return
    }
    
    if (clickToExitEnabled) {
      onExit()
    } else {
    }
  }, [onExit, clickToExitEnabled])

  // Auto-advance slideshow
  useEffect(() => {
    if (photos.length === 0) return

    const currentPhoto = photos[currentPhotoIndex]
    if (!currentPhoto) return

    let duration: number

    if (currentPhoto.type === 'VIDEO') {
      if (settings.slideshow.videoPlayback === 'full') {
        // For full video playback, we'll let the video component handle advancing
        // Don't set an interval here - the video will trigger advancement on end
        return
      } else {
        // Use the photo interval for video duration limit
        duration = settings.slideshow.interval * 1000
      }
    } else {
      // Use photo interval for images
      duration = settings.slideshow.interval * 1000
    }

    const interval = setInterval(() => {
      handleNextPhoto()
    }, duration)

    return () => clearInterval(interval)
  }, [photos.length, settings.slideshow.interval, settings.slideshow.videoPlayback, handleNextPhoto, currentPhotoIndex])

  // Setup event listeners
  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress)
    document.addEventListener('click', handleClick)

    return () => {
      document.removeEventListener('keydown', handleKeyPress)
      document.removeEventListener('click', handleClick)
    }
  }, [handleKeyPress, handleClick])

  // Show loading state
  if (isLoading) {
    return (
      <div className="slideshow-container">
        <div className="flex items-center justify-center h-full">
          <div className="text-white text-center">
            <div className="text-6xl mb-4 animate-pulse">📷</div>
            <div className="text-xl">Loading photos...</div>
            <div className="text-sm mt-2 opacity-75">Fetching from your Immich server</div>
            <div className="text-xs mt-4 opacity-50">Press ESC to return to settings</div>
          </div>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="slideshow-container">
        <div className="flex items-center justify-center h-full">
          <div className="text-white text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <div className="text-xl">Failed to load photos</div>
            <div className="text-sm mt-2 opacity-75">{error.message}</div>
            <div className="text-xs mt-4 opacity-50">Press ESC to return to settings</div>
          </div>
        </div>
      </div>
    )
  }

  // Show no photos state
  if (photos.length === 0) {
    return (
      <div className="slideshow-container">
        <div className="flex items-center justify-center h-full">
          <div className="text-white text-center">
            <div className="text-6xl mb-4">📷</div>
            <div className="text-xl">No photos available</div>
            <div className="text-sm mt-2 opacity-75">Check your photo source configuration</div>
            <div className="text-xs mt-4 opacity-50">Press ESC to return to settings</div>
          </div>
        </div>
      </div>
    )
  }

  const currentPhoto = photos[currentPhotoIndex]
  
  
  if (!currentPhoto) {
    return (
      <div className="slideshow-container">
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
    <div className="slideshow-container">
      <PhotoDisplay 
        photo={currentPhoto} 
        transition={settings.slideshow.transition}
        getCachedPhotoUrl={getCachedPhotoUrl}
        onVideoEnd={handleNextPhoto}
        videoPlayback={settings.slideshow.videoPlayback}
        videoMuted={settings.slideshow.videoMuted}
        slideshowInterval={settings.slideshow.interval}
      />
      
      {(settings.display.showMetadata || settings.display.showTime) && (
        <MetadataOverlay 
          photo={currentPhoto}
          showWeather={settings.display.showWeather}
          showTime={settings.display.showTime}
        />
      )}
      
      <FloatingSettingsButton onOpenSettings={onExit} />
      
      <OfflineIndicator 
        isOffline={isOffline}
        offlineSourceNames={offlineSourceNames}
      />
    </div>
  )
}