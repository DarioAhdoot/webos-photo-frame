interface ConnectionStatus {
  isOnline: boolean
  lastChecked: number
  failureCount: number
  lastError?: string
}

interface PhotoSourceStatus {
  [sourceId: string]: ConnectionStatus
}

type ConnectionListener = (sourceId: string, isOnline: boolean) => void

export class ConnectionDetectionService {
  private sourceStatus: PhotoSourceStatus = {}
  private listeners: ConnectionListener[] = []
  private checkInterval: number = 30000 // 30 seconds
  private maxRetries: number = 3
  private retryDelay: number = 5000 // 5 seconds
  private intervalId: number | null = null
  private isNavigatorOnline: boolean = true

  constructor() {
    this.initNavigatorOnlineDetection()
  }

  private initNavigatorOnlineDetection(): void {
    if (typeof navigator !== 'undefined' && 'onLine' in navigator) {
      this.isNavigatorOnline = navigator.onLine
      
      window.addEventListener('online', () => {
        this.isNavigatorOnline = true
        this.recheckAllSources()
      })
      
      window.addEventListener('offline', () => {
        this.isNavigatorOnline = false
        // Mark all sources as offline when navigator goes offline
        Object.keys(this.sourceStatus).forEach(sourceId => {
          this.updateSourceStatus(sourceId, false, 'Navigator offline')
        })
      })
    }
  }

  // Register a photo source for monitoring
  registerSource(sourceId: string): void {
    if (!this.sourceStatus[sourceId]) {
      this.sourceStatus[sourceId] = {
        isOnline: true, // Assume online initially
        lastChecked: 0,
        failureCount: 0
      }
    }
  }

  // Unregister a photo source
  unregisterSource(sourceId: string): void {
    delete this.sourceStatus[sourceId]
  }

  // Get current status of a source
  getSourceStatus(sourceId: string): boolean {
    return this.sourceStatus[sourceId]?.isOnline ?? false
  }

  // Get general network status
  isNetworkOnline(): boolean {
    return this.isNavigatorOnline
  }

  // Add listener for connection status changes
  addListener(listener: ConnectionListener): void {
    this.listeners.push(listener)
  }

  // Remove listener
  removeListener(listener: ConnectionListener): void {
    const index = this.listeners.indexOf(listener)
    if (index > -1) {
      this.listeners.splice(index, 1)
    }
  }

  // Start periodic monitoring
  startMonitoring(): void {
    if (this.intervalId) {
      return // Already monitoring
    }

    this.intervalId = window.setInterval(() => {
      this.checkAllSources()
    }, this.checkInterval)
  }

  // Stop periodic monitoring
  stopMonitoring(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }

  // Test connection to a specific photo source
  async testSourceConnection(sourceId: string, testUrl: string): Promise<boolean> {
    // If navigator is offline, don't even try
    if (!this.isNavigatorOnline) {
      this.updateSourceStatus(sourceId, false, 'Navigator offline')
      return false
    }

    try {
      // Use a lightweight endpoint test with timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

      const response = await fetch(testUrl, {
        method: 'HEAD', // Lightweight request
        signal: controller.signal,
        cache: 'no-cache'
      })

      clearTimeout(timeoutId)

      const isOnline = response.ok
      this.updateSourceStatus(sourceId, isOnline, isOnline ? undefined : `HTTP ${response.status}`)
      return isOnline

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      this.updateSourceStatus(sourceId, false, errorMessage)
      return false
    }
  }

  // Test connection with retry logic for critical operations
  async testSourceConnectionWithRetry(sourceId: string, testUrl: string): Promise<boolean> {
    let lastError: string = ''
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const isOnline = await this.testSourceConnection(sourceId, testUrl)
        if (isOnline) {
          return true
        }
        lastError = this.sourceStatus[sourceId]?.lastError || 'Connection failed'
      } catch (error) {
        lastError = error instanceof Error ? error.message : 'Unknown error'
      }

      // Wait before retry (except on last attempt)
      if (attempt < this.maxRetries) {
        await new Promise(resolve => setTimeout(resolve, this.retryDelay))
      }
    }

    this.updateSourceStatus(sourceId, false, `Failed after ${this.maxRetries} attempts: ${lastError}`)
    return false
  }

  // Handle fetch errors and determine if they indicate offline status
  handleFetchError(sourceId: string, error: any): boolean {
    let isConnectionError = false
    let errorMessage = 'Unknown error'

    if (error instanceof Error) {
      errorMessage = error.message
      
      // Check for network-related errors
      const networkErrors = [
        'NetworkError',
        'Failed to fetch',
        'ERR_NETWORK',
        'ERR_INTERNET_DISCONNECTED',
        'ERR_NAME_NOT_RESOLVED',
        'ERR_CONNECTION_REFUSED',
        'ERR_CONNECTION_TIMED_OUT',
        'The operation was aborted'
      ]

      isConnectionError = networkErrors.some(errType => 
        errorMessage.includes(errType)
      )
    }

    // If navigator is offline, always consider it a connection error
    if (!this.isNavigatorOnline) {
      isConnectionError = true
      errorMessage = 'Navigator offline'
    }

    if (isConnectionError) {
      this.updateSourceStatus(sourceId, false, errorMessage)
    }

    return isConnectionError
  }

  // Handle HTTP response and determine online status
  handleHttpResponse(sourceId: string, response: Response): boolean {
    const isOnline = response.ok
    const errorMessage = isOnline ? undefined : `HTTP ${response.status} ${response.statusText}`
    
    this.updateSourceStatus(sourceId, isOnline, errorMessage)
    return isOnline
  }

  private updateSourceStatus(sourceId: string, isOnline: boolean, error?: string): void {
    const currentStatus = this.sourceStatus[sourceId]
    if (!currentStatus) {
      return
    }

    const wasOnline = currentStatus.isOnline
    const now = Date.now()

    currentStatus.isOnline = isOnline
    currentStatus.lastChecked = now
    currentStatus.lastError = error

    if (isOnline) {
      currentStatus.failureCount = 0
    } else {
      currentStatus.failureCount++
    }

    // Notify listeners if status changed
    if (wasOnline !== isOnline) {
      this.notifyListeners(sourceId, isOnline)
    }
  }

  private notifyListeners(sourceId: string, isOnline: boolean): void {
    this.listeners.forEach(listener => {
      try {
        listener(sourceId, isOnline)
      } catch (error) {
        console.error('Error in connection status listener:', error)
      }
    })
  }

  private async checkAllSources(): Promise<void> {
    // Don't check if navigator is offline
    if (!this.isNavigatorOnline) {
      return
    }

    // This would need to be integrated with photo source manager
    // For now, we'll implement this when we integrate with the photo sources
  }

  private async recheckAllSources(): Promise<void> {
    // When coming back online, recheck all sources
    const sourceIds = Object.keys(this.sourceStatus)
    for (const sourceId of sourceIds) {
      // Reset failure count when rechecking
      const status = this.sourceStatus[sourceId]
      if (status) {
        status.failureCount = 0
      }
    }
  }

  // Get detailed status for debugging
  getDetailedStatus(): PhotoSourceStatus {
    return { ...this.sourceStatus }
  }

  // Clear all status (useful when photo sources change)
  clearAllStatus(): void {
    this.sourceStatus = {}
  }
}

// Global instance
export const connectionDetectionService = new ConnectionDetectionService()