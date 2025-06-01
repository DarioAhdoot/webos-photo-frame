import { useState, useEffect } from 'react'
import { Button } from './ui'
import type { PhotoSource, ImmichConfig } from '../types'

interface TestResult {
  id: string
  name: string
  status: 'pending' | 'running' | 'success' | 'error'
  message?: string
  details?: string
}

interface ConnectionTestModalProps {
  isOpen: boolean
  onClose: () => void
  photoSource: PhotoSource
}

export default function ConnectionTestModal({ isOpen, onClose, photoSource }: ConnectionTestModalProps) {
  const [tests, setTests] = useState<TestResult[]>([
    { id: 'server', name: 'Server reachability', status: 'pending' },
    { id: 'auth', name: 'Authentication', status: 'pending' },
    { id: 'albums', name: 'Album access', status: 'pending' },
    { id: 'version', name: 'Server version', status: 'pending' },
  ])
  const [isRunning, setIsRunning] = useState(false)

  const config = photoSource.config as ImmichConfig
  const baseUrl = config.serverUrl.replace(/\/$/, '')

  const updateTest = (id: string, updates: Partial<TestResult>) => {
    setTests(prev => prev.map(test => 
      test.id === id ? { ...test, ...updates } : test
    ))
  }

  const getHeaders = async (): Promise<Record<string, string>> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (config.apiKey) {
      headers['x-api-key'] = config.apiKey
    } else if (config.username && config.password) {
      // For password auth, we'll need to authenticate first
      try {
        const response = await fetch(`${baseUrl}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: config.username,
            password: config.password,
          }),
        })

        if (response.ok) {
          const data = await response.json()
          headers['Authorization'] = `Bearer ${data.accessToken}`
        }
      } catch (error) {
        // Will be handled in auth test
      }
    }

    return headers
  }

  const testServerReachability = async (): Promise<void> => {
    updateTest('server', { status: 'running' })
    
    try {
      // Try the newer API endpoint first (v1.118.0+)
      let testUrl = `${baseUrl}/api/server/ping`
      let response = await fetch(testUrl, { mode: 'cors' })
      
      // If that fails with 404, try the older endpoint
      if (response.status === 404) {
        testUrl = `${baseUrl}/api/server-info/ping`
        response = await fetch(testUrl, { mode: 'cors' })
      }
      
      if (response.ok) {
        updateTest('server', { 
          status: 'success', 
          message: 'Server is reachable',
          details: `HTTP ${response.status}`
        })
      } else {
        updateTest('server', { 
          status: 'error', 
          message: 'Server responded with error',
          details: `HTTP ${response.status}: ${response.statusText}`
        })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      updateTest('server', { 
        status: 'error', 
        message: 'Cannot reach server',
        details: errorMessage.includes('fetch') 
          ? 'Network error - check URL and CORS configuration'
          : errorMessage
      })
    }
  }

  const testAuthentication = async (): Promise<void> => {
    updateTest('auth', { status: 'running' })
    
    try {
      const headers = await getHeaders()
      
      // Test authentication by trying to access a protected endpoint
      let testUrl = `${baseUrl}/api/users/me`
      const response = await fetch(testUrl, { headers })
      
      if (response.ok) {
        const userData = await response.json()
        updateTest('auth', { 
          status: 'success', 
          message: 'Authentication successful',
          details: `Logged in as: ${userData.email || userData.name || 'Unknown user'}`
        })
      } else if (response.status === 401) {
        const authMethod = config.apiKey ? 'API key' : 'username and password'
        updateTest('auth', { 
          status: 'error', 
          message: 'Authentication failed',
          details: `Invalid ${authMethod}. Please check your credentials.`
        })
      } else {
        updateTest('auth', { 
          status: 'error', 
          message: 'Authentication check failed',
          details: `HTTP ${response.status}: ${response.statusText}`
        })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      updateTest('auth', { 
        status: 'error', 
        message: 'Authentication test failed',
        details: errorMessage
      })
    }
  }

  const testAlbumAccess = async (): Promise<void> => {
    updateTest('albums', { status: 'running' })
    
    try {
      const headers = await getHeaders()
      const response = await fetch(`${baseUrl}/api/albums`, { headers })
      
      if (response.ok) {
        const albums = await response.json()
        const albumCount = Array.isArray(albums) ? albums.length : 0
        updateTest('albums', { 
          status: 'success', 
          message: 'Album access successful',
          details: `Found ${albumCount} album${albumCount !== 1 ? 's' : ''}`
        })
      } else if (response.status === 401) {
        updateTest('albums', { 
          status: 'error', 
          message: 'No permission to access albums',
          details: 'Authentication failed or insufficient permissions'
        })
      } else {
        updateTest('albums', { 
          status: 'error', 
          message: 'Cannot access albums',
          details: `HTTP ${response.status}: ${response.statusText}`
        })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      updateTest('albums', { 
        status: 'error', 
        message: 'Album access test failed',
        details: errorMessage
      })
    }
  }

  const testServerVersion = async (): Promise<void> => {
    updateTest('version', { status: 'running' })
    
    try {
      const headers = await getHeaders()
      
      // Try different version endpoints
      let response = await fetch(`${baseUrl}/api/server/version`, { headers })
      
      // If that fails, try the server-info endpoint  
      if (!response.ok && response.status === 404) {
        response = await fetch(`${baseUrl}/api/server-info/version`, { headers })
      }
      
      // If that fails, try the general server info endpoint
      if (!response.ok && response.status === 404) {
        response = await fetch(`${baseUrl}/api/server-info`, { headers })
      }
      
      if (response.ok) {
        const data = await response.json()
        
        // Handle version object format: {major: 1, minor: 134, patch: 0}
        let version = 'Unknown'
        
        if (data.major !== undefined && data.minor !== undefined && data.patch !== undefined) {
          version = `${data.major}.${data.minor}.${data.patch}`
        } else {
          // Fallback to other possible version field names
          version = data.server_version || 
                   data.version || 
                   data.serverVersion ||
                   data.versionNumber ||
                   (data.server && data.server.version) ||
                   'Unknown'
        }
        
        if (version && version !== 'Unknown') {
          updateTest('version', { 
            status: 'success', 
            message: 'Server version retrieved',
            details: `Immich v${version}`
          })
        } else {
          updateTest('version', { 
            status: 'success', 
            message: 'Version check completed',
            details: 'Server version format not recognized'
          })
        }
      } else {
        // Version might not be available, but that's not critical
        updateTest('version', { 
          status: 'success', 
          message: 'Version check completed',
          details: 'Server version endpoint not available (older Immich version)'
        })
      }
    } catch (error) {
      updateTest('version', { 
        status: 'success', 
        message: 'Version check completed',
        details: 'Server version endpoint not available'
      })
    }
  }

  const runAllTests = async () => {
    setIsRunning(true)
    
    // Reset all tests
    setTests(prev => prev.map(test => ({ ...test, status: 'pending', message: undefined, details: undefined })))
    
    // Run tests sequentially
    await testServerReachability()
    await testAuthentication()
    await testAlbumAccess()
    await testServerVersion()
    
    setIsRunning(false)
  }

  useEffect(() => {
    if (isOpen) {
      runAllTests()
    }
  }, [isOpen])

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pending': return '⏳'
      case 'running': return '🔄'
      case 'success': return '✅'
      case 'error': return '❌'
    }
  }

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'pending': return 'text-gray-400'
      case 'running': return 'text-yellow-400'
      case 'success': return 'text-green-400'
      case 'error': return 'text-red-400'
    }
  }

  const allTestsComplete = tests.every(test => test.status === 'success' || test.status === 'error')
  const hasErrors = tests.some(test => test.status === 'error')

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-dark-card rounded-lg border border-dark-border shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-dark-border">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-dark-text">Connection Test Results</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          </div>
          <p className="text-dark-muted mt-2">Testing connection to: {config.serverUrl}</p>
        </div>

        <div className="p-6 space-y-4 flex-1 overflow-y-auto">
          {tests.map((test) => (
            <div key={test.id} className="border border-dark-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{getStatusIcon(test.status)}</span>
                  <span className="text-lg font-medium text-dark-text">{test.name}</span>
                </div>
                <span className={`text-sm font-medium ${getStatusColor(test.status)}`}>
                  {test.status.charAt(0).toUpperCase() + test.status.slice(1)}
                </span>
              </div>
              
              {test.message && (
                <div className="ml-8">
                  <p className={`text-sm ${getStatusColor(test.status)}`}>{test.message}</p>
                  {test.details && (
                    <p className="text-xs text-dark-muted mt-1">{test.details}</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="p-6 border-t border-dark-border">
          <div className="flex justify-between items-center">
            <div className="text-sm text-dark-muted">
              {allTestsComplete && !hasErrors && (
                <span className="text-green-400">All tests passed! Connection is working properly.</span>
              )}
              {allTestsComplete && hasErrors && (
                <span className="text-red-400">Some tests failed. Please check the errors above.</span>
              )}
              {!allTestsComplete && isRunning && (
                <span className="text-yellow-400">Running tests...</span>
              )}
            </div>
            <div className="flex gap-3">
              <Button 
                variant="secondary" 
                size="md" 
                onClick={runAllTests}
                disabled={isRunning}
              >
                {isRunning ? 'Testing...' : 'Retest'}
              </Button>
              <Button variant="primary" size="md" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}