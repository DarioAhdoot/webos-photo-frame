import { useEffect } from 'react'
import SettingsView from './components/SettingsView'
import ScreensaverView from './components/ScreensaverView'
import { useAppStore } from './stores/appStore'
import { useSettingsStore } from './stores/settingsStore'

function App() {
  const { currentMode, userRequestedSettings, setCurrentMode } = useAppStore()
  const { photoSources } = useSettingsStore()
  
  // Enable dark mode
  useEffect(() => {
    document.documentElement.classList.add('dark')
  }, [])
  
  // Auto-launch into screensaver if photo sources exist (unless user explicitly requested settings)
  useEffect(() => {
    const enabledPhotoSources = photoSources.filter(source => source.enabled)
    if (enabledPhotoSources.length > 0 && currentMode === 'settings' && !userRequestedSettings) {
      setCurrentMode('screensaver')
    } else if (enabledPhotoSources.length === 0 && currentMode === 'screensaver') {
      setCurrentMode('settings')
    }
  }, [photoSources, currentMode, userRequestedSettings, setCurrentMode])

  const handleStartScreensaver = () => {
    setCurrentMode('screensaver', false) // Reset user requested flag
  }

  const handleExitScreensaver = () => {
    setCurrentMode('settings', true) // User explicitly requested settings
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-dark-bg text-dark-text">
      {currentMode === 'settings' ? (
        <SettingsView onStartScreensaver={handleStartScreensaver} />
      ) : (
        <ScreensaverView onExit={handleExitScreensaver} />
      )}
    </div>
  )
}

export default App