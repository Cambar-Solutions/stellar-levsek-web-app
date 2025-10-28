import { cn } from '../../lib/utils'

export function Card({ children, className, ...props }) {
  return (
    <div
      className={cn(
        'bg-white rounded-2xl shadow-sm border border-gray-200/60',
        'transition-all duration-200',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className, ...props }) {
  return (
    <div
      className={cn('px-6 py-5 border-b border-gray-100', className)}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardContent({ children, className, ...props }) {
  return (
    <div className={cn('px-6 py-5', className)} {...props}>
      {children}
    </div>
  )
}

export function CardFooter({ children, className, ...props }) {
  return (
    <div
      className={cn('px-6 py-4 border-t border-gray-100', className)}
      {...props}
    >
      {children}
    </div>
  )
}
