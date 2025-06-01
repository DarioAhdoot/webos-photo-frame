import { useEffect, useState } from 'react'
import { useAppStore } from '../stores/appStore'

interface MagicRemoteHandlerProps {
  onNextPhoto?: () => void
  onPreviousPhoto?: () => void
  onToggleSettings?: () => void
  isInSlideshow?: boolean
}

export default function MagicRemoteHandler({ 
  onNextPhoto, 
  onPreviousPhoto, 
  onToggleSettings,
  isInSlideshow = false 
}: MagicRemoteHandlerProps) {
  const [cursorVisible, setCursorVisible] = useState(false)
  const [isPointerMode, setIsPointerMode] = useState(false)
  const { currentMode } = useAppStore()

  useEffect(() => {
    // Handle cursor state changes (pointer vs 5-way mode)
    const handleCursorStateChange = (event: any) => {
      const isVisible = event.detail?.visibility === true
      setCursorVisible(isVisible)
      setIsPointerMode(isVisible)
      console.log('Magic Remote cursor state:', isVisible ? 'visible' : 'hidden')
    }

    // Handle Magic Remote keydown events
    const handleMagicRemoteKeydown = (event: KeyboardEvent) => {
      const keyCode = event.keyCode || event.which

      // Handle navigation in slideshow mode
      if (isInSlideshow && currentMode === 'slideshow') {
        switch (keyCode) {
          case 37: // Left Arrow - Previous photo
            event.preventDefault()
            onPreviousPhoto?.()
            break
          case 39: // Right Arrow - Next photo  
            event.preventDefault()
            onNextPhoto?.()
            break
          case 13: // OK Button - Toggle settings
          case 32: // Space (for testing)
            event.preventDefault()
            onToggleSettings?.()
            break
          case 461: // WebOS Back button
            event.preventDefault()
            onToggleSettings?.()
            break
          case 38: // Up Arrow - could be used for additional controls
          case 40: // Down Arrow - could be used for additional controls
            // Currently no action, but could add volume/brightness controls
            break
        }
      }
    }

    // Handle wheel events for scrolling through photos
    const handleWheel = (event: WheelEvent) => {
      if (isInSlideshow && currentMode === 'slideshow') {
        event.preventDefault()
        if (event.deltaY > 0) {
          // Scroll down = next photo
          onNextPhoto?.()
        } else if (event.deltaY < 0) {
          // Scroll up = previous photo
          onPreviousPhoto?.()
        }
      }
    }

    // Handle mouse movement to show cursor in pointer mode
    const handleMouseMove = () => {
      if (isPointerMode && currentMode === 'slideshow') {
        // In slideshow mode, show cursor briefly when moved
        setCursorVisible(true)
        
        // Hide cursor after 3 seconds of inactivity
        const timeout = setTimeout(() => {
          setCursorVisible(false)
        }, 3000)

        return () => clearTimeout(timeout)
      }
    }

    // Handle focus/blur events for system UI overlay detection
    const handleWindowFocus = () => {
      console.log('App gained focus (Magic Remote)')
    }

    const handleWindowBlur = () => {
      console.log('App lost focus (Magic Remote) - system UI may be showing')
    }

    // Add event listeners
    document.addEventListener('cursorStateChange', handleCursorStateChange)
    document.addEventListener('keydown', handleMagicRemoteKeydown)
    document.addEventListener('wheel', handleWheel, { passive: false })
    document.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('focus', handleWindowFocus)
    window.addEventListener('blur', handleWindowBlur)

    // Cleanup
    return () => {
      document.removeEventListener('cursorStateChange', handleCursorStateChange)
      document.removeEventListener('keydown', handleMagicRemoteKeydown)
      document.removeEventListener('wheel', handleWheel)
      document.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('focus', handleWindowFocus)
      window.removeEventListener('blur', handleWindowBlur)
    }
  }, [isInSlideshow, currentMode, onNextPhoto, onPreviousPhoto, onToggleSettings, isPointerMode])

  // Apply cursor visibility styles to body
  useEffect(() => {
    if (isInSlideshow && currentMode === 'slideshow') {
      if (cursorVisible && isPointerMode) {
        document.body.style.cursor = 'default'
      } else {
        document.body.style.cursor = 'none'
      }
    } else {
      // In settings mode, always show cursor
      document.body.style.cursor = 'default'
    }

    // Cleanup on unmount
    return () => {
      document.body.style.cursor = 'default'
    }
  }, [cursorVisible, isPointerMode, isInSlideshow, currentMode])

  return null // This component only manages Magic Remote events
}