import { PhotoSourceBase, type Album } from './PhotoSourceBase'
import type { Photo, ImmichConfig, PhotoMetadata } from '../types'

interface ImmichAlbum {
  id: string
  albumName: string
  description?: string
  assetCount: number
  albumThumbnailAssetId?: string
}

interface ImmichAsset {
  id: string
  originalFileName: string
  resized: boolean
  fileCreatedAt: string
  fileModifiedAt: string
  updatedAt: string
  isFavorite: boolean
  isArchived: boolean
  duration: string
  exifInfo?: {
    make?: string
    model?: string
    exifImageWidth?: number
    exifImageHeight?: number
    latitude?: number
    longitude?: number
    city?: string
    state?: string
    country?: string
    description?: string
  }
  type: 'IMAGE' | 'VIDEO'
  localDateTime: string
  thumbhash?: string
}

export class ImmichPhotoSource extends PhotoSourceBase {
  private authToken: string | null = null

  private get immichConfig(): ImmichConfig {
    return this.config.config as ImmichConfig
  }

  private get baseUrl(): string {
    return this.immichConfig.serverUrl.replace(/\/$/, '')
  }

  private async getHeaders(): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (this.immichConfig.apiKey) {
      headers['x-api-key'] = this.immichConfig.apiKey
    } else if (this.immichConfig.username && this.immichConfig.password) {
      // Use username/password authentication - get token if needed
      if (!this.authToken) {
        await this.authenticate()
      }
      if (this.authToken) {
        headers['Authorization'] = `Bearer ${this.authToken}`
      }
    }

    return headers
  }

  private async authenticate(): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: this.immichConfig.username,
          password: this.immichConfig.password,
        }),
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed - check your username and password')
        }
        throw new Error(`Login failed: ${response.statusText}`)
      }

      const data = await response.json()
      this.authToken = data.accessToken
    } catch (error) {
      this.authToken = null
      throw error
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      // Try the newer API endpoint first (v1.118.0+)
      let testUrl = `${this.baseUrl}/api/server/ping`
      console.log('Testing connection to (newer API):', testUrl)
      const headers = await this.getHeaders()
      console.log('Headers:', headers)
      
      let response = await fetch(testUrl, {
        headers,
        mode: 'cors',
      })
      
      // If that fails with 404, try the older endpoint
      if (response.status === 404) {
        testUrl = `${this.baseUrl}/api/server-info/ping`
        console.log('Trying older API endpoint:', testUrl)
        response = await fetch(testUrl, {
          headers,
          mode: 'cors',
        })
      }
      
      console.log('Response status:', response.status, response.statusText)
      
      if (!response.ok) {
        console.error('Connection test failed:', response.status, response.statusText)
        if (response.status === 401) {
          const authMethod = this.immichConfig.apiKey ? 'API key' : 'username and password'
          throw new Error(`Authentication failed - check your ${authMethod}`)
        } else if (response.status === 404) {
          throw new Error('Server not found - check your server URL')
        } else {
          throw new Error(`Server responded with ${response.status}: ${response.statusText}`)
        }
      }
      
      console.log('Connection test successful')
      return true
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error('Network error - possibly CORS or server unreachable:', error)
        throw new Error('Cannot reach server - check URL and ensure CORS is configured')
      }
      throw error
    }
  }

  async getAlbums(): Promise<Album[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/albums`, {
        headers: await this.getHeaders(),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const albums: ImmichAlbum[] = await response.json()

      return albums.map((album): Album => ({
        id: album.id,
        name: album.albumName,
        description: album.description,
        photoCount: album.assetCount,
        thumbnailUrl: album.albumThumbnailAssetId 
          ? `${this.baseUrl}/api/assets/${album.albumThumbnailAssetId}/thumbnail`
          : undefined,
      }))
    } catch (error) {
      this.handleError(error, 'get albums')
    }
  }

  async getPhotos(albumIds?: string[]): Promise<Photo[]> {
    try {
      const photos: Photo[] = []

      if (albumIds && albumIds.length > 0) {
        // Get photos from specific albums
        for (const albumId of albumIds) {
          const albumPhotos = await this.getAlbumPhotos(albumId)
          photos.push(...albumPhotos)
        }
      } else {
        // Get all photos (or implement a different strategy)
        const albums = await this.getAlbums()
        for (const album of albums) {
          const albumPhotos = await this.getAlbumPhotos(album.id)
          photos.push(...albumPhotos)
        }
      }

      return photos
    } catch (error) {
      this.handleError(error, 'get photos')
    }
  }

  async getPhoto(photoId: string): Promise<Photo | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/assets/${photoId}`, {
        headers: await this.getHeaders(),
      })

      if (!response.ok) {
        if (response.status === 404) {
          return null
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const asset: ImmichAsset = await response.json()
      return this.mapAssetToPhoto(asset)
    } catch (error) {
      this.handleError(error, 'get photo')
    }
  }

  private async getAlbumPhotos(albumId: string): Promise<Photo[]> {
    const response = await fetch(`${this.baseUrl}/api/albums/${albumId}`, {
      headers: await this.getHeaders(),
    })

    if (!response.ok) {
      throw new Error(`Failed to get album ${albumId}: ${response.statusText}`)
    }

    const album: ImmichAlbum & { assets: ImmichAsset[] } = await response.json()
    
    return album.assets
      .filter(asset => asset.type === 'IMAGE' || asset.type === 'VIDEO') // Include both images and videos
      .map(asset => this.mapAssetToPhoto(asset, albumId))
  }

  private mapAssetToPhoto(asset: ImmichAsset, albumId?: string): Photo {
    const metadata: PhotoMetadata = {
      title: asset.originalFileName,
      dateTaken: asset.fileCreatedAt,
      camera: asset.exifInfo?.make && asset.exifInfo?.model 
        ? `${asset.exifInfo.make} ${asset.exifInfo.model}`
        : undefined,
      dimensions: asset.exifInfo?.exifImageWidth && asset.exifInfo?.exifImageHeight
        ? {
            width: asset.exifInfo.exifImageWidth,
            height: asset.exifInfo.exifImageHeight,
          }
        : undefined,
      location: this.formatLocation(asset.exifInfo),
      description: asset.exifInfo?.description,
    }

    return {
      id: asset.id,
      url: `${this.baseUrl}/api/assets/${asset.id}/original`,
      thumbnailUrl: `${this.baseUrl}/api/assets/${asset.id}/thumbnail`,
      metadata,
      source: this.config.id,
      albumId,
      type: asset.type,
      duration: asset.duration,
    }
  }

  private formatLocation(exifInfo?: ImmichAsset['exifInfo']): string | undefined {
    if (!exifInfo) return undefined

    const parts: string[] = []
    if (exifInfo.city) parts.push(exifInfo.city)
    if (exifInfo.state) parts.push(exifInfo.state)
    if (exifInfo.country) parts.push(exifInfo.country)

    return parts.length > 0 ? parts.join(', ') : undefined
  }

  async getPhotoBlob(photoUrl: string): Promise<Blob> {
    const response = await fetch(photoUrl, {
      headers: await this.getHeaders(),
    })
    
    if (!response.ok) {
      throw new Error(`Failed to fetch photo: ${response.statusText}`)
    }
    
    return response.blob()
  }
}