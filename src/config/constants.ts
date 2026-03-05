// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
export const BOT_USERNAME = import.meta.env.VITE_BOT_USERNAME || 'escrow_bot';

// Transak Configuration
export const TRANSAK_API_KEY = import.meta.env.VITE_TRANSAK_API_KEY || '';
export const TRANSAK_ENV = import.meta.env.VITE_TRANSAK_ENV || 'STAGING';

// Currency definitions
export const CURRENCIES = {
  USDT: { 
    symbol: 'USDT', 
    name: 'Tether', 
    network: 'TRC20', 
    decimals: 6,
    color: '#26A17B',
    icon: 'usdt'
  },
  USDT_TRC20: { 
    symbol: 'USDT', 
    name: 'Tether', 
    network: 'TRC20', 
    decimals: 6,
    color: '#26A17B',
    icon: 'usdt'
  },
  BTC: { 
    symbol: 'BTC', 
    name: 'Bitcoin', 
    network: 'Bitcoin', 
    decimals: 8,
    color: '#F7931A',
    icon: 'btc'
  },
  ETH: { 
    symbol: 'ETH', 
    name: 'Ethereum', 
    network: 'ERC20', 
    decimals: 18,
    color: '#627EEA',
    icon: 'eth'
  },
  LTC: { 
    symbol: 'LTC', 
    name: 'Litecoin', 
    network: 'Litecoin', 
    decimals: 8,
    color: '#345D9D',
    icon: 'ltc'
  },
} as const;

export const DEAL_STATUSES = {
  created: { label: 'Created', color: 'pending', description: 'Deal created' },
  awaiting_deposit: { label: 'Awaiting Payment', color: 'pending', description: 'Awaiting deposit' },
  funded: { label: 'Funded', color: 'info', description: 'In escrow' },
  in_progress: { label: 'In Progress', color: 'info', description: 'Seller working' },
  delivered: { label: 'Delivered', color: 'warning', description: 'Awaiting confirmation' },
  completed: { label: 'Completed', color: 'success', description: 'Deal complete' },
  disputed: { label: 'Disputed', color: 'error', description: 'Under review' },
  cancelled: { label: 'Cancelled', color: 'muted', description: 'Deal cancelled' },
  refunded: { label: 'Refunded', color: 'muted', description: 'Funds returned' },
  expired: { label: 'Expired', color: 'muted', description: 'Deal expired' },
  locked_for_payout: { label: 'Processing', color: 'info', description: 'Payout in progress' },
} as const;

// Escrow configuration (must match backend settings)
export const MIN_DEAL_AMOUNT = 100; // USD equivalent (backend: min_deal_amount_usd)
export const MAX_DEAL_AMOUNT = 100000; // USD equivalent
export const ESCROW_FEE_PERCENT = 5.0; // Backend: default_fee_percentage
export const MIN_FEE_AMOUNT = 25; // USD minimum fee (backend: min_fee_amount_usd)
export const MIN_OFFRAMP_AMOUNT = 50; // USD equivalent

// Tiered fee structure (volume-based discounts)
export const FEE_TIERS = {
  tier1: { threshold: 0, percentage: 5.0, label: 'Standard' },
  tier2: { threshold: 10000, percentage: 4.0, label: 'Volume' },
  tier3: { threshold: 50000, percentage: 3.0, label: 'Premium' },
} as const;

// Deal expiration
export const DEAL_EXPIRY_HOURS = 72;

// Validation
export const WALLET_PATTERNS = {
  USDT: /^T[A-Za-z1-9]{33}$/, // TRC20
  USDT_TRC20: /^T[A-Za-z1-9]{33}$/, // TRC20
  BTC: /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/, // Bitcoin
  ETH: /^0x[a-fA-F0-9]{40}$/, // Ethereum
  LTC: /^[LM3][a-km-zA-HJ-NP-Z1-9]{26,33}$/, // Litecoin
} as const;

// Routes
export const ROUTES = {
  HOME: '/',
  DEALS: '/deals',
  DEAL_DETAIL: '/deal/:id',
  CREATE_DEAL: '/create',
  WALLET: '/wallet',
  WITHDRAW: '/withdraw',
  OFFRAMP: '/offramp',
  DEPOSIT: '/deposit',
  SETTINGS: '/settings',
  ADDRESS_BOOK: '/address-book',
  REWARDS: '/rewards',
  TRANSACTIONS: '/transactions',
  PAYMENT: '/payment/:id',
} as const;
