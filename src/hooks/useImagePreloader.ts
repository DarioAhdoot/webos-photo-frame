import { useState, useEffect, useRef } from 'react'
import { photoSourceManager } from '../services/PhotoSourceManager'
import type { Photo } from '../types'

interface PreloadedImage {
  photoId: string
  objectUrl: string
  blob: Blob
}

export function useImagePreloader(photos: Photo[], currentIndex: number, preloadCount = 3) {
  const [preloadedImages, setPreloadedImages] = useState<Map<string, PreloadedImage>>(new Map())
  const isPreloading = useRef(false)

  // Get the next photos to preload
  const getPhotosToPreload = (startIndex: number, count: number): Photo[] => {
    if (photos.length === 0) return []
    
    const photosToPreload: Photo[] = []
    for (let i = 0; i < count; i++) {
      const index = (startIndex + i) % photos.length
      const photo = photos[index]
      if (photo) {
        photosToPreload.push(photo)
      }
    }
    return photosToPreload
  }

  // Preload images in background
  useEffect(() => {
    if (photos.length === 0 || isPreloading.current) return

    const preloadImages = async () => {
      isPreloading.current = true
      
      try {
        // Get next few photos starting from current index
        const photosToPreload = getPhotosToPreload(currentIndex, preloadCount)
        
        // Only preload photos that aren't already cached
        const newPreloads = photosToPreload.filter(photo => 
          !preloadedImages.has(photo.id)
        )


        // Preload each image
        for (const photo of newPreloads) {
          try {
            const blob = await photoSourceManager.getPhotoBlob(photo.source, photo.url)
            const objectUrl = URL.createObjectURL(blob)
            
            setPreloadedImages(prev => new Map(prev).set(photo.id, {
              photoId: photo.id,
              objectUrl,
              blob
            }))
            
          } catch (error) {
            console.error('Failed to preload photo:', photo.id, error)
          }
        }

        // Clean up old preloaded images that are too far behind
        setPreloadedImages(prev => {
          const newMap = new Map(prev)
          const currentPhotoIds = new Set(photosToPreload.map(p => p.id))
          
          // Keep current photo and next few, remove others
          for (const [photoId, preloaded] of prev) {
            if (!currentPhotoIds.has(photoId)) {
              URL.revokeObjectURL(preloaded.objectUrl)
              newMap.delete(photoId)
            }
          }
          
          return newMap
        })

      } finally {
        isPreloading.current = false
      }
    }

    preloadImages()
  }, [currentIndex, photos, preloadCount])

  // Get preloaded image URL for a photo
  const getPreloadedImageUrl = (photoId: string): string | null => {
    const preloaded = preloadedImages.get(photoId)
    return preloaded ? preloaded.objectUrl : null
  }

  // Check if a photo is preloaded (not currently used but might be useful later)
  const isPhotoPreloaded = (photoId: string): boolean => {
    return preloadedImages.has(photoId)
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      preloadedImages.forEach(preloaded => {
        URL.revokeObjectURL(preloaded.objectUrl)
      })
    }
  }, [])

  return {
    getPreloadedImageUrl,
    isPhotoPreloaded,
    preloadedCount: preloadedImages.size
  }
}