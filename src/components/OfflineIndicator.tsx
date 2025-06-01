import { useState, useEffect } from 'react'

interface OfflineIndicatorProps {
  isOffline: boolean
  offlineSourceNames?: string[]
  className?: string
}

export default function OfflineIndicator({ isOffline, offlineSourceNames = [], className = '' }: OfflineIndicatorProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  // Show/hide indicator based on offline status
  useEffect(() => {
    if (isOffline) {
      setIsVisible(true)
      // Auto-hide details after 10 seconds
      const timer = setTimeout(() => {
        setShowDetails(false)
      }, 10000)
      return () => clearTimeout(timer)
    } else {
      // Fade out when coming back online
      const timer = setTimeout(() => {
        setIsVisible(false)
        setShowDetails(false)
      }, 3000) // Show "back online" for 3 seconds
      return () => clearTimeout(timer)
    }
  }, [isOffline])

  // Toggle details on click
  const handleClick = () => {
    if (isOffline) {
      setShowDetails(!showDetails)
    }
  }

  if (!isVisible) return null

  return (
    <div 
      className={`fixed top-6 left-6 z-50 ${className}`}
      onClick={handleClick}
    >
      <div className={`
        px-4 py-3 rounded-lg backdrop-blur-md border transition-all duration-300 cursor-pointer
        ${isOffline 
          ? 'bg-orange-900/80 border-orange-500/50 text-orange-100' 
          : 'bg-green-900/80 border-green-500/50 text-green-100'
        }
        ${showDetails ? 'min-w-80' : 'min-w-48'}
      `}>
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${isOffline ? 'bg-orange-400' : 'bg-green-400'}`} />
          <div className="font-medium">
            {isOffline ? 'Using Cached Photos' : 'Back Online'}
          </div>
        </div>
        
        {isOffline && showDetails && offlineSourceNames.length > 0 && (
          <div className="mt-3 pt-3 border-t border-orange-500/30">
            <div className="text-sm opacity-90 mb-2">Offline sources:</div>
            <div className="text-xs space-y-1">
              {offlineSourceNames.map((name, index) => (
                <div key={index} className="opacity-75">• {name}</div>
              ))}
            </div>
          </div>
        )}
        
        {isOffline && !showDetails && (
          <div className="text-xs opacity-75 mt-1">
            Click for details
          </div>
        )}
      </div>
    </div>
  )
}