import { cn } from '../../lib/utils'

export function Input({ className, error, icon: Icon, ...props }) {
  return (
    <div className="relative">
      {Icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
          <Icon size={20} />
        </div>
      )}
      <input
        className={cn(
          'w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-3 text-base',
          'text-gray-900 dark:text-white',
          'transition-all duration-200',
          'placeholder:text-gray-400 dark:placeholder:text-gray-500',
          'focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 dark:focus:border-blue-400',
          'disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60',
          error && 'border-red-500 focus:ring-red-500/50 focus:border-red-500',
          Icon && 'pl-10',
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  )
}

export function Label({ children, required, className, ...props }) {
  return (
    <label
      className={cn('block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2', className)}
      {...props}
    >
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  )
}

export function Textarea({ className, error, ...props }) {
  return (
    <div>
      <textarea
        className={cn(
          'w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-3 text-base',
          'text-gray-900 dark:text-white',
          'transition-all duration-200 resize-none',
          'placeholder:text-gray-400 dark:placeholder:text-gray-500',
          'focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 dark:focus:border-blue-400',
          'disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60',
          error && 'border-red-500 focus:ring-red-500/50 focus:border-red-500',
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  )
}
