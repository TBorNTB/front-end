import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatsActionBarProps {
  stats: ReactNode;
  actions?: ReactNode;
  className?: string;
  statsClassName?: string;
  actionsClassName?: string;
}

export default function StatsActionBar({
  stats,
  actions,
  className,
  statsClassName,
  actionsClassName,
}: StatsActionBarProps) {
  return (
    <section className={cn('mb-8 border-y border-gray-200 py-5', className)}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className={cn('flex items-center gap-5 text-sm text-gray-700', statsClassName)}>{stats}</div>
        {actions ? <div className={cn('flex items-center gap-2', actionsClassName)}>{actions}</div> : null}
      </div>
    </section>
  );
}
