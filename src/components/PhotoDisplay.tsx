import { useEffect, useRef, useState } from 'react'
import { useSettingsStore } from '../stores/settingsStore'
import { photoSourceManager } from '../services/PhotoSourceManager'
import type { Photo } from '../types'

interface PhotoDisplayProps {
  photo: Photo
  transition: 'fade' | 'slide' | 'dissolve' | 'none' | 'ken-burns'
  getCachedPhotoUrl?: (photoId: string) => string | null
  onVideoEnd?: () => void
  videoPlayback?: 'full' | 'duration'
  videoMuted?: boolean
  slideshowInterval?: number
  isPaused?: boolean
}

export default function PhotoDisplay({ photo, transition, getCachedPhotoUrl, onVideoEnd, videoPlayback, videoMuted = true, slideshowInterval = 10, isPaused = false }: PhotoDisplayProps) {
  const { settings } = useSettingsStore()
  const [currentImageSrc, setCurrentImageSrc] = useState<string>('')
  const [previousImageSrc, setPreviousImageSrc] = useState<string>('')
  const [currentImageLoaded, setCurrentImageLoaded] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [currentPhotoId, setCurrentPhotoId] = useState<string>('')
  const [previousPhotoId, setPreviousPhotoId] = useState<string>('')
  const [kenBurnsAnimation, setKenBurnsAnimation] = useState<{
    scale: { start: number; end: number }
    translate: { start: { x: number; y: number }; end: { x: number; y: number } }
    key: string // Unique key to force animation restart
  } | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const previousVideoRef = useRef<HTMLVideoElement>(null)
  
  // Generate random Ken Burns animation parameters
  const generateKenBurnsAnimation = () => {
    // More subtle random scale between 1.0 and 1.08 (very gentle zoom)
    const startScale = 1.0 + Math.random() * 0.03 // 1.0 to 1.03
    const endScale = 1.02 + Math.random() * 0.06 // 1.02 to 1.08
    
    // More subtle translate values for gentle panning (in percentages)
    const maxTranslate = 2 // 2% maximum movement (reduced from 5%)
    const startX = (Math.random() - 0.5) * maxTranslate
    const startY = (Math.random() - 0.5) * maxTranslate
    const endX = (Math.random() - 0.5) * maxTranslate
    const endY = (Math.random() - 0.5) * maxTranslate
    
    return {
      scale: { start: startScale, end: endScale },
      translate: { 
        start: { x: startX, y: startY },
        end: { x: endX, y: endY }
      },
      key: `kb-${Date.now()}-${Math.random()}` // Unique key for each animation
    }
  }
  

  useEffect(() => {
    // Track photo changes (not just URL changes)
    const isNewPhoto = photo.id !== currentPhotoId
    
    if (isNewPhoto) {
      
      // For dissolve transition, keep previous image and photo ID
      if (transition === 'dissolve' && currentImageSrc && currentPhotoId) {
        setPreviousImageSrc(currentImageSrc)
        setPreviousPhotoId(currentPhotoId)
      }
      
      setCurrentPhotoId(photo.id)
      setCurrentImageLoaded(false)
      setIsTransitioning(false) // Reset transition state
      setCurrentImageSrc('')
      
      // Generate Ken Burns animation for new photo (only for images)
      if (transition === 'ken-burns' && photo.type !== 'VIDEO') {
        const newAnimation = generateKenBurnsAnimation()
        setKenBurnsAnimation(newAnimation)
      } else {
        setKenBurnsAnimation(null)
      }
    }
    
    // Handle media loading based on type
    if (isNewPhoto) {
      if (photo.type === 'VIDEO') {
        // Videos need authentication but aren't cached
        setCurrentImageLoaded(false)
        const loadVideo = async () => {
          try {
            const blob = await photoSourceManager.getPhotoBlob(photo.source, photo.url)
            const objectUrl = URL.createObjectURL(blob)
            setCurrentImageSrc(objectUrl)
            setCurrentImageLoaded(true)
          } catch (error) {
            console.error('Failed to load video:', photo.id, error)
            // Fallback to direct URL (may not work for authenticated sources)
            setCurrentImageSrc(photo.url)
            setCurrentImageLoaded(true)
          }
        }
        loadVideo()
        
        // For dissolve transition with previous photo
        if (transition === 'dissolve' && previousImageSrc && previousPhotoId && previousPhotoId !== photo.id) {
          setIsTransitioning(true)
          setTimeout(() => {
            setIsTransitioning(false)
            if (previousImageSrc && previousImageSrc.startsWith('blob:')) {
              URL.revokeObjectURL(previousImageSrc)
            }
            setPreviousImageSrc('')
            setPreviousPhotoId('')
          }, 1500)
        } else {
          setPreviousImageSrc('')
          setPreviousPhotoId('')
        }
      } else {
        // Images use cache system
        const cachedUrl = getCachedPhotoUrl?.(photo.id)
        
        if (cachedUrl) {
          setCurrentImageSrc(cachedUrl)
          setCurrentImageLoaded(true)
          
          // Trigger transition logic for dissolve if we have a previous photo
          if (transition === 'dissolve' && previousImageSrc && previousPhotoId && previousPhotoId !== photo.id) {
            setIsTransitioning(true)
            setTimeout(() => {
              setIsTransitioning(false)
              if (previousImageSrc && previousImageSrc.startsWith('blob:')) {
                const isStillInUse = getCachedPhotoUrl?.(previousPhotoId) === previousImageSrc
                if (!isStillInUse) {
                  URL.revokeObjectURL(previousImageSrc)
                }
              }
              setPreviousImageSrc('')
              setPreviousPhotoId('')
            }, 1500)
          } else {
            setPreviousImageSrc('')
            setPreviousPhotoId('')
          }
        } else {
          // Image not yet loaded by cache system, show loading state
          setCurrentImageSrc('')
          setCurrentImageLoaded(false)
        }
      }
    }
    
    // Cleanup object URL when component unmounts
    return () => {
      // Don't cleanup here during transitions, handle in transition completion
    }
  }, [photo.id, photo.url, photo.source, transition, getCachedPhotoUrl, currentPhotoId])

  // Handle video pause/resume when app visibility changes
  useEffect(() => {
    if (photo.type === 'VIDEO') {
      if (isPaused) {
        // Pause video
        if (videoRef.current && !videoRef.current.paused) {
          videoRef.current.pause()
        }
        if (previousVideoRef.current && !previousVideoRef.current.paused) {
          previousVideoRef.current.pause()
        }
      } else {
        // Resume video if it was previously playing
        if (videoRef.current && videoRef.current.paused && currentImageLoaded) {
          videoRef.current.play().catch(e => console.warn('Video resume failed:', e))
        }
        if (previousVideoRef.current && previousVideoRef.current.paused) {
          previousVideoRef.current.play().catch(e => console.warn('Previous video resume failed:', e))
        }
      }
    }
  }, [isPaused, photo.type, currentImageLoaded])

  const handleCurrentImageLoad = () => {
    
    // Only update loaded state if not already loaded (for non-preloaded images)
    if (!currentImageLoaded) {
      setCurrentImageLoaded(true)
      startTransitionIfNeeded()
    }
  }
  
  const handleVideoCanPlay = () => {
    if (!currentImageLoaded) {
      setCurrentImageLoaded(true)
      startTransitionIfNeeded()
      // Auto-play video only if not paused
      if (videoRef.current && !isPaused) {
        videoRef.current.play().catch(e => console.warn('Video autoplay failed:', e))
        
        // Set up duration limit if needed
        if (videoPlayback === 'duration' && onVideoEnd) {
          setTimeout(() => {
            onVideoEnd()
          }, slideshowInterval * 1000)
        }
      }
    }
  }
  
  const handleVideoEnded = () => {
    if (videoPlayback === 'full' && onVideoEnd) {
      onVideoEnd()
    }
  }
  
  const startTransitionIfNeeded = () => {
    if (transition === 'dissolve' && previousImageSrc && previousPhotoId && previousPhotoId !== currentPhotoId) {
      // Start dissolve transition immediately when new media is ready
      setIsTransitioning(true)
      
      // End transition after animation completes
      setTimeout(() => {
        setIsTransitioning(false)
        // Clean up previous media
        if (previousImageSrc && previousImageSrc.startsWith('blob:')) {
          URL.revokeObjectURL(previousImageSrc)
        }
        setPreviousImageSrc('')
        setPreviousPhotoId('')
      }, 1500) // Match dissolve animation duration
    } else {
      // No previous photo or same photo, clear without transition
      setPreviousImageSrc('')
      setPreviousPhotoId('')
    }
  }
  
  const handleImageError = (error: any) => {
    console.error('Image failed to load:', currentImageSrc, error)
  }

  const getCurrentImageClass = () => {
    if (transition === 'dissolve') {
      if (!currentImageLoaded) return 'opacity-0'
      // Only animate dissolve if we have a different previous photo
      if (isTransitioning && previousPhotoId && previousPhotoId !== currentPhotoId) {
        return 'animate-dissolve'
      }
      return 'opacity-100'
    }
    
    if (!currentImageLoaded) return 'opacity-0'
    
    switch (transition) {
      case 'fade':
        return 'animate-fade-in'
      case 'slide':
        return 'animate-slide-left'
      case 'ken-burns':
        // Ken Burns only for photos, not videos
        return photo.type === 'VIDEO' ? 'opacity-100' : 'ken-burns-animate'
      default:
        return 'opacity-100'
    }
  }
  
  const getPreviousImageClass = () => {
    if (transition === 'dissolve' && previousImageSrc && previousPhotoId) {
      // Only show and animate previous image if it's a different photo
      if (previousPhotoId !== currentPhotoId) {
        return isTransitioning ? 'animate-dissolve-out' : 'opacity-100'
      }
    }
    return 'opacity-0'
  }

  const isPortrait = photo.metadata?.dimensions 
    ? photo.metadata.dimensions.height > photo.metadata.dimensions.width
    : false
    
  const isLandscape = photo.metadata?.dimensions 
    ? photo.metadata.dimensions.width > photo.metadata.dimensions.height
    : false
    
  // Use object-cover for landscape photos to fill screen, object-contain for portrait
  const imageObjectFit = isLandscape ? 'object-cover' : 'object-contain'
  
  // Generate Ken Burns CSS custom properties (only for photos, not videos)
  const getKenBurnsStyle = () => {
    if (transition !== 'ken-burns' || !kenBurnsAnimation || photo.type === 'VIDEO') {
      return {}
    }
    
    const { scale, translate } = kenBurnsAnimation
    return {
      '--ken-burns-scale-start': scale.start,
      '--ken-burns-scale-end': scale.end,
      '--ken-burns-translate-x-start': `${translate.start.x}%`,
      '--ken-burns-translate-y-start': `${translate.start.y}%`,
      '--ken-burns-translate-x-end': `${translate.end.x}%`,
      '--ken-burns-translate-y-end': `${translate.end.y}%`,
      '--slideshow-duration': `${slideshowInterval}s`
    } as React.CSSProperties
  }
  
  // Helper function to render media (image or video)
  const renderMedia = (src: string, isVideo: boolean, isPrevious: boolean = false, className: string = '') => {
    const kenBurnsStyle = !isPrevious ? getKenBurnsStyle() : {}
    
    // Generate unique key for Ken Burns animation restart
    const elementKey = !isPrevious && transition === 'ken-burns' && kenBurnsAnimation 
      ? kenBurnsAnimation.key 
      : undefined
    
    if (isVideo) {
      return (
        <video
          key={elementKey} // Force re-render for animation restart
          ref={isPrevious ? previousVideoRef : videoRef}
          src={src}
          className={`photo-image w-full h-full ${imageObjectFit} ${className}`}
          style={kenBurnsStyle}
          onCanPlay={isPrevious ? undefined : handleVideoCanPlay}
          onEnded={isPrevious ? undefined : handleVideoEnded}
          onError={handleImageError}
          autoPlay
          muted={videoMuted}
          loop={videoPlayback === 'duration'} // Only loop if duration limited
          controls={false}
          playsInline
        />
      )
    } else {
      return (
        <img
          key={elementKey} // Force re-render for animation restart
          src={src}
          alt={isPrevious ? 'Previous photo' : (photo.metadata?.title || 'Photo')}
          className={`photo-image w-full h-full ${imageObjectFit} ${className}`}
          style={kenBurnsStyle}
          onLoad={isPrevious ? undefined : handleCurrentImageLoad}
          onError={handleImageError}
        />
      )
    }
  }

  if (settings.layout.portraitBlurredBackground && isPortrait) {
    return (
      <div className="photo-display relative">
        {/* Blurred background */}
        <div 
          className="absolute inset-0 bg-cover bg-center filter blur-lg scale-110"
          style={{ backgroundImage: `url(${currentImageSrc})` }}
        />
        
        {/* Previous media (for dissolve transition) */}
        {previousImageSrc && transition === 'dissolve' && previousPhotoId && previousPhotoId !== currentPhotoId && (
          <div className="absolute inset-0 z-10">
            {renderMedia(previousImageSrc, photo.type === 'VIDEO', true, getPreviousImageClass())}
          </div>
        )}
        
        {/* Current media */}
        <div className="absolute inset-0 z-20">
          {currentImageSrc && renderMedia(currentImageSrc, photo.type === 'VIDEO', false, getCurrentImageClass())}
        </div>
      </div>
    )
  }

  // Default single photo display
  return (
    <div className="photo-display relative">
      {/* Previous media (for dissolve transition) */}
      {previousImageSrc && transition === 'dissolve' && previousPhotoId && previousPhotoId !== currentPhotoId && (
        renderMedia(previousImageSrc, photo.type === 'VIDEO', true, `absolute inset-0 ${getPreviousImageClass()}`)
      )}
      
      {/* Current media */}
      {currentImageSrc && renderMedia(currentImageSrc, photo.type === 'VIDEO', false, `absolute inset-0 ${getCurrentImageClass()}`)}
    </div>
  )
}