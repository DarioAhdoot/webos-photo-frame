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
                onClick={() => handleLayoutChange('portraitLayout', 'single')}
                className={`w-full px-8 py-6 rounded-xl text-xl font-medium text-center transition-colors ${
                  settings.layout.portraitLayout === 'single'
                    ? 'bg-blue-600 text-white border-2 border-blue-500'
                    : 'bg-gray-700 text-gray-200 hover:bg-gray-600 border-2 border-transparent'
                }`}
              >
                Single photo
              </button>
              <button
                onClick={() => handleLayoutChange('portraitLayout', 'dual')}
                className={`w-full px-8 py-6 rounded-xl text-xl font-medium text-center transition-colors ${
                  settings.layout.portraitLayout === 'dual'
                    ? 'bg-blue-600 text-white border-2 border-blue-500'
                    : 'bg-gray-700 text-gray-200 hover:bg-gray-600 border-2 border-transparent'
                }`}
              >
                Two photos side by side
              </button>
              <button
                onClick={() => handleLayoutChange('portraitLayout', 'blurred-bg')}
                className={`w-full px-8 py-6 rounded-xl text-xl font-medium text-center transition-colors ${
                  settings.layout.portraitLayout === 'blurred-bg'
                    ? 'bg-blue-600 text-white border-2 border-blue-500'
                    : 'bg-gray-700 text-gray-200 hover:bg-gray-600 border-2 border-transparent'
                }`}
              >
                Photo with blurred background
              </button>
            </div>
            <div className="text-lg text-dark-muted">
              How to display portrait-oriented photos on the TV screen
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}