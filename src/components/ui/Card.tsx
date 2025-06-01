import { ReactNode, MouseEvent } from 'react'

interface CardProps {
  children: ReactNode
  title?: string
  className?: string
  padding?: 'sm' | 'md' | 'lg' | 'xl'
  onClick?: (event: MouseEvent<HTMLDivElement>) => void
}

export default function Card({ 
  children, 
  title, 
  className = '',
  padding = 'xl',
  onClick
}: CardProps) {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6', 
    lg: 'p-8',
    xl: 'p-8'
  }
  
  const baseClasses = 'bg-dark-card rounded-xl border border-dark-border shadow-sm'
  const classes = `${baseClasses} ${paddingClasses[padding]} ${className}`.trim()
  
  return (
    <div className={classes} onClick={onClick}>
      {title && (
        <h2 className="text-3xl font-semibold text-dark-text mb-6">
          {title}
        </h2>
      )}
      {children}
    </div>
  )
}