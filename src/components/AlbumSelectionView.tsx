import { useState, useEffect } from 'react'
import { ImmichPhotoSource } from '../services/ImmichPhotoSource'
import type { PhotoSource } from '../types'
import type { Album } from '../services/PhotoSourceBase'

interface AlbumSelectionViewProps {
  photoSource: PhotoSource
  selectedAlbumIds: string[]
  onAlbumToggle: (albumId: string) => void
  onBack: () => void
  onSave: () => void
}

export default function AlbumSelectionView({ 
  photoSource, 
  selectedAlbumIds, 
  onAlbumToggle, 
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

  if (loading) {
    return (
      <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
        <div className="flex-shrink-0 bg-white shadow-sm border-b p-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Select Albums</h1>
              <button
                onClick={onBack}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                ← Back
              </button>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="text-4xl mb-4 animate-pulse">📷</div>
                <div className="text-lg">Loading albums...</div>
                <div className="text-sm text-gray-500 mt-2">Fetching from {photoSource.name}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
        <div className="flex-shrink-0 bg-white shadow-sm border-b p-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Select Albums</h1>
              <button
                onClick={onBack}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                ← Back
              </button>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="text-4xl mb-4">⚠️</div>
                <div className="text-lg">Failed to load albums</div>
                <div className="text-sm text-gray-500 mt-2">{error}</div>
                <button
                  onClick={loadAlbums}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      <div className="flex-shrink-0 bg-white shadow-sm border-b p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Select Albums</h1>
              <p className="text-gray-600 mt-1">
                Choose albums from {photoSource.name} • {selectedAlbumIds.length} selected
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={onBack}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                ← Back
              </button>
              <button
                onClick={onSave}
                className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Save Selection
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto">
          {albums.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📷</div>
              <div className="text-lg">No albums found</div>
              <div className="text-sm text-gray-500 mt-2">
                This photo source doesn't have any albums
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-6">
              {albums.map((album) => (
                <div
                  key={album.id}
                  onClick={() => handleAlbumClick(album.id)}
                  className={`relative cursor-pointer group rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                    isAlbumSelected(album.id)
                      ? 'border-blue-500 ring-2 ring-blue-200'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="aspect-square bg-gray-100 flex items-center justify-center">
                    {thumbnailBlobUrls[album.id] ? (
                      <img
                        src={thumbnailBlobUrls[album.id]}
                        alt={album.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-4xl text-gray-400">📷</div>
                    )}
                  </div>
                  
                  <div className="absolute top-2 right-2">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        isAlbumSelected(album.id)
                          ? 'bg-blue-500 border-blue-500'
                          : 'bg-white border-gray-300 group-hover:border-gray-400'
                      }`}
                    >
                      {isAlbumSelected(album.id) && (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                  </div>

                  <div className="p-3 bg-white">
                    <h3 className="font-medium text-sm truncate" title={album.name}>
                      {album.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {album.photoCount} photo{album.photoCount !== 1 ? 's' : ''}
                    </p>
                    {album.description && (
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2" title={album.description}>
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