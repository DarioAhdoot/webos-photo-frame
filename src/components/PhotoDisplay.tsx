import { useEffect, useRef, useState } from 'react'
import { photoSourceManager } from '../services/PhotoSourceManager'
import type { Photo } from '../types'

interface PhotoDisplayProps {
  photo: Photo
  transition: 'fade' | 'slide' | 'dissolve' | 'none' | 'ken-burns'
  layout: 'single' | 'dual' | 'blurred-bg'
  getPreloadedImageUrl?: (photoId: string) => string | null
  onVideoEnd?: () => void
  videoPlayback?: 'full' | 'duration'
  videoMuted?: boolean
  slideshowInterval?: number
}

export default function PhotoDisplay({ photo, transition, layout, getPreloadedImageUrl, onVideoEnd, videoPlayback, videoMuted = true, slideshowInterval = 10 }: PhotoDisplayProps) {
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
    
    // Check if image is preloaded first (only for images, not videos)
    if (isNewPhoto) {
      const preloadedUrl = photo.type !== 'VIDEO' ? getPreloadedImageUrl?.(photo.id) : null
      
      if (preloadedUrl && photo.type !== 'VIDEO') {
        setCurrentImageSrc(preloadedUrl)
        // Image is already loaded, so mark as loaded immediately
        setCurrentImageLoaded(true)
        
        // Trigger transition logic for dissolve if we have a previous photo
        if (transition === 'dissolve' && previousImageSrc && previousPhotoId && previousPhotoId !== photo.id) {
          setIsTransitioning(true)
          setTimeout(() => {
            setIsTransitioning(false)
            if (previousImageSrc && previousImageSrc.startsWith('blob:')) {
              // Don't revoke if it's still being used elsewhere
              const isStillInUse = getPreloadedImageUrl?.(previousPhotoId) === previousImageSrc
              if (!isStillInUse) {
                URL.revokeObjectURL(previousImageSrc)
              }
            }
            setPreviousImageSrc('')
            setPreviousPhotoId('')
          }, 1500)
        } else {
          // No previous photo or same photo, clear without transition
          setPreviousImageSrc('')
          setPreviousPhotoId('')
        }
      } else {
        // For videos, stream directly without preloading. For images, fetch with auth
        if (photo.type === 'VIDEO') {
          setCurrentImageSrc(photo.url)
        } else {
          // Fallback: Fetch image with authentication and create object URL
          const loadImage = async () => {
            try {
              const blob = await photoSourceManager.getPhotoBlob(photo.source, photo.url)
              const objectUrl = URL.createObjectURL(blob)
              setCurrentImageSrc(objectUrl)
            } catch (error) {
              console.error('Failed to load image:', error)
              // Fallback to direct URL (might not work but worth trying)
              setCurrentImageSrc(photo.url)
            }
          }
          
          loadImage()
        }
      }
    }
    
    // Cleanup object URL when component unmounts
    return () => {
      // Don't cleanup here during transitions, handle in transition completion
    }
  }, [photo.id, photo.url, photo.source, transition, getPreloadedImageUrl, currentPhotoId])

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
      // Auto-play video
      if (videoRef.current) {
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

  if (layout === 'blurred-bg' && isPortrait) {
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
          {renderMedia(currentImageSrc, photo.type === 'VIDEO', false, getCurrentImageClass())}
        </div>
      </div>
    )
  }

  // TODO: Implement dual layout for portrait photos
  // For now, default to single photo display
  return (
    <div className="photo-display relative">
      {/* Previous media (for dissolve transition) */}
      {previousImageSrc && transition === 'dissolve' && previousPhotoId && previousPhotoId !== currentPhotoId && (
        renderMedia(previousImageSrc, photo.type === 'VIDEO', true, `absolute inset-0 ${getPreviousImageClass()}`)
      )}
      
      {/* Current media */}
      {renderMedia(currentImageSrc, photo.type === 'VIDEO', false, `absolute inset-0 ${getCurrentImageClass()}`)}
    </div>
  )
}