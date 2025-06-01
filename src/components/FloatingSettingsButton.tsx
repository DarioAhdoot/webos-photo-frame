import { useState, useEffect, useRef } from 'react'

interface FloatingSettingsButtonProps {
  onOpenSettings: () => void
}

export default function FloatingSettingsButton({ onOpenSettings }: FloatingSettingsButtonProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const handleMouseMove = () => {
      setIsVisible(true)
      
      // Clear existing timeout
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      
      // Set new timeout to hide after 5 seconds (unless focused)
      const newTimeoutId = setTimeout(() => {
        if (!isFocused) {
          setIsVisible(false)
        }
      }, 5000)
      
      setTimeoutId(newTimeoutId)
    }

    // Handle Magic Remote cursor state changes
    const handleCursorStateChange = (event: any) => {
      const isPointerMode = event.detail?.visibility === true
      if (isPointerMode) {
        // In pointer mode, show button on cursor movement
        setIsVisible(true)
      }
    }

    // Handle keyboard navigation (5-way mode)
    const handleKeyDown = (event: KeyboardEvent) => {
      // Show button when using arrow keys (indicates 5-way navigation)
      if ([37, 38, 39, 40].includes(event.keyCode)) {
        setIsVisible(true)
        
        // Auto-focus button if it's visible and we're navigating
        if (buttonRef.current && isVisible) {
          buttonRef.current.focus()
        }
      }
    }

    // Add event listeners
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('cursorStateChange', handleCursorStateChange)
    document.addEventListener('keydown', handleKeyDown)
    
    // Cleanup
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('cursorStateChange', handleCursorStateChange)
      document.removeEventListener('keydown', handleKeyDown)
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [timeoutId, isFocused, isVisible])

  return (
    <div
      className={`floating-settings-button fixed top-4 right-4 z-50 transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <button
        ref={buttonRef}
        onClick={onOpenSettings}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="bg-black/20 hover:bg-black/40 focus:bg-black/60 focus:ring-2 focus:ring-white/50 text-white p-3 rounded-full backdrop-blur-sm transition-colors duration-200"
        aria-label="Open Settings"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </button>
    </div>
  )
}