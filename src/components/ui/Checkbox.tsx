interface CheckboxProps {
  checked: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function Checkbox({ 
  checked, 
  size = 'md',
  className = ''
}: CheckboxProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5', 
    lg: 'w-6 h-6'
  }
  
  const iconSizeClasses = {
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  }
  
  const baseClasses = 'rounded-full border-2 flex items-center justify-center transition-all duration-200'
  const checkedClasses = checked 
    ? 'bg-blue-500 border-blue-500' 
    : 'bg-dark-card border-dark-border group-hover:border-gray-500'
  
  const classes = `${baseClasses} ${checkedClasses} ${sizeClasses[size]} ${className}`.trim()
  
  return (
    <div className={classes}>
      {checked && (
        <svg
          className={`${iconSizeClasses[size]} text-white`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      )}
    </div>
  )
}