import { useState, useEffect } from 'react'
import Input from './Input'

interface NumericInputProps {
  label?: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  unit?: string
  helperText?: string
  error?: string
  size?: 'md' | 'lg' | 'xl'
  placeholder?: string
}

export default function NumericInput({
  label,
  value,
  onChange,
  min = 0,
  max = Infinity,
  step = 1,
  unit,
  helperText,
  error,
  size = 'lg',
  placeholder = '0'
}: NumericInputProps) {
  const [inputValue, setInputValue] = useState(value.toString())

  // Update input when value prop changes
  useEffect(() => {
    setInputValue(value.toString())
  }, [value])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)

    // Parse and validate the number
    const parsed = parseFloat(newValue)
    if (!isNaN(parsed)) {
      const clamped = Math.max(min, Math.min(max, parsed))
      onChange(clamped)
    } else if (newValue === '') {
      // Allow empty input temporarily
      onChange(min)
    }
  }

  const handleBlur = () => {
    // Ensure the input shows a valid number on blur
    const parsed = parseFloat(inputValue)
    if (isNaN(parsed) || inputValue === '') {
      setInputValue(min.toString())
      onChange(min)
    } else {
      const clamped = Math.max(min, Math.min(max, parsed))
      setInputValue(clamped.toString())
      if (clamped !== parsed) {
        onChange(clamped)
      }
    }
  }

  const increment = () => {
    const newValue = Math.min(max, value + step)
    onChange(newValue)
  }

  const decrement = () => {
    const newValue = Math.max(min, value - step)
    onChange(newValue)
  }

  const displayLabel = unit ? `${label} (${unit})` : label

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-xl font-medium text-dark-text">
          {displayLabel}
        </label>
      )}
      
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={decrement}
          disabled={value <= min}
          className="flex-shrink-0 w-12 h-12 bg-dark-card border border-dark-border rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-xl font-bold"
        >
          −
        </button>
        
        <div className="flex-1">
          <Input
            keyboardType="number"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleBlur}
            placeholder={placeholder}
            size={size}
            error={error}
          />
        </div>
        
        <button
          type="button"
          onClick={increment}
          disabled={value >= max}
          className="flex-shrink-0 w-12 h-12 bg-dark-card border border-dark-border rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-xl font-bold"
        >
          +
        </button>
      </div>
      
      {(helperText || error) && (
        <div className={`text-base ${error ? 'text-red-400' : 'text-dark-muted'}`}>
          {error || helperText}
        </div>
      )}
    </div>
  )
}