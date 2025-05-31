import { useSettingsStore } from '../stores/settingsStore'

export default function DisplaySettings() {
  const { settings, updateSettings } = useSettingsStore()

  const handleDisplayChange = (key: keyof typeof settings.display, value: any) => {
    updateSettings({
      display: {
        ...settings.display,
        [key]: value,
      },
    })
  }

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
        <h2 className="text-xl font-semibold mb-4">Display Options</h2>
        
        <div className="bg-white p-6 rounded-lg border shadow-sm space-y-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.display.showMetadata}
              onChange={(e) => handleDisplayChange('showMetadata', e.target.checked)}
              className="mr-3"
            />
            <span>Show Photo Metadata</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.display.showWeather}
              onChange={(e) => handleDisplayChange('showWeather', e.target.checked)}
              className="mr-3"
            />
            <span>Show Weather Information</span>
          </label>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Layout Settings</h2>
        
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div>
            <label className="block text-sm font-medium mb-3">Portrait Photo Layout</label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="portraitLayout"
                  value="single"
                  checked={settings.layout.portraitLayout === 'single'}
                  onChange={(e) => handleLayoutChange('portraitLayout', e.target.value)}
                  className="mr-3"
                />
                <span>Single Photo</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="portraitLayout"
                  value="dual"
                  checked={settings.layout.portraitLayout === 'dual'}
                  onChange={(e) => handleLayoutChange('portraitLayout', e.target.value)}
                  className="mr-3"
                />
                <span>Two Photos Side by Side</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="portraitLayout"
                  value="blurred-bg"
                  checked={settings.layout.portraitLayout === 'blurred-bg'}
                  onChange={(e) => handleLayoutChange('portraitLayout', e.target.value)}
                  className="mr-3"
                />
                <span>Photo with Blurred Background</span>
              </label>
            </div>
            <div className="text-xs text-gray-500 mt-2">
              How to display portrait-oriented photos
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}