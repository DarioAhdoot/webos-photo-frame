import { useEffect } from 'react'
import { Button } from './ui'

interface ExitConfirmModalProps {
  onConfirm: () => void
  onCancel: () => void
}

export default function ExitConfirmModal({ onConfirm, onCancel }: ExitConfirmModalProps) {
  
  // Handle keyboard navigation for WebOS
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'Enter':
          onConfirm()
          break
        case 'Escape':
          onCancel()
          break
        case 'ArrowLeft':
        case 'ArrowRight':
          // Switch focus between buttons
          const buttons = document.querySelectorAll('.exit-modal-button')
          const focusedElement = document.activeElement
          const currentIndex = Array.from(buttons).indexOf(focusedElement as Element)
          
          if (currentIndex !== -1) {
            const nextIndex: number = event.key === 'ArrowLeft' 
              ? (currentIndex - 1 + buttons.length) % buttons.length
              : (currentIndex + 1) % buttons.length
            
            const nextButton = buttons[nextIndex] as HTMLElement
            if (nextButton) {
              nextButton.focus()
            }
          }
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    
    // Focus the cancel button by default (safer choice)
    setTimeout(() => {
      const cancelButton = document.querySelector('.exit-modal-cancel') as HTMLElement
      if (cancelButton) {
        cancelButton.focus()
      }
    }, 100)

    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onConfirm, onCancel])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-dark-card border border-dark-border rounded-lg p-8 max-w-md w-full mx-4 text-center">
        <div className="mb-6">
          <div className="text-4xl mb-4">🚪</div>
          <h2 className="text-xl font-semibold text-dark-text mb-2">Exit Application?</h2>
          <p className="text-dark-muted">
            Are you sure you want to exit the Digital Photo Frame?
          </p>
        </div>
        
        <div className="flex gap-4 justify-center">
          <Button
            variant="secondary"
            size="md"
            onClick={onCancel}
            className="exit-modal-button exit-modal-cancel"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={onConfirm}
            className="exit-modal-button exit-modal-confirm bg-red-600 hover:bg-red-700"
          >
            Exit App
          </Button>
        </div>
        
        <div className="mt-4 text-xs text-dark-muted">
          Press ESC to cancel or ENTER to exit
        </div>
      </div>
    </div>
  )
}