import { useSettingsStore } from '../stores/settingsStore'
import { Button } from './ui'
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
      return { text: 'Disabled', class: 'text-gray-400 bg-gray-700 border-gray-600' }
    }
    
    const config = source.config as ImmichConfig
    if (!config.serverUrl || (!config.apiKey && (!config.username || !config.password))) {
      return { text: 'Setup Required', class: 'text-amber-400 bg-amber-900 border-amber-700' }
    }
    
    return { text: 'Enabled', class: 'text-green-400 bg-green-900 border-green-700' }
  }

  const getAlbumCount = (source: PhotoSource) => {
    const config = source.config as ImmichConfig
    const count = config.albumIds?.length || 0
    return count === 0 ? 'All albums' : `${count} album${count !== 1 ? 's' : ''}`
  }

  return (
    <div className="space-y-8 pb-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-semibold">Photo Sources</h2>
        <Button
          variant="primary"
          size="lg"
          onClick={handleAddSource}
        >
          Add Immich Source
        </Button>
      </div>

      {photoSources.length === 0 ? (
        <div className="text-center py-16 text-dark-muted">
          <div className="text-6xl mb-6">📁</div>
          <div className="text-2xl mb-3">No photo sources configured</div>
          <div className="text-lg">Add a source to get started</div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {photoSources.map((source) => {
            const config = source.config as ImmichConfig
            const status = getSourceStatus(source)
            const albumCount = getAlbumCount(source)
            
            return (
              <div 
                key={source.id} 
                onClick={() => onEditSource(source)}
                className="bg-dark-card p-8 rounded-xl border border-dark-border shadow-sm hover:border-blue-500 cursor-pointer transition-all duration-200 hover:bg-gray-800"
              >
                <div className="space-y-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-2xl font-semibold text-dark-text">{source.name}</h3>
                      <p className="text-lg text-dark-muted capitalize">{source.type} server</p>
                    </div>
                    <span className={`px-3 py-2 rounded-lg text-sm border font-medium ${status.class}`}>
                      {status.text}
                    </span>
                  </div>
                  
                  <div className="space-y-3 text-lg">
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
                  
                  <div className="pt-4 border-t border-dark-border">
                    <div className="text-base text-dark-muted">
                      Click to configure this source
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
