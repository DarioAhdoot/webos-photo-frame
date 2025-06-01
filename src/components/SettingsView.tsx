import { useState, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useSettingsStore } from '../stores/settingsStore'
import { useAppStore } from '../stores/appStore'
import { useAllPhotos } from '../hooks/usePhotoSources'
import { Button } from './ui'
import PhotoSourceConfig from './PhotoSourceConfig'
import PhotoSourceEdit from './PhotoSourceEdit'
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
import MagicRemoteHandler from './MagicRemoteHandler'
import type { PhotoSource, ImmichConfig } from '../types'

interface SettingsViewProps {
  onStartSlideshow: () => void
  initialEditingSource?: PhotoSource | null | undefined
  onRootStateChange?: (isRoot: boolean) => void
}

export default function SettingsView({ onStartSlideshow, initialEditingSource, onRootStateChange }: SettingsViewProps) {
  const { photoSources, updatePhotoSource } = useSettingsStore()
  const { photos } = useAppStore()
  const queryClient = useQueryClient()
  const allPhotosQuery = useAllPhotos()
  const [activeTab, setActiveTab] = useState<'sources' | 'photo-interval' | 'transition-effect' | 'media-order' | 'image-quality' | 'display-options' | 'layout' | 'video' | 'photo-refresh' | 'cache'>('sources')
  const [editingSource, setEditingSource] = useState<PhotoSource | null | undefined>(initialEditingSource ?? undefined) // undefined = not editing, null = new source, PhotoSource = editing existing
  const [albumSelectionView, setAlbumSelectionView] = useState<{
    photoSource: PhotoSource
    selectedAlbumIds: string[]
  } | null>(null)

  // Update editingSource when initialEditingSource changes
  useEffect(() => {
    if (initialEditingSource !== undefined) {
      setEditingSource(initialEditingSource)
    }
  }, [initialEditingSource])

  // Track root state and notify parent
  useEffect(() => {
    const isAtRoot = editingSource === undefined && albumSelectionView === null
    onRootStateChange?.(isAtRoot)
  }, [editingSource, albumSelectionView, onRootStateChange])

  // Handle WebOS back button within settings
  useEffect(() => {
    const handleBackButton = (event: KeyboardEvent) => {
      // WebOS back button keycode is 461 (0x1CD)
      if (event.keyCode === 461) {
        if (albumSelectionView) {
          // In album selection, go back to edit view
          event.preventDefault()
          handleBackFromAlbumSelection()
        } else if (editingSource !== undefined) {
          // In edit view, go back to main settings
          event.preventDefault()
          handleBackFromEdit()
        }
        // If at root, let App.tsx handle the back button
      }
    }

    document.addEventListener('keydown', handleBackButton)
    return () => document.removeEventListener('keydown', handleBackButton)
  }, [editingSource, albumSelectionView])


  const hasConfiguredSources = photoSources.some(source => source.enabled)
  
  // Use current query data for real-time counts
  const currentPhotos = allPhotosQuery.data || photos
  
  // Count photos and videos separately from current data
  const photoCount = currentPhotos.filter(photo => photo.type !== 'VIDEO').length
  const videoCount = currentPhotos.filter(photo => photo.type === 'VIDEO').length

  const handleEditSource = (source: PhotoSource | null) => {
    setEditingSource(source) // null means new source, PhotoSource means editing existing
  }

  const handleBackFromEdit = () => {
    setEditingSource(undefined)
  }

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
    // Return to edit view after album selection
    setEditingSource(albumSelectionView.photoSource)
  }

  const handleBackFromAlbumSelection = () => {
    const sourceToReturn = albumSelectionView?.photoSource
    setAlbumSelectionView(null)
    // Return to edit view after backing out of album selection
    if (sourceToReturn) {
      setEditingSource(sourceToReturn)
    }
  }

  const handleAlbumBulkSelect = (albumIds: string[]) => {
    if (!albumSelectionView) return
    
    setAlbumSelectionView({
      ...albumSelectionView,
      selectedAlbumIds: albumIds
    })
  }

  // If album selection view is active, show it instead of main settings or edit view
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

  // If edit view is active, show it instead of main settings
  if (editingSource !== undefined) {
    return (
      <PhotoSourceEdit
        source={editingSource}
        onBack={handleBackFromEdit}
        onOpenAlbumSelection={handleOpenAlbumSelection}
      />
    )
  }

  return (
    <div className="h-screen bg-dark-bg flex flex-col">
      <MagicRemoteHandler
        isInSlideshow={false}
      />
      <header className="bg-dark-card shadow-sm border-b border-dark-border p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-dark-text">Photo Slideshow Settings</h1>
          <div className="flex gap-3 items-center">
            {/* Debug info */}
            <div className="text-sm text-dark-muted">
              Sources: {photoSources.length} | Enabled: {photoSources.filter(s => s.enabled).length} | Photos: {photoCount} | Videos: {videoCount}
              {allPhotosQuery.isFetching && <span className="ml-2 text-blue-400">(refreshing...)</span>}
            </div>
            
            <Button
              variant="primary"
              size="md"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                // Small delay to prevent event bubbling issues
                setTimeout(() => {
                  onStartSlideshow()
                }, 100)
              }}
              disabled={!hasConfiguredSources}
              title={!hasConfiguredSources ? 'Enable at least one photo source first' : ''}
            >
              Start slideshow
            </Button>
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
                Library Refresh
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
            {activeTab === 'sources' && <PhotoSourceConfig onEditSource={handleEditSource} />}
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