import { cn } from '../../lib/utils'

const buttonVariants = {
  default: 'bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700 shadow-sm',
  primary: 'bg-gradient-to-br from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/30',
  secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 active:bg-gray-300',
  success: 'bg-green-500 text-white hover:bg-green-600 active:bg-green-700 shadow-sm',
  warning: 'bg-amber-500 text-white hover:bg-amber-600 active:bg-amber-700 shadow-sm',
  danger: 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700 shadow-sm',
  ghost: 'bg-transparent hover:bg-gray-100 text-gray-700',
  outline: 'border-2 border-gray-300 bg-white hover:bg-gray-50 text-gray-700',
}

const sizeVariants = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-base',
  lg: 'px-6 py-3 text-lg',
}

export function Button({
  children,
  variant = 'default',
  size = 'md',
  className,
  disabled,
  ...props
}) {
  return (
    <button
      className={cn(
        'rounded-xl font-semibold transition-all duration-200 ease-out',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none',
        'focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2',
        buttonVariants[variant],
        sizeVariants[size],
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
