import type { Photo, CachedPhoto } from '../types'

// Simplified cache manager using localStorage for metadata and simple object storage
export class PhotoCacheManager {
  private maxSizeMB: number = 100
  private cache: Map<string, CachedPhoto> = new Map()

  async init(maxSizeMB: number = 100): Promise<void> {
    this.maxSizeMB = maxSizeMB
    // For now, use in-memory cache
    // TODO: Implement proper IndexedDB when WebOS supports it better
  }

  async getCachedPhoto(photoId: string): Promise<CachedPhoto | null> {
    return this.cache.get(photoId) || null
  }

  async cachePhoto(photo: Photo, blob: Blob): Promise<void> {
    const size = blob.size
    const cachedPhoto: CachedPhoto = {
      id: photo.id,
      url: photo.url,
      thumbnailUrl: photo.thumbnailUrl,
      metadata: photo.metadata,
      source: photo.source,
      albumId: photo.albumId,
      cachedAt: Date.now(),
      size,
      blob,
    }

    // Check if we need to make space
    await this.ensureSpace(size)

    // Add the photo to cache
    this.cache.set(photo.id, cachedPhoto)
  }

  async getCacheInfo(): Promise<{ totalSize: number; photoCount: number; maxSizeMB: number }> {
    let totalSize = 0
    for (const cached of this.cache.values()) {
      totalSize += cached.size
    }

    return {
      totalSize,
      photoCount: this.cache.size,
      maxSizeMB: this.maxSizeMB,
    }
  }

  async clearCache(): Promise<void> {
    this.cache.clear()
  }

  async removeCachedPhoto(photoId: string): Promise<void> {
    this.cache.delete(photoId)
  }

  async updateMaxSize(newMaxSizeMB: number): Promise<void> {
    this.maxSizeMB = newMaxSizeMB
    await this.cleanup()
  }

  private async ensureSpace(newItemSize: number): Promise<void> {
    const maxSizeBytes = this.maxSizeMB * 1024 * 1024
    const currentInfo = await this.getCacheInfo()
    const spaceNeeded = newItemSize
    const availableSpace = maxSizeBytes - currentInfo.totalSize

    if (availableSpace >= spaceNeeded) {
      return // Enough space available
    }

    // Need to free up space - remove oldest items first
    const spaceToFree = spaceNeeded - availableSpace
    await this.freeSpace(spaceToFree)
  }

  private async freeSpace(bytesToFree: number): Promise<void> {
    // Get all photos sorted by cache time (oldest first)
    const photos = Array.from(this.cache.values()).sort((a, b) => a.cachedAt - b.cachedAt)
    
    let freedBytes = 0
    const photosToDelete: string[] = []

    for (const photo of photos) {
      if (freedBytes >= bytesToFree) break
      
      photosToDelete.push(photo.id)
      freedBytes += photo.size
    }

    // Delete the selected photos
    for (const photoId of photosToDelete) {
      this.cache.delete(photoId)
    }
  }

  private async cleanup(): Promise<void> {
    const maxSizeBytes = this.maxSizeMB * 1024 * 1024
    const currentInfo = await this.getCacheInfo()

    if (currentInfo.totalSize > maxSizeBytes) {
      const excessBytes = currentInfo.totalSize - maxSizeBytes
      await this.freeSpace(excessBytes)
    }
  }

  async getPhotoUrl(photo: Photo): Promise<string> {
    // First try to get from cache
    const cached = await this.getCachedPhoto(photo.id)
    if (cached) {
      return URL.createObjectURL(cached.blob)
    }

    // If not cached, return original URL
    return photo.url
  }
}

// Global instance
export const photoCacheManager = new PhotoCacheManager()