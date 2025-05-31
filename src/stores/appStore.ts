import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AppState, Photo } from '../types'

interface AppStore extends AppState {
  userRequestedSettings: boolean
  setCurrentMode: (mode: 'settings' | 'screensaver', userRequested?: boolean) => void
  setCurrentPhotoIndex: (index: number) => void
  setPhotos: (photos: Photo[]) => void
  setLoading: (loading: boolean) => void
  nextPhoto: () => void
  previousPhoto: () => void
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      currentMode: 'settings',
      currentPhotoIndex: 0,
      photos: [],
      isLoading: false,
      userRequestedSettings: false,

      setCurrentMode: (mode, userRequested = false) => {
        console.log('AppStore - setCurrentMode called with:', mode, 'userRequested:', userRequested)
        set({ 
          currentMode: mode,
          userRequestedSettings: mode === 'settings' && userRequested
        })
      },
      setCurrentPhotoIndex: (index) => set({ currentPhotoIndex: index }),
      setPhotos: (photos) => set({ photos, currentPhotoIndex: 0 }),
      setLoading: (loading) => set({ isLoading: loading }),
      
      nextPhoto: () => {
        const { photos, currentPhotoIndex } = get()
        if (photos.length > 0) {
          set({ currentPhotoIndex: (currentPhotoIndex + 1) % photos.length })
        }
      },

      previousPhoto: () => {
        const { photos, currentPhotoIndex } = get()
        if (photos.length > 0) {
          const newIndex = currentPhotoIndex === 0 ? photos.length - 1 : currentPhotoIndex - 1
          set({ currentPhotoIndex: newIndex })
        }
      },
    }),
    {
      name: 'immich-screensaver-app',
      partialize: (state) => ({
        currentPhotoIndex: state.currentPhotoIndex,
        photos: state.photos,
      }),
    }
  )
)