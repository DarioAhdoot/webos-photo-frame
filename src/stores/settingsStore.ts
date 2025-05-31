import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { PhotoSource, AppSettings } from '../types'

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
    transition: 'fade',
    order: 'random',
    videoPlayback: 'full',
    videoDuration: 30,
    videoMuted: true,
  },
  layout: {
    portraitLayout: 'single',
  },
  display: {
    showMetadata: false,
    showWeather: false,
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
    console.log('Migrating old cache settings to network settings')
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

  // Ensure all slideshow properties exist with defaults
  if (!settings.slideshow) {
    settings.slideshow = { ...defaultSettings.slideshow }
  } else {
    settings.slideshow = {
      interval: settings.slideshow.interval ?? defaultSettings.slideshow.interval,
      transition: settings.slideshow.transition ?? defaultSettings.slideshow.transition,
      order: settings.slideshow.order ?? defaultSettings.slideshow.order,
      videoPlayback: settings.slideshow.videoPlayback ?? defaultSettings.slideshow.videoPlayback,
      videoDuration: settings.slideshow.videoDuration ?? defaultSettings.slideshow.videoDuration,
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
      },

      updatePhotoSource: (id, updates) => {
        set((state) => ({
          photoSources: state.photoSources.map((source) =>
            source.id === id ? { ...source, ...updates } : source
          ),
        }))
      },

      removePhotoSource: (id) => {
        set((state) => ({
          photoSources: state.photoSources.filter((source) => source.id !== id),
        }))
      },

      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        }))
      },
    }),
    {
      name: 'immich-screensaver-settings',
      onRehydrateStorage: () => (state) => {
        // Ensure settings are properly migrated after rehydration
        if (state?.settings) {
          if (!state.settings.network) {
            console.log('Post-rehydration migration: adding missing network settings')
            state.settings.network = {
              maxSizeMB: 100,
              refreshIntervalHours: 24,
            }
          }
          
          // Ensure all slideshow properties exist
          if (!state.settings.slideshow) {
            console.log('Post-rehydration migration: adding missing slideshow settings')
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