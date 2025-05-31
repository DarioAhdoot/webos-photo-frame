import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { photoSourceManager } from '../services/PhotoSourceManager'
import { useSettingsStore } from '../stores/settingsStore'
import { useAppStore } from '../stores/appStore'

export function usePhotoSources() {
  const { photoSources } = useSettingsStore()
  const { setPhotos, setLoading } = useAppStore()

  // Register all photo sources when they change
  useEffect(() => {
    photoSources.forEach(source => {
      try {
        photoSourceManager.registerSource(source)
      } catch (error) {
        console.error(`Failed to register source ${source.name}:`, error)
      }
    })
  }, [photoSources])

  // Query to test a specific source connection
  const useTestConnection = (sourceId: string) => {
    return useQuery({
      queryKey: ['test-connection', sourceId],
      queryFn: () => photoSourceManager.testSource(sourceId),
      enabled: false, // Manual trigger only
    })
  }

  // Query to get albums from a specific source
  const useAlbums = (sourceId: string, enabled = true) => {
    return useQuery({
      queryKey: ['albums', sourceId],
      queryFn: () => photoSourceManager.getAlbums(sourceId),
      enabled,
      staleTime: 5 * 60 * 1000, // 5 minutes
    })
  }

  // Query to get all photos from enabled sources
  const useAllPhotos = () => {
    const enabledSources = photoSources.filter(source => source.enabled)
    
    return useQuery({
      queryKey: ['all-photos', enabledSources.map(s => s.id).sort()],
      queryFn: async () => {
        setLoading(true)
        try {
          const photos = await photoSourceManager.getAllPhotos(enabledSources)
          const { settings } = useSettingsStore.getState()
          const shuffledPhotos = photoSourceManager.shufflePhotos(photos, settings.slideshow.order)
          setPhotos(shuffledPhotos)
          return shuffledPhotos
        } finally {
          setLoading(false)
        }
      },
      enabled: enabledSources.length > 0,
      staleTime: 10 * 60 * 1000, // 10 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes
    })
  }

  return {
    useTestConnection,
    useAlbums,
    useAllPhotos,
  }
}

// Individual hook functions for easier usage
export function useTestConnection(sourceId: string) {
  const { useTestConnection } = usePhotoSources()
  return useTestConnection(sourceId)
}

export function useAlbums(sourceId: string, enabled = true) {
  const { useAlbums } = usePhotoSources()
  return useAlbums(sourceId, enabled)
}

export function useAllPhotos() {
  const { useAllPhotos } = usePhotoSources()
  return useAllPhotos()
}