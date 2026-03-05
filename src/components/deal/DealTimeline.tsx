import type { DealStatus } from '@/types';

interface DealTimelineProps {
  status: DealStatus;
}

const STEPS = [
  { key: 'created', label: 'Created' },
  { key: 'funded', label: 'Funded' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'completed', label: 'Complete' },
] as const;

const STATUS_STEP_MAP: Record<DealStatus, number> = {
  created: 0,
  awaiting_deposit: 0,
  funded: 1,
  in_progress: 1,
  delivered: 2,
  completed: 3,
  disputed: -1,
  cancelled: -2,
  refunded: -2,
  expired: -2,
  locked_for_payout: 2,
};

export function DealTimeline({ status }: DealTimelineProps) {
  const currentStep = STATUS_STEP_MAP[status];
  
  if (['disputed', 'cancelled', 'refunded', 'expired'].includes(status)) {
    const messages: Record<string, string> = {
      disputed: '⚠️ Deal is under dispute',
      cancelled: '❌ Deal was cancelled',
      refunded: '💸 Deal was refunded',
      expired: '⏰ Deal has expired',
    };
    return (
      <div className="py-4">
        <div className={`
          text-center py-3 px-4 rounded-lg
          ${status === 'disputed' ? 'bg-status-error-bg text-status-error' : 'bg-bg-tertiary text-text-muted'}
        `}>
          {messages[status]}
        </div>
      </div>
    );
  }

  return (
    <div className="deal-timeline py-4">
      {STEPS.map((step, index) => {
        const isCompleted = index < currentStep;
        const isActive = index === currentStep;
        const isLast = index === STEPS.length - 1;

        return (
          <div key={step.key} className="flex items-center flex-1">
            {/* Step */}
            <div className="timeline-step">
              <div
                className={`
                  timeline-dot
                  ${isCompleted ? 'completed' : ''}
                  ${isActive ? 'active' : ''}
                `}
              />
              <span
                className={`
                  text-xs mt-1
                  ${isActive ? 'text-accent font-semibold' : ''}
                  ${isCompleted ? 'text-status-success' : 'text-text-muted'}
                `}
              >
                {step.label}
              </span>
            </div>
            
            {/* Line between steps */}
            {!isLast && (
              <div
                className={`
                  timeline-line flex-1
                  ${isCompleted ? 'completed' : ''}
                `}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
