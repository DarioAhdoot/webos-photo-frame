import { useEffect, useState } from 'react'
import SettingsView from './components/SettingsView'
import SlideshowView from './components/SlideshowView'
import WelcomeScreen from './components/WelcomeScreen'
import WebOSLifecycle from './components/WebOSLifecycle'
import VirtualKeyboardHandler from './components/VirtualKeyboardHandler'
import { useAppStore } from './stores/appStore'
import { useSettingsStore } from './stores/settingsStore'
import ExitConfirmModal from './components/ExitConfirmModal'

function App() {
  const { currentMode, userRequestedSettings, setCurrentMode } = useAppStore()
  const { photoSources } = useSettingsStore()
  const [shouldStartWithAddSource, setShouldStartWithAddSource] = useState(false)
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const [isAtSettingsRoot, setIsAtSettingsRoot] = useState(true)
  
  // Enable dark mode
  useEffect(() => {
    document.documentElement.classList.add('dark')
  }, [])

  // Handle WebOS back button
  useEffect(() => {
    const handleBackButton = (event: KeyboardEvent) => {
      // WebOS back button keycode is 461 (0x1CD)
      if (event.keyCode === 461) {
        event.preventDefault()
        
        if (currentMode === 'slideshow') {
          // From slideshow, go back to settings
          setCurrentMode('settings', true)
        } else if (currentMode === 'settings' && isAtSettingsRoot) {
          // From settings root, show exit confirmation
          setShowExitConfirm(true)
        }
        // If in settings but not at root, let the settings view handle it
      }
    }

    document.addEventListener('keydown', handleBackButton)
    return () => document.removeEventListener('keydown', handleBackButton)
  }, [currentMode, isAtSettingsRoot, setCurrentMode])

  const handleExitApp = () => {
    // Use WebOS platform back function to properly exit
    if (typeof window !== 'undefined' && (window as any).webOS) {
      (window as any).webOS.platformBack()
    } else {
      // Fallback for browser testing
      window.close()
    }
  }

  const handleCancelExit = () => {
    setShowExitConfirm(false)
  }
  
  // Auto-launch into slideshow if photo sources exist (unless user explicitly requested settings)
  useEffect(() => {
    const enabledPhotoSources = photoSources.filter(source => source.enabled)
    if (enabledPhotoSources.length > 0 && currentMode === 'settings' && !userRequestedSettings) {
      setCurrentMode('slideshow')
    }
  }, [photoSources, currentMode, userRequestedSettings, setCurrentMode])

  const handleStartSlideshow = () => {
    setShouldStartWithAddSource(false) // Reset add source flag
    setCurrentMode('slideshow', false) // Reset user requested flag
  }

  const handleExitSlideshow = () => {
    setShouldStartWithAddSource(false) // Reset add source flag
    setCurrentMode('settings', true) // User explicitly requested settings
  }

  const handleSettingsRootChange = (isRoot: boolean) => {
    setIsAtSettingsRoot(isRoot)
  }

  const handleSetupPhotoSources = () => {
    setShouldStartWithAddSource(true)
    setCurrentMode('settings', true) // User explicitly requested settings to set up sources
  }

  const enabledPhotoSources = photoSources.filter(source => source.enabled)
  const hasNoSources = enabledPhotoSources.length === 0

  return (
    <div className="h-screen w-screen overflow-hidden bg-dark-bg text-dark-text">
      <WebOSLifecycle />
      <VirtualKeyboardHandler>
        {hasNoSources && !userRequestedSettings ? (
          <WelcomeScreen onSetupPhotoSources={handleSetupPhotoSources} />
        ) : currentMode === 'settings' ? (
          <SettingsView 
            onStartSlideshow={handleStartSlideshow} 
            initialEditingSource={shouldStartWithAddSource ? null : undefined}
            onRootStateChange={handleSettingsRootChange}
          />
        ) : (
          <SlideshowView onExit={handleExitSlideshow} />
        )}
        
        {showExitConfirm && (
          <ExitConfirmModal
            onConfirm={handleExitApp}
            onCancel={handleCancelExit}
          />
        )}
      </VirtualKeyboardHandler>
    </div>
  )
}

export default App