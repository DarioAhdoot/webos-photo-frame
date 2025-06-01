interface EnabledToggleProps {
  enabled: boolean
  onToggle: () => void
  size?: 'md' | 'lg'
}

export default function EnabledToggle({ 
  enabled, 
  onToggle,
  size = 'lg'
}: EnabledToggleProps) {
  const sizeClasses = {
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-4 text-xl'
  }
  
  const checkboxSizeClasses = {
    md: 'w-5 h-5 mr-3',
    lg: 'w-6 h-6 mr-4'
  }
  
  const iconSizeClasses = {
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  }
  
  return (
    <button
      onClick={onToggle}
      className={`flex items-center rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 ${
        enabled 
          ? 'bg-green-600 border-green-500 text-white hover:bg-green-700' 
          : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
      } ${sizeClasses[size]}`}
    >
      <div className={`rounded border-2 flex items-center justify-center ${
        enabled 
          ? 'bg-white border-white' 
          : 'bg-transparent border-gray-400'
      } ${checkboxSizeClasses[size]}`}>
        {enabled && (
          <svg className={`text-green-600 ${iconSizeClasses[size]}`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )}
      </div>
      <span className="font-medium">
        {enabled ? 'Enabled' : 'Disabled'}
      </span>
    </button>
  )
}