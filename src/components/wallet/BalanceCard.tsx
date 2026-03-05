import type { UserBalance } from '@/types';
import { formatAmount, formatUSD } from '@/lib/utils';

interface BalanceCardProps {
  balance: UserBalance;
  onDeposit?: () => void;
  onWithdraw?: () => void;
}

export function BalanceCard({ balance, onDeposit, onWithdraw }: BalanceCardProps) {
  const totalUSD = parseFloat(balance.total); // Assuming 1:1 for USDT, need conversion for BTC

  return (
    <div className="balance-card">
      <div className="flex items-center justify-between mb-2">
        <span className="text-white/70 text-sm font-medium">
          ESCROW BALANCE ({balance.currency})
        </span>
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
          {balance.currency === 'USDT' ? '₮' : '₿'}
        </div>
      </div>
      
      <div className="mb-1">
        <span className="text-4xl font-bold">
          {formatAmount(balance.total, balance.currency, false)}
        </span>
        <span className="text-xl ml-2 text-white/80">{balance.currency}</span>
      </div>
      
      <div className="text-white/60 text-sm mb-6">
        ≈ {formatUSD(totalUSD)}
      </div>

      {balance.inEscrow !== '0' && (
        <div className="text-white/70 text-xs mb-4 bg-white/10 rounded-lg px-3 py-2">
          {formatAmount(balance.inEscrow, balance.currency)} in active escrow
        </div>
      )}
      
      <div className="flex gap-3">
        <button
          className="flex-1 bg-white text-gray-900 font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-100 active:bg-gray-200 transition-colors"
          onClick={onDeposit}
        >
          <span className="text-lg">+</span> Deposit
        </button>
        <button
          className="flex-1 bg-transparent border-2 border-white/80 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 hover:bg-white/10 active:bg-white/20 transition-colors"
          onClick={onWithdraw}
        >
          <span className="text-lg">↑</span> Withdraw
        </button>
      </div>
    </div>
  );
}
