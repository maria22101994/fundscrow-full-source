import type { Currency } from '@/types';
import { CURRENCIES } from '@/config/constants';

interface CryptoIconProps {
  currency: Currency;
  size?: 'sm' | 'md' | 'lg';
}

export function CryptoIcon({ currency, size = 'md' }: CryptoIconProps) {
  const currencyInfo = CURRENCIES[currency];
  
  const sizeClasses = {
    sm: 'w-5 h-5 text-[8px]',
    md: 'w-6 h-6 text-[10px]',
    lg: 'w-8 h-8 text-xs',
  };

  return (
    <div
      className={`
        rounded-full flex items-center justify-center font-bold
        ${sizeClasses[size]}
      `}
      style={{ backgroundColor: currencyInfo.color }}
    >
      {currency === 'USDT' ? '₮' : '₿'}
    </div>
  );
}
