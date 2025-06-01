import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useSettingsStore } from '../stores/settingsStore'
import { useAppStore } from '../stores/appStore'
import { useAllPhotos } from '../hooks/usePhotoSources'
import PhotoSourceConfig from './PhotoSourceConfig'
import PhotoIntervalSettings from './PhotoIntervalSettings'
import TransitionEffectSettings from './TransitionEffectSettings'
import MediaOrderSettings from './MediaOrderSettings'
import ImageQualitySettings from './ImageQualitySettings'
import DisplayOptionsSettings from './DisplayOptionsSettings'
import LayoutSettings from './LayoutSettings'
import PhotoRefreshSettings from './PhotoRefreshSettings'
import CacheSettings from './CacheSettings'
import VideoSettings from './VideoSettings'
import AlbumSelectionView from './AlbumSelectionView'
import type { PhotoSource, ImmichConfig } from '../types'

interface SettingsViewProps {
  onStartScreensaver: () => void
}

export default function SettingsView({ onStartScreensaver }: SettingsViewProps) {
  const { photoSources, updatePhotoSource } = useSettingsStore()
  const { photos } = useAppStore()
  const queryClient = useQueryClient()
  const allPhotosQuery = useAllPhotos()
  const [activeTab, setActiveTab] = useState<'sources' | 'photo-interval' | 'transition-effect' | 'media-order' | 'image-quality' | 'display-options' | 'layout' | 'video' | 'photo-refresh' | 'cache'>('sources')
  const [albumSelectionView, setAlbumSelectionView] = useState<{
    photoSource: PhotoSource
    selectedAlbumIds: string[]
  } | null>(null)

  const hasConfiguredSources = photoSources.some(source => source.enabled)
  
  // Use current query data for real-time counts
  const currentPhotos = allPhotosQuery.data || photos
  const hasPhotos = currentPhotos.length > 0
  
  // Count photos and videos separately from current data
  const photoCount = currentPhotos.filter(photo => photo.type !== 'VIDEO').length
  const videoCount = currentPhotos.filter(photo => photo.type === 'VIDEO').length
  
  console.log('Settings Debug:', {
    photoSources,
    hasConfiguredSources,
    hasPhotos,
    storedPhotosCount: photos.length,
    queryPhotosCount: allPhotosQuery.data?.length || 0,
    currentPhotosCount: currentPhotos.length,
    photoCount,
    videoCount,
    queryStatus: allPhotosQuery.status,
    isLoading: allPhotosQuery.isLoading,
    isFetching: allPhotosQuery.isFetching
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
    
    // Invalidate photo cache to force refresh with new album selection
    queryClient.invalidateQueries({ queryKey: ['all-photos'] })
    
    setAlbumSelectionView(null)
  }

  const handleBackFromAlbumSelection = () => {
    setAlbumSelectionView(null)
  }

  const handleAlbumBulkSelect = (albumIds: string[]) => {
    if (!albumSelectionView) return
    
    setAlbumSelectionView({
      ...albumSelectionView,
      selectedAlbumIds: albumIds
    })
  }

  // If album selection view is active, show it instead of main settings
  if (albumSelectionView) {
    return (
      <AlbumSelectionView
        photoSource={albumSelectionView.photoSource}
        selectedAlbumIds={albumSelectionView.selectedAlbumIds}
        onAlbumToggle={handleAlbumToggle}
        onAlbumBulkSelect={handleAlbumBulkSelect}
        onBack={handleBackFromAlbumSelection}
        onSave={handleSaveAlbumSelection}
      />
    )
  }

  return (
    <div className="h-screen bg-dark-bg flex flex-col">
      <header className="bg-dark-card shadow-sm border-b border-dark-border p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-dark-text">Photo Screensaver Settings</h1>
          <div className="flex gap-3 items-center">
            {/* Debug info */}
            <div className="text-sm text-dark-muted">
              Sources: {photoSources.length} | Enabled: {photoSources.filter(s => s.enabled).length} | Photos: {photoCount} | Videos: {videoCount}
              {allPhotosQuery.isFetching && <span className="ml-2 text-blue-400">(refreshing...)</span>}
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
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
              title={!hasConfiguredSources ? 'Enable at least one photo source first' : ''}
            >
              Start Screensaver
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex min-h-0">
        <nav className="w-64 bg-dark-card shadow-sm border-r border-dark-border">
          <div className="p-4">
            <div className="space-y-2">
              <button
                onClick={() => setActiveTab('sources')}
                className={`w-full text-left px-4 py-2 rounded-lg ${
                  activeTab === 'sources'
                    ? 'bg-blue-900 text-blue-200'
                    : 'text-dark-muted hover:bg-gray-700'
                }`}
              >
                Photo Sources
              </button>
              <button
                onClick={() => setActiveTab('photo-interval')}
                className={`w-full text-left px-4 py-2 rounded-lg ${
                  activeTab === 'photo-interval'
                    ? 'bg-blue-900 text-blue-200'
                    : 'text-dark-muted hover:bg-gray-700'
                }`}
              >
                Photo Interval
              </button>
              <button
                onClick={() => setActiveTab('transition-effect')}
                className={`w-full text-left px-4 py-2 rounded-lg ${
                  activeTab === 'transition-effect'
                    ? 'bg-blue-900 text-blue-200'
                    : 'text-dark-muted hover:bg-gray-700'
                }`}
              >
                Transition Effect
              </button>
              <button
                onClick={() => setActiveTab('media-order')}
                className={`w-full text-left px-4 py-2 rounded-lg ${
                  activeTab === 'media-order'
                    ? 'bg-blue-900 text-blue-200'
                    : 'text-dark-muted hover:bg-gray-700'
                }`}
              >
                Media Order
              </button>
              <button
                onClick={() => setActiveTab('image-quality')}
                className={`w-full text-left px-4 py-2 rounded-lg ${
                  activeTab === 'image-quality'
                    ? 'bg-blue-900 text-blue-200'
                    : 'text-dark-muted hover:bg-gray-700'
                }`}
              >
                Image Quality
              </button>
              <button
                onClick={() => setActiveTab('display-options')}
                className={`w-full text-left px-4 py-2 rounded-lg ${
                  activeTab === 'display-options'
                    ? 'bg-blue-900 text-blue-200'
                    : 'text-dark-muted hover:bg-gray-700'
                }`}
              >
                Display Options
              </button>
              <button
                onClick={() => setActiveTab('layout')}
                className={`w-full text-left px-4 py-2 rounded-lg ${
                  activeTab === 'layout'
                    ? 'bg-blue-900 text-blue-200'
                    : 'text-dark-muted hover:bg-gray-700'
                }`}
              >
                Portrait Photos
              </button>
              <button
                onClick={() => setActiveTab('video')}
                className={`w-full text-left px-4 py-2 rounded-lg ${
                  activeTab === 'video'
                    ? 'bg-blue-900 text-blue-200'
                    : 'text-dark-muted hover:bg-gray-700'
                }`}
              >
                Video
              </button>
              <button
                onClick={() => setActiveTab('photo-refresh')}
                className={`w-full text-left px-4 py-2 rounded-lg ${
                  activeTab === 'photo-refresh'
                    ? 'bg-blue-900 text-blue-200'
                    : 'text-dark-muted hover:bg-gray-700'
                }`}
              >
                Photo Refresh
              </button>
              <button
                onClick={() => setActiveTab('cache')}
                className={`w-full text-left px-4 py-2 rounded-lg ${
                  activeTab === 'cache'
                    ? 'bg-blue-900 text-blue-200'
                    : 'text-dark-muted hover:bg-gray-700'
                }`}
              >
                Cache
              </button>
            </div>
          </div>
        </nav>

        <main className="flex-1 overflow-y-auto bg-dark-bg">
          <div className="p-6">
            {activeTab === 'sources' && <PhotoSourceConfig onOpenAlbumSelection={handleOpenAlbumSelection} />}
            {activeTab === 'photo-interval' && <PhotoIntervalSettings />}
            {activeTab === 'transition-effect' && <TransitionEffectSettings />}
            {activeTab === 'media-order' && <MediaOrderSettings />}
            {activeTab === 'image-quality' && <ImageQualitySettings />}
            {activeTab === 'display-options' && <DisplayOptionsSettings />}
            {activeTab === 'layout' && <LayoutSettings />}
            {activeTab === 'video' && <VideoSettings />}
            {activeTab === 'photo-refresh' && <PhotoRefreshSettings />}
            {activeTab === 'cache' && <CacheSettings />}
          </div>
        </main>
      </div>
    </div>
  )
}