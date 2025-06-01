import { useState, useEffect } from 'react'
import { useSettingsStore } from '../stores/settingsStore'
import { useTestConnection } from '../hooks/usePhotoSources'
import { Button, Input, Card, ToggleButton, EnabledToggle, ConfirmModal } from './ui'
import ConnectionTestModal from './ConnectionTestModal'
import type { PhotoSource, ImmichConfig } from '../types'

interface PhotoSourceEditProps {
  source: PhotoSource | null // null for new source
  onBack: () => void
  onOpenAlbumSelection: (photoSource: PhotoSource) => void
}

export default function PhotoSourceEdit({ source, onBack, onOpenAlbumSelection }: PhotoSourceEditProps) {
  const { addPhotoSource, updatePhotoSource, removePhotoSource } = useSettingsStore()
  const isNewSource = !source
  
  // Initialize with source data or defaults for new source
  const [formData, setFormData] = useState<PhotoSource>(() => {
    if (source) return source
    
    // Default for new source
    return {
      id: `immich-${Date.now()}`,
      name: 'My Immich Server',
      type: 'immich',
      config: {
        serverUrl: '',
        apiKey: '',
        username: '',
        password: '',
        albumIds: [],
        authType: 'apiKey', // Track auth type in config
      } as ImmichConfig & { authType: 'apiKey' | 'password' },
      enabled: false,
    }
  })

  const [authType, setAuthType] = useState<'apiKey' | 'password'>(() => {
    const config = formData.config as ImmichConfig & { authType?: 'apiKey' | 'password' }
    // Use stored authType if available, otherwise infer from existing data
    if (config.authType) return config.authType
    if (config.apiKey) return 'apiKey'
    if (config.username && config.password) return 'password'
    return 'apiKey'
  })
  
  const testConnection = useTestConnection(formData.id)
  const config = formData.config as ImmichConfig
  const [showTestModal, setShowTestModal] = useState(false)
  const [showBackConfirm, setShowBackConfirm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Handle TV remote back button
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Handle TV remote back button (mapped to Escape key in WebOS)
      if (event.key === 'Escape' || event.key === 'Back') {
        event.preventDefault()
        handleBack()
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, []) // Empty dependency array since handleBack will handle the latest state

  const updateConfig = (updates: Partial<ImmichConfig>) => {
    const newConfig = { ...config, ...updates }
    setFormData(prev => ({ ...prev, config: newConfig }))
  }

  const handleAuthTypeChange = (newAuthType: 'apiKey' | 'password') => {
    setAuthType(newAuthType)
    // Update the authType in the config to track this as a change
    updateConfig({ authType: newAuthType } as Partial<ImmichConfig>)
  }

  const hasChanges = () => {
    if (isNewSource) {
      // For new sources, check if any meaningful data has been entered
      const config = formData.config as ImmichConfig & { authType?: string }
      return formData.name !== 'My Immich Server' || 
             config.serverUrl !== '' || 
             config.apiKey !== '' || 
             config.username !== '' || 
             config.password !== '' ||
             authType !== 'apiKey' // Default auth type changed
    } else {
      // For existing sources, compare with original (including authType changes)
      const originalConfig = source.config as ImmichConfig & { authType?: string }
      const currentConfig = formData.config as ImmichConfig & { authType?: string }
      
      // Check if authType changed from what was originally stored
      const originalAuthType = originalConfig.authType || (originalConfig.apiKey ? 'apiKey' : 'password')
      const authTypeChanged = authType !== originalAuthType
      
      return JSON.stringify(formData) !== JSON.stringify(source) || authTypeChanged
    }
  }

  const handleSave = () => {
    if (isNewSource) {
      addPhotoSource(formData)
    } else {
      updatePhotoSource(formData.id, formData)
    }
    onBack()
  }

  const handleBack = () => {
    if (hasChanges()) {
      setShowBackConfirm(true)
    } else {
      onBack()
    }
  }

  const confirmBack = () => {
    setShowBackConfirm(false)
    onBack()
  }

  const handleDelete = () => {
    if (source) {
      setShowDeleteConfirm(true)
    }
  }

  const confirmDelete = () => {
    if (source) {
      removePhotoSource(source.id)
      setShowDeleteConfirm(false)
      onBack()
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
    <div className="h-screen bg-dark-bg flex flex-col">
      <header className="bg-dark-card shadow-sm border-b border-dark-border p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-6">
            <Button
              variant="ghost"
              size="md"
              onClick={handleBack}
            >
              ← Back to Photo Sources
            </Button>
            <h1 className="text-3xl font-bold text-dark-text">
              {isNewSource ? 'Add Photo Source' : 'Edit Photo Source'}
            </h1>
          </div>
          <div className="flex gap-4">
            <EnabledToggle 
              enabled={formData.enabled}
              onToggle={() => setFormData(prev => ({ ...prev, enabled: !prev.enabled }))}
              size="md"
            />
            {!isNewSource && (
              <Button
                variant="danger"
                size="md"
                onClick={handleDelete}
              >
                Remove
              </Button>
            )}
            <Button
              variant={hasChanges() ? "primary" : "secondary"}
              size="md"
              onClick={handleSave}
              disabled={!hasChanges() && !isNewSource}
            >
              {isNewSource ? 'Add Source' : hasChanges() ? 'Save Changes' : 'No Changes'}
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 bg-dark-bg p-8">
        <div className="h-full max-w-6xl mx-auto">
          <div className="grid grid-cols-2 gap-8 h-full">
            {/* Left Column */}
            <div className="space-y-8">
              {/* Basic Information */}
              <Card title="Basic Information">
                <div className="space-y-8">
                  <Input
                    label="Source Name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="My Immich Server"
                    size="lg"
                  />
                  
                  <Input
                    label="Server URL"
                    type="url"
                    value={config.serverUrl}
                    onChange={(e) => updateConfig({ serverUrl: e.target.value })}
                    placeholder="http://your-server.com:2283"
                    helperText="Enter your Immich server URL (without /api path)"
                    size="lg"
                  />
                </div>
              </Card>

              {/* Album Selection */}
              <Card title="Album Selection">
                <div className="space-y-6">
                  <div>
                    <label className="block text-xl font-medium mb-4 text-dark-text">Albums</label>
                    <Button
                      fullWidth
                      variant="ghost"
                      size="lg"
                      onClick={() => onOpenAlbumSelection(formData)}
                      disabled={!config.serverUrl || 
                        (authType === 'apiKey' && !config.apiKey) ||
                        (authType === 'password' && (!config.username || !config.password))}
                      className="text-left justify-start"
                    >
                      Select Albums ({config.albumIds.length} selected)
                    </Button>
                    <div className="text-base text-dark-muted mt-3">
                      {config.albumIds.length === 0 ? 'All albums will be used' : `${config.albumIds.length} album${config.albumIds.length !== 1 ? 's' : ''} selected`}
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              {/* Authentication */}
              <Card title="Authentication">
                <div className="space-y-8">
                  <div>
                    <label className="block text-xl font-medium mb-4 text-dark-text">Authentication Method</label>
                    <div className="flex gap-4 mb-6">
                      <ToggleButton
                        isActive={authType === 'apiKey'}
                        onClick={() => handleAuthTypeChange('apiKey')}
                        size="lg"
                      >
                        API Key
                      </ToggleButton>
                      <ToggleButton
                        isActive={authType === 'password'}
                        onClick={() => handleAuthTypeChange('password')}
                        size="lg"
                      >
                        Username & Password
                      </ToggleButton>
                    </div>
                    
                    {authType === 'apiKey' ? (
                      <Input
                        label="API Key"
                        type="password"
                        value={config.apiKey || ''}
                        onChange={(e) => updateConfig({ apiKey: e.target.value })}
                        placeholder="Your Immich API key"
                        helperText="Create an API key in your Immich user settings"
                        size="lg"
                      />
                    ) : (
                      <div className="space-y-6">
                        <Input
                          label="Username (Email)"
                          type="email"
                          value={config.username || ''}
                          onChange={(e) => updateConfig({ username: e.target.value })}
                          placeholder="your-email@example.com"
                          size="lg"
                        />
                        <Input
                          label="Password"
                          type="password"
                          value={config.password || ''}
                          onChange={(e) => updateConfig({ password: e.target.value })}
                          placeholder="Your Immich password"
                          size="lg"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              {/* Test Connection */}
              <div className="space-y-4">
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={() => setShowTestModal(true)}
                  disabled={!config.serverUrl || 
                    (authType === 'apiKey' && !config.apiKey) ||
                    (authType === 'password' && (!config.username || !config.password))}
                >
                  Test Connection
                </Button>
                
                {connectionStatus && (
                  <div className="text-center">
                    <span className={`text-xl ${connectionStatus.class}`}>
                      {connectionStatus.text}
                    </span>
                    {connectionStatus.detail && (
                      <div className="text-base text-red-400 mt-2">
                        {connectionStatus.detail}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <ConnectionTestModal
        isOpen={showTestModal}
        onClose={() => setShowTestModal(false)}
        photoSource={formData}
      />

      <ConfirmModal
        isOpen={showBackConfirm}
        onClose={() => setShowBackConfirm(false)}
        onConfirm={confirmBack}
        title="Unsaved Changes"
        message="You have unsaved changes. Are you sure you want to go back without saving?"
        confirmText="Discard Changes"
        cancelText="Keep Editing"
        variant="warning"
      />

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title="Remove Photo Source"
        message={
          <div>
            Are you sure you want to remove <strong>"{source?.name}"</strong>?
            <br />
            <br />
            This action cannot be undone.
          </div>
        }
        confirmText="Remove Source"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  )
}