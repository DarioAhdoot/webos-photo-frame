import type { Photo, PhotoSource } from '../types'

export interface PhotoSourceAPI {
  /**
   * Test connection to the photo source
   */
  testConnection(): Promise<boolean>

  /**
   * Get available albums from the source
   */
  getAlbums(): Promise<Album[]>

  /**
   * Get photos and videos from specified albums
   */
  getPhotos(albumIds?: string[], useOptimized?: boolean): Promise<Photo[]>

  /**
   * Get a specific photo or video by ID
   */
  getPhoto(photoId: string, useOptimized?: boolean): Promise<Photo | null>

  /**
   * Get photo blob for caching (only used for images, not videos)
   */
  getPhotoBlob(photoUrl: string): Promise<Blob>
}

export interface Album {
  id: string
  name: string
  description?: string
  photoCount: number // Includes both photos and videos
  thumbnailUrl?: string
}

export abstract class PhotoSourceBase implements PhotoSourceAPI {
  protected config: PhotoSource

  constructor(config: PhotoSource) {
    this.config = config
  }

  abstract testConnection(): Promise<boolean>
  abstract getAlbums(): Promise<Album[]>
  abstract getPhotos(albumIds?: string[], useOptimized?: boolean): Promise<Photo[]>
  abstract getPhoto(photoId: string, useOptimized?: boolean): Promise<Photo | null>

  async getPhotoBlob(photoUrl: string): Promise<Blob> {
    const response = await fetch(photoUrl)
    if (!response.ok) {
      throw new Error(`Failed to fetch photo: ${response.statusText}`)
    }
    return response.blob()
  }

  protected handleError(error: any, operation: string): never {
    console.error(`${this.config.type} ${operation} failed:`, error)
    throw new Error(`${this.config.name}: ${operation} failed - ${error.message}`)
  }
}