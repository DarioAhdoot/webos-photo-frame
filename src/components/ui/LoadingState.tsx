interface LoadingStateProps {
  title?: string
  message?: string
  subtitle?: string
  icon?: string
}

export default function LoadingState({ 
  title = "Loading...",
  message,
  subtitle,
  icon = "📷"
}: LoadingStateProps) {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <div className="text-6xl mb-6 animate-pulse">{icon}</div>
        <div className="text-2xl text-dark-text mb-3">{title}</div>
        {message && (
          <div className="text-xl text-dark-muted">{message}</div>
        )}
        {subtitle && (
          <div className="text-lg text-dark-muted mt-2">{subtitle}</div>
        )}
      </div>
    </div>
  )
}