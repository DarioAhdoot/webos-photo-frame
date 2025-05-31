import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { photoCacheManager } from '../services/PhotoCacheManager'
import { photoSourceManager } from '../services/PhotoSourceManager'
import { useSettingsStore } from '../stores/settingsStore'
import type { Photo } from '../types'

export function usePhotoCache() {
  const { settings } = useSettingsStore()
  const queryClient = useQueryClient()

  // Initialize cache manager with current settings
  useEffect(() => {
    photoCacheManager.init(settings.cache.maxSizeMB)
  }, [settings.cache.maxSizeMB])

  // Update cache size when settings change
  useEffect(() => {
    photoCacheManager.updateMaxSize(settings.cache.maxSizeMB)
  }, [settings.cache.maxSizeMB])

  // Query to get cache info
  const useCacheInfo = () => {
    return useQuery({
      queryKey: ['cache-info'],
      queryFn: () => photoCacheManager.getCacheInfo(),
      refetchInterval: 30000, // Refresh every 30 seconds
    })
  }

  // Query to get cached photo
  const useCachedPhoto = (photoId: string) => {
    return useQuery({
      queryKey: ['cached-photo', photoId],
      queryFn: () => photoCacheManager.getCachedPhoto(photoId),
      staleTime: Infinity, // Cached photos don't become stale
    })
  }

  // Mutation to cache a photo
  const useCachePhoto = () => {
    return useMutation({
      mutationFn: async ({ photo, sourceId }: { photo: Photo; sourceId: string }) => {
        const blob = await photoSourceManager.getPhotoBlob(sourceId, photo.url)
        await photoCacheManager.cachePhoto(photo, blob)
        return blob
      },
      onSuccess: (_, { photo }) => {
        // Invalidate related queries
        queryClient.invalidateQueries({ queryKey: ['cache-info'] })
        queryClient.invalidateQueries({ queryKey: ['cached-photo', photo.id] })
      },
    })
  }

  // Mutation to clear entire cache
  const useClearCache = () => {
    return useMutation({
      mutationFn: () => photoCacheManager.clearCache(),
      onSuccess: () => {
        // Invalidate all cache-related queries
        queryClient.invalidateQueries({ queryKey: ['cache-info'] })
        queryClient.invalidateQueries({ queryKey: ['cached-photo'] })
      },
    })
  }

  // Mutation to remove specific cached photo
  const useRemoveCachedPhoto = () => {
    return useMutation({
      mutationFn: (photoId: string) => photoCacheManager.removeCachedPhoto(photoId),
      onSuccess: (_, photoId) => {
        queryClient.invalidateQueries({ queryKey: ['cache-info'] })
        queryClient.invalidateQueries({ queryKey: ['cached-photo', photoId] })
      },
    })
  }

  // Hook to get optimized photo URL (cached if available, otherwise original)
  const usePhotoUrl = (photo: Photo) => {
    return useQuery({
      queryKey: ['photo-url', photo.id],
      queryFn: () => photoCacheManager.getPhotoUrl(photo),
      staleTime: 5 * 60 * 1000, // 5 minutes
    })
  }

  // Hook to preload/cache multiple photos in background
  const usePreloadPhotos = () => {
    return useMutation({
      mutationFn: async (photos: Photo[]) => {
        const cachePromises = photos.map(async (photo) => {
          try {
            const blob = await photoSourceManager.getPhotoBlob(photo.source, photo.url)
            await photoCacheManager.cachePhoto(photo, blob)
          } catch (error) {
            console.warn(`Failed to cache photo ${photo.id}:`, error)
          }
        })
        
        await Promise.allSettled(cachePromises)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['cache-info'] })
      },
    })
  }

  return {
    useCacheInfo,
    useCachedPhoto,
    useCachePhoto,
    useClearCache,
    useRemoveCachedPhoto,
    usePhotoUrl,
    usePreloadPhotos,
  }
}

// Individual hook exports for easier usage
export function useCacheInfo() {
  const { useCacheInfo } = usePhotoCache()
  return useCacheInfo()
}

export function useCachedPhoto(photoId: string) {
  const { useCachedPhoto } = usePhotoCache()
  return useCachedPhoto(photoId)
}

export function usePhotoUrl(photo: Photo) {
  const { usePhotoUrl } = usePhotoCache()
  return usePhotoUrl(photo)
}