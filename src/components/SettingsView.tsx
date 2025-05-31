import { useState } from 'react'
import { useSettingsStore } from '../stores/settingsStore'
import { useAppStore } from '../stores/appStore'
import PhotoSourceConfig from './PhotoSourceConfig'
import SlideshowSettings from './SlideshowSettings'
import AlbumSelectionView from './AlbumSelectionView'
import type { PhotoSource, ImmichConfig } from '../types'

interface SettingsViewProps {
  onStartScreensaver: () => void
}

export default function SettingsView({ onStartScreensaver }: SettingsViewProps) {
  const { photoSources, updatePhotoSource } = useSettingsStore()
  const { photos } = useAppStore()
  const [activeTab, setActiveTab] = useState<'sources' | 'slideshow' | 'display'>('sources')
  const [albumSelectionView, setAlbumSelectionView] = useState<{
    photoSource: PhotoSource
    selectedAlbumIds: string[]
  } | null>(null)

  const hasConfiguredSources = photoSources.some(source => source.enabled)
  const hasPhotos = photos.length > 0
  
  console.log('Settings Debug:', {
    photoSources,
    hasConfiguredSources,
    hasPhotos,
    photosCount: photos.length
  })

  const handleOpenAlbumSelection = (photoSource: PhotoSource) => {
    const config = photoSource.config as ImmichConfig
    setAlbumSelectionView({
      photoSource,
      selectedAlbumIds: config.albumIds || []
    })
  }

  const handleAlbumToggle = (albumId: string) => {
    if (!albumSelectionView) return
    
    const currentSelection = albumSelectionView.selectedAlbumIds
    const newSelection = currentSelection.includes(albumId)
      ? currentSelection.filter(id => id !== albumId)
      : [...currentSelection, albumId]
      
    setAlbumSelectionView({
      ...albumSelectionView,
      selectedAlbumIds: newSelection
    })
  }

  const handleSaveAlbumSelection = () => {
    if (!albumSelectionView) return
    
    const config = albumSelectionView.photoSource.config as ImmichConfig
    updatePhotoSource(albumSelectionView.photoSource.id, {
      config: {
        ...config,
        albumIds: albumSelectionView.selectedAlbumIds
      }
    })
    
    setAlbumSelectionView(null)
  }

  const handleBackFromAlbumSelection = () => {
    setAlbumSelectionView(null)
  }

  // If album selection view is active, show it instead of main settings
  if (albumSelectionView) {
    return (
      <AlbumSelectionView
        photoSource={albumSelectionView.photoSource}
        selectedAlbumIds={albumSelectionView.selectedAlbumIds}
        onAlbumToggle={handleAlbumToggle}
        onBack={handleBackFromAlbumSelection}
        onSave={handleSaveAlbumSelection}
      />
    )
  }

  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      <header className="bg-white shadow-sm border-b p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Photo Screensaver Settings</h1>
          <div className="flex gap-3 items-center">
            {/* Debug info */}
            <div className="text-sm text-gray-500">
              Sources: {photoSources.length} | Enabled: {photoSources.filter(s => s.enabled).length} | Photos: {photos.length}
            </div>
            
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                console.log('Start Screensaver clicked!', { hasConfiguredSources, onStartScreensaver })
                // Small delay to prevent event bubbling issues
                setTimeout(() => {
                  onStartScreensaver()
                }, 100)
              }}
              disabled={!hasConfiguredSources}
              className={`px-6 py-2 rounded-lg font-medium ${
                hasConfiguredSources
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              title={!hasConfiguredSources ? 'Enable at least one photo source first' : ''}
            >
              Start Screensaver
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex min-h-0">
        <nav className="w-64 bg-white shadow-sm border-r">
          <div className="p-4">
            <div className="space-y-2">
              <button
                onClick={() => setActiveTab('sources')}
                className={`w-full text-left px-4 py-2 rounded-lg ${
                  activeTab === 'sources'
                    ? 'bg-blue-100 text-blue-800'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Photo Sources
              </button>
              <button
                onClick={() => setActiveTab('slideshow')}
                className={`w-full text-left px-4 py-2 rounded-lg ${
                  activeTab === 'slideshow'
                    ? 'bg-blue-100 text-blue-800'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Slideshow Settings
              </button>
              <button
                onClick={() => setActiveTab('display')}
                className={`w-full text-left px-4 py-2 rounded-lg ${
                  activeTab === 'display'
                    ? 'bg-blue-100 text-blue-800'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Display Settings
              </button>
            </div>
          </div>
        </nav>

        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {activeTab === 'sources' && <PhotoSourceConfig onOpenAlbumSelection={handleOpenAlbumSelection} />}
            {activeTab === 'slideshow' && <SlideshowSettings />}
            {activeTab === 'display' && <div>Display settings coming soon...</div>}
          </div>
        </main>
      </div>
    </div>
  )
}