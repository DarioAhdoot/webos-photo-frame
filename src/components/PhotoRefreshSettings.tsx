import { useSettingsStore } from '../stores/settingsStore'
import { useQueryClient } from '@tanstack/react-query'

export default function PhotoRefreshSettings() {
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
        <div className="bg-dark-card p-8 rounded-xl border border-dark-border shadow-sm space-y-6">
          <div>
            <h2 className="text-3xl font-semibold mb-6">Auto-refresh Media</h2>
            <div className="flex items-center gap-6 mb-6">
              <button
                onClick={() => {
                  const current = settings.network.refreshIntervalHours
                  const newValue = current <= 1 ? 1 : current <= 6 ? current - 1 : current <= 24 ? current - 6 : current - 24
                  handleNetworkChange('refreshIntervalHours', Math.max(1, newValue))
                }}
                className="px-6 py-4 bg-gray-600 hover:bg-gray-500 rounded-xl text-2xl font-bold min-w-[80px]"
                disabled={settings.network.refreshIntervalHours <= 1}
              >
                ◀
              </button>
              <span className="text-3xl font-medium min-w-[200px] text-center bg-gray-700 py-4 px-6 rounded-xl">
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
                className="px-6 py-4 bg-gray-600 hover:bg-gray-500 rounded-xl text-2xl font-bold min-w-[80px]"
                disabled={settings.network.refreshIntervalHours >= 168}
              >
                ▶
              </button>
            </div>
            <div className="text-lg text-dark-muted mb-6">
              How often to automatically fetch new media from your sources
            </div>
          </div>

          <button
            onClick={handleRefreshNow}
            className="w-full px-8 py-6 rounded-xl text-xl font-medium text-center transition-colors bg-blue-600 text-white border-2 border-blue-500 hover:bg-blue-700"
          >
            Refresh library now
          </button>
        </div>
      </div>
    </div>
  )
}