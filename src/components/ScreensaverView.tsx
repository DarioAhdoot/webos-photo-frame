import { useEffect, useCallback, useState } from 'react'
import { useAppStore } from '../stores/appStore'
import { useSettingsStore } from '../stores/settingsStore'
import { useAllPhotos } from '../hooks/usePhotoSources'
import { useImagePreloader } from '../hooks/useImagePreloader'
import PhotoDisplay from './PhotoDisplay'
import MetadataOverlay from './MetadataOverlay'
import FloatingSettingsButton from './FloatingSettingsButton'

interface ScreensaverViewProps {
  onExit: () => void
}

export default function ScreensaverView({ onExit }: ScreensaverViewProps) {
  const { photos, currentPhotoIndex, nextPhoto } = useAppStore()
  const { settings } = useSettingsStore()
  const { isLoading, error } = useAllPhotos()
  const [clickToExitEnabled, setClickToExitEnabled] = useState(false)

  // Use the standard nextPhoto function which already loops
  const handleNextPhoto = useCallback(() => {
    nextPhoto() // Automatically restarts when reaching the end
  }, [nextPhoto])
  
  // Preload images for smooth transitions
  const { getPreloadedImageUrl, preloadedCount } = useImagePreloader(
    photos, 
    currentPhotoIndex, 
    3 // Preload 3 images ahead
  )
  
  console.log('Preloader status:', { preloadedCount, currentIndex: currentPhotoIndex, totalPhotos: photos.length })
  
  // Enable click-to-exit after a short delay to prevent accidental exits
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log('Click-to-exit enabled')
      setClickToExitEnabled(true)
    }, 1000) // 1 second delay
    
    return () => clearTimeout(timer)
  }, [])

  // Handle keyboard events
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape' || event.key === ' ') {
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
      console.log('Click to exit triggered')
      onExit()
    } else {
      console.log('Click ignored - too soon after startup')
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
        // Use the configured video duration limit
        duration = settings.slideshow.videoDuration * 1000
      }
    } else {
      // Use photo interval for images
      duration = settings.slideshow.interval * 1000
    }

    const interval = setInterval(() => {
      handleNextPhoto()
    }, duration)

    return () => clearInterval(interval)
  }, [photos.length, settings.slideshow.interval, settings.slideshow.videoPlayback, settings.slideshow.videoDuration, handleNextPhoto, currentPhotoIndex])

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
      <div className="screensaver-container">
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
      <div className="screensaver-container">
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
      <div className="screensaver-container">
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
  
  console.log('ScreensaverView render:', {
    photosLength: photos.length,
    currentPhotoIndex,
    currentPhoto: currentPhoto ? {
      id: currentPhoto.id,
      url: currentPhoto.url,
      source: currentPhoto.source
    } : null
  })
  
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
        getPreloadedImageUrl={getPreloadedImageUrl}
        onVideoEnd={handleNextPhoto}
        videoPlayback={settings.slideshow.videoPlayback}
        videoDuration={settings.slideshow.videoDuration}
      />
      
      {settings.display.showMetadata && (
        <MetadataOverlay 
          photo={currentPhoto}
          showWeather={settings.display.showWeather}
        />
      )}
      
      <FloatingSettingsButton onOpenSettings={onExit} />
    </div>
  )
}