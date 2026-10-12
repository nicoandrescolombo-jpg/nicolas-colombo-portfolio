import { cn } from '@/lib/utils/helpers'

type Status = 'draft' | 'published'

interface StatusBadgeProps {
  status: Status
}

const statusConfig: Record<
  Status,
  { label: string; className: string }
> = {
  draft: {
    label: 'Draft',
    className: 'bg-[#2A2A2A] text-[#888888] border border-[#333333]',
  },
  published: {
    label: 'Published',
    className: 'bg-[#0D2E1A] text-[#4ADE80] border border-[#166534]',
  },
}

/**
 * Pill badge indicating a project's publication status.
 * Server-component safe — no interactivity needed.
 */
export default function StatusBadge({ status }: StatusBadgeProps) {
  const { label, className } = statusConfig[status]

  return (
    <span
      className={cn(
        'font-ui text-xs uppercase tracking-wider px-2 py-0.5 rounded-full inline-block',
        className,
      )}
    >
      {label}
    </span>
  )
}
