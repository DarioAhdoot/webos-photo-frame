import type { PhotoSource, Photo } from '../types'
import type { PhotoSourceAPI, Album } from './PhotoSourceBase'
import { ImmichPhotoSource } from './ImmichPhotoSource'

export class PhotoSourceManager {
  private sources: Map<string, PhotoSourceAPI> = new Map()

  /**
   * Register a photo source
   */
  registerSource(config: PhotoSource): void {
    let sourceInstance: PhotoSourceAPI

    switch (config.type) {
      case 'immich':
        sourceInstance = new ImmichPhotoSource(config)
        break
      case 'google-photos':
        // TODO: Implement Google Photos source
        throw new Error('Google Photos source not yet implemented')
      case 'local':
        // TODO: Implement local file source
        throw new Error('Local file source not yet implemented')
      default:
        throw new Error(`Unknown source type: ${config.type}`)
    }

    this.sources.set(config.id, sourceInstance)
  }

  /**
   * Remove a photo source
   */
  removeSource(sourceId: string): void {
    this.sources.delete(sourceId)
  }

  /**
   * Test connection for a specific source
   */
  async testSource(sourceId: string): Promise<boolean> {
    const source = this.sources.get(sourceId)
    if (!source) {
      throw new Error(`Source ${sourceId} not found`)
    }
    return source.testConnection()
  }

  /**
   * Get albums from a specific source
   */
  async getAlbums(sourceId: string): Promise<Album[]> {
    const source = this.sources.get(sourceId)
    if (!source) {
      throw new Error(`Source ${sourceId} not found`)
    }
    return source.getAlbums()
  }

  /**
   * Get photos from all enabled sources
   */
  async getAllPhotos(enabledSources: PhotoSource[], useOptimized: boolean = true): Promise<Photo[]> {
    const allPhotos: Photo[] = []

    for (const sourceConfig of enabledSources.filter(s => s.enabled)) {
      try {
        const source = this.sources.get(sourceConfig.id)
        if (!source) {
          console.warn(`Source ${sourceConfig.id} not registered, skipping`)
          continue
        }

        const albumIds = sourceConfig.type === 'immich' 
          ? sourceConfig.config.albumIds 
          : undefined

        const photos = await source.getPhotos(albumIds, useOptimized)
        allPhotos.push(...photos)
      } catch (error) {
        console.error(`Failed to get photos from ${sourceConfig.name}:`, error)
        // Continue with other sources even if one fails
      }
    }

    return allPhotos
  }

  /**
   * Get photo blob for caching
   */
  async getPhotoBlob(sourceId: string, photoUrl: string): Promise<Blob> {
    const source = this.sources.get(sourceId)
    if (!source) {
      throw new Error(`Source ${sourceId} not found`)
    }
    return source.getPhotoBlob(photoUrl)
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