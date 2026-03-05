import type { DealStatus } from '@/types';
import { DEAL_STATUSES } from '@/config/constants';

interface StatusBadgeProps {
  status: DealStatus;
  size?: 'sm' | 'md';
  showLabel?: boolean;
}

export function StatusBadge({ status, size = 'md', showLabel = true }: StatusBadgeProps) {
  const statusInfo = DEAL_STATUSES[status];
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-3 py-1 text-xs',
  };

  const colorClasses: Record<string, string> = {
    pending: 'bg-status-pending text-white',
    info: 'bg-status-info text-white',
    warning: 'bg-status-warning text-black',
    success: 'bg-status-success text-white',
    error: 'bg-status-error text-white',
    muted: 'bg-text-muted text-white',
  };

  return (
    <span
      className={`
        inline-flex items-center rounded-full font-semibold uppercase tracking-wider
        ${sizeClasses[size]}
        ${colorClasses[statusInfo.color]}
      `}
    >
      {showLabel ? statusInfo.label : status}
    </span>
  );
}
