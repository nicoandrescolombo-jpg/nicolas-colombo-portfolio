import { cn } from '@/lib/utils/helpers'

interface SpinnerProps {
  /** Pixel size of the SVG (width = height). Defaults to 20. */
  size?: number
  className?: string
}

/**
 * Lightweight inline SVG spinner.
 * Colour inherits from `currentColor` — control it via a text-* class.
 */
export default function Spinner({ size = 20, className }: SpinnerProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cn('animate-spin', className)}
    >
      {/* Full circle track (muted) */}
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeOpacity={0.2}
        strokeWidth={2.5}
      />
      {/* Quarter-arc indicator */}
      <path d="M12 2a10 10 0 0 1 10 10" />
    </svg>
  )
}
