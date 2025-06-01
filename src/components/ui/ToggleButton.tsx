import { ReactNode } from 'react'

interface ToggleButtonProps {
  children: ReactNode
  isActive: boolean
  onClick: () => void
  disabled?: boolean
  size?: 'md' | 'lg' | 'xl'
  fullWidth?: boolean
  className?: string
}

export default function ToggleButton({ 
  children, 
  isActive, 
  onClick, 
  disabled = false,
  size = 'lg',
  fullWidth = false,
  className = ''
}: ToggleButtonProps) {
  const sizeClasses = {
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-xl', 
    xl: 'px-8 py-6 text-2xl'
  }
  
  const baseClasses = 'font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 border-2'
  
  const activeClasses = isActive
    ? 'bg-blue-600 text-white border-blue-500'
    : 'bg-gray-700 text-gray-200 hover:bg-gray-600 border-gray-600'
  
  const disabledClasses = disabled 
    ? 'opacity-50 cursor-not-allowed' 
    : 'cursor-pointer'
  
  const widthClasses = fullWidth ? 'w-full' : ''
  
  const classes = `${baseClasses} ${sizeClasses[size]} ${activeClasses} ${disabledClasses} ${widthClasses} ${className}`.trim()
  
  return (
    <button 
      className={classes}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}