import SettingsView from './components/SettingsView'
import ScreensaverView from './components/ScreensaverView'
import { useAppStore } from './stores/appStore'

function App() {
  const { currentMode, setCurrentMode } = useAppStore()

  return (
    <div className="h-screen w-screen overflow-hidden">
      {currentMode === 'settings' ? (
        <SettingsView onStartScreensaver={() => setCurrentMode('screensaver')} />
      ) : (
        <ScreensaverView onExit={() => setCurrentMode('settings')} />
      )}
    </div>
  )
}

export default App