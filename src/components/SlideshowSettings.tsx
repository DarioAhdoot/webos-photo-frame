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
    <div className="space-y-8 pb-8">
      <div>
        <h2 className="text-xl font-semibold mb-4">Slideshow Settings</h2>
        
        <div className="bg-white p-6 rounded-lg border shadow-sm space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Photo Interval (seconds): {settings.slideshow.interval}
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
            <div className="text-xs text-gray-500 mt-1">
              How long to display each photo
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-3">Transition Effect</label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="transition"
                  value="fade"
                  checked={settings.slideshow.transition === 'fade'}
                  onChange={(e) => handleSlideshowChange('transition', e.target.value)}
                  className="mr-3"
                />
                <span>Fade (Recommended)</span>
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
                  value="none"
                  checked={settings.slideshow.transition === 'none'}
                  onChange={(e) => handleSlideshowChange('transition', e.target.value)}
                  className="mr-3"
                />
                <span>None</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-3">Media Order</label>
            <div className="space-y-2">
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

      <div>
        <h2 className="text-xl font-semibold mb-4">Video Settings</h2>
        
        <div className="bg-white p-6 rounded-lg border shadow-sm space-y-4">
          <div>
            <label className="block text-sm font-medium mb-3">Video Playback Mode</label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="videoPlayback"
                  value="full"
                  checked={settings.slideshow.videoPlayback === 'full'}
                  onChange={(e) => handleSlideshowChange('videoPlayback', e.target.value)}
                  className="mr-3"
                />
                <span>Play Full Video</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="videoPlayback"
                  value="duration"
                  checked={settings.slideshow.videoPlayback === 'duration'}
                  onChange={(e) => handleSlideshowChange('videoPlayback', e.target.value)}
                  className="mr-3"
                />
                <span>Limit Duration</span>
              </label>
            </div>
            <div className="text-xs text-gray-500 mt-2">
              Whether to play videos completely or limit to a maximum duration
            </div>
          </div>

          {settings.slideshow.videoPlayback === 'duration' && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Maximum Video Duration (seconds): {settings.slideshow.videoDuration}
              </label>
              <input
                type="range"
                min="5"
                max="300"
                step="5"
                value={settings.slideshow.videoDuration}
                onChange={(e) => handleSlideshowChange('videoDuration', parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>5s</span>
                <span>5min</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Videos longer than this will advance to the next item after this duration
              </div>
            </div>
          )}
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