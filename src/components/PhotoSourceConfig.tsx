import { useState } from 'react'
import { useSettingsStore } from '../stores/settingsStore'
import type { PhotoSource, ImmichConfig } from '../types'

export default function PhotoSourceConfig() {
  const { photoSources, addPhotoSource, updatePhotoSource, removePhotoSource } = useSettingsStore()
  const [showAddModal, setShowAddModal] = useState(false)

  const handleAddImmichSource = () => {
    const newSource: PhotoSource = {
      id: `immich-${Date.now()}`,
      name: 'My Immich Server',
      type: 'immich',
      config: {
        serverUrl: '',
        apiKey: '',
        albumIds: [],
      } as ImmichConfig,
      enabled: false,
    }
    addPhotoSource(newSource)
    setShowAddModal(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Photo Sources</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Add Source
        </button>
      </div>

      {photoSources.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-4">📁</div>
          <div>No photo sources configured</div>
          <div className="text-sm mt-2">Add a source to get started</div>
        </div>
      ) : (
        <div className="space-y-4">
          {photoSources.map((source) => (
            <div key={source.id} className="bg-white p-4 rounded-lg border shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-medium">{source.name}</h3>
                  <div className="text-sm text-gray-500 capitalize">{source.type}</div>
                </div>
                <div className="flex gap-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={source.enabled}
                      onChange={(e) => updatePhotoSource(source.id, { enabled: e.target.checked })}
                      className="mr-2"
                    />
                    Enabled
                  </label>
                  <button
                    onClick={() => removePhotoSource(source.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>
              
              {source.type === 'immich' && (
                <ImmichSourceConfig source={source} onUpdate={updatePhotoSource} />
              )}
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Add Photo Source</h3>
            <div className="space-y-3">
              <button
                onClick={handleAddImmichSource}
                className="w-full p-3 text-left border rounded-lg hover:bg-gray-50"
              >
                <div className="font-medium">Immich Server</div>
                <div className="text-sm text-gray-500">Connect to your Immich instance</div>
              </button>
              <button
                disabled
                className="w-full p-3 text-left border rounded-lg opacity-50 cursor-not-allowed"
              >
                <div className="font-medium">Google Photos</div>
                <div className="text-sm text-gray-500">Coming soon</div>
              </button>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface ImmichSourceConfigProps {
  source: PhotoSource
  onUpdate: (id: string, updates: Partial<PhotoSource>) => void
}

function ImmichSourceConfig({ source, onUpdate }: ImmichSourceConfigProps) {
  const config = source.config as ImmichConfig

  const updateConfig = (updates: Partial<ImmichConfig>) => {
    onUpdate(source.id, {
      config: { ...config, ...updates }
    })
  }

  return (
    <div className="space-y-3 pt-3 border-t">
      <div>
        <label className="block text-sm font-medium mb-1">Server URL</label>
        <input
          type="url"
          value={config.serverUrl}
          onChange={(e) => updateConfig({ serverUrl: e.target.value })}
          placeholder="https://your-immich-server.com"
          className="w-full px-3 py-2 border rounded-md"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">API Key</label>
        <input
          type="password"
          value={config.apiKey || ''}
          onChange={(e) => updateConfig({ apiKey: e.target.value })}
          placeholder="Your Immich API key"
          className="w-full px-3 py-2 border rounded-md"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Album IDs</label>
        <textarea
          value={config.albumIds.join('\n')}
          onChange={(e) => updateConfig({ albumIds: e.target.value.split('\n').filter(Boolean) })}
          placeholder="Enter album IDs, one per line"
          rows={3}
          className="w-full px-3 py-2 border rounded-md"
        />
        <div className="text-xs text-gray-500 mt-1">Leave empty to use all albums</div>
      </div>
    </div>
  )
}