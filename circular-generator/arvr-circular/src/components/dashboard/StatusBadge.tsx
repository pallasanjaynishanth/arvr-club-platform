import clsx from 'clsx'
import { CircularStatus } from '@/types/event'

export function StatusBadge({ status }: { status: CircularStatus }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium',
        status === 'generated' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
      )}
    >
      {status === 'generated' ? 'Generated' : 'Draft'}
    </span>
  )
}
