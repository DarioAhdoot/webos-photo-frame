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
  },
  layout: {
    portraitLayout: 'single',
  },
  display: {
    showMetadata: false,
    showWeather: false,
  },
  cache: {
    maxSizeMB: 100,
  },
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
    }
  )
)