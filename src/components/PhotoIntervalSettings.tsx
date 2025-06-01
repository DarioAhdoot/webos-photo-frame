import { useSettingsStore } from '../stores/settingsStore'

export default function PhotoIntervalSettings() {
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
            <h2 className="text-3xl font-semibold mb-6">Photo Display Duration</h2>
            <div className="flex items-center gap-6 mb-6">
              <button
                onClick={() => {
                  const current = settings.slideshow.interval
                  const decrement = current > 30 ? 5 : 1
                  handleSlideshowChange('interval', Math.max(1, current - decrement))
                }}
                className="px-6 py-4 bg-gray-600 hover:bg-gray-500 rounded-xl text-2xl font-bold min-w-[80px]"
                disabled={settings.slideshow.interval <= 1}
              >
                ◀
              </button>
              <span className="text-3xl font-medium min-w-[200px] text-center bg-gray-700 py-4 px-6 rounded-xl">
                {settings.slideshow.interval} second{settings.slideshow.interval !== 1 ? 's' : ''}
              </span>
              <button
                onClick={() => {
                  const current = settings.slideshow.interval
                  const increment = current >= 30 ? 5 : 1
                  handleSlideshowChange('interval', Math.min(60, current + increment))
                }}
                className="px-6 py-4 bg-gray-600 hover:bg-gray-500 rounded-xl text-2xl font-bold min-w-[80px]"
                disabled={settings.slideshow.interval >= 60}
              >
                ▶
              </button>
            </div>
            <div className="text-lg text-dark-muted">
              How long to display each photo before moving to the next one
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}