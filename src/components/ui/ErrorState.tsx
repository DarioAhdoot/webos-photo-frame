import Button from './Button'

interface ErrorStateProps {
  title?: string
  message: string
  onRetry?: () => void
  retryText?: string
  icon?: string
}

export default function ErrorState({ 
  title = "Something went wrong",
  message,
  onRetry,
  retryText = "Try Again",
  icon = "⚠️"
}: ErrorStateProps) {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <div className="text-6xl mb-6">{icon}</div>
        <div className="text-2xl text-dark-text mb-3">{title}</div>
        <div className="text-xl text-dark-muted mb-6">{message}</div>
        {onRetry && (
          <Button
            variant="primary"
            size="lg"
            onClick={onRetry}
          >
            {retryText}
          </Button>
        )}
      </div>
    </div>
  )
}