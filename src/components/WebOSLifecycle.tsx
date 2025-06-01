import { useEffect } from 'react'
import { useAppStore } from '../stores/appStore'

declare global {
  interface Window {
    webOSSystem?: {
      PalmSystem?: {
        activate?: () => void
      }
    }
    PalmSystem?: {
      activate?: () => void
    }
  }
}

export default function WebOSLifecycle() {
  const { setAppVisible } = useAppStore()

  useEffect(() => {
    // Handle WebOS launch events
    const handleWebOSLaunch = (event: any) => {
      console.log('WebOS Launch event:', event)
      setAppVisible(true)
    }

    const handleWebOSRelaunch = (event: any) => {
      console.log('WebOS Relaunch event:', event)
      setAppVisible(true)
      
      // Handle any launch parameters if needed
      if (event.detail && event.detail.parameters) {
        console.log('Launch parameters:', event.detail.parameters)
        // Could handle specific photo or album launch here
      }
    }

    // Handle visibility changes (app becoming hidden/visible)
    const handleVisibilityChange = () => {
      const isVisible = !document.hidden
      console.log('App visibility changed:', isVisible ? 'visible' : 'hidden')
      setAppVisible(isVisible)
    }

    // Add event listeners
    document.addEventListener('webOSLaunch', handleWebOSLaunch)
    document.addEventListener('webOSRelaunch', handleWebOSRelaunch)
    document.addEventListener('visibilitychange', handleVisibilityChange, true)

    // Handle initial launch state
    setAppVisible(!document.hidden)

    // Cleanup
    return () => {
      document.removeEventListener('webOSLaunch', handleWebOSLaunch)
      document.removeEventListener('webOSRelaunch', handleWebOSRelaunch)
      document.removeEventListener('visibilitychange', handleVisibilityChange, true)
    }
  }, [setAppVisible])

  return null // This component only manages lifecycle events
}