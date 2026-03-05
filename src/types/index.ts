export type DealStatus =
  | 'created'
  | 'awaiting_deposit'
  | 'funded'
  | 'in_progress'
  | 'delivered'
  | 'completed'
  | 'disputed'
  | 'cancelled'
  | 'refunded'
  | 'expired'
  | 'locked_for_payout';

export type Currency = 'USDT' | 'BTC' | 'ETH' | 'LTC' | 'USDT_TRC20';

export type UserRole = 'buyer' | 'seller';

export interface TelegramUser {
  id: number;
  firstName: string;
  lastName?: string;
  username?: string;
  photoUrl?: string;
  languageCode?: string;
}

export interface User {
  id: number;
  username?: string;
  firstName: string;
  isAdmin: boolean;
  rewardPoints: number;
  rewardLevel: number;
  cashbackBalance: string;
  freeEscrowCredits: string;
  completedEscrows: number;
  totalVolume: string;
  activeStreakDays: number;
  nokycUnlocked: boolean;
}

export interface Deal {
  id: string;
  dealNumber: number;
  status: DealStatus;
  amount: string;
  currency: Currency;
  feeAmount: string;
  totalAmount: string;
  description: string;
  terms?: string;
  buyerId: number;
  buyerUsername?: string;
  sellerId: number;
  sellerUsername?: string;
  depositAddress?: string;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  fundedAt?: string;
  deliveredAt?: string;
  completedAt?: string;
  hasUnreadMessages?: boolean;
  lastMessage?: string;
  lastMessageAt?: string;
}

export interface CreateDealInput {
  role: UserRole;
  counterpartyId?: number;
  counterpartyUsername?: string;
  amount: string;
  currency: Currency;
  description: string;
  terms?: string;
}

export interface UserBalance {
  currency: Currency;
  available: string;
  inEscrow: string;
  total: string;
}

export interface Transaction {
  id: string;
  type: string;
  amount: string;
  currency: string;
  description: string;
  dealNumber?: number;
  txHash?: string;
  fromAddress?: string;
  toAddress?: string;
  status: string;
  createdAt: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Stats types
export interface DealStats {
  active: number;
  completed: number;
  pending: number;
  totalVolume: string;
}

// Transak types
export interface TransakOrder {
  id: string;
  status: string;
  cryptoAmount: string;
  cryptoCurrency: string;
  fiatAmount: string;
  fiatCurrency: string;
  network: string;
}

// Address Book types
export interface SavedWallet {
  id: string;
  label: string;
  address: string;
  network: string;
  currency: Currency;
}

// NO-KYC Withdrawal types
export type NoKycWithdrawalStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface NoKycRecipient {
  id: string;
  label: string;
  recipientType: 'card' | 'bank';
  cardLastFour?: string;
  cardBrand?: string; // Visa, Mastercard, etc.
  bankName?: string;
  accountLastFour?: string;
  fiatCurrency: string;
  isDefault: boolean;
  createdAt: string;
}

export interface NoKycWithdrawal {
  id: string;
  recipientId?: string;
  amount: string;
  cryptoCurrency: string;
  fiatAmount?: string;
  fiatCurrency: string;
  exchangeRate?: string;
  feeAmount?: string;
  status: NoKycWithdrawalStatus;
  transactionId?: string;
  notes?: string;
  createdAt: string;
  completedAt?: string;
}

export interface NoKycStatus {
  unlocked: boolean;
  unlockedAt?: string;
  recipients: NoKycRecipient[];
}
