import { InputHTMLAttributes, forwardRef, useEffect, useRef } from 'react'

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  helperText?: string
  error?: string
  size?: 'md' | 'lg' | 'xl'
  keyboardType?: 'text' | 'number' | 'url' | 'password'
}

const Input = forwardRef<HTMLInputElement, InputProps>(({ 
  label, 
  helperText, 
  error,
  size = 'lg',
  keyboardType = 'text',
  className = '', 
  ...props 
}, ref) => {
  const sizeClasses = {
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-xl',
    xl: 'px-8 py-6 text-2xl'
  }
  
  const innerRef = useRef<HTMLInputElement>(null)
  const inputRef = ref || innerRef

  const baseInputClasses = 'virtual-keyboard-input w-full border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-dark-card text-dark-text transition-all duration-300'
  const borderClasses = error 
    ? 'border-red-500' 
    : 'border-dark-border'
  
  const inputClasses = `${baseInputClasses} ${sizeClasses[size]} ${borderClasses} ${className}`.trim()

  // Handle focus events for virtual keyboard
  useEffect(() => {
    const input = typeof inputRef === 'object' && inputRef?.current
    if (!input) return

    const handleFocus = () => {
      // Ensure the input is visible when keyboard appears
      setTimeout(() => {
        input.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'nearest'
        })
      }, 300) // Allow time for keyboard animation
    }

    input.addEventListener('focus', handleFocus)
    
    return () => {
      input.removeEventListener('focus', handleFocus)
    }
  }, [inputRef])

  // Determine the appropriate input type for WebOS virtual keyboard
  const getInputType = () => {
    if (props.type) return props.type
    return keyboardType
  }
  
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-xl font-medium text-dark-text">
          {label}
        </label>
      )}
      <input
        ref={inputRef}
        type={getInputType()}
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