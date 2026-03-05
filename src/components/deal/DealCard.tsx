import { Cell } from '@telegram-apps/telegram-ui';
import type { Deal, UserRole } from '@/types';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { CryptoIcon } from '@/components/ui/CryptoIcon';
import { formatAmount, formatRelativeTime, truncate } from '@/lib/utils';

interface DealCardProps {
  deal: Deal;
  userRole: UserRole;
  onClick?: () => void;
}

export function DealCard({ deal, userRole, onClick }: DealCardProps) {
  const counterparty = userRole === 'buyer' 
    ? deal.sellerUsername || `User ${deal.sellerId}`
    : deal.buyerUsername || `User ${deal.buyerId}`;

  return (
    <Cell
      onClick={onClick}
      before={<CryptoIcon currency={deal.currency} size="lg" />}
      after={<StatusBadge status={deal.status} size="sm" />}
      subtitle={
        <div className="flex flex-col gap-0.5">
          <span className="text-text-secondary">@{counterparty}</span>
          <span className="text-text-muted text-xs">
            {truncate(deal.description, 30)}
          </span>
        </div>
      }
      description={
        <span className="text-text-muted text-xs">
          {formatRelativeTime(deal.createdAt)}
        </span>
      }
      className="bg-bg-secondary rounded-xl mb-2"
    >
      <div className="flex items-center justify-between">
        <span className="font-semibold">Deal #{deal.dealNumber}</span>
        <span className="font-bold text-accent">
          {formatAmount(deal.amount, deal.currency)}
        </span>
      </div>
    </Cell>
  );
}
