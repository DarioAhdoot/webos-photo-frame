import { useEffect, useState } from 'react'

interface VirtualKeyboardState {
  isVisible: boolean
  height: number
}

interface VirtualKeyboardHandlerProps {
  onKeyboardStateChange?: (state: VirtualKeyboardState) => void
  children?: React.ReactNode
}

export default function VirtualKeyboardHandler({ 
  onKeyboardStateChange,
  children 
}: VirtualKeyboardHandlerProps) {
  const [keyboardState, setKeyboardState] = useState<VirtualKeyboardState>({
    isVisible: false,
    height: 0
  })

  useEffect(() => {
    // Handle WebOS virtual keyboard state changes
    const handleKeyboardStateChange = (event: any) => {
      const isVisible = event.detail?.visible === true
      const height = isVisible ? (window.innerHeight / 3) : 0 // WebOS keyboard takes 1/3 of screen height
      
      const newState = {
        isVisible,
        height
      }
      
      setKeyboardState(newState)
      onKeyboardStateChange?.(newState)
      
      console.log('Virtual keyboard state changed:', isVisible ? 'visible' : 'hidden', `height: ${height}px`)
      
      // Apply layout adjustments to body
      if (isVisible) {
        document.body.style.setProperty('--keyboard-height', `${height}px`)
        document.body.classList.add('virtual-keyboard-active')
      } else {
        document.body.style.removeProperty('--keyboard-height')
        document.body.classList.remove('virtual-keyboard-active')
      }
    }

    // Handle input focus events to detect when keyboard might appear
    const handleInputFocus = (event: FocusEvent) => {
      const target = event.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        console.log('Input focused, virtual keyboard may appear')
        
        // Scroll the focused input into view with some padding
        setTimeout(() => {
          target.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          })
        }, 300) // Delay to allow keyboard animation
      }
    }

    // Handle input blur events
    const handleInputBlur = (event: FocusEvent) => {
      const target = event.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        console.log('Input blurred, virtual keyboard may hide')
      }
    }

    // Handle window resize (keyboard appearance/disappearance can trigger this)
    const handleWindowResize = () => {
      // Check if this might be due to keyboard state change
      const viewportHeight = window.innerHeight
      const screenHeight = window.screen.height
      
      // If viewport is significantly smaller than screen, keyboard might be visible
      const keyboardVisible = (screenHeight - viewportHeight) > 100
      
      if (keyboardVisible !== keyboardState.isVisible) {
        const height = keyboardVisible ? (screenHeight / 3) : 0
        const newState = {
          isVisible: keyboardVisible,
          height
        }
        
        setKeyboardState(newState)
        onKeyboardStateChange?.(newState)
      }
    }

    // Add event listeners
    document.addEventListener('keyboardStateChange', handleKeyboardStateChange)
    document.addEventListener('focusin', handleInputFocus, true)
    document.addEventListener('focusout', handleInputBlur, true)
    window.addEventListener('resize', handleWindowResize)

    // Cleanup
    return () => {
      document.removeEventListener('keyboardStateChange', handleKeyboardStateChange)
      document.removeEventListener('focusin', handleInputFocus, true)
      document.removeEventListener('focusout', handleInputBlur, true)
      window.removeEventListener('resize', handleWindowResize)
      
      // Clean up body styles
      document.body.style.removeProperty('--keyboard-height')
      document.body.classList.remove('virtual-keyboard-active')
    }
  }, [onKeyboardStateChange, keyboardState.isVisible])

  // Apply CSS custom properties for keyboard state
  useEffect(() => {
    document.documentElement.style.setProperty(
      '--virtual-keyboard-visible', 
      keyboardState.isVisible ? '1' : '0'
    )
    document.documentElement.style.setProperty(
      '--virtual-keyboard-height', 
      `${keyboardState.height}px`
    )
  }, [keyboardState])

  return (
    <>
      {children}
      {/* Optional overlay or indicator when keyboard is active */}
      {keyboardState.isVisible && (
        <div 
          className="fixed top-0 left-0 right-0 z-40 pointer-events-none"
          style={{ 
            height: `calc(100vh - ${keyboardState.height}px)`,
            background: 'transparent'
          }}
        />
      )}
    </>
  )
}

// Hook to use keyboard state in components
export function useVirtualKeyboard() {
  const [keyboardState, setKeyboardState] = useState<VirtualKeyboardState>({
    isVisible: false,
    height: 0
  })

  useEffect(() => {
    const handleKeyboardStateChange = (event: any) => {
      const isVisible = event.detail?.visible === true
      const height = isVisible ? (window.innerHeight / 3) : 0
      
      setKeyboardState({
        isVisible,
        height
      })
    }

    document.addEventListener('keyboardStateChange', handleKeyboardStateChange)
    
    return () => {
      document.removeEventListener('keyboardStateChange', handleKeyboardStateChange)
    }
  }, [])

  return keyboardState
}