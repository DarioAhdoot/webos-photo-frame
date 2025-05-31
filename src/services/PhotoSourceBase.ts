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
   * Get photos from specified albums
   */
  getPhotos(albumIds?: string[]): Promise<Photo[]>

  /**
   * Get a specific photo by ID
   */
  getPhoto(photoId: string): Promise<Photo | null>

  /**
   * Get photo blob for caching
   */
  getPhotoBlob(photoUrl: string): Promise<Blob>
}

export interface Album {
  id: string
  name: string
  description?: string
  photoCount: number
  thumbnailUrl?: string
}

export abstract class PhotoSourceBase implements PhotoSourceAPI {
  protected config: PhotoSource

  constructor(config: PhotoSource) {
    this.config = config
  }

  abstract testConnection(): Promise<boolean>
  abstract getAlbums(): Promise<Album[]>
  abstract getPhotos(albumIds?: string[]): Promise<Photo[]>
  abstract getPhoto(photoId: string): Promise<Photo | null>

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