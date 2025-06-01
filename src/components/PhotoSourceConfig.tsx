import { useState } from 'react'
import { useSettingsStore } from '../stores/settingsStore'
import { useTestConnection } from '../hooks/usePhotoSources'
import type { PhotoSource, ImmichConfig } from '../types'

interface PhotoSourceConfigProps {
  onOpenAlbumSelection: (photoSource: PhotoSource) => void
}

export default function PhotoSourceConfig({ onOpenAlbumSelection }: PhotoSourceConfigProps) {
  const { photoSources, addPhotoSource, updatePhotoSource, removePhotoSource } = useSettingsStore()

  const handleAddImmichSource = () => {
    const newSource: PhotoSource = {
      id: `immich-${Date.now()}`,
      name: 'My Immich Server',
      type: 'immich',
      config: {
        serverUrl: '',
        apiKey: '',
        username: '',
        password: '',
        albumIds: [],
      } as ImmichConfig,
      enabled: false,
    }
    addPhotoSource(newSource)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Photo Sources</h2>
        <button
          onClick={handleAddImmichSource}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Add Immich Source
        </button>
      </div>

      {photoSources.length === 0 ? (
        <div className="text-center py-12 text-dark-muted">
          <div className="text-4xl mb-4">📁</div>
          <div>No photo sources configured</div>
          <div className="text-sm mt-2">Add a source to get started</div>
        </div>
      ) : (
        <div className="space-y-4">
          {photoSources.map((source) => (
            <div key={source.id} className="bg-dark-card p-4 rounded-lg border border-dark-border shadow-sm">
              <div className="mb-3">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <div className="text-xl font-semibold text-dark-text capitalize">{source.type} server</div>
                    {source.config && (source.config as ImmichConfig).serverUrl ? (
                      <span className="text-green-400 bg-green-900 px-2 py-1 rounded text-xs border border-green-700">
                        Configured
                      </span>
                    ) : (
                      <span className="text-amber-400 bg-amber-900 px-2 py-1 rounded text-xs border border-amber-700">
                        Setup Required
                      </span>
                    )}
                  </div>
                  
                  <div className="flex gap-3 items-center">
                    <button
                      onClick={() => updatePhotoSource(source.id, { enabled: !source.enabled })}
                      className={`flex items-center px-4 py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 ${
                        source.enabled 
                          ? 'bg-green-600 border-green-500 text-white hover:bg-green-700 focus:border-green-400' 
                          : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 focus:border-gray-400'
                      }`}
                      tabIndex={0}
                    >
                      <div className={`w-5 h-5 rounded border-2 mr-3 flex items-center justify-center ${
                        source.enabled 
                          ? 'bg-white border-white' 
                          : 'bg-transparent border-gray-400'
                      }`}>
                        {source.enabled && (
                          <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <span className="text-sm font-medium">
                        {source.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </button>
                    
                    <button
                      onClick={() => removePhotoSource(source.id)}
                      className="px-4 py-3 rounded-lg border-2 border-red-600 bg-red-600 text-white hover:bg-red-700 hover:border-red-500 focus:outline-none focus:ring-4 focus:ring-red-500 focus:ring-opacity-50 focus:border-red-400 transition-all duration-200 text-sm font-medium"
                      tabIndex={0}
                    >
                      Remove
                    </button>
                  </div>
                </div>
                
                <input
                  type="text"
                  value={source.name}
                  onChange={(e) => updatePhotoSource(source.id, { name: e.target.value })}
                  className="w-full px-3 py-2 border border-dark-border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-dark-card text-dark-text"
                  placeholder="Unnamed source"
                />
              </div>
              
              {source.type === 'immich' && (
                <ImmichSourceConfig 
                  source={source} 
                  onUpdate={updatePhotoSource}
                  onOpenAlbumSelection={onOpenAlbumSelection}
                />
              )}
            </div>
          ))}
        </div>
      )}

    </div>
  )
}

interface ImmichSourceConfigProps {
  source: PhotoSource
  onUpdate: (id: string, updates: Partial<PhotoSource>) => void
  onOpenAlbumSelection: (photoSource: PhotoSource) => void
}

function ImmichSourceConfig({ source, onUpdate, onOpenAlbumSelection }: ImmichSourceConfigProps) {
  const [authType, setAuthType] = useState<'apiKey' | 'password'>(() => {
    // Determine initial auth type based on existing config
    const config = source.config as ImmichConfig
    if (config.apiKey) return 'apiKey'
    if (config.username && config.password) return 'password'
    return 'apiKey' // default
  })
  
  const testConnection = useTestConnection(source.id)
  const config = source.config as ImmichConfig

  const updateConfig = (updates: Partial<ImmichConfig>) => {
    const newConfig = { ...config, ...updates }
    onUpdate(source.id, { config: newConfig })
  }

  const handleAuthTypeChange = (newAuthType: 'apiKey' | 'password') => {
    setAuthType(newAuthType)
    
    // Clear fields from the other auth method
    if (newAuthType === 'apiKey') {
      updateConfig({ username: '', password: '' })
    } else {
      updateConfig({ apiKey: '' })
    }
  }

  const getConnectionStatus = () => {
    if (testConnection.isLoading) return { text: 'Testing...', class: 'text-yellow-400', detail: null }
    if (testConnection.isError) {
      const errorMessage = testConnection.error?.message || 'Unknown error'
      return { 
        text: 'Connection failed', 
        class: 'text-red-400',
        detail: errorMessage
      }
    }
    if (testConnection.data === true) return { text: 'Connected ✓', class: 'text-green-400', detail: null }
    if (testConnection.data === false) return { text: 'Connection failed', class: 'text-red-400', detail: null }
    return null
  }

  const connectionStatus = getConnectionStatus()

  return (
    <div className="space-y-4 pt-3 border-t border-dark-border">
      <div>
        <label className="block text-sm font-medium mb-1 text-dark-text">Server URL</label>
        <input
          type="url"
          value={config.serverUrl}
          onChange={(e) => updateConfig({ serverUrl: e.target.value })}
          placeholder="http://your-server.com:2283"
          className="w-full px-3 py-2 border border-dark-border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-dark-card text-dark-text"
        />
        <div className="text-xs text-dark-muted mt-1">
          Enter your Immich server URL (without /api path). Example: http://diarrhio.mooo.com:2283
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2 text-dark-text">Authentication Method</label>
        <div className="flex gap-4 mb-3">
          <label className="flex items-center">
            <input
              type="radio"
              name={`auth-type-${source.id}`}
              value="apiKey"
              checked={authType === 'apiKey'}
              onChange={() => handleAuthTypeChange('apiKey')}
              className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-dark-border"
            />
            <span className="text-sm text-dark-text">API Key</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name={`auth-type-${source.id}`}
              value="password"
              checked={authType === 'password'}
              onChange={() => handleAuthTypeChange('password')}
              className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-dark-border"
            />
            <span className="text-sm text-dark-text">Username & Password</span>
          </label>
        </div>
        
        {authType === 'apiKey' ? (
          <div>
            <label className="block text-sm font-medium mb-1 text-dark-text">API Key</label>
            <input
              type="password"
              value={config.apiKey || ''}
              onChange={(e) => updateConfig({ apiKey: e.target.value })}
              placeholder="Your Immich API key"
              className="w-full px-3 py-2 border border-dark-border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-dark-card text-dark-text"
            />
            <div className="text-xs text-dark-muted mt-1">
              Create an API key in your Immich user settings
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1 text-dark-text">Username (Email)</label>
              <input
                type="email"
                value={config.username || ''}
                onChange={(e) => updateConfig({ username: e.target.value })}
                placeholder="your-email@example.com"
                className="w-full px-3 py-2 border border-dark-border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-dark-card text-dark-text"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-dark-text">Password</label>
              <input
                type="password"
                value={config.password || ''}
                onChange={(e) => updateConfig({ password: e.target.value })}
                placeholder="Your Immich password"
                className="w-full px-3 py-2 border border-dark-border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-dark-card text-dark-text"
              />
            </div>
          </div>
        )}
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1 text-dark-text">Albums</label>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onOpenAlbumSelection(source)}
            disabled={!config.serverUrl || 
              (authType === 'apiKey' && !config.apiKey) ||
              (authType === 'password' && (!config.username || !config.password))}
            className="px-4 py-2 border border-dark-border rounded-md text-sm font-medium text-dark-text hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Select Albums ({config.albumIds.length} selected)
          </button>
          <div className="text-xs text-dark-muted">
            {config.albumIds.length === 0 ? 'All albums will be used' : `${config.albumIds.length} album${config.albumIds.length !== 1 ? 's' : ''} selected`}
          </div>
        </div>
      </div>
      
      {/* Test Connection */}
      <div className="flex gap-3 pt-2 items-center">
        <button
          onClick={() => testConnection.refetch()}
          disabled={testConnection.isLoading || !config.serverUrl || 
            (authType === 'apiKey' && !config.apiKey) ||
            (authType === 'password' && (!config.username || !config.password))}
          className="px-4 py-2 border border-dark-border rounded-md text-sm font-medium text-dark-text hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {testConnection.isLoading ? 'Testing...' : 'Test Connection'}
        </button>
        
        {connectionStatus && (
          <div className="flex flex-col items-start">
            <span className={`text-sm ${connectionStatus.class}`}>
              {connectionStatus.text}
            </span>
            {connectionStatus.detail && (
              <span className="text-xs text-red-400 mt-1 max-w-xs">
                {connectionStatus.detail}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}