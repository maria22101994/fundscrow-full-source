import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Deal, UserBalance, DealStats, TelegramUser, SavedWallet, User } from '@/types';
import { api } from '@/services/api';

// Auth Store
interface AuthState {
  user: TelegramUser | null;
  userData: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: TelegramUser | null) => void;
  setAuthenticated: (value: boolean) => void;
  fetchUserData: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  userData: null,
  isAuthenticated: false,
  isLoading: true,
  setUser: (user) => set({ user, isLoading: false }),
  setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
  fetchUserData: async () => {
    try {
      const data = await api.getMe();
      set({
        userData: {
          id: data.id,
          username: data.username,
          firstName: data.firstName,
          isAdmin: data.isAdmin,
          rewardPoints: data.rewardPoints,
          rewardLevel: data.rewardLevel,
          cashbackBalance: data.cashbackBalance,
          freeEscrowCredits: data.freeEscrowCredits,
          completedEscrows: data.completedEscrows,
          totalVolume: data.totalVolume,
          activeStreakDays: data.activeStreakDays,
          nokycUnlocked: data.nokycUnlocked,
        },
      });
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    }
  },
}));

// Deal Store
interface DealState {
  deals: Deal[];
  currentDeal: Deal | null;
  isLoading: boolean;
  error: string | null;
  
  fetchDeals: (status?: string) => Promise<void>;
  fetchDeal: (id: string) => Promise<void>;
  createDeal: (input: Parameters<typeof api.createDeal>[0]) => Promise<Deal>;
  updateDeal: (deal: Deal) => void;
  clearError: () => void;
}

export const useDealStore = create<DealState>((set) => ({
  deals: [],
  currentDeal: null,
  isLoading: false,
  error: null,

  fetchDeals: async (status?: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.getDeals({ status });
      set({ deals: response.items, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  fetchDeal: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const deal = await api.getDeal(id);
      set({ currentDeal: deal, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  createDeal: async (input) => {
    set({ isLoading: true, error: null });
    try {
      const deal = await api.createDeal(input);
      set((state) => ({
        deals: [deal, ...state.deals],
        isLoading: false,
      }));
      return deal;
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  updateDeal: (deal) => {
    set((state) => ({
      deals: state.deals.map((d) => (d.id === deal.id ? deal : d)),
      currentDeal: state.currentDeal?.id === deal.id ? deal : state.currentDeal,
    }));
  },

  clearError: () => set({ error: null }),
}));

// Wallet Store (persisted to fix balance showing 0 on first load)
interface WalletState {
  balances: UserBalance[];
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;
  
  fetchBalances: (force?: boolean) => Promise<void>;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      balances: [],
      isLoading: false,
      error: null,
      lastFetched: null,

      fetchBalances: async (force = false) => {
        // Skip if already loading
        if (get().isLoading) return;
        
        // Skip if fetched within last 10 seconds (unless forced)
        const lastFetched = get().lastFetched;
        if (!force && lastFetched && Date.now() - lastFetched < 10000) {
          return;
        }
        
        set({ isLoading: true, error: null });
        try {
          const balances = await api.getBalances();
          set({ balances, isLoading: false, lastFetched: Date.now() });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },
    }),
    {
      name: 'fundscrow-wallet',
      partialize: (state) => ({ balances: state.balances, lastFetched: state.lastFetched }),
    }
  )
);

// Stats Store
interface StatsState {
  stats: DealStats | null;
  isLoading: boolean;
  
  fetchStats: () => Promise<void>;
}

export const useStatsStore = create<StatsState>((set) => ({
  stats: null,
  isLoading: false,

  fetchStats: async () => {
    set({ isLoading: true });
    try {
      const stats = await api.getDealStats();
      set({ stats, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },
}));

// UI Store
interface UIState {
  toasts: Array<{ id: string; message: string; type: 'success' | 'error' | 'info' }>;
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  toasts: [],
  
  addToast: (message, type = 'info') => {
    const id = Date.now().toString();
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }],
    }));
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, 3000);
  },
  
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
}));

// Settings Store (persisted)
interface AppSettings {
  notifications: {
    dealUpdates: boolean;
    deposits: boolean;
    withdrawals: boolean;
    security: boolean;
  };
  security: {
    twoFactor: boolean;
    withdrawalConfirmation: boolean;
  };
  display: {
    showBalances: boolean;
    compactMode: boolean;
    theme: 'dark' | 'light';
  };
}

interface SettingsState {
  settings: AppSettings;
  updateNotificationSetting: (key: keyof AppSettings['notifications'], value: boolean) => void;
  updateSecuritySetting: (key: keyof AppSettings['security'], value: boolean) => void;
  updateDisplaySetting: <K extends keyof AppSettings['display']>(key: K, value: AppSettings['display'][K]) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: {
        notifications: {
          dealUpdates: true,
          deposits: true,
          withdrawals: true,
          security: true,
        },
        security: {
          twoFactor: false,
          withdrawalConfirmation: true,
        },
        display: {
          showBalances: true,
          compactMode: false,
          theme: 'dark',
        },
      },

      updateNotificationSetting: (key, value) => {
        set((state) => ({
          settings: {
            ...state.settings,
            notifications: { ...state.settings.notifications, [key]: value },
          },
        }));
      },

      updateSecuritySetting: (key, value) => {
        set((state) => ({
          settings: {
            ...state.settings,
            security: { ...state.settings.security, [key]: value },
          },
        }));
      },

      updateDisplaySetting: (key, value) => {
        set((state) => ({
          settings: {
            ...state.settings,
            display: { ...state.settings.display, [key]: value },
          },
        }));
      },
    }),
    {
      name: 'fundscrow-settings',
    }
  )
);

interface AddressBookState {
  addresses: SavedWallet[];
  addAddress: (wallet: Omit<SavedWallet, 'id'>) => void;
  updateAddress: (id: string, wallet: Partial<Omit<SavedWallet, 'id'>>) => void;
  removeAddress: (id: string) => void;
  getAddress: (id: string) => SavedWallet | undefined;
}

export const useAddressBookStore = create<AddressBookState>()(
  persist(
    (set, get) => ({
      addresses: [],

      addAddress: (wallet) => {
        const id = `wallet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        set((state) => ({
          addresses: [...state.addresses, { ...wallet, id }],
        }));
      },

      updateAddress: (id, wallet) => {
        set((state) => ({
          addresses: state.addresses.map((w) =>
            w.id === id ? { ...w, ...wallet } : w
          ),
        }));
      },

      removeAddress: (id) => {
        set((state) => ({
          addresses: state.addresses.filter((w) => w.id !== id),
        }));
      },

      getAddress: (id) => {
        return get().addresses.find((w) => w.id === id);
      },
    }),
    {
      name: 'fundscrow-address-book',
    }
  )
);
