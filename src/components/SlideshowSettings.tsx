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

  const handleLayoutChange = (key: keyof typeof settings.layout, value: any) => {
    updateSettings({
      layout: {
        ...settings.layout,
        [key]: value,
      },
    })
  }

  const handleDisplayChange = (key: keyof typeof settings.display, value: any) => {
    updateSettings({
      display: {
        ...settings.display,
        [key]: value,
      },
    })
  }

  const handleCacheChange = (key: keyof typeof settings.cache, value: any) => {
    updateSettings({
      cache: {
        ...settings.cache,
        [key]: value,
      },
    })
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-4">Slideshow Settings</h2>
        
        <div className="bg-white p-6 rounded-lg border shadow-sm space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Interval (seconds): {settings.slideshow.interval}
            </label>
            <input
              type="range"
              min="1"
              max="60"
              value={settings.slideshow.interval}
              onChange={(e) => handleSlideshowChange('interval', parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1s</span>
              <span>60s</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Transition Effect</label>
            <select
              value={settings.slideshow.transition}
              onChange={(e) => handleSlideshowChange('transition', e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="fade">Fade</option>
              <option value="slide">Slide</option>
              <option value="none">None</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Photo Order</label>
            <select
              value={settings.slideshow.order}
              onChange={(e) => handleSlideshowChange('order', e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="random">Random</option>
              <option value="sequential">Sequential</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Layout Settings</h2>
        
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div>
            <label className="block text-sm font-medium mb-2">Portrait Photo Layout</label>
            <select
              value={settings.layout.portraitLayout}
              onChange={(e) => handleLayoutChange('portraitLayout', e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="single">Single Photo</option>
              <option value="dual">Two Photos Side by Side</option>
              <option value="blurred-bg">Photo with Blurred Background</option>
            </select>
            <div className="text-xs text-gray-500 mt-1">
              How to display portrait-oriented photos
            </div>
          </div>
        </div>
      </div>

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