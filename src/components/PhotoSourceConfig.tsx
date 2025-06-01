import { useSettingsStore } from '../stores/settingsStore'
import { Button, Card, StatusBadge } from './ui'
import type { PhotoSource, ImmichConfig } from '../types'

interface PhotoSourceConfigProps {
  onEditSource: (source: PhotoSource | null) => void
}

export default function PhotoSourceConfig({ onEditSource }: PhotoSourceConfigProps) {
  const { photoSources } = useSettingsStore()

  const handleAddSource = () => {
    onEditSource(null) // null indicates new source
  }

  const getSourceStatus = (source: PhotoSource) => {
    if (!source.enabled) {
      return { text: 'Disabled', variant: 'disabled' as const }
    }
    
    const config = source.config as ImmichConfig
    if (!config.serverUrl || (!config.apiKey && (!config.username || !config.password))) {
      return { text: 'Setup Required', variant: 'warning' as const }
    }
    
    return { text: 'Enabled', variant: 'enabled' as const }
  }

  const getAlbumCount = (source: PhotoSource) => {
    const config = source.config as ImmichConfig
    const count = config.albumIds?.length || 0
    return count === 0 ? 'All albums' : `${count} album${count !== 1 ? 's' : ''}`
  }

  return (
    <div className="space-y-10 pb-10">
      <div className="flex justify-between items-center">
        <h2 className="text-4xl font-semibold">Photo Sources</h2>
        <Button
          variant="primary"
          size="lg"
          onClick={handleAddSource}
          className="text-2xl px-8 py-4"
        >
          Add Immich Source
        </Button>
      </div>

      {photoSources.length === 0 ? (
        <div className="text-center py-20 text-dark-muted">
          <div className="text-8xl mb-8">📁</div>
          <div className="text-3xl mb-4">No photo sources configured</div>
          <div className="text-2xl">Add a source to get started</div>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {photoSources.map((source) => {
            const config = source.config as ImmichConfig
            const status = getSourceStatus(source)
            const albumCount = getAlbumCount(source)
            
            return (
              <Card
                key={source.id}
                padding="xl"
                className="hover:border-blue-500 cursor-pointer transition-all duration-200 hover:bg-gray-800 p-10"
                onClick={() => onEditSource(source)}
              >
                <div className="space-y-8">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-3xl font-semibold text-dark-text">{source.name}</h3>
                      <p className="text-2xl text-dark-muted capitalize">{source.type} server</p>
                    </div>
                    <StatusBadge variant={status.variant} size="lg">
                      {status.text}
                    </StatusBadge>
                  </div>
                  
                  <div className="space-y-4 text-2xl">
                    <div>
                      <span className="text-dark-muted">URL: </span>
                      <span className="text-dark-text">
                        {config.serverUrl || 'Not configured'}
                      </span>
                    </div>
                    <div>
                      <span className="text-dark-muted">Albums: </span>
                      <span className="text-dark-text">{albumCount}</span>
                    </div>
                  </div>
                  
                  <div className="pt-6 border-t border-dark-border">
                    <div className="text-xl text-dark-muted">
                      Click to configure this source
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
