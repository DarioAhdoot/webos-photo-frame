import { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  fullWidth?: boolean
}

export default function Button({ 
  children, 
  variant = 'secondary', 
  size = 'lg',
  fullWidth = false,
  className = '', 
  disabled,
  ...props 
}: ButtonProps) {
  const baseClasses = 'font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-opacity-50'
  
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-xl',
    xl: 'px-8 py-6 text-2xl'
  }
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 border-2 border-blue-500 focus:ring-blue-500',
    secondary: 'bg-gray-700 text-gray-200 hover:bg-gray-600 border-2 border-gray-600 focus:ring-gray-500',
    success: 'bg-green-600 text-white hover:bg-green-700 border-2 border-green-500 focus:ring-green-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 border-2 border-red-500 focus:ring-red-500',
    ghost: 'bg-transparent text-dark-text hover:bg-gray-700 border-2 border-dark-border focus:ring-blue-500'
  }
  
  const disabledClasses = disabled 
    ? 'opacity-50 cursor-not-allowed hover:bg-gray-700' 
    : ''
  
  const widthClasses = fullWidth ? 'w-full' : ''
  
  const classes = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${widthClasses} ${disabledClasses} ${className}`.trim()
  
  return (
    <button 
      className={classes}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}