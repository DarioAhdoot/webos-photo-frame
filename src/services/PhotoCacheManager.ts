import type { Photo, CachedPhoto } from '../types'

interface CacheRecord {
  id: string
  url: string
  thumbnailUrl: string
  metadata?: any
  source: string
  albumId?: string
  type?: 'IMAGE' | 'VIDEO'
  duration?: string
  cachedAt: number
  size: number
  blob: Blob
  accessedAt: number // For FIFO cleanup
}

// IndexedDB-based cache manager for persistent photo storage
export class PhotoCacheManager {
  private maxSizeMB: number = 100
  private dbName = 'immich-photo-cache'
  private dbVersion = 1
  private storeName = 'photos'
  private db: IDBDatabase | null = null
  private initPromise: Promise<void> | null = null

  async init(maxSizeMB: number = 100): Promise<void> {
    if (this.initPromise) {
      return this.initPromise
    }

    this.initPromise = this._init(maxSizeMB)
    return this.initPromise
  }

  private async _init(maxSizeMB: number): Promise<void> {
    this.maxSizeMB = maxSizeMB
    
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion)
      
      request.onerror = () => {
        console.error('Failed to open IndexedDB:', request.error)
        reject(new Error('Failed to initialize photo cache'))
      }
      
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        
        // Create object store for photos
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' })
          store.createIndex('cachedAt', 'cachedAt', { unique: false })
          store.createIndex('accessedAt', 'accessedAt', { unique: false })
          store.createIndex('source', 'source', { unique: false })
        }
      }
    })
  }

  async getCachedPhoto(photoId: string): Promise<CachedPhoto | null> {
    if (!this.db) {
      await this.init()
    }
    
    return new Promise((resolve) => {
      if (!this.db) {
        resolve(null)
        return
      }
      
      const transaction = this.db.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.get(photoId)
      
      request.onsuccess = () => {
        const record = request.result as CacheRecord | undefined
        if (record) {
          // Update access time for FIFO
          record.accessedAt = Date.now()
          store.put(record)
          
          const cachedPhoto: CachedPhoto = {
            id: record.id,
            url: record.url,
            thumbnailUrl: record.thumbnailUrl,
            metadata: record.metadata,
            source: record.source,
            albumId: record.albumId,
            type: record.type,
            duration: record.duration,
            cachedAt: record.cachedAt,
            size: record.size,
            blob: record.blob
          }
          resolve(cachedPhoto)
        } else {
          resolve(null)
        }
      }
      
      request.onerror = () => {
        console.error('Failed to get cached photo:', request.error)
        resolve(null)
      }
    })
  }

  async cachePhoto(photo: Photo, blob: Blob): Promise<void> {
    // Only cache images, not videos
    if (photo.type === 'VIDEO') {
      return
    }

    if (!this.db) {
      await this.init()
    }
    
    const size = blob.size
    const now = Date.now()
    
    const record: CacheRecord = {
      id: photo.id,
      url: photo.url,
      thumbnailUrl: photo.thumbnailUrl,
      metadata: photo.metadata,
      source: photo.source,
      albumId: photo.albumId,
      type: photo.type,
      duration: photo.duration,
      cachedAt: now,
      size,
      blob,
      accessedAt: now
    }

    // Check if we need to make space
    await this.ensureSpace(size)

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'))
        return
      }
      
      const transaction = this.db.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.put(record)
      
      request.onsuccess = () => resolve()
      request.onerror = () => {
        console.error('Failed to cache photo:', request.error)
        reject(new Error('Failed to cache photo'))
      }
    })
  }

  async getCacheInfo(): Promise<{ totalSize: number; photoCount: number; maxSizeMB: number }> {
    if (!this.db) {
      await this.init()
    }
    
    return new Promise((resolve) => {
      if (!this.db) {
        resolve({ totalSize: 0, photoCount: 0, maxSizeMB: this.maxSizeMB })
        return
      }
      
      const transaction = this.db.transaction([this.storeName], 'readonly')
      const store = transaction.objectStore(this.storeName)
      const request = store.getAll()
      
      request.onsuccess = () => {
        const records = request.result as CacheRecord[]
        const totalSize = records.reduce((sum, record) => sum + record.size, 0)
        
        resolve({
          totalSize,
          photoCount: records.length,
          maxSizeMB: this.maxSizeMB,
        })
      }
      
      request.onerror = () => {
        console.error('Failed to get cache info:', request.error)
        resolve({ totalSize: 0, photoCount: 0, maxSizeMB: this.maxSizeMB })
      }
    })
  }

  async clearCache(): Promise<void> {
    if (!this.db) {
      await this.init()
    }
    
    return new Promise((resolve, reject) => {
      if (!this.db) {
        resolve()
        return
      }
      
      const transaction = this.db.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.clear()
      
      request.onsuccess = () => resolve()
      request.onerror = () => {
        console.error('Failed to clear cache:', request.error)
        reject(new Error('Failed to clear cache'))
      }
    })
  }

  async removeCachedPhoto(photoId: string): Promise<void> {
    if (!this.db) {
      await this.init()
    }
    
    return new Promise((resolve, reject) => {
      if (!this.db) {
        resolve()
        return
      }
      
      const transaction = this.db.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.delete(photoId)
      
      request.onsuccess = () => resolve()
      request.onerror = () => {
        console.error('Failed to remove cached photo:', request.error)
        reject(new Error('Failed to remove cached photo'))
      }
    })
  }

  async updateMaxSize(newMaxSizeMB: number): Promise<void> {
    this.maxSizeMB = newMaxSizeMB
    await this.cleanup()
  }

  // Clear cache when photo sources change
  async invalidateCache(): Promise<void> {
    await this.clearCache()
  }

  // Remove photos from specific source
  async removeCacheBySource(sourceId: string): Promise<void> {
    if (!this.db) {
      await this.init()
    }
    
    return new Promise((resolve, reject) => {
      if (!this.db) {
        resolve()
        return
      }
      
      const transaction = this.db.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const index = store.index('source')
      const request = index.openCursor(IDBKeyRange.only(sourceId))
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result
        if (cursor) {
          cursor.delete()
          cursor.continue()
        } else {
          resolve()
        }
      }
      
      request.onerror = () => {
        console.error('Failed to remove cache by source:', request.error)
        reject(new Error('Failed to remove cache by source'))
      }
    })
  }

  // Get all cached photos for offline fallback
  async getAllCachedPhotos(): Promise<CachedPhoto[]> {
    if (!this.db) {
      await this.init()
    }
    
    return new Promise((resolve) => {
      if (!this.db) {
        resolve([])
        return
      }
      
      const transaction = this.db.transaction([this.storeName], 'readonly')
      const store = transaction.objectStore(this.storeName)
      const request = store.getAll()
      
      request.onsuccess = () => {
        const records = request.result as CacheRecord[]
        const cachedPhotos: CachedPhoto[] = records.map(record => ({
          id: record.id,
          url: record.url,
          thumbnailUrl: record.thumbnailUrl,
          metadata: record.metadata,
          source: record.source,
          albumId: record.albumId,
          type: record.type,
          duration: record.duration,
          cachedAt: record.cachedAt,
          size: record.size,
          blob: record.blob
        }))
        resolve(cachedPhotos)
      }
      
      request.onerror = () => {
        console.error('Failed to get all cached photos:', request.error)
        resolve([])
      }
    })
  }

  private async ensureSpace(newItemSize: number): Promise<void> {
    const maxSizeBytes = this.maxSizeMB * 1024 * 1024
    const currentInfo = await this.getCacheInfo()
    const spaceNeeded = newItemSize
    const availableSpace = maxSizeBytes - currentInfo.totalSize

    if (availableSpace >= spaceNeeded) {
      return // Enough space available
    }

    // Need to free up space - remove oldest accessed items first (FIFO)
    const spaceToFree = spaceNeeded - availableSpace
    await this.freeSpace(spaceToFree)
  }

  private async freeSpace(bytesToFree: number): Promise<void> {
    if (!this.db) {
      return
    }
    
    return new Promise((resolve, reject) => {
      if (!this.db) {
        resolve()
        return
      }
      
      const transaction = this.db.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const index = store.index('accessedAt')
      const request = index.openCursor() // Opens in ascending order (oldest first)
      
      let freedBytes = 0
      const photosToDelete: string[] = []
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result
        if (cursor && freedBytes < bytesToFree) {
          const record = cursor.value as CacheRecord
          photosToDelete.push(record.id)
          freedBytes += record.size
          cursor.continue()
        } else {
          // Delete the selected photos
          const deletePromises = photosToDelete.map(photoId => 
            new Promise<void>((deleteResolve, deleteReject) => {
              const deleteTransaction = this.db!.transaction([this.storeName], 'readwrite')
              const deleteStore = deleteTransaction.objectStore(this.storeName)
              const deleteRequest = deleteStore.delete(photoId)
              
              deleteRequest.onsuccess = () => deleteResolve()
              deleteRequest.onerror = () => deleteReject(deleteRequest.error)
            })
          )
          
          Promise.all(deletePromises)
            .then(() => resolve())
            .catch(reject)
        }
      }
      
      request.onerror = () => {
        console.error('Failed to free space:', request.error)
        reject(new Error('Failed to free space'))
      }
    })
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