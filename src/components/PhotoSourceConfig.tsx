import { useState } from 'react'
import { useSettingsStore } from '../stores/settingsStore'
import { useTestConnection } from '../hooks/usePhotoSources'
import type { PhotoSource, ImmichConfig } from '../types'

interface PhotoSourceConfigProps {
  onOpenAlbumSelection: (photoSource: PhotoSource) => void
}

export default function PhotoSourceConfig({ onOpenAlbumSelection }: PhotoSourceConfigProps) {
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
        username: '',
        password: '',
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
        <div className="text-center py-12 text-dark-muted">
          <div className="text-4xl mb-4">📁</div>
          <div>No photo sources configured</div>
          <div className="text-sm mt-2">Add a source to get started</div>
        </div>
      ) : (
        <div className="space-y-4">
          {photoSources.map((source) => (
            <div key={source.id} className="bg-dark-card p-4 rounded-lg border border-dark-border shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1 mr-4">
                  <input
                    type="text"
                    value={source.name}
                    onChange={(e) => updatePhotoSource(source.id, { name: e.target.value })}
                    className="font-medium text-lg bg-transparent border-none p-0 w-full focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
                    placeholder="Source name"
                  />
                  <div className="text-sm text-dark-muted capitalize">{source.type} server</div>
                </div>
                <div className="flex gap-3 items-center">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={source.enabled}
                      onChange={(e) => updatePhotoSource(source.id, { enabled: e.target.checked })}
                      className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-dark-border rounded"
                    />
                    <span className={`text-sm font-medium ${
                      source.enabled ? 'text-green-400' : 'text-dark-muted'
                    }`}>
                      {source.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </label>
                  
                  {/* Configuration status indicator */}
                  <div className="text-xs">
                    {source.config && (source.config as ImmichConfig).serverUrl ? (
                      <span className="text-green-400 bg-green-900 px-2 py-1 rounded">
                        Configured
                      </span>
                    ) : (
                      <span className="text-amber-400 bg-amber-900 px-2 py-1 rounded">
                        Setup Required
                      </span>
                    )}
                  </div>
                  
                  <button
                    onClick={() => removePhotoSource(source.id)}
                    className="text-red-400 hover:text-red-300 text-sm px-2 py-1 rounded hover:bg-red-900"
                  >
                    Remove
                  </button>
                </div>
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

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-dark-card rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4 text-dark-text">Add Photo Source</h3>
            <div className="space-y-3">
              <button
                onClick={handleAddImmichSource}
                className="w-full p-3 text-left border border-dark-border rounded-lg hover:bg-gray-700"
              >
                <div className="font-medium text-dark-text">Immich Server</div>
                <div className="text-sm text-dark-muted">Connect to your Immich instance</div>
              </button>
              <button
                disabled
                className="w-full p-3 text-left border border-dark-border rounded-lg opacity-50 cursor-not-allowed"
              >
                <div className="font-medium text-dark-text">Google Photos</div>
                <div className="text-sm text-dark-muted">Coming soon</div>
              </button>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 border border-dark-border rounded-lg hover:bg-gray-700 text-dark-text"
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
  onOpenAlbumSelection: (photoSource: PhotoSource) => void
}

function ImmichSourceConfig({ source, onUpdate, onOpenAlbumSelection }: ImmichSourceConfigProps) {
  const [localConfig, setLocalConfig] = useState<ImmichConfig>(source.config as ImmichConfig)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [authType, setAuthType] = useState<'apiKey' | 'password'>(() => {
    // Determine initial auth type based on existing config
    if (localConfig.apiKey) return 'apiKey'
    if (localConfig.username && localConfig.password) return 'password'
    return 'apiKey' // default
  })
  
  const testConnection = useTestConnection(source.id)

  const updateLocalConfig = (updates: Partial<ImmichConfig>) => {
    const newConfig = { ...localConfig, ...updates }
    setLocalConfig(newConfig)
    setHasUnsavedChanges(true)
    setSaveStatus('idle')
  }

  const handleAuthTypeChange = (newAuthType: 'apiKey' | 'password') => {
    setAuthType(newAuthType)
    
    // Clear fields from the other auth method
    if (newAuthType === 'apiKey') {
      updateLocalConfig({ username: '', password: '' })
    } else {
      updateLocalConfig({ apiKey: '' })
    }
  }

  const handleSave = async () => {
    setSaveStatus('saving')
    try {
      onUpdate(source.id, {
        config: localConfig
      })
      setHasUnsavedChanges(false)
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
    } catch (error) {
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
    }
  }

  const handleTestConnection = async () => {
    if (hasUnsavedChanges) {
      handleSave()
      // Wait a bit for the save to complete
      setTimeout(() => testConnection.refetch(), 100)
    } else {
      testConnection.refetch()
    }
  }

  const getSaveButtonText = () => {
    switch (saveStatus) {
      case 'saving': return 'Saving...'
      case 'saved': return 'Saved ✓'
      case 'error': return 'Error saving'
      default: return hasUnsavedChanges ? 'Save Changes' : 'Saved'
    }
  }

  const getSaveButtonClass = () => {
    const baseClass = 'px-4 py-2 rounded-md text-sm font-medium '
    switch (saveStatus) {
      case 'saving': return baseClass + 'bg-gray-500 text-white cursor-not-allowed'
      case 'saved': return baseClass + 'bg-green-600 text-white'
      case 'error': return baseClass + 'bg-red-600 text-white'
      default: return hasUnsavedChanges 
        ? baseClass + 'bg-blue-600 text-white hover:bg-blue-700'
        : baseClass + 'bg-gray-600 text-dark-muted cursor-default'
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
    return { text: 'Not tested', class: 'text-dark-muted', detail: null }
  }

  const connectionStatus = getConnectionStatus()

  return (
    <div className="space-y-4 pt-3 border-t border-dark-border">
      <div>
        <label className="block text-sm font-medium mb-1 text-dark-text">Server URL</label>
        <input
          type="url"
          value={localConfig.serverUrl}
          onChange={(e) => updateLocalConfig({ serverUrl: e.target.value })}
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
              value={localConfig.apiKey || ''}
              onChange={(e) => updateLocalConfig({ apiKey: e.target.value })}
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
                value={localConfig.username || ''}
                onChange={(e) => updateLocalConfig({ username: e.target.value })}
                placeholder="your-email@example.com"
                className="w-full px-3 py-2 border border-dark-border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-dark-card text-dark-text"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-dark-text">Password</label>
              <input
                type="password"
                value={localConfig.password || ''}
                onChange={(e) => updateLocalConfig({ password: e.target.value })}
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
            onClick={() => {
              // Save current changes before opening album selection
              if (hasUnsavedChanges) {
                handleSave()
              }
              onOpenAlbumSelection(source)
            }}
            disabled={!localConfig.serverUrl || 
              (authType === 'apiKey' && !localConfig.apiKey) ||
              (authType === 'password' && (!localConfig.username || !localConfig.password))}
            className="px-4 py-2 border border-dark-border rounded-md text-sm font-medium text-dark-text hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Select Albums ({localConfig.albumIds.length} selected)
          </button>
          <div className="text-xs text-dark-muted">
            {localConfig.albumIds.length === 0 ? 'All albums will be used' : `${localConfig.albumIds.length} album${localConfig.albumIds.length !== 1 ? 's' : ''} selected`}
          </div>
        </div>
      </div>
      
      {/* Save and Test Actions */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={handleSave}
          disabled={!hasUnsavedChanges || saveStatus === 'saving'}
          className={getSaveButtonClass()}
        >
          {getSaveButtonText()}
        </button>
        
        <button
          onClick={handleTestConnection}
          disabled={testConnection.isLoading || !localConfig.serverUrl || 
            (authType === 'apiKey' && !localConfig.apiKey) ||
            (authType === 'password' && (!localConfig.username || !localConfig.password))}
          className="px-4 py-2 border border-dark-border rounded-md text-sm font-medium text-dark-text hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {testConnection.isLoading ? 'Testing...' : 'Test Connection'}
        </button>
        
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
      </div>
      
      {hasUnsavedChanges && (
        <div className="text-xs text-amber-400 bg-amber-900 p-2 rounded">
          💡 You have unsaved changes. Click "Save Changes" to apply them.
        </div>
      )}
    </div>
  )
}