import { useEffect, useState } from 'react'
import SettingsView from './components/SettingsView'
import ScreensaverView from './components/ScreensaverView'
import WelcomeScreen from './components/WelcomeScreen'
import { useAppStore } from './stores/appStore'
import { useSettingsStore } from './stores/settingsStore'

function App() {
  const { currentMode, userRequestedSettings, setCurrentMode } = useAppStore()
  const { photoSources } = useSettingsStore()
  const [shouldStartWithAddSource, setShouldStartWithAddSource] = useState(false)
  
  // Enable dark mode
  useEffect(() => {
    document.documentElement.classList.add('dark')
  }, [])
  
  // Auto-launch into screensaver if photo sources exist (unless user explicitly requested settings)
  useEffect(() => {
    const enabledPhotoSources = photoSources.filter(source => source.enabled)
    if (enabledPhotoSources.length > 0 && currentMode === 'settings' && !userRequestedSettings) {
      setCurrentMode('screensaver')
    }
  }, [photoSources, currentMode, userRequestedSettings, setCurrentMode])

  const handleStartScreensaver = () => {
    setShouldStartWithAddSource(false) // Reset add source flag
    setCurrentMode('screensaver', false) // Reset user requested flag
  }

  const handleExitScreensaver = () => {
    setShouldStartWithAddSource(false) // Reset add source flag
    setCurrentMode('settings', true) // User explicitly requested settings
  }

  const handleSetupPhotoSources = () => {
    setShouldStartWithAddSource(true)
    setCurrentMode('settings', true) // User explicitly requested settings to set up sources
  }

  const enabledPhotoSources = photoSources.filter(source => source.enabled)
  const hasNoSources = enabledPhotoSources.length === 0

  return (
    <div className="h-screen w-screen overflow-hidden bg-dark-bg text-dark-text">
      {hasNoSources && !userRequestedSettings ? (
        <WelcomeScreen onSetupPhotoSources={handleSetupPhotoSources} />
      ) : currentMode === 'settings' ? (
        <SettingsView 
          onStartScreensaver={handleStartScreensaver} 
          initialEditingSource={shouldStartWithAddSource ? null : undefined}
        />
      ) : (
        <ScreensaverView onExit={handleExitScreensaver} />
      )}
    </div>
  )
}

export default App