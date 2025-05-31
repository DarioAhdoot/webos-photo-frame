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
            <label className="block text-sm font-medium mb-3">Auto-refresh Photos</label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  const current = settings.network.refreshIntervalHours
                  const newValue = current <= 1 ? 1 : current <= 6 ? current - 1 : current <= 24 ? current - 6 : current - 24
                  handleNetworkChange('refreshIntervalHours', Math.max(1, newValue))
                }}
                className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-lg font-bold"
                disabled={settings.network.refreshIntervalHours <= 1}
              >
                ◀
              </button>
              <span className="text-lg font-medium min-w-[100px] text-center">
                {settings.network.refreshIntervalHours === 1 ? '1 hour' : 
                 settings.network.refreshIntervalHours < 24 ? `${settings.network.refreshIntervalHours} hours` :
                 settings.network.refreshIntervalHours === 24 ? '1 day' :
                 `${Math.round(settings.network.refreshIntervalHours / 24)} days`}
              </span>
              <button
                onClick={() => {
                  const current = settings.network.refreshIntervalHours
                  const newValue = current < 6 ? current + 1 : current < 24 ? current + 6 : current + 24
                  handleNetworkChange('refreshIntervalHours', Math.min(168, newValue))
                }}
                className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-lg font-bold"
                disabled={settings.network.refreshIntervalHours >= 168}
              >
                ▶
              </button>
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
            <label className="block text-sm font-medium mb-3">Cache Size</label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  const current = settings.network.maxSizeMB
                  const decrement = current <= 100 ? 10 : current <= 500 ? 50 : 100
                  handleNetworkChange('maxSizeMB', Math.max(10, current - decrement))
                }}
                className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-lg font-bold"
                disabled={settings.network.maxSizeMB <= 10}
              >
                ◀
              </button>
              <span className="text-lg font-medium min-w-[80px] text-center">
                {settings.network.maxSizeMB} MB
              </span>
              <button
                onClick={() => {
                  const current = settings.network.maxSizeMB
                  const increment = current < 100 ? 10 : current < 500 ? 50 : 100
                  handleNetworkChange('maxSizeMB', Math.min(1000, current + increment))
                }}
                className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-lg font-bold"
                disabled={settings.network.maxSizeMB >= 1000}
              >
                ▶
              </button>
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