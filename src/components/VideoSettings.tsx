import { useQueryClient } from '@tanstack/react-query'
import { useSettingsStore } from '../stores/settingsStore'

export default function VideoSettings() {
  const { settings, updateSettings } = useSettingsStore()
  const queryClient = useQueryClient()

  const handleSlideshowChange = (key: keyof typeof settings.slideshow, value: any) => {
    updateSettings({
      slideshow: {
        ...settings.slideshow,
        [key]: value,
      },
    })
    
    // Invalidate photo cache when video settings change that affect photo loading
    if (key === 'videoEnabled') {
      queryClient.invalidateQueries({ queryKey: ['all-photos'] })
    }
  }

  return (
    <div className="space-y-8 pb-8">
      <div>
        <div className="bg-dark-card p-8 rounded-xl border border-dark-border shadow-sm space-y-6">
          <div>
            <h2 className="text-3xl font-semibold mb-6">Video Playback</h2>
            <button
              onClick={() => handleSlideshowChange('videoEnabled', !settings.slideshow.videoEnabled)}
              className={`w-full px-8 py-6 rounded-xl text-xl font-medium text-center transition-colors border-2 ${
                settings.slideshow.videoEnabled
                  ? 'bg-blue-600 text-white border-blue-500'
                  : 'bg-gray-700 text-gray-200 hover:bg-gray-600 border-transparent'
              }`}
            >
              <span className="flex items-center justify-center">
                <span className={`mr-4 text-2xl ${settings.slideshow.videoEnabled ? '✓' : '○'}`}></span>
                Show videos in slideshow
              </span>
            </button>
            <div className="text-lg text-dark-muted mt-4">
              Whether to include video files in the photo slideshow
            </div>
          </div>

          {settings.slideshow.videoEnabled && (
            <>
              <div>
                <h3 className="text-2xl font-medium mb-6">Video Playback Mode</h3>
                <div className="space-y-4 mb-6">
                  <button
                    onClick={() => handleSlideshowChange('videoPlayback', 'full')}
                    className={`w-full px-8 py-6 rounded-xl text-xl font-medium text-center transition-colors ${
                      settings.slideshow.videoPlayback === 'full'
                        ? 'bg-blue-600 text-white border-2 border-blue-500'
                        : 'bg-gray-700 text-gray-200 hover:bg-gray-600 border-2 border-transparent'
                    }`}
                  >
                    Play Full Video
                  </button>
                  <button
                    onClick={() => handleSlideshowChange('videoPlayback', 'duration')}
                    className={`w-full px-8 py-6 rounded-xl text-xl font-medium text-center transition-colors ${
                      settings.slideshow.videoPlayback === 'duration'
                        ? 'bg-blue-600 text-white border-2 border-blue-500'
                        : 'bg-gray-700 text-gray-200 hover:bg-gray-600 border-2 border-transparent'
                    }`}
                  >
                    Limit Duration
                  </button>
                  {settings.slideshow.videoPlayback === 'duration' && (
                    <div className="text-md text-blue-300 mt-2 text-center">
                      Uses photo interval of {settings.slideshow.interval}s
                    </div>
                  )}
                </div>
                <div className="text-lg text-dark-muted mb-6">
                  Whether to play videos completely or limit to a maximum duration
                </div>
              </div>

              <div>
                <button
                  onClick={() => handleSlideshowChange('videoMuted', !settings.slideshow.videoMuted)}
                  className={`w-full px-8 py-6 rounded-xl text-xl font-medium text-center transition-colors border-2 ${
                    settings.slideshow.videoMuted
                      ? 'bg-blue-600 text-white border-blue-500'
                      : 'bg-gray-700 text-gray-200 hover:bg-gray-600 border-transparent'
                  }`}
                >
                  <span className="flex items-center justify-center">
                    <span className={`mr-4 text-2xl ${settings.slideshow.videoMuted ? '✓' : '○'}`}></span>
                    Mute video audio
                  </span>
                </button>
                <div className="text-lg text-dark-muted mt-4">
                  Whether videos should play with or without sound
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}