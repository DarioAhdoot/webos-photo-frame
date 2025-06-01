import { useSettingsStore } from '../stores/settingsStore'

export default function DisplayOptionsSettings() {
  const { settings, updateSettings } = useSettingsStore()

  const handleDisplayChange = (key: keyof typeof settings.display, value: any) => {
    updateSettings({
      display: {
        ...settings.display,
        [key]: value,
      },
    })
  }

  return (
    <div className="space-y-8 pb-8">
      <div>
        <div className="bg-dark-card p-8 rounded-xl border-dark-border shadow-sm">
          <div>
            <h2 className="text-3xl font-semibold mb-6">Information Display</h2>
            <div className="space-y-4 mb-6">
              <button
                onClick={() => handleDisplayChange('showMetadata', !settings.display.showMetadata)}
                className={`w-full px-8 py-6 rounded-xl text-xl font-medium text-center transition-colors border-2 ${
                  settings.display.showMetadata
                    ? 'bg-blue-600 text-white border-blue-500'
                    : 'bg-gray-700 text-gray-200 hover:bg-gray-600 border-transparent'
                }`}
              >
                <span className="flex items-center justify-center">
                  <span className={`mr-4 text-2xl ${settings.display.showMetadata ? '✓' : '○'}`}></span>
                  Show Photo Metadata
                </span>
              </button>

              <button
                onClick={() => handleDisplayChange('showWeather', !settings.display.showWeather)}
                className={`w-full px-8 py-6 rounded-xl text-xl font-medium text-center transition-colors border-2 ${
                  settings.display.showWeather
                    ? 'bg-blue-600 text-white border-blue-500'
                    : 'bg-gray-700 text-gray-200 hover:bg-gray-600 border-transparent'
                }`}
              >
                <span className="flex items-center justify-center">
                  <span className={`mr-4 text-2xl ${settings.display.showWeather ? '✓' : '○'}`}></span>
                  Show Weather Information
                </span>
              </button>
            </div>
            
            <div className="text-lg text-dark-muted">
              Control what information is displayed on top of photos during the slideshow
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}