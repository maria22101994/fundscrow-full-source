import { API_BASE_URL } from '@/config/constants';
import type {
  Deal,
  CreateDealInput,
  UserBalance,
  Transaction,
  DealStats,
  PaginatedResponse,
  NoKycRecipient,
  NoKycWithdrawal,
  NoKycStatus,
} from '@/types';

// Development mode check
const DEV_MODE = import.meta.env.VITE_DEV_MODE === 'true';

// ============================================================================
// MOCK DATA FOR DEV MODE — silenced with as any to bypass strict type checking
// ============================================================================
const MOCK_USER = {
  id: 123456789,
  username: 'devuser',
  firstName: 'Dev',
  isAdmin: false,
  rewardPoints: 2500,
  rewardLevel: 3,
  cashbackBalance: '15.50',
  freeEscrowCredits: '25.00',
  completedEscrows: 12,
  totalVolume: '5420.00',
  activeStreakDays: 5,
  nokycUnlocked: true,
} as any;

const MOCK_BALANCES = [
  { 
    currency: 'USDT_TRC20', 
    available: '1250.00',
    pendingBalance: '100.00',
    address: 'TLMcd1XUgBuoAXhjZnZpk1' 
  },
  { 
    currency: 'BTC', 
    available: '0.0234',
    pendingBalance: '0',
    address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh' 
  },
  { 
    currency: 'ETH', 
    available: '0.5123',
    pendingBalance: '0',
    address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F' 
  },
] as any;

const MOCK_DEALS = [
  {
    id: 'deal-001',
    dealNumber: 1001,
    status: 'funded',
    amount: '500.00',
    currency: 'USDT_TRC20',
    description: 'Logo design, 3 revisions included',
    terms: 'Delivery within 5 days',
    buyerId: 123456789,
    sellerId: 987654321,
    buyerUsername: 'devuser',
    sellerUsername: 'designpro',
    sellerPayoutAddress: 'TLMcd1XUgBuoAXhjZnZpk1',
    depositAddress: 'TYDzsYUEpvnYmQk4zGP9sWWcTEd2MiAtW7',
    feePercentage: '5.0',
    feeAmount: '25.00',
    sellerReceives: '475.00',
    createdAt: '2026-02-15T10:30:00Z',
    fundedAt: '2026-02-15T11:00:00Z',
    expiresAt: '2026-02-18T10:30:00Z',
    isBuyer: true,
    isSeller: false,
    hasMilestones: false,
    totalMilestones: 0,
    completedMilestones: 0,
  },
  {
    id: 'deal-002',
    dealNumber: 1002,
    status: 'in_progress',
    amount: '1200.00',
    currency: 'USDT_TRC20',
    description: 'Website development - Landing page',
    terms: 'Full responsive design with animations',
    buyerId: 555555555,
    sellerId: 123456789,
    buyerUsername: 'clientabc',
    sellerUsername: 'devuser',
    sellerPayoutAddress: 'TLMcd1XUgBuoAXhjZnZpk1',
    depositAddress: 'TYDzsYUEpvnYmQk4zGP9sWWcTEd2MiAtW8',
    feePercentage: '5.0',
    feeAmount: '60.00',
    sellerReceives: '1140.00',
    createdAt: '2026-02-14T09:00:00Z',
    fundedAt: '2026-02-14T10:00:00Z',
    expiresAt: '2026-02-21T09:00:00Z',
    isBuyer: false,
    isSeller: true,
    hasMilestones: true,
    totalMilestones: 3,
    completedMilestones: 1,
  },
  {
    id: 'deal-003',
    dealNumber: 1003,
    status: 'delivered',
    amount: '250.00',
    currency: 'USDT_TRC20',
    description: 'Social media graphics pack',
    terms: '10 graphics for Instagram',
    buyerId: 123456789,
    sellerId: 111222333,
    buyerUsername: 'devuser',
    sellerUsername: 'graphicsguru',
    sellerPayoutAddress: 'TLMcd1XUgBuoAXhjZnZpk2',
    depositAddress: 'TYDzsYUEpvnYmQk4zGP9sWWcTEd2MiAtW9',
    feePercentage: '5.0',
    feeAmount: '12.50',
    sellerReceives: '237.50',
    createdAt: '2026-02-13T14:00:00Z',
    fundedAt: '2026-02-13T15:00:00Z',
    deliveredAt: '2026-02-16T12:00:00Z',
    expiresAt: '2026-02-20T14:00:00Z',
    isBuyer: true,
    isSeller: false,
    hasMilestones: false,
    totalMilestones: 0,
    completedMilestones: 0,
  },
  {
    id: 'deal-004',
    dealNumber: 998,
    status: 'completed',
    amount: '800.00',
    currency: 'USDT_TRC20',
    description: 'Mobile app UI design',
    terms: 'Figma deliverables',
    buyerId: 123456789,
    sellerId: 444555666,
    buyerUsername: 'devuser',
    sellerUsername: 'uidesigner',
    sellerPayoutAddress: 'TLMcd1XUgBuoAXhjZnZpk3',
    depositAddress: 'TYDzsYUEpvnYmQk4zGP9sWWcTEd2MiAtW0',
    feePercentage: '5.0',
    feeAmount: '40.00',
    sellerReceives: '760.00',
    createdAt: '2026-02-10T08:00:00Z',
    fundedAt: '2026-02-10T09:00:00Z',
    deliveredAt: '2026-02-12T16:00:00Z',
    completedAt: '2026-02-12T18:00:00Z',
    expiresAt: '2026-02-17T08:00:00Z',
    isBuyer: true,
    isSeller: false,
    hasMilestones: false,
    totalMilestones: 0,
    completedMilestones: 0,
  },
  {
    id: 'deal-005',
    dealNumber: 1004,
    status: 'awaiting_deposit',
    amount: '350.00',
    currency: 'USDT_TRC20',
    description: 'Video editing - YouTube intro',
    terms: '15 second intro with effects',
    buyerId: 123456789,
    sellerId: 777888999,
    buyerUsername: 'devuser',
    sellerUsername: 'videoeditor',
    sellerPayoutAddress: 'TLMcd1XUgBuoAXhjZnZpk4',
    depositAddress: 'TYDzsYUEpvnYmQk4zGP9sWWcTEd2MiAtW1',
    feePercentage: '5.0',
    feeAmount: '25.00',
    sellerReceives: '325.00',
    createdAt: '2026-02-16T11:00:00Z',
    expiresAt: '2026-02-19T11:00:00Z',
    isBuyer: true,
    isSeller: false,
    hasMilestones: false,
    totalMilestones: 0,
    completedMilestones: 0,
  },
] as any;

const MOCK_TRANSACTIONS = [
  {
    id: 'tx-001',
    type: 'deposit',
    amount: '500.00',
    currency: 'USDT_TRC20',
    status: 'confirmed',
    txHash: '3a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b',
    fromAddress: 'external',
    toAddress: 'TYDzsYUEpvnYmQk4zGP9sWWcTEd2MiAtW7',
    createdAt: '2026-02-15T10:45:00Z',
    description: 'Deposit to escrow deal-001',
  },
  {
    id: 'tx-002',
    type: 'release',
    amount: '760.00',
    currency: 'USDT_TRC20',
    status: 'confirmed',
    txHash: '4b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c',
    fromAddress: 'escrow',
    toAddress: 'TLMcd1XUgBuoAXhjZnZpk3',
    createdAt: '2026-02-12T18:00:00Z',
    description: 'Release from deal-004',
  },
  {
    id: 'tx-003',
    type: 'withdrawal',
    amount: '200.00',
    currency: 'USDT_TRC20',
    status: 'confirmed',
    txHash: '5c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d',
    fromAddress: 'wallet',
    toAddress: 'TExternalAddress123456',
    createdAt: '2026-02-11T14:30:00Z',
    description: 'User withdrawal',
  },
] as any;

const MOCK_STATS = {
  dealsCount: 15,
  activeCount: 3,
  completedCount: 12,
  volume: '8500.00',
  earnings: '1200.00',
  spent: '7300.00',
} as any;

const MOCK_MESSAGES = [
  {
    id: 'msg-001',
    dealId: 'deal-001',
    senderId: 987654321,
    senderUsername: 'designpro',
    message: 'Hi! I have started working on your logo. Will send first draft tomorrow.',
    isSystem: false,
    isRead: true,
    createdAt: '2026-02-15T12:00:00Z',
  },
  {
    id: 'msg-002',
    dealId: 'deal-001',
    senderId: 123456789,
    senderUsername: 'devuser',
    message: 'Great, looking forward to it!',
    isSystem: false,
    isRead: true,
    createdAt: '2026-02-15T12:05:00Z',
  },
  {
    id: 'msg-003',
    dealId: 'deal-001',
    senderId: 0,
    senderUsername: 'system',
    message: 'Deal has been funded. Seller can now start working.',
    isSystem: true,
    isRead: true,
    createdAt: '2026-02-15T11:00:00Z',
  },
] as any;

const MOCK_NOKYC_STATUS = {
  unlocked: true,
  unlockedAt: '2026-02-01T10:00:00Z',
  recipients: [],
} as any;

const MOCK_NOKYC_RECIPIENTS = [
  {
    id: 'rec-001',
    label: 'My Visa Card',
    recipientType: 'card',
    cardLastFour: '4242',
    cardBrand: 'Visa',
    fiatCurrency: 'EUR',
    isDefault: true,
    createdAt: '2026-01-15T10:00:00Z',
  },
  {
    id: 'rec-002',
    label: 'Bank Account',
    recipientType: 'bank',
    bankName: 'Deutsche Bank',
    accountLastFour: '7890',
    fiatCurrency: 'EUR',
    isDefault: false,
    createdAt: '2026-01-20T14:00:00Z',
  },
] as any;

function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

function transformKeys<T>(obj: unknown): T {
  if (obj === null || obj === undefined) {
    return obj as T;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => transformKeys(item)) as T;
  }
  
  if (typeof obj === 'object') {
    const transformed: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      const camelKey = snakeToCamel(key);
      transformed[camelKey] = transformKeys(value);
    }
    return transformed as T;
  }
  
  return obj as T;
}

class ApiClient {
  private baseUrl: string;
  private initData: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setInitData(initData: string) {
    this.initData = initData;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.initData) {
      headers['Authorization'] = `Bearer ${this.initData}`;
    }
    
    if (options.headers) {
      Object.assign(headers, options.headers);
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Request failed' }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    const data = await response.json();
    return transformKeys<T>(data);
  }

  async getDeals(params?: {
    status?: string;
    page?: number;
    pageSize?: number;
  }): Promise<PaginatedResponse<Deal>> {
    if (DEV_MODE) {
      let deals = [...MOCK_DEALS];
      if (params?.status && params.status !== 'all') {
        deals = deals.filter(d => d.status === params.status);
      }
      return { items: deals, total: deals.length, page: 1, pageSize: 20, hasMore: false };
    }
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.page) query.set('page', params.page.toString());
    if (params?.pageSize) query.set('page_size', params.pageSize.toString());

    return this.request(`/deals?${query}`);
  }

  async getDeal(id: string): Promise<Deal> {
    if (DEV_MODE) {
      const deal = MOCK_DEALS.find((d: Deal) => d.id === id || d.dealNumber?.toString() === id);
      if (deal) return deal;
      return MOCK_DEALS[0];
    }
    return this.request(`/deals/${id}`);
  }

  async createDeal(input: CreateDealInput): Promise<Deal> {
    const apiInput = {
      role: input.role,
      counterparty_id: input.counterpartyId,
      counterparty_username: input.counterpartyUsername,
      amount: input.amount,
      currency: input.currency,
      description: input.description,
      terms: input.terms,
    };
    return this.request('/deals', {
      method: 'POST',
      body: JSON.stringify(apiInput),
    });
  }

  async fundDeal(id: string): Promise<Deal> {
    return this.request(`/deals/${id}/fund`, { method: 'POST' });
  }

  async markDelivered(id: string): Promise<Deal> {
    return this.request(`/deals/${id}/deliver`, { method: 'POST' });
  }

  async confirmReceipt(id: string): Promise<Deal> {
    return this.request(`/deals/${id}/confirm`, { method: 'POST' });
  }

  async uploadDisputeFile(dealId: string, file: File): Promise<{ id: string; filename: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const headers: Record<string, string> = {};
    if (this.initData) {
      headers['Authorization'] = `Bearer ${this.initData}`;
    }

    const response = await fetch(`${this.baseUrl}/deals/${dealId}/files`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Upload failed' }));
      throw new Error(error.detail || 'Upload failed');
    }

    const data = await response.json();
    return transformKeys<{ id: string; filename: string }>(data);
  }

  async disputeDeal(
    id: string,
    reason: string,
    refundAddress?: string,
    fileIds?: string[]
  ): Promise<Deal> {
    return this.request(`/deals/${id}/dispute`, {
      method: 'POST',
      body: JSON.stringify({
        reason,
        refund_address: refundAddress,
        file_ids: fileIds,
      }),
    });
  }

  async cancelDeal(id: string): Promise<Deal> {
    return this.request(`/deals/${id}/cancel`, { method: 'POST' });
  }

  async acceptDeal(id: string): Promise<Deal> {
    return this.request(`/deals/${id}/accept`, { method: 'POST' });
  }

  async rejectDeal(id: string, reason?: string): Promise<Deal> {
    return this.request(`/deals/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async markInProgress(id: string): Promise<Deal> {
    return this.request(`/deals/${id}/start`, { method: 'POST' });
  }

  async sendInviteReminder(id: string): Promise<{ success: boolean }> {
    return this.request(`/deals/${id}/remind`, { method: 'POST' });
  }

  async getBalances(): Promise<UserBalance[]> {
    if (DEV_MODE) return MOCK_BALANCES;
    return this.request('/wallet/balances');
  }

  async getDepositAddress(currency: string): Promise<{ address: string; network: string }> {
    if (DEV_MODE) {
      const networks: Record<string, string> = {
        USDT_TRC20: 'TRC20',
        BTC: 'Bitcoin',
        ETH: 'ERC20',
        LTC: 'Litecoin',
      };
      return {
        address: 'TYDzsYUEpvnYmQk4zGP9sWWcTEd2MiAtW7',
        network: networks[currency] || 'TRC20',
      };
    }
    return this.request(`/wallet/deposit-address?currency=${currency}`);
  }

  async getTransactions(params?: {
    page?: number;
    pageSize?: number;
    currency?: string;
    txType?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  }): Promise<{
    items: Transaction[];
    total: number;
    hasMore: boolean;
  }> {
    if (DEV_MODE) {
      return { items: MOCK_TRANSACTIONS, total: MOCK_TRANSACTIONS.length, hasMore: false };
    }
    const query = new URLSearchParams();
    if (params?.page) query.set('page', params.page.toString());
    if (params?.pageSize) query.set('page_size', params.pageSize.toString());
    if (params?.currency) query.set('currency', params.currency);
    if (params?.txType) query.set('tx_type', params.txType);
    if (params?.startDate) query.set('start_date', params.startDate);
    if (params?.endDate) query.set('end_date', params.endDate);
    if (params?.search) query.set('search', params.search);

    return this.request(`/wallet/transactions?${query}`);
  }

  async getDealStats(): Promise<DealStats> {
    if (DEV_MODE) return MOCK_STATS;
    return this.request('/stats/deals');
  }

  async checkUserBotStatus(username: string): Promise<{
    hasStartedBot: boolean;
    userId?: number;
    username?: string;
  }> {
    if (DEV_MODE) return { hasStartedBot: true, userId: 987654321, username };
    return this.request(`/users/check-bot-status?username=${encodeURIComponent(username)}`);
  }

  async sendBotInvitation(username: string, dealInfo?: {
    amount: string;
    currency: string;
    description: string;
  }): Promise<{ success: boolean; message: string }> {
    return this.request('/users/send-bot-invitation', {
      method: 'POST',
      body: JSON.stringify({
        username,
        deal_info: dealInfo,
      }),
    });
  }

  async getMe(): Promise<{
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
  }> {
    if (DEV_MODE) return MOCK_USER;
    return this.request('/users/me');
  }

  async getNoKycStatus(): Promise<NoKycStatus> {
    if (DEV_MODE) return MOCK_NOKYC_STATUS;
    return this.request('/nokyc/status');
  }

  async getNoKycRecipients(): Promise<NoKycRecipient[]> {
    if (DEV_MODE) return MOCK_NOKYC_RECIPIENTS;
    return this.request('/nokyc/recipients');
  }

  async addNoKycRecipient(recipient: {
    label: string;
    recipientType: 'card' | 'bank';
    cardLastFour?: string;
    cardBrand?: string;
    bankName?: string;
    accountLastFour?: string;
    fiatCurrency?: string;
  }): Promise<NoKycRecipient> {
    return this.request('/nokyc/recipients', {
      method: 'POST',
      body: JSON.stringify({
        label: recipient.label,
        recipient_type: recipient.recipientType,
        card_last_four: recipient.cardLastFour,
        card_brand: recipient.cardBrand,
        bank_name: recipient.bankName,
        account_last_four: recipient.accountLastFour,
        fiat_currency: recipient.fiatCurrency || 'EUR',
      }),
    });
  }

  async deleteNoKycRecipient(recipientId: string): Promise<{ success: boolean }> {
    return this.request(`/nokyc/recipients/${recipientId}`, { method: 'DELETE' });
  }

  async createNoKycWithdrawal(params: {
    amount: string;
    cryptoCurrency: string;
    recipientId?: string;
    fiatCurrency?: string;
  }): Promise<NoKycWithdrawal> {
    return this.request('/nokyc/withdraw', {
      method: 'POST',
      body: JSON.stringify({
        amount: params.amount,
        currency: params.cryptoCurrency,
        recipient_id: params.recipientId,
        fiat_currency: params.fiatCurrency || 'EUR',
      }),
    });
  }

  async getNoKycWithdrawals(): Promise<NoKycWithdrawal[]> {
    return this.request('/nokyc/withdrawals');
  }

  async createOfframpTransaction(params: {
    amount: string;
    currency: string;
    fiat_currency?: string;
    withdraw_method?: string;
    kyc_personal?: {
      first_name: string;
      last_name: string;
      mobile_number: string;
      country_code: string;
      dob_day: string;
      dob_month: string;
      dob_year: string;
    };
    kyc_address?: {
      address_line: string;
      address_line2?: string;
      city: string;
      state_region?: string;
      postal_code: string;
      country: string;
    };
    kyc_purpose?: string;
  }): Promise<{ id: string; walletAddress: string; status: string; onfidoUrl?: string }> {
    return this.request('/offramp/create', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async getMessages(dealId: string, params?: {
    limit?: number;
    beforeId?: string;
  }): Promise<{
    messages: ChatMessage[];
    total: number;
    unreadCount: number;
  }> {
    if (DEV_MODE) {
const messages = MOCK_MESSAGES.filter((m: ChatMessage) => m.dealId === dealId || dealId === 'deal-001');      return { messages: messages as ChatMessage[], total: messages.length, unreadCount: 0 };
    }
    const query = new URLSearchParams();
    if (params?.limit) query.set('limit', params.limit.toString());
    if (params?.beforeId) query.set('before_id', params.beforeId);

    return this.request(`/deals/${dealId}/messages?${query}`);
  }

  async sendMessage(dealId: string, message: string, attachment?: { url: string; type: string }): Promise<ChatMessage> {
    return this.request(`/deals/${dealId}/messages`, {
      method: 'POST',
      body: JSON.stringify({
        message,
        attachment_url: attachment?.url,
        attachment_type: attachment?.type,
      }),
    });
  }

  async uploadChatFile(dealId: string, file: File): Promise<{ url: string; type: string; filename: string; size: number }> {
    const formData = new FormData();
    formData.append('file', file);

    const headers: Record<string, string> = {};
    if (this.initData) {
      headers['Authorization'] = `Bearer ${this.initData}`;
    }

    const response = await fetch(`${this.baseUrl}/deals/${dealId}/chat-files`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Upload failed' }));
      throw new Error(error.detail || 'Upload failed');
    }

    const data = await response.json();
    return transformKeys<{ url: string; type: string; filename: string; size: number }>(data);
  }

  async markMessagesRead(dealId: string): Promise<{ success: boolean }> {
    return this.request(`/deals/${dealId}/messages/read`, { method: 'POST' });
  }

  async withdraw(params: {
    amount: string;
    currency: string;
    address: string;
  }): Promise<{ success: boolean; transactionId?: string; message?: string }> {
    return this.request('/wallet/withdraw', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }
}

// Chat message type
export interface ChatMessage {
  id: string;
  dealId: string;
  senderId: number;
  senderUsername?: string;
  message: string;
  isSystem: boolean;
  isRead: boolean;
  createdAt: string;
  attachmentUrl?: string;
  attachmentType?: string;
}

// Export singleton instance
export const api = new ApiClient(API_BASE_URL);