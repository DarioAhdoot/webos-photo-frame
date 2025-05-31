import { useSettingsStore } from '../stores/settingsStore'
import { useQueryClient } from '@tanstack/react-query'

export default function NetworkSettings() {
  const { settings, updateSettings } = useSettingsStore()
  const queryClient = useQueryClient()

  const handleNetworkChange = (key: keyof typeof settings.network, value: any) => {
    updateSettings({
      network: {
        ...settings.network,
        [key]: value,
      },
    })
  }

  const handleRefreshNow = () => {
    // Invalidate all photo queries to force a refresh
    queryClient.invalidateQueries({ queryKey: ['all-photos'] })
  }

  return (
    <div className="space-y-8 pb-8">
      <div>
        <h2 className="text-xl font-semibold mb-4">Photo Refresh Settings</h2>
        
        <div className="bg-white p-6 rounded-lg border shadow-sm space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Auto-refresh photos every: {settings.network.refreshIntervalHours} hours
            </label>
            <input
              type="range"
              min="1"
              max="168"
              step="1"
              value={settings.network.refreshIntervalHours}
              onChange={(e) => handleNetworkChange('refreshIntervalHours', parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1h</span>
              <span>7 days</span>
            </div>
            <div className="text-xs text-gray-500 mt-2">
              How often to automatically fetch new photos from your sources
            </div>
          </div>

          <button
            onClick={handleRefreshNow}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh Photos Now
          </button>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Cache Settings</h2>
        
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div>
            <label className="block text-sm font-medium mb-2">
              Cache Size: {settings.network.maxSizeMB} MB
            </label>
            <input
              type="range"
              min="10"
              max="1000"
              step="10"
              value={settings.network.maxSizeMB}
              onChange={(e) => handleNetworkChange('maxSizeMB', parseInt(e.target.value))}
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