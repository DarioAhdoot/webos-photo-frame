import { useSettingsStore } from '../stores/settingsStore'

export default function LayoutSettings() {
  const { settings, updateSettings } = useSettingsStore()

  const handleLayoutChange = (key: keyof typeof settings.layout, value: any) => {
    updateSettings({
      layout: {
        ...settings.layout,
        [key]: value,
      },
    })
  }

  return (
    <div className="space-y-8 pb-8">
      <div>
        <div className="bg-dark-card p-8 rounded-xl border-dark-border shadow-sm">
          <div>
            <h2 className="text-3xl font-semibold mb-6">Portrait Photo Layout</h2>
            <div className="space-y-4 mb-6">
              <button
                onClick={() => handleLayoutChange('portraitBlurredBackground', !settings.layout.portraitBlurredBackground)}
                className={`w-full px-8 py-6 rounded-xl text-xl font-medium text-center transition-colors border-2 ${
                  settings.layout.portraitBlurredBackground
                    ? 'bg-blue-600 text-white border-blue-500'
                    : 'bg-gray-700 text-gray-200 hover:bg-gray-600 border-transparent'
                }`}
              >
                <span className="flex items-center justify-center">
                  <span className={`mr-4 text-2xl ${settings.layout.portraitBlurredBackground ? '✓' : '○'}`}></span>
                  Blurred background for portrait photos
                </span>
              </button>
            </div>
            <div className="text-lg text-dark-muted">
              When enabled, portrait photos are displayed over a blurred background.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}