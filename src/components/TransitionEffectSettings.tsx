import { useSettingsStore } from '../stores/settingsStore'
import { Card, ToggleButton } from './ui'

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

  const transitionOptions = [
    { value: 'none', label: 'None', description: 'Photos appear instantly with no transition effect' },
    { value: 'fade', label: 'Fade', description: 'Photos gradually fade from one to the next' },
    { value: 'slide', label: 'Slide', description: 'Photos slide horizontally from one to the next' },
    { value: 'ken-burns', label: 'Ken Burns (recommended)', description: 'Adds subtle zoom and pan effects' }
  ]

  return (
    <div className="space-y-10 pb-10">
      <Card title="Animation Between Photos" padding="xl">
        <div className="space-y-6">
          {transitionOptions.map((option) => (
            <div key={option.value}>
              <ToggleButton
                isActive={settings.slideshow.transition === option.value}
                onClick={() => handleSlideshowChange('transition', option.value)}
                size="xl"
                fullWidth
              >
                {option.label}
              </ToggleButton>
              <div className="text-lg text-dark-muted mt-3 text-center">
                {option.description}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}