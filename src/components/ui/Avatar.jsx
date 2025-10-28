import { cn } from '../../lib/utils'

export function Avatar({ name, size = 'md', className }) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl',
  }

  const colors = [
    'bg-blue-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-red-500',
    'bg-indigo-500',
    'bg-teal-500',
  ]

  const getInitials = (name) => {
    const parts = name.split(' ')
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  const getColor = (name) => {
    const index = name.charCodeAt(0) % colors.length
    return colors[index]
  }

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-semibold text-white',
        'shadow-sm',
        sizeClasses[size],
        getColor(name),
        className
      )}
    >
      {getInitials(name)}
    </div>
  )
}
