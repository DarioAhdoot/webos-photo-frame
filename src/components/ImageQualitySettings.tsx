import { useSettingsStore } from '../stores/settingsStore'

export default function ImageQualitySettings() {
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
            <h2 className="text-3xl font-semibold mb-6">Image Quality</h2>
            <div className="space-y-4 mb-6">
              <button
                onClick={() => handleDisplayChange('imageResolution', 'optimized')}
                className={`w-full px-8 py-6 rounded-xl text-xl font-medium text-center transition-colors ${
                  settings.display.imageResolution === 'optimized'
                    ? 'bg-blue-600 text-white border-2 border-blue-500'
                    : 'bg-gray-700 text-gray-200 hover:bg-gray-600 border-2 border-transparent'
                }`}
              >
                Optimized (recommended)
              </button>
              <button
                onClick={() => handleDisplayChange('imageResolution', 'original')}
                className={`w-full px-8 py-6 rounded-xl text-xl font-medium text-center transition-colors ${
                  settings.display.imageResolution === 'original'
                    ? 'bg-blue-600 text-white border-2 border-blue-500'
                    : 'bg-gray-700 text-gray-200 hover:bg-gray-600 border-2 border-transparent'
                }`}
              >
                Original
              </button>
            </div>
            <div className="text-lg text-dark-muted">
              Optimized provides faster loading with preview quality, Original uses full resolution
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}