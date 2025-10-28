import { cn } from '../../lib/utils'

const badgeVariants = {
  default: 'bg-gray-100 text-gray-700',
  primary: 'bg-blue-100 text-blue-700',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-orange-100 text-orange-700',
  danger: 'bg-red-100 text-red-700',
  pending: 'bg-orange-100 text-orange-700',
  verified: 'bg-emerald-100 text-emerald-700',
}

export function Badge({ children, variant = 'default', className, ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold',
        'transition-colors duration-200',
        badgeVariants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
