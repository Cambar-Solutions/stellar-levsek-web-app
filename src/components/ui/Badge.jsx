import { cn } from '../../lib/utils'

const badgeVariants = {
  default: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200',
  primary: 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300',
  success: 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300',
  warning: 'bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300',
  danger: 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300',
  pending: 'bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300',
  verified: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300',
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
