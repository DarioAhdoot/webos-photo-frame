import { useQueryClient } from '@tanstack/react-query'
import { useSettingsStore } from '../stores/settingsStore'
import { Card, ToggleButton, EnabledToggle } from './ui'

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
    <div className="space-y-10 pb-10">
      <Card title="Video Playback" padding="xl">
        <div className="space-y-8">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-medium text-dark-text">Show videos in slideshow</h3>
                <p className="text-xl text-dark-muted mt-2">Whether to include video files in the photo slideshow</p>
              </div>
              <EnabledToggle 
                enabled={settings.slideshow.videoEnabled}
                onToggle={() => handleSlideshowChange('videoEnabled', !settings.slideshow.videoEnabled)}
                size="lg"
              />
            </div>
          </div>

          {settings.slideshow.videoEnabled && (
            <>
              <div>
                <h3 className="text-2xl font-medium mb-6 text-dark-text">Video playback mode</h3>
                <div className="space-y-4 mb-6">
                  <ToggleButton
                    isActive={settings.slideshow.videoPlayback === 'full'}
                    onClick={() => handleSlideshowChange('videoPlayback', 'full')}
                    size="xl"
                    fullWidth
                  >
                    Play full video
                  </ToggleButton>
                  <ToggleButton
                    isActive={settings.slideshow.videoPlayback === 'duration'}
                    onClick={() => handleSlideshowChange('videoPlayback', 'duration')}
                    size="xl"
                    fullWidth
                  >
                    Limit duration
                  </ToggleButton>
                  {settings.slideshow.videoPlayback === 'duration' && (
                    <div className="text-lg text-blue-300 mt-3 text-center">
                      Uses photo interval of {settings.slideshow.interval}s
                    </div>
                  )}
                </div>
                <div className="text-xl text-dark-muted">
                  Whether to play videos completely or limit to a maximum duration
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-medium text-dark-text">Mute video audio</h3>
                    <p className="text-xl text-dark-muted mt-2">Whether videos should play with or without sound</p>
                  </div>
                  <EnabledToggle 
                    enabled={settings.slideshow.videoMuted}
                    onToggle={() => handleSlideshowChange('videoMuted', !settings.slideshow.videoMuted)}
                    size="lg"
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  )
}