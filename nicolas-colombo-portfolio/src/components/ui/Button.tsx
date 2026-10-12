import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils/helpers'
import Spinner from './Spinner'

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  children?: React.ReactNode
  className?: string
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  danger: 'btn-danger',
  ghost:
    'bg-transparent border-none text-[#F5F5F5] hover:text-[#E8FF59] transition-colors duration-200',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-base',
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      children,
      className,
      disabled,
      ...rest
    },
    ref,
  ) => {
    const isDisabled = disabled || isLoading

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        aria-busy={isLoading}
        className={cn(
          // Base styles
          'inline-flex items-center justify-center gap-2 rounded font-ui font-medium',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8FF59] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0A]',
          'transition-all duration-200 select-none cursor-pointer',
          // Disabled / loading state
          isDisabled && 'opacity-50 cursor-not-allowed pointer-events-none',
          // Variant
          variantClasses[variant],
          // Size
          sizeClasses[size],
          className,
        )}
        {...rest}
      >
        {isLoading && (
          <Spinner
            size={size === 'lg' ? 18 : size === 'sm' ? 12 : 15}
            className="shrink-0"
          />
        )}
        {children}
      </button>
    )
  },
)

Button.displayName = 'Button'

export { Button }
export default Button
