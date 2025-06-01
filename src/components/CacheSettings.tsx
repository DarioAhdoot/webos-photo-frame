import { useSettingsStore } from '../stores/settingsStore'

export default function CacheSettings() {
  const { settings, updateSettings } = useSettingsStore()

  const handleNetworkChange = (key: keyof typeof settings.network, value: any) => {
    updateSettings({
      network: {
        ...settings.network,
        [key]: value,
      },
    })
  }

  return (
    <div className="space-y-8 pb-8">
      <div>
        <div className="bg-dark-card p-8 rounded-xl border border-dark-border shadow-sm">
          <div>
            <h2 className="text-3xl font-semibold mb-6">Cache Size</h2>
            <div className="flex items-center gap-6 mb-6">
              <button
                onClick={() => {
                  const current = settings.network.maxSizeMB
                  const decrement = current <= 100 ? 10 : current <= 500 ? 50 : 100
                  handleNetworkChange('maxSizeMB', Math.max(10, current - decrement))
                }}
                className="px-6 py-4 bg-gray-600 hover:bg-gray-500 rounded-xl text-2xl font-bold min-w-[80px]"
                disabled={settings.network.maxSizeMB <= 10}
              >
                ◀
              </button>
              <span className="text-3xl font-medium min-w-[200px] text-center bg-gray-700 py-4 px-6 rounded-xl">
                {settings.network.maxSizeMB} MB
              </span>
              <button
                onClick={() => {
                  const current = settings.network.maxSizeMB
                  const increment = current < 100 ? 10 : current < 500 ? 50 : 100
                  handleNetworkChange('maxSizeMB', Math.min(1000, current + increment))
                }}
                className="px-6 py-4 bg-gray-600 hover:bg-gray-500 rounded-xl text-2xl font-bold min-w-[80px]"
                disabled={settings.network.maxSizeMB >= 1000}
              >
                ▶
              </button>
            </div>
            <div className="text-lg text-dark-muted">
              Amount of storage to use for caching photos locally for faster loading
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}