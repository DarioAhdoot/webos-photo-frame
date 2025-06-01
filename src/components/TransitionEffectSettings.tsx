import { useSettingsStore } from '../stores/settingsStore'

export default function TransitionEffectSettings() {
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
            <h2 className="text-3xl font-semibold mb-6">Animation Between Photos</h2>
            <div className="space-y-4 mb-6">
              <div>
                <button
                  onClick={() => handleSlideshowChange('transition', 'none')}
                  className={`w-full px-8 py-6 rounded-xl text-xl font-medium text-center transition-colors ${
                    settings.slideshow.transition === 'none'
                      ? 'bg-blue-600 text-white border-2 border-blue-500'
                      : 'bg-gray-700 text-gray-200 hover:bg-gray-600 border-2 border-transparent'
                  }`}
                >
                  None
                </button>
                <div className="text-md text-gray-400 mt-2 text-center">
                  Photos appear instantly with no transition effect
                </div>
              </div>
              
              <div>
                <button
                  onClick={() => handleSlideshowChange('transition', 'fade')}
                  className={`w-full px-8 py-6 rounded-xl text-xl font-medium text-center transition-colors ${
                    settings.slideshow.transition === 'fade'
                      ? 'bg-blue-600 text-white border-2 border-blue-500'
                      : 'bg-gray-700 text-gray-200 hover:bg-gray-600 border-2 border-transparent'
                  }`}
                >
                  Fade
                </button>
                <div className="text-md text-gray-400 mt-2 text-center">
                  Photos gradually fade from one to the next
                </div>
              </div>
              
              <div>
                <button
                  onClick={() => handleSlideshowChange('transition', 'slide')}
                  className={`w-full px-8 py-6 rounded-xl text-xl font-medium text-center transition-colors ${
                    settings.slideshow.transition === 'slide'
                      ? 'bg-blue-600 text-white border-2 border-blue-500'
                      : 'bg-gray-700 text-gray-200 hover:bg-gray-600 border-2 border-transparent'
                  }`}
                >
                  Slide
                </button>
                <div className="text-md text-gray-400 mt-2 text-center">
                  Photos slide horizontally from one to the next
                </div>
              </div>
              
              <div>
                <button
                  onClick={() => handleSlideshowChange('transition', 'ken-burns')}
                  className={`w-full px-8 py-6 rounded-xl text-xl font-medium text-center transition-colors ${
                    settings.slideshow.transition === 'ken-burns'
                      ? 'bg-blue-600 text-white border-2 border-blue-500'
                      : 'bg-gray-700 text-gray-200 hover:bg-gray-600 border-2 border-transparent'
                  }`}
                >
                  Ken Burns (Recommended)
                </button>
                <div className="text-md text-gray-400 mt-2 text-center">
                  Adds subtle zoom and pan effects like Apple TV screensavers
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}