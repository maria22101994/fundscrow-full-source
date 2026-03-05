import { CURRENCIES, WALLET_PATTERNS } from '@/config/constants';
import type { Currency, DealStatus } from '@/types';

/**
 * Format currency amount with proper decimals
 */
export function formatAmount(
  amount: string | number, 
  currency: Currency,
  showSymbol = true
): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return showSymbol ? `0.00 ${currency}` : '0.00';
  
  const decimals = currency === 'BTC' ? 8 : 2;
  const formatted = num.toFixed(decimals);
  
  return showSymbol ? `${formatted} ${currency}` : formatted;
}

/**
 * Format USD equivalent
 */
export function formatUSD(amount: string | number): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '$0.00';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(num);
}

/**
 * Format date relative to now
 */
export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format date for display
 */
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Mask wallet address for display
 */
export function maskAddress(address: string, chars = 6): string {
  if (address.length < chars * 2 + 3) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

/**
 * Validate wallet address
 */
export function validateWalletAddress(address: string, currency: Currency): boolean {
  const pattern = WALLET_PATTERNS[currency];
  return pattern?.test(address) ?? false;
}

/**
 * Get currency info
 */
export function getCurrencyInfo(currency: Currency) {
  return CURRENCIES[currency];
}

/**
 * Calculate escrow fee
 */
export function calculateFee(amount: string | number, feePercent: number): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '0';
  return (num * feePercent / 100).toFixed(6);
}

export function getStatusColorClass(status: DealStatus): string {
  const colors: Record<DealStatus, string> = {
    created: 'status-pending',
    awaiting_deposit: 'status-pending',
    funded: 'status-info',
    in_progress: 'status-info',
    delivered: 'status-warning',
    completed: 'status-success',
    disputed: 'status-error',
    cancelled: 'status-muted',
    refunded: 'status-muted',
    expired: 'status-muted',
    locked_for_payout: 'status-info',
  };
  return colors[status] || 'status-muted';
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textArea);
    return success;
  }
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Generate unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
