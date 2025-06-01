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
    const { settings } = useSettingsStore()
    const { currentMode } = useAppStore()
    const enabledSources = photoSources.filter(source => source.enabled)
    
    // Safety check for network settings
    const refreshInterval = settings?.network?.refreshIntervalHours || 24
    const imageResolution = settings?.display?.imageResolution || 'optimized'
    const videoEnabled = settings?.slideshow?.videoEnabled ?? true
    
    // Create a more specific query key that includes album configurations
    const sourceConfigs = enabledSources.map(source => ({
      id: source.id,
      albumIds: source.config.albumIds || []
    })).sort((a, b) => a.id.localeCompare(b.id))
    
    return useQuery({
      queryKey: ['all-photos', sourceConfigs, imageResolution, videoEnabled],
      queryFn: async () => {
        setLoading(true)
        try {
          const { settings } = useSettingsStore.getState()
          const useOptimized = settings?.display?.imageResolution === 'optimized'
          const includeVideos = settings?.slideshow?.videoEnabled ?? true
          const photos = await photoSourceManager.getAllPhotos(enabledSources, useOptimized, includeVideos)
          const shuffledPhotos = photoSourceManager.shufflePhotos(photos, settings?.slideshow?.order || 'random')
          setPhotos(shuffledPhotos)
          return shuffledPhotos
        } finally {
          setLoading(false)
        }
      },
      enabled: enabledSources.length > 0,
      staleTime: refreshInterval * 60 * 60 * 1000, // Use configured refresh interval
      gcTime: 30 * 60 * 1000, // 30 minutes
      refetchInterval: currentMode === 'screensaver' ? refreshInterval * 60 * 60 * 1000 : false, // Pause auto-refresh in settings
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