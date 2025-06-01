import { ReactNode } from 'react'

interface StatusBadgeProps {
  children: ReactNode
  variant?: 'enabled' | 'disabled' | 'warning' | 'error'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function StatusBadge({ 
  children, 
  variant = 'enabled', 
  size = 'md',
  className = ''
}: StatusBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-3 py-2 text-base',
    lg: 'px-4 py-3 text-lg'
  }
  
  const variantClasses = {
    enabled: 'text-green-400 bg-green-900 border-green-700',
    disabled: 'text-gray-400 bg-gray-700 border-gray-600',
    warning: 'text-amber-400 bg-amber-900 border-amber-700',
    error: 'text-red-400 bg-red-900 border-red-700'
  }
  
  const baseClasses = 'rounded-lg border font-medium'
  const classes = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`.trim()
  
  return (
    <span className={classes}>
      {children}
    </span>
  )
}