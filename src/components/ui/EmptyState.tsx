interface EmptyStateProps {
  title: string
  message?: string
  icon?: string
  className?: string
}

export default function EmptyState({ 
  title,
  message,
  icon = "📷",
  className = ""
}: EmptyStateProps) {
  return (
    <div className={`text-center py-20 ${className}`}>
      <div className="text-6xl mb-6">{icon}</div>
      <div className="text-2xl text-dark-text mb-3">{title}</div>
      {message && (
        <div className="text-xl text-dark-muted">{message}</div>
      )}
    </div>
  )
}