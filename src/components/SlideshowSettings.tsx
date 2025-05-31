import { useSettingsStore } from '../stores/settingsStore'

export default function SlideshowSettings() {
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
        <h2 className="text-xl font-semibold mb-4">Slideshow Settings</h2>
        
        <div className="bg-white p-6 rounded-lg border shadow-sm space-y-4">
          <div>
            <label className="block text-sm font-medium mb-3">Photo Interval</label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  const current = settings.slideshow.interval
                  const decrement = current > 30 ? 5 : 1
                  handleSlideshowChange('interval', Math.max(1, current - decrement))
                }}
                className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-lg font-bold"
                disabled={settings.slideshow.interval <= 1}
              >
                ◀
              </button>
              <span className="text-lg font-medium min-w-[80px] text-center">
                {settings.slideshow.interval} second{settings.slideshow.interval !== 1 ? 's' : ''}
              </span>
              <button
                onClick={() => {
                  const current = settings.slideshow.interval
                  const increment = current >= 30 ? 5 : 1
                  handleSlideshowChange('interval', Math.min(60, current + increment))
                }}
                className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-lg font-bold"
                disabled={settings.slideshow.interval >= 60}
              >
                ▶
              </button>
            </div>
            <div className="text-xs text-gray-500 mt-2">
              How long to display each photo
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-3">Transition Effect</label>
            <div className="flex gap-6 flex-wrap">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="transition"
                  value="fade"
                  checked={settings.slideshow.transition === 'fade'}
                  onChange={(e) => handleSlideshowChange('transition', e.target.value)}
                  className="mr-3"
                />
                <span>Fade</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="transition"
                  value="slide"
                  checked={settings.slideshow.transition === 'slide'}
                  onChange={(e) => handleSlideshowChange('transition', e.target.value)}
                  className="mr-3"
                />
                <span>Slide</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="transition"
                  value="ken-burns"
                  checked={settings.slideshow.transition === 'ken-burns'}
                  onChange={(e) => handleSlideshowChange('transition', e.target.value)}
                  className="mr-3"
                />
                <span>Ken Burns (Recommended)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="transition"
                  value="none"
                  checked={settings.slideshow.transition === 'none'}
                  onChange={(e) => handleSlideshowChange('transition', e.target.value)}
                  className="mr-3"
                />
                <span>None</span>
              </label>
            </div>
            <div className="text-xs text-gray-500 mt-2">
              Ken Burns adds subtle zoom and pan effects like Apple TV screensavers
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-3">Media Order</label>
            <div className="flex gap-6">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="order"
                  value="random"
                  checked={settings.slideshow.order === 'random'}
                  onChange={(e) => handleSlideshowChange('order', e.target.value)}
                  className="mr-3"
                />
                <span>Random</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="order"
                  value="sequential"
                  checked={settings.slideshow.order === 'sequential'}
                  onChange={(e) => handleSlideshowChange('order', e.target.value)}
                  className="mr-3"
                />
                <span>Sequential</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}