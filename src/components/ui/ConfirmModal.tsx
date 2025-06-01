import { ReactNode, useEffect } from 'react'
import Button from './Button'

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string | ReactNode
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'default'
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default'
}: ConfirmModalProps) {
  
  useEffect(() => {
    if (!isOpen) return
    
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' || event.key === 'Back') {
        event.preventDefault()
        onClose()
      }
      if (event.key === 'Enter') {
        event.preventDefault()
        onConfirm()
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose, onConfirm])

  if (!isOpen) return null

  const getConfirmVariant = () => {
    switch (variant) {
      case 'danger': return 'danger'
      case 'warning': return 'primary'
      default: return 'primary'
    }
  }

  const getIconForVariant = () => {
    switch (variant) {
      case 'danger': return '⚠️'
      case 'warning': return '⚠️'
      default: return '❓'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-dark-card rounded-lg border border-dark-border shadow-xl max-w-lg w-full mx-4">
        <div className="p-8">
          <div className="flex items-center gap-4 mb-6">
            <span className="text-4xl">{getIconForVariant()}</span>
            <h2 className="text-3xl font-semibold text-dark-text">{title}</h2>
          </div>
          
          <div className="text-xl text-dark-muted mb-8 leading-relaxed">
            {message}
          </div>
          
          <div className="flex gap-4 justify-end">
            <Button
              variant="secondary"
              size="lg"
              onClick={onClose}
              className="min-w-32"
            >
              {cancelText}
            </Button>
            <Button
              variant={getConfirmVariant()}
              size="lg"
              onClick={onConfirm}
              className="min-w-32"
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}