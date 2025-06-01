import { useState, useEffect, useRef } from 'react'
import { photoCacheManager } from '../services/PhotoCacheManager'
import { photoSourceManager } from '../services/PhotoSourceManager'
import type { Photo } from '../types'

interface CachedPhotoData {
  photoId: string
  objectUrl: string
  blob: Blob
}

export function useCachedPhotoLoader(photos: Photo[], currentIndex: number, preloadCount = 3) {
  const [cachedPhotos, setCachedPhotos] = useState<Map<string, CachedPhotoData>>(new Map())
  const [isOffline, setIsOffline] = useState(false)
  const isLoading = useRef(false)

  // Get the next photos to preload/cache
  const getPhotosToProcess = (startIndex: number, count: number): Photo[] => {
    if (photos.length === 0) return []
    
    const photosToProcess: Photo[] = []
    for (let i = 0; i < count; i++) {
      const index = (startIndex + i) % photos.length
      const photo = photos[index]
      if (photo) {
        photosToProcess.push(photo)
      }
    }
    return photosToProcess
  }

  // Load and cache photos
  useEffect(() => {
    if (photos.length === 0 || isLoading.current) return

    const loadPhotos = async () => {
      isLoading.current = true
      
      try {
        // Get photos to process (current + preload ahead)
        const photosToProcess = getPhotosToProcess(currentIndex, preloadCount)
        
        // Check which photos need loading
        const photosToLoad = photosToProcess.filter(photo => 
          !cachedPhotos.has(photo.id)
        )

        // Load each photo (skip videos entirely)
        for (const photo of photosToLoad) {
          try {
            // Skip videos completely - they don't use the cache system
            if (photo.type === 'VIDEO') {
              continue
            }

            // First check if already cached in IndexedDB (images only)
            let cachedPhoto = await photoCacheManager.getCachedPhoto(photo.id)
            let objectUrl: string
            let blob: Blob

            if (cachedPhoto) {
              // Use cached version
              blob = cachedPhoto.blob
              objectUrl = URL.createObjectURL(blob)
            } else {
              // Load from source and cache it (images only)
              try {
                blob = await photoSourceManager.getPhotoBlob(photo.source, photo.url)
                objectUrl = URL.createObjectURL(blob)
                
                // Cache the photo for future use (don't wait for this)
                photoCacheManager.cachePhoto(photo, blob).catch(error => {
                  console.warn('Failed to cache photo:', photo.id, error)
                })
                
                setIsOffline(false) // Successfully loaded from source
              } catch (error) {
                console.error('Failed to load photo from source:', photo.id, error)
                
                // Try cached version as fallback
                cachedPhoto = await photoCacheManager.getCachedPhoto(photo.id)
                if (cachedPhoto) {
                  blob = cachedPhoto.blob
                  objectUrl = URL.createObjectURL(blob)
                  setIsOffline(true) // Using cached version indicates offline
                } else {
                  // No cached version available, skip this photo
                  console.warn('Photo not available offline:', photo.id)
                  continue
                }
              }
            }
            
            setCachedPhotos(prev => new Map(prev).set(photo.id, {
              photoId: photo.id,
              objectUrl,
              blob
            }))
            
          } catch (error) {
            console.error('Failed to process photo:', photo.id, error)
          }
        }

        // Clean up old cached photos that are too far behind
        setCachedPhotos(prev => {
          const newMap = new Map(prev)
          const currentPhotoIds = new Set(photosToProcess.map(p => p.id))
          
          // Keep current + preload photos, remove others
          for (const [photoId, cachedData] of prev) {
            if (!currentPhotoIds.has(photoId)) {
              URL.revokeObjectURL(cachedData.objectUrl)
              newMap.delete(photoId)
            }
          }
          
          return newMap
        })

      } finally {
        isLoading.current = false
      }
    }

    loadPhotos()
  }, [currentIndex, photos, preloadCount])

  // Get cached photo URL for display
  const getCachedPhotoUrl = (photoId: string): string | null => {
    const cached = cachedPhotos.get(photoId)
    return cached ? cached.objectUrl : null
  }

  // Check if a photo is cached and ready
  const isPhotoCached = (photoId: string): boolean => {
    return cachedPhotos.has(photoId)
  }

  // Get current photo data for immediate display
  const getCurrentPhotoData = (): CachedPhotoData | null => {
    if (photos.length === 0) return null
    const currentPhoto = photos[currentIndex]
    return currentPhoto ? cachedPhotos.get(currentPhoto.id) || null : null
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cachedPhotos.forEach(cachedData => {
        URL.revokeObjectURL(cachedData.objectUrl)
      })
    }
  }, [])

  // Preload current photo immediately when it changes
  useEffect(() => {
    if (photos.length === 0) return
    
    const currentPhoto = photos[currentIndex]
    if (currentPhoto && !cachedPhotos.has(currentPhoto.id)) {
      // Trigger immediate load for current photo
      const loadCurrent = async () => {
        try {
          // Skip videos completely - they don't use the cache system
          if (currentPhoto.type === 'VIDEO') {
            return
          }

          // Handle images only
          let cachedPhoto = await photoCacheManager.getCachedPhoto(currentPhoto.id)
          let objectUrl: string
          let blob: Blob

          if (cachedPhoto) {
            blob = cachedPhoto.blob
            objectUrl = URL.createObjectURL(blob)
          } else {
            try {
              blob = await photoSourceManager.getPhotoBlob(currentPhoto.source, currentPhoto.url)
              objectUrl = URL.createObjectURL(blob)
              
              // Cache for future use (images only)
              photoCacheManager.cachePhoto(currentPhoto, blob).catch(error => {
                console.warn('Failed to cache current photo:', currentPhoto.id, error)
              })
            } catch (error) {
              // Try cached version
              cachedPhoto = await photoCacheManager.getCachedPhoto(currentPhoto.id)
              if (cachedPhoto) {
                blob = cachedPhoto.blob
                objectUrl = URL.createObjectURL(blob)
                setIsOffline(true)
              } else {
                throw error
              }
            }
          }
          
          setCachedPhotos(prev => new Map(prev).set(currentPhoto.id, {
            photoId: currentPhoto.id,
            objectUrl,
            blob
          }))
          
        } catch (error) {
          console.error('Failed to load current photo:', currentPhoto.id, error)
        }
      }
      
      loadCurrent()
    }
  }, [currentIndex, photos])

  return {
    getCachedPhotoUrl,
    isPhotoCached,
    getCurrentPhotoData,
    cachedCount: cachedPhotos.size,
    isOffline
  }
}