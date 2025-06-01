import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { PhotoSource, AppSettings } from '../types'
import { photoSourceManager } from '../services/PhotoSourceManager'
import { photoCacheManager } from '../services/PhotoCacheManager'

interface SettingsStore {
  photoSources: PhotoSource[]
  settings: AppSettings
  addPhotoSource: (source: PhotoSource) => void
  updatePhotoSource: (id: string, source: Partial<PhotoSource>) => void
  removePhotoSource: (id: string) => void
  updateSettings: (settings: Partial<AppSettings>) => void
}

const defaultSettings: AppSettings = {
  slideshow: {
    interval: 10,
    transition: 'ken-burns',
    order: 'random',
    videoEnabled: true,
    videoPlayback: 'duration',
    videoMuted: true,
  },
  layout: {
    portraitBlurredBackground: true,
  },
  display: {
    showMetadata: true,
    showWeather: true,
    showTime: true,
    imageResolution: 'optimized',
  },
  network: {
    maxSizeMB: 100,
    refreshIntervalHours: 24,
  },
}

// Migration function to handle old cache settings format
const migrateSettings = (persistedState: any): any => {
  if (!persistedState?.state?.settings) {
    return persistedState
  }

  const settings = persistedState.state.settings

  // If we have old cache settings but no network settings, migrate them
  if (settings.cache && !settings.network) {
    settings.network = {
      maxSizeMB: settings.cache.maxSizeMB || 100,
      refreshIntervalHours: 24, // Default value
    }
    delete settings.cache
  }

  // Ensure network settings exist with defaults
  if (!settings.network) {
    settings.network = {
      maxSizeMB: 100,
      refreshIntervalHours: 24,
    }
  }

  // Ensure all required network properties exist
  settings.network = {
    maxSizeMB: settings.network.maxSizeMB ?? 100,
    refreshIntervalHours: settings.network.refreshIntervalHours ?? 24,
  }

  // Remove old autoRestart property if it exists
  if ('autoRestart' in settings.network) {
    delete settings.network.autoRestart
  }

  // Migrate old portraitLayout to new portraitBlurredBackground
  if (settings.layout && 'portraitLayout' in settings.layout) {
    settings.layout.portraitBlurredBackground = settings.layout.portraitLayout === 'blurred-bg'
    delete settings.layout.portraitLayout
  }

  // Ensure layout settings exist with defaults
  if (!settings.layout) {
    settings.layout = { ...defaultSettings.layout }
  } else {
    settings.layout = {
      portraitBlurredBackground: settings.layout.portraitBlurredBackground ?? defaultSettings.layout.portraitBlurredBackground,
    }
  }

  // Ensure all slideshow properties exist with defaults
  if (!settings.slideshow) {
    settings.slideshow = { ...defaultSettings.slideshow }
  } else {
    settings.slideshow = {
      interval: settings.slideshow.interval ?? defaultSettings.slideshow.interval,
      transition: settings.slideshow.transition ?? defaultSettings.slideshow.transition,
      order: settings.slideshow.order ?? defaultSettings.slideshow.order,
      videoEnabled: settings.slideshow.videoEnabled ?? defaultSettings.slideshow.videoEnabled,
      videoPlayback: settings.slideshow.videoPlayback ?? defaultSettings.slideshow.videoPlayback,
      videoMuted: settings.slideshow.videoMuted ?? defaultSettings.slideshow.videoMuted,
    }
  }

  return persistedState
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      photoSources: [],
      settings: defaultSettings,

      addPhotoSource: (source) => {
        set((state) => ({
          photoSources: [...state.photoSources, source],
        }))
        
        // Invalidate caches when photo sources change
        photoSourceManager.invalidateAllCaches().catch(error => {
          console.error('Failed to invalidate caches after adding photo source:', error)
        })
      },

      updatePhotoSource: (id, updates) => {
        set((state) => ({
          photoSources: state.photoSources.map((source) =>
            source.id === id ? { ...source, ...updates } : source
          ),
        }))
        
        // Invalidate caches when photo sources change
        photoSourceManager.invalidateAllCaches().catch(error => {
          console.error('Failed to invalidate caches after updating photo source:', error)
        })
      },

      removePhotoSource: (id) => {
        set((state) => ({
          photoSources: state.photoSources.filter((source) => source.id !== id),
        }))
        
        // Remove from photo source manager and invalidate caches
        photoSourceManager.removeSource(id)
        photoSourceManager.invalidateAllCaches().catch(error => {
          console.error('Failed to invalidate caches after removing photo source:', error)
        })
      },

      updateSettings: (newSettings) => {
        set((state) => {
          const oldSettings = state.settings
          const updatedSettings = { ...oldSettings, ...newSettings }
          
          // Check if image quality setting changed
          const imageQualityChanged = newSettings.display && 
            oldSettings.display.imageResolution !== newSettings.display.imageResolution
          
          // Check if cache size changed
          const cacheSizeChanged = newSettings.network && 
            oldSettings.network.maxSizeMB !== newSettings.network.maxSizeMB
          
          // Invalidate cache when image quality changes
          if (imageQualityChanged) {
            photoSourceManager.invalidateAllCaches().catch(error => {
              console.error('Failed to invalidate caches after image quality change:', error)
            })
          }
          
          // Update cache size when it changes
          if (cacheSizeChanged && newSettings.network) {
            photoCacheManager.updateMaxSize(newSettings.network.maxSizeMB).catch(error => {
              console.error('Failed to update cache size:', error)
            })
          }
          
          return { settings: updatedSettings }
        })
      },
    }),
    {
      name: 'immich-slideshow-settings',
      onRehydrateStorage: () => (state) => {
        // Ensure settings are properly migrated after rehydration
        if (state?.settings) {
          if (!state.settings.network) {
            state.settings.network = {
              maxSizeMB: 100,
              refreshIntervalHours: 24,
            }
          }
          
          // Ensure all slideshow properties exist
          if (!state.settings.slideshow) {
            state.settings.slideshow = { ...defaultSettings.slideshow }
          } else {
            // Fill in any missing slideshow properties
            state.settings.slideshow = {
              ...defaultSettings.slideshow,
              ...state.settings.slideshow,
            }
          }
        }
      },
      migrate: migrateSettings,
      version: 1,
    }
  )
)