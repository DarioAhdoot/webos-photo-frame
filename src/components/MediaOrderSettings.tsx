import { useSettingsStore } from '../stores/settingsStore'

export default function MediaOrderSettings() {
  const { settings, updateSettings } = useSettingsStore()

  const handleSlideshowChange = (key: keyof typeof settings.slideshow, value: any) => {
    updateSettings({
      slideshow: {
        ...settings.slideshow,
        [key]: value,
      },
    })
  }

  return (
    <div className="space-y-8 pb-8">
      <div>
        <div className="bg-dark-card p-8 rounded-xl border-dark-border shadow-sm">
          <div>
            <h2 className="text-3xl font-semibold mb-6">Display Order</h2>
            <div className="space-y-4 mb-6">
              <button
                onClick={() => handleSlideshowChange('order', 'random')}
                className={`w-full px-8 py-6 rounded-xl text-xl font-medium text-center transition-colors ${
                  settings.slideshow.order === 'random'
                    ? 'bg-blue-600 text-white border-2 border-blue-500'
                    : 'bg-gray-700 text-gray-200 hover:bg-gray-600 border-2 border-transparent'
                }`}
              >
                Random
              </button>
              <button
                onClick={() => handleSlideshowChange('order', 'sequential')}
                className={`w-full px-8 py-6 rounded-xl text-xl font-medium text-center transition-colors ${
                  settings.slideshow.order === 'sequential'
                    ? 'bg-blue-600 text-white border-2 border-blue-500'
                    : 'bg-gray-700 text-gray-200 hover:bg-gray-600 border-2 border-transparent'
                }`}
              >
                Sequential
              </button>
            </div>
            <div className="text-lg text-dark-muted">
              Whether to display media in a random order or in sequence
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}