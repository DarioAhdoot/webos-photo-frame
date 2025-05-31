import { useState, useEffect } from 'react'
import { photoSourceManager } from '../services/PhotoSourceManager'
import type { Photo } from '../types'

interface PhotoDisplayProps {
  photo: Photo
  transition: 'fade' | 'slide' | 'dissolve' | 'none'
  layout: 'single' | 'dual' | 'blurred-bg'
  getPreloadedImageUrl?: (photoId: string) => string | null
}

export default function PhotoDisplay({ photo, transition, layout, getPreloadedImageUrl }: PhotoDisplayProps) {
  const [currentImageSrc, setCurrentImageSrc] = useState<string>('')
  const [previousImageSrc, setPreviousImageSrc] = useState<string>('')
  const [currentImageLoaded, setCurrentImageLoaded] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [currentPhotoId, setCurrentPhotoId] = useState<string>('')
  const [previousPhotoId, setPreviousPhotoId] = useState<string>('')
  
  console.log('PhotoDisplay render:', {
    photoId: photo.id,
    photoUrl: photo.url,
    currentImageSrc,
    currentImageLoaded,
    layout,
    isTransitioning
  })

  useEffect(() => {
    // Track photo changes (not just URL changes)
    const isNewPhoto = photo.id !== currentPhotoId
    
    if (isNewPhoto) {
      console.log('Photo changed from', currentPhotoId, 'to', photo.id)
      
      // For dissolve transition, keep previous image and photo ID
      if (transition === 'dissolve' && currentImageSrc && currentPhotoId) {
        setPreviousImageSrc(currentImageSrc)
        setPreviousPhotoId(currentPhotoId)
      }
      
      setCurrentPhotoId(photo.id)
      setCurrentImageLoaded(false)
      setIsTransitioning(false) // Reset transition state
      setCurrentImageSrc('')
    }
    
    // Check if image is preloaded first
    if (isNewPhoto) {
      const preloadedUrl = getPreloadedImageUrl?.(photo.id)
      
      if (preloadedUrl) {
        console.log('Using preloaded image:', photo.id, preloadedUrl)
        setCurrentImageSrc(preloadedUrl)
        // Image is already loaded, so mark as loaded immediately
        setCurrentImageLoaded(true)
        
        // Trigger transition logic for dissolve if we have a previous photo
        if (transition === 'dissolve' && previousImageSrc && previousPhotoId && previousPhotoId !== photo.id) {
          console.log('Starting dissolve transition from', previousPhotoId, 'to', photo.id)
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
        // Fallback: Fetch image with authentication and create object URL
        const loadImage = async () => {
          try {
            console.log('Fetching image with auth (not preloaded):', photo.url)
            const blob = await photoSourceManager.getPhotoBlob(photo.source, photo.url)
            const objectUrl = URL.createObjectURL(blob)
            console.log('Created object URL:', objectUrl)
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
    
    // Cleanup object URL when component unmounts
    return () => {
      // Don't cleanup here during transitions, handle in transition completion
    }
  }, [photo.id, photo.url, photo.source, transition, getPreloadedImageUrl, currentPhotoId])

  const handleCurrentImageLoad = () => {
    console.log('Current image loaded successfully:', currentImageSrc)
    
    // Only update loaded state if not already loaded (for non-preloaded images)
    if (!currentImageLoaded) {
      setCurrentImageLoaded(true)
      
      if (transition === 'dissolve' && previousImageSrc && previousPhotoId && previousPhotoId !== currentPhotoId) {
        // Start dissolve transition immediately when new image is ready
        console.log('Starting dissolve transition (fallback load) from', previousPhotoId, 'to', currentPhotoId)
        setIsTransitioning(true)
        
        // End transition after animation completes
        setTimeout(() => {
          setIsTransitioning(false)
          // Clean up previous image
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

  if (layout === 'blurred-bg' && isPortrait) {
    return (
      <div className="photo-display relative">
        {/* Blurred background */}
        <div 
          className="absolute inset-0 bg-cover bg-center filter blur-lg scale-110"
          style={{ backgroundImage: `url(${currentImageSrc})` }}
        />
        
        {/* Previous image (for dissolve transition) */}
        {previousImageSrc && transition === 'dissolve' && previousPhotoId && previousPhotoId !== currentPhotoId && (
          <div className="absolute inset-0 z-10">
            <img
              src={previousImageSrc}
              alt="Previous photo"
              className={`photo-image w-full h-full ${imageObjectFit} ${getPreviousImageClass()}`}
            />
          </div>
        )}
        
        {/* Current photo */}
        <div className="absolute inset-0 z-20">
          <img
            src={currentImageSrc}
            alt={photo.metadata?.title || 'Photo'}
            className={`photo-image w-full h-full ${imageObjectFit} ${getCurrentImageClass()}`}
            onLoad={handleCurrentImageLoad}
            onError={handleImageError}
          />
        </div>
      </div>
    )
  }

  // TODO: Implement dual layout for portrait photos
  // For now, default to single photo display
  return (
    <div className="photo-display relative">
      {/* Previous image (for dissolve transition) */}
      {previousImageSrc && transition === 'dissolve' && previousPhotoId && previousPhotoId !== currentPhotoId && (
        <img
          src={previousImageSrc}
          alt="Previous photo"
          className={`photo-image absolute inset-0 w-full h-full ${imageObjectFit} ${getPreviousImageClass()}`}
        />
      )}
      
      {/* Current image */}
      <img
        src={currentImageSrc}
        alt={photo.metadata?.title || 'Photo'}
        className={`photo-image absolute inset-0 w-full h-full ${imageObjectFit} ${getCurrentImageClass()}`}
        onLoad={handleCurrentImageLoad}
        onError={handleImageError}
      />
    </div>
  )
}