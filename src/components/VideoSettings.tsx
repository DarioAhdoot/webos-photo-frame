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
        <h2 className="text-xl font-semibold mb-4">Video Settings</h2>
        
        <div className="bg-white p-6 rounded-lg border shadow-sm space-y-4">
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.slideshow.videoEnabled}
                onChange={(e) => handleSlideshowChange('videoEnabled', e.target.checked)}
                className="mr-3"
              />
              <span className="font-medium">Show videos in slideshow</span>
            </label>
            <div className="text-xs text-gray-500 mt-1">
              Whether to include video files in the photo slideshow
            </div>
          </div>

          {settings.slideshow.videoEnabled && (
            <>
              <div>
            <label className="block text-sm font-medium mb-3">Video Playback Mode</label>
            <div className="flex gap-6 items-center flex-wrap">
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
                <span>Limit Duration (uses photo interval of {settings.slideshow.interval}s)</span>
              </label>
            </div>
            <div className="text-xs text-gray-500 mt-2">
              Whether to play videos completely or limit to a maximum duration
            </div>
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.slideshow.videoMuted}
                onChange={(e) => handleSlideshowChange('videoMuted', e.target.checked)}
                className="mr-3"
              />
              <span>Mute video audio</span>
            </label>
            <div className="text-xs text-gray-500 mt-1">
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