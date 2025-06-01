import { useState, useEffect } from 'react'
import { ImmichPhotoSource } from '../services/ImmichPhotoSource'
import { Button, LoadingState, ErrorState, EmptyState, Checkbox } from './ui'
import type { PhotoSource } from '../types'
import type { Album } from '../services/PhotoSourceBase'

interface AlbumSelectionViewProps {
  photoSource: PhotoSource
  selectedAlbumIds: string[]
  onAlbumToggle: (albumId: string) => void
  onAlbumBulkSelect?: (albumIds: string[]) => void
  onBack: () => void
  onSave: () => void
}

export default function AlbumSelectionView({ 
  photoSource, 
  selectedAlbumIds, 
  onAlbumToggle, 
  onAlbumBulkSelect,
  onBack, 
  onSave 
}: AlbumSelectionViewProps) {
  const [albums, setAlbums] = useState<Album[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [thumbnailBlobUrls, setThumbnailBlobUrls] = useState<Record<string, string>>({})

  useEffect(() => {
    loadAlbums()
  }, [photoSource])

  useEffect(() => {
    // Cleanup blob URLs when component unmounts
    return () => {
      Object.values(thumbnailBlobUrls).forEach(url => {
        URL.revokeObjectURL(url)
      })
    }
  }, [thumbnailBlobUrls])

  const loadAlbums = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Create source instance directly based on type
      let source
      switch (photoSource.type) {
        case 'immich':
          source = new ImmichPhotoSource(photoSource)
          break
        default:
          throw new Error(`Unsupported source type: ${photoSource.type}`)
      }
      
      const albumList = await source.getAlbums()
      setAlbums(albumList)
      
      // Load thumbnails for albums that have them
      const blobUrls: Record<string, string> = {}
      await Promise.all(
        albumList.map(async (album) => {
          if (album.thumbnailUrl) {
            try {
              const blob = await source.getPhotoBlob(album.thumbnailUrl)
              blobUrls[album.id] = URL.createObjectURL(blob)
            } catch (error) {
              console.warn(`Failed to load thumbnail for album ${album.name}:`, error)
            }
          }
        })
      )
      
      setThumbnailBlobUrls(blobUrls)
    } catch (err) {
      console.error('Failed to load albums:', err)
      setError(err instanceof Error ? err.message : 'Failed to load albums')
    } finally {
      setLoading(false)
    }
  }

  const handleAlbumClick = (albumId: string) => {
    onAlbumToggle(albumId)
  }

  const isAlbumSelected = (albumId: string) => {
    return selectedAlbumIds.includes(albumId)
  }

  const handleSelectAll = () => {
    if (onAlbumBulkSelect) {
      // Use bulk select if available
      const allAlbumIds = albums.map(album => album.id)
      onAlbumBulkSelect(allAlbumIds)
    } else {
      // Fall back to individual toggles
      albums.forEach(album => {
        if (!selectedAlbumIds.includes(album.id)) {
          onAlbumToggle(album.id)
        }
      })
    }
  }

  const handleDeselectAll = () => {
    if (onAlbumBulkSelect) {
      // Use bulk select with empty array
      onAlbumBulkSelect([])
    } else {
      // Fall back to individual toggles
      selectedAlbumIds.forEach(albumId => {
        onAlbumToggle(albumId)
      })
    }
  }

  if (loading) {
    return (
      <div className="h-screen bg-gray-700 flex flex-col overflow-hidden">
        <div className="flex-shrink-0 bg-dark-card shadow-sm border-b border-dark-border p-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-dark-text">Select Albums</h1>
              <Button variant="ghost" size="lg" onClick={onBack}>
                ← Back
              </Button>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto">
            <LoadingState
              title="Loading albums..."
              subtitle={`Fetching from ${photoSource.name}`}
            />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-screen bg-gray-700 flex flex-col overflow-hidden">
        <div className="flex-shrink-0 bg-dark-card shadow-sm border-b border-dark-border p-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-dark-text">Select Albums</h1>
              <Button variant="ghost" size="lg" onClick={onBack}>
                ← Back
              </Button>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto">
            <ErrorState
              title="Failed to load albums"
              message={error}
              onRetry={loadAlbums}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gray-700 flex flex-col overflow-hidden">
      <div className="flex-shrink-0 bg-dark-card shadow-sm border-b border-dark-border p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-dark-text">Select Albums</h1>
              <p className="text-xl text-dark-muted mt-2">
                Choose albums from {photoSource.name} • {selectedAlbumIds.length} selected
              </p>
            </div>
            <div className="flex gap-4">
              {albums.length > 0 && (
                <>
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={handleSelectAll}
                    disabled={selectedAlbumIds.length === albums.length}
                  >
                    Select All
                  </Button>
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={handleDeselectAll}
                    disabled={selectedAlbumIds.length === 0}
                  >
                    Deselect All
                  </Button>
                </>
              )}
              <Button variant="ghost" size="lg" onClick={onBack}>
                ← Back
              </Button>
              <Button variant="primary" size="lg" onClick={onSave}>
                Save Selection
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto">
          {albums.length === 0 ? (
            <EmptyState
              title="No albums found"
              message="This photo source doesn't have any albums"
            />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 pb-8">
              {albums.map((album) => (
                <div
                  key={album.id}
                  onClick={() => handleAlbumClick(album.id)}
                  className={`relative cursor-pointer group rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                    isAlbumSelected(album.id)
                      ? 'border-blue-400 ring-2 ring-blue-400/30'
                      : 'border-dark-border hover:border-gray-500'
                  }`}
                >
                  <div className="aspect-square bg-gray-600 flex items-center justify-center">
                    {thumbnailBlobUrls[album.id] ? (
                      <img
                        src={thumbnailBlobUrls[album.id]}
                        alt={album.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-5xl text-gray-400">📷</div>
                    )}
                  </div>
                  
                  <div className="absolute top-3 right-3">
                    <Checkbox 
                      checked={isAlbumSelected(album.id)} 
                      size="lg"
                    />
                  </div>

                  <div className="p-4 bg-dark-card">
                    <h3 className="font-medium text-lg truncate text-dark-text" title={album.name}>
                      {album.name}
                    </h3>
                    <p className="text-base text-dark-muted mt-1">
                      {album.photoCount} photo{album.photoCount !== 1 ? 's' : ''}
                    </p>
                    {album.description && (
                      <p className="text-sm text-dark-muted/70 mt-2 line-clamp-2" title={album.description}>
                        {album.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}