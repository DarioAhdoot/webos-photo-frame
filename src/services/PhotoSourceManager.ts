import type { Photo, PhotoSource } from '../types'
import { ImmichPhotoSource } from './ImmichPhotoSource'
import type { Album, PhotoSourceAPI } from './PhotoSourceBase'
import { connectionDetectionService } from './ConnectionDetectionService'
import { photoCacheManager } from './PhotoCacheManager'

export class PhotoSourceManager {
  private sources: Map<string, PhotoSourceAPI> = new Map()
  private isMonitoring: boolean = false

  constructor() {
    // Listen for connection status changes
    connectionDetectionService.addListener((sourceId, isOnline) => {
      console.log(`Photo source ${sourceId} is now ${isOnline ? 'online' : 'offline'}`)
    })
  }

  /**
   * Register a photo source
   */
  registerSource(config: PhotoSource): void {
    let sourceInstance: PhotoSourceAPI

    switch (config.type) {
      case 'immich':
        sourceInstance = new ImmichPhotoSource(config)
        break
      case 'local':
        // TODO: Implement local file source
        throw new Error('Local file source not yet implemented')
      default:
        throw new Error(`Unknown source type: ${config.type}`)
    }

    this.sources.set(config.id, sourceInstance)
    
    // Register with connection detection service
    connectionDetectionService.registerSource(config.id)
    
    // Start monitoring if not already started
    if (!this.isMonitoring) {
      connectionDetectionService.startMonitoring()
      this.isMonitoring = true
    }
  }

  /**
   * Remove a photo source
   */
  removeSource(sourceId: string): void {
    this.sources.delete(sourceId)
    
    // Unregister from connection detection and remove cached photos
    connectionDetectionService.unregisterSource(sourceId)
    photoCacheManager.removeCacheBySource(sourceId).catch(error => {
      console.error(`Failed to remove cache for source ${sourceId}:`, error)
    })
  }

  /**
   * Test connection for a specific source
   */
  async testSource(sourceId: string): Promise<boolean> {
    const source = this.sources.get(sourceId)
    if (!source) {
      throw new Error(`Source ${sourceId} not found`)
    }
    
    try {
      const result = await source.testConnection()
      connectionDetectionService.handleHttpResponse(sourceId, { ok: result } as Response)
      return result
    } catch (error) {
      connectionDetectionService.handleFetchError(sourceId, error)
      return false
    }
  }

  /**
   * Get albums from a specific source
   */
  async getAlbums(sourceId: string): Promise<Album[]> {
    const source = this.sources.get(sourceId)
    if (!source) {
      throw new Error(`Source ${sourceId} not found`)
    }
    
    try {
      const albums = await source.getAlbums()
      connectionDetectionService.handleHttpResponse(sourceId, { ok: true } as Response)
      return albums
    } catch (error) {
      const isConnectionError = connectionDetectionService.handleFetchError(sourceId, error)
      if (isConnectionError) {
        // Could potentially return cached album list here in the future
        throw new Error(`Source ${sourceId} is offline`)
      }
      throw error
    }
  }

