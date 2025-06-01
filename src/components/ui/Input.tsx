import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  helperText?: string
  error?: string
  size?: 'md' | 'lg' | 'xl'
}

const Input = forwardRef<HTMLInputElement, InputProps>(({ 
  label, 
  helperText, 
  error,
  size = 'lg',
  className = '', 
  ...props 
}, ref) => {
  const sizeClasses = {
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-xl',
    xl: 'px-8 py-6 text-2xl'
  }
  
  const baseInputClasses = 'w-full border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-dark-card text-dark-text transition-colors'
  const borderClasses = error 
    ? 'border-red-500' 
    : 'border-dark-border'
  
  const inputClasses = `${baseInputClasses} ${sizeClasses[size]} ${borderClasses} ${className}`.trim()
  
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-xl font-medium text-dark-text">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={inputClasses}
        {...props}
      />
      {(helperText || error) && (
        <div className={`text-base ${error ? 'text-red-400' : 'text-dark-muted'}`}>
          {error || helperText}
        </div>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input