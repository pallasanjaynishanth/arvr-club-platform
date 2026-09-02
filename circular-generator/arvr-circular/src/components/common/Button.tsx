import { ButtonHTMLAttributes, forwardRef } from 'react'
import clsx from 'clsx'
import { Spinner } from '@/components/common/Spinner'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', loading, disabled, className, children, ...props }, ref) => {
    const base =
      'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60'
    const variants: Record<string, string> = {
      primary: 'bg-navy-700 text-white hover:bg-navy-800',
      secondary: 'bg-white text-navy-700 border border-navy-200 hover:bg-navy-50',
      ghost: 'text-navy-700 hover:bg-navy-50',
      danger: 'bg-white text-red-600 border border-red-200 hover:bg-red-50',
    }
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={clsx(base, variants[variant], className)}
        {...props}
      >
        {loading && <Spinner size={16} />}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