  /**
   * Get photos from all enabled sources with offline fallback
   */
  async getAllPhotos(enabledSources: PhotoSource[], useOptimized: boolean = true, includeVideos: boolean = true): Promise<Photo[]> {
    const allPhotos: Photo[] = []
    const offlineSources: string[] = []

    for (const sourceConfig of enabledSources.filter(s => s.enabled)) {
      try {
        const source = this.sources.get(sourceConfig.id)
        if (!source) {
          console.warn(`Source ${sourceConfig.id} not registered, skipping`)
          continue
        }

        // Check if source is known to be offline
        const isOnline = connectionDetectionService.getSourceStatus(sourceConfig.id)
        if (!isOnline && !connectionDetectionService.isNetworkOnline()) {
          console.log(`Source ${sourceConfig.name} is offline, will try cache fallback`)
          offlineSources.push(sourceConfig.id)
          continue
        }

        const albumIds = sourceConfig.type === 'immich' 
          ? sourceConfig.config.albumIds 
          : undefined

        const photos = await source.getPhotos(albumIds, useOptimized)
        
        // Mark source as online
        connectionDetectionService.handleHttpResponse(sourceConfig.id, { ok: true } as Response)
        
        // Filter out videos if not enabled
        const filteredPhotos = includeVideos 
          ? photos 
          : photos.filter(photo => photo.type !== 'VIDEO')
        
        allPhotos.push(...filteredPhotos)
      } catch (error) {
        console.error(`Failed to get photos from ${sourceConfig.name}:`, error)
        
        // Handle connection error
        const isConnectionError = connectionDetectionService.handleFetchError(sourceConfig.id, error)
        if (isConnectionError) {
          offlineSources.push(sourceConfig.id)
        }
        // Continue with other sources even if one fails
      }
    }

    // If we have offline sources and no online photos, try to get cached photos
    if (allPhotos.length === 0 && offlineSources.length > 0) {
      console.log('All sources offline, attempting to use cached photos')
      return this.getCachedPhotos()
    }

    return allPhotos
  }

  /**
   * Get photo blob with caching and offline fallback
   */
  async getPhotoBlob(sourceId: string, photoUrl: string): Promise<Blob> {
    const source = this.sources.get(sourceId)
    if (!source) {
      throw new Error(`Source ${sourceId} not found`)
    }
    
    try {
      const blob = await source.getPhotoBlob(photoUrl)
      connectionDetectionService.handleHttpResponse(sourceId, { ok: true } as Response)
      return blob
    } catch (error) {
      const isConnectionError = connectionDetectionService.handleFetchError(sourceId, error)
      if (isConnectionError) {
        throw new Error(`Source ${sourceId} is offline and photo not cached`)
      }
      throw error
    }
  }

  /**
   * Get cached photos for offline fallback
   */
  private async getCachedPhotos(): Promise<Photo[]> {
    try {
      // Get all cached photos from IndexedDB
      const cachedPhotos = await photoCacheManager.getAllCachedPhotos()
      
      // Convert cached photos back to Photo objects (only images are cached)
      const photos: Photo[] = cachedPhotos.map(cached => ({
        id: cached.id,
        url: cached.url,
        thumbnailUrl: cached.thumbnailUrl,
        metadata: cached.metadata,
        source: cached.source,
        albumId: cached.albumId,
        type: cached.type,
        duration: cached.duration
      }))
      
      // Note: Only images are cached, so no videos will be in this list
      // Videos are not available in offline mode
      const filteredPhotos = photos.filter(photo => photo.type !== 'VIDEO')
      
      console.log(`Loaded ${filteredPhotos.length} cached photos for offline use`)
      return filteredPhotos
    } catch (error) {
      console.error('Failed to get cached photos:', error)
      return []
    }
  }

  /**
   * Check if any sources are offline
   */
  hasOfflineSources(enabledSources: PhotoSource[]): boolean {
    return enabledSources.some(source => 
      !connectionDetectionService.getSourceStatus(source.id)
    )
  }

  /**
   * Get offline source names for display
   */
  getOfflineSourceNames(enabledSources: PhotoSource[]): string[] {
    return enabledSources
      .filter(source => !connectionDetectionService.getSourceStatus(source.id))
      .map(source => source.name)
  }

  /**
   * Clear all caches when photo sources change
   */
  async invalidateAllCaches(): Promise<void> {
    try {
      await photoCacheManager.invalidateCache()
      connectionDetectionService.clearAllStatus()
    } catch (error) {
      console.error('Failed to invalidate caches:', error)
    }
  }

  /**
   * Shuffle photos based on settings
   */
  shufflePhotos(photos: Photo[], order: 'random' | 'sequential'): Photo[] {
    if (order === 'random') {
      const shuffled = [...photos]
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        const temp = shuffled[i]!
        const other = shuffled[j]!
        shuffled[i] = other
        shuffled[j] = temp
      }
      return shuffled
    }
    return photos
  }
}

// Global instance
export const photoSourceManager = new PhotoSourceManager()