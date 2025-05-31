import { useSettingsStore } from '../stores/settingsStore'

export default function NetworkSettings() {
  const { settings, updateSettings } = useSettingsStore()

  const handleCacheChange = (key: keyof typeof settings.cache, value: any) => {
    updateSettings({
      cache: {
        ...settings.cache,
        [key]: value,
      },
    })
  }

  return (
    <div className="space-y-8 pb-8">
      <div>
        <h2 className="text-xl font-semibold mb-4">Cache Settings</h2>
        
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div>
            <label className="block text-sm font-medium mb-2">
              Cache Size: {settings.cache.maxSizeMB} MB
            </label>
            <input
              type="range"
              min="10"
              max="1000"
              step="10"
              value={settings.cache.maxSizeMB}
              onChange={(e) => handleCacheChange('maxSizeMB', parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>10 MB</span>
              <span>1000 MB</span>
            </div>
            <div className="text-xs text-gray-500 mt-2">
              Amount of storage to use for caching photos locally
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}