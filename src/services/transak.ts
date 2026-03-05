import { TRANSAK_API_KEY, TRANSAK_ENV } from '@/config/constants';
import type { Currency, TransakOrder } from '@/types';

// Transak SDK types
interface TransakConfig {
  apiKey: string;
  environment: 'STAGING' | 'PRODUCTION';
  productsAvailed?: 'BUY' | 'SELL';
  cryptoCurrencyCode?: string;
  network?: string;
  cryptoAmount?: number;
  walletAddress?: string;
  partnerCustomerId?: string;
  partnerOrderId?: string;
  themeColor?: string;
  hideMenu?: boolean;
  redirectURL?: string;
  widgetHeight?: string;
  widgetWidth?: string;
}

interface TransakSDK {
  init: () => void;
  close: () => void;
  cleanup: () => void;
  on: (event: string, callback: (data: unknown) => void) => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let TransakClass: any = null;

async function loadTransakSDK(): Promise<{ new (config: TransakConfig): TransakSDK } | null> {
  if (!TransakClass) {
    try {
      const module = await import('@transak/transak-sdk');
      // The SDK exports Transak class directly
      TransakClass = module.Transak;
    } catch (e) {
      console.error('Failed to load Transak SDK:', e);
      return null;
    }
  }
  return TransakClass;
}

export interface TransakParams {
  amount: number;
  currency: Currency;
  walletAddress: string;
  userId: string;
  orderId?: string;
  onSuccess?: (order: TransakOrder) => void;
  onError?: (error: Error) => void;
  onClose?: () => void;
}

/**
 * Initialize and open Transak off-ramp widget
 */
export async function openTransakOfframp(params: TransakParams): Promise<void> {
  const TransakSDKClass = await loadTransakSDK();
  
  if (!TransakSDKClass) {
    throw new Error('Failed to load Transak SDK');
  }

  const CURRENCY_NETWORK_MAP: Record<string, string> = {
    USDT: 'tron', USDT_TRC20: 'tron', BTC: 'bitcoin', ETH: 'ethereum', LTC: 'litecoin',
  };
  const network = CURRENCY_NETWORK_MAP[params.currency] || 'bitcoin';
  
  const config: TransakConfig = {
    apiKey: TRANSAK_API_KEY,
    environment: TRANSAK_ENV as 'STAGING' | 'PRODUCTION',
    
    // Off-ramp specific
    productsAvailed: 'SELL',
    cryptoCurrencyCode: params.currency,
    network,
    cryptoAmount: params.amount,
    
    // User context
    walletAddress: params.walletAddress,
    partnerCustomerId: params.userId,
    partnerOrderId: params.orderId,
    
    // UI customization - Indigo theme
    themeColor: '6366F1',
    hideMenu: true,
    
    // Redirect
    redirectURL: `${window.location.origin}/offramp/callback`,
    
    // Widget size
    widgetHeight: '100%',
    widgetWidth: '100%',
  };

  const transak = new TransakSDKClass(config) as TransakSDK;

  // Event listeners
  transak.on('TRANSAK_WIDGET_OPEN', () => {
    console.log('Transak widget opened');
  });

  transak.on('TRANSAK_ORDER_CREATED', (orderData) => {
    console.log('Transak order created:', orderData);
  });

  transak.on('TRANSAK_ORDER_SUCCESSFUL', (orderData) => {
    console.log('Transak order successful:', orderData);
    params.onSuccess?.(orderData as TransakOrder);
  });

  transak.on('TRANSAK_ORDER_FAILED', (errorData) => {
    console.error('Transak order failed:', errorData);
    params.onError?.(new Error('Transaction failed'));
  });

  transak.on('TRANSAK_WIDGET_CLOSE', () => {
    console.log('Transak widget closed');
    params.onClose?.();
    transak.cleanup();
  });

  // Open widget
  transak.init();
}

/**
 * Generate Transak URL for off-ramp (alternative to SDK)
 */
export function getTransakOfframpUrl(params: {
  amount: number;
  currency: Currency;
  walletAddress: string;
  userId: string;
}): string {
  const baseUrl = TRANSAK_ENV === 'PRODUCTION' 
    ? 'https://global.transak.com' 
    : 'https://global-stg.transak.com';
  
  const CURRENCY_NETWORK_MAP: Record<string, string> = {
    USDT: 'tron', USDT_TRC20: 'tron', BTC: 'bitcoin', ETH: 'ethereum', LTC: 'litecoin',
  };
  const network = CURRENCY_NETWORK_MAP[params.currency] || 'bitcoin';
  
  const queryParams = new URLSearchParams({
    apiKey: TRANSAK_API_KEY,
    productsAvailed: 'SELL',
    cryptoCurrencyCode: params.currency,
    network,
    defaultCryptoAmount: params.amount.toString(),
    walletAddress: params.walletAddress,
    partnerCustomerId: params.userId,
    themeColor: '6366F1',
    hideMenu: 'true',
  });

  return `${baseUrl}?${queryParams}`;
}
