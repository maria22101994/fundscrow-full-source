import { useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect, useCallback } from 'react';
import { api } from '@/services/api';

// Coin icons
const CoinUsdt = ({ size = 32 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <circle cx="16" cy="16" r="16" fill="#26A17B"/>
    <path d="M17.922 17.383v-.002c-.11.008-.677.042-1.942.042-1.01 0-1.721-.03-1.971-.042v.003c-3.888-.171-6.79-.848-6.79-1.658 0-.809 2.902-1.486 6.79-1.66v2.644c.254.018.982.061 1.988.061 1.207 0 1.812-.05 1.925-.06v-2.643c3.88.173 6.775.85 6.775 1.658 0 .81-2.895 1.485-6.775 1.657m0-3.59v-2.366h5.414V7.819H8.595v3.608h5.414v2.365c-4.4.202-7.709 1.074-7.709 2.118 0 1.044 3.309 1.915 7.709 2.118v7.582h3.913v-7.584c4.393-.202 7.694-1.073 7.694-2.116 0-1.043-3.301-1.914-7.694-2.117" fill="#fff"/>
  </svg>
);

const CoinBtc = ({ size = 32 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <circle cx="16" cy="16" r="16" fill="#F7931A"/>
    <path d="M22.5 13.6c.3-2-1.2-3.1-3.3-3.8l.7-2.7-1.7-.4-.7 2.6c-.4-.1-.9-.2-1.4-.3l.7-2.6-1.7-.4-.7 2.7c-.4-.1-.7-.2-1.1-.3v-.1l-2.3-.6-.4 1.8s1.2.3 1.2.3c.7.2.8.6.8 1l-.8 3.2c0 .1.1.1.1.1h-.1l-1.1 4.5c-.1.2-.3.5-.8.4 0 0-1.2-.3-1.2-.3l-.8 1.9 2.2.5c.4.1.8.2 1.2.3l-.7 2.8 1.7.4.7-2.7c.5.1.9.2 1.4.3l-.7 2.7 1.7.4.7-2.8c2.9.5 5.1.3 6-2.3.7-2.1-.1-3.3-1.5-4.1 1.1-.3 1.9-1 2.1-2.5zm-3.8 5.3c-.5 2.1-4.1 1-5.3.7l.9-3.8c1.2.3 4.9.9 4.4 3.1zm.6-5.3c-.5 1.9-3.5.9-4.4.7l.8-3.4c1 .2 4.1.7 3.6 2.7z" fill="#fff"/>
  </svg>
);

const CoinEth = ({ size = 32 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <circle cx="16" cy="16" r="16" fill="#627EEA"/>
    <path d="M16 4v8.87l7.5 3.35L16 4z" fill="#fff" fillOpacity=".6"/>
    <path d="M16 4l-7.5 12.22L16 12.87V4z" fill="#fff"/>
    <path d="M16 21.97v6.03l7.5-10.4-7.5 4.37z" fill="#fff" fillOpacity=".6"/>
    <path d="M16 28v-6.03L8.5 17.6 16 28z" fill="#fff"/>
    <path d="M16 20.57l7.5-4.35L16 12.87v7.7z" fill="#fff" fillOpacity=".2"/>
    <path d="M8.5 16.22l7.5 4.35v-7.7l-7.5 3.35z" fill="#fff" fillOpacity=".6"/>
  </svg>
);

const CoinLtc = ({ size = 32 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <circle cx="16" cy="16" r="16" fill="#345D9D"/>
    <path d="M16.2 7l-1.1 6.9-3.1 1.2.4 1.7 2.6-1-1.8 7.2h11.3l.7-2.8h-7.5l1.2-4.7 3.1-1.2-.4-1.7-2.6 1L20.1 7h-3.9z" fill="#fff"/>
  </svg>
);

// Arrow icons for transaction direction
const ArrowUpRight = () => (
  <svg width="10" height="10" viewBox="-1 -1 13 13" fill="none">
    <path d="M2.5 7.5L7.5 2.5M7.5 2.5H3M7.5 2.5V7" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ArrowDownLeft = () => (
<svg width="10" height="10" viewBox="0 0 13 13" fill="none">
  <path 
    d="M8.5 4.5L4.5 8.5M4.5 8.5H8M4.5 8.5V5" 
    stroke="white" 
    strokeWidth="1" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  />
</svg>
);

const SearchIcon = ({ size = 20 }: { size?: number }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 20 20" 
    fill="none"
  >
    <path 
      fillRule="evenodd" 
      clipRule="evenodd" 
      d="M8.5 0C13.1944 0 17 3.80558 17 8.5C17 10.4868 16.316 12.3125 15.1738 13.7598L19.707 18.293L19.7754 18.3691C20.0957 18.7619 20.0731 19.3409 19.707 19.707C19.3409 20.0731 18.7619 20.0957 18.3691 19.7754L18.293 19.707L13.7598 15.1738C12.3125 16.316 10.4868 17 8.5 17C3.80558 17 0 13.1944 0 8.5C0 3.80558 3.80558 0 8.5 0ZM8.5 2C4.91015 2 2 4.91015 2 8.5C2 12.0899 4.91015 15 8.5 15C12.0899 15 15 12.0899 15 8.5C15 4.91015 12.0899 2 8.5 2Z" 
      fill="currentColor"
    />
  </svg>
);

const FilterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path d="M18 17C18.5523 17 19 17.4477 19 18C19 18.5523 18.5523 19 18 19H6C5.44772 19 5 18.5523 5 18C5 17.4477 5.44772 17 6 17H18Z" fill="white"/>
  <path d="M20.1025 11.0049C20.6067 11.0562 21 11.4823 21 12C21 12.5177 20.6067 12.9438 20.1025 12.9951L20 13H4C3.44772 13 3 12.5523 3 12C3 11.4477 3.44772 11 4 11H20L20.1025 11.0049Z" fill="white"/>
  <path d="M22 5C22.5523 5 23 5.44772 23 6C23 6.55228 22.5523 7 22 7H2C1.44772 7 1 6.55228 1 6C1 5.44772 1.44772 5 2 5H22Z" fill="white"/>
</svg>
);

const BackArrow = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M9.66135 4.72394C10.054 4.40371 10.6331 4.42659 10.9992 4.7923C11.3653 5.1584 11.3879 5.73742 11.0676 6.13019L10.9992 6.20636L6.20529 11.0003H20.0022C20.5545 11.0003 21.0022 11.448 21.0022 12.0003C21.002 12.5524 20.5543 13.0003 20.0022 13.0003H6.20725L10.9992 17.7923C11.3898 18.1828 11.3897 18.8158 10.9992 19.2064C10.6087 19.5969 9.9757 19.5969 9.58518 19.2064L3.43869 13.0599L3.33615 12.9456C2.88807 12.3958 2.88782 11.6028 3.33615 11.053L3.43869 10.9388L9.58518 4.7923L9.66135 4.72394Z" fill="white"/>
  </svg>
);
const CloseIconfilter = ({ size = 20 }: { size?: number }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none"
  >
    <path 
      d="M5.06566 5.06532C5.46028 4.67081 6.08478 4.64673 6.50804 4.99207L6.59007 5.06532L12.0002 10.4755L17.4104 5.06532L17.4924 4.99207C17.9157 4.6467 18.5402 4.6707 18.9348 5.06532C19.3294 5.45994 19.3534 6.08442 19.008 6.5077L18.9348 6.58973L13.5246 11.9999L18.9348 17.41C19.3555 17.8309 19.3556 18.5136 18.9348 18.9345C18.514 19.3553 17.8313 19.3552 17.4104 18.9345L12.0002 13.5243L6.59007 18.9345C6.16924 19.3553 5.48655 19.3552 5.06566 18.9345C4.64478 18.5136 4.64478 17.8309 5.06566 17.41L10.4758 11.9999L5.06566 6.58973L4.99242 6.5077C4.64703 6.0844 4.67104 5.45993 5.06566 5.06532Z" 
      fill="currentColor"
    />
  </svg>
);
const CloseIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="18" 
    height="18" 
    viewBox="0 0 18 18" 
    fill="none"
  >
    <g clipPath="url(#clip0_123_5236)">
      <path 
        fillRule="evenodd" 
        clipRule="evenodd" 
        d="M14.8343 14.8336C11.6125 18.0555 6.3889 18.0555 3.16708 14.8336C-0.0547492 11.6118 -0.0547492 6.38819 3.16708 3.16637C6.3889 -0.0554563 11.6125 -0.0554563 14.8343 3.16637C18.0562 6.38819 18.0562 11.6118 14.8343 14.8336ZM11.6524 11.6517C11.9453 11.3588 11.9453 10.8839 11.6524 10.591L10.0614 9L11.6524 7.40901C11.9453 7.11612 11.9453 6.64124 11.6524 6.34835C11.3595 6.05546 10.8846 6.05546 10.5917 6.34835L9.00071 7.93934L7.40972 6.34835C7.11682 6.05546 6.64195 6.05546 6.34906 6.34835C6.05616 6.64124 6.05616 7.11612 6.34906 7.40901L7.94005 9L6.34906 10.591C6.05616 10.8839 6.05616 11.3588 6.34906 11.6517C6.64195 11.9445 7.11682 11.9445 7.40972 11.6517L9.00071 10.0607L10.5917 11.6517C10.8846 11.9445 11.3595 11.9445 11.6524 11.6517Z" 
        fill="white" 
        fillOpacity="0.64"
      />
    </g>
    <defs>
      <clipPath id="clip0_123_5236">
        <rect width="18" height="18" fill="white"/>
      </clipPath>
    </defs>
  </svg>
);

const CalendarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M6.667 1.667v2.5M13.333 1.667v2.5M2.917 7.575h14.166M17.5 7.083v7.084c0 2.5-1.25 4.166-4.167 4.166H6.667c-2.917 0-4.167-1.666-4.167-4.166V7.083c0-2.5 1.25-4.166 4.167-4.166h6.666c2.917 0 4.167 1.666 4.167 4.166z" stroke="#8F8C9C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M13.079 11.417h.008M13.079 14.083h.008M9.996 11.417h.008M9.996 14.083h.008M6.912 11.417h.008M6.912 14.083h.008" stroke="#8F8C9C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Checkbox icons (Figma: 20x20)
const CheckboxChecked = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <rect width="20" height="20" rx="6" fill="#BFED33"/>
    <path d="M6 10L9 13L14 7" stroke="#0e0d1f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CheckboxUnchecked = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <rect x="1" y="1" width="18" height="18" rx="5" stroke="rgba(255,255,255,0.32)" strokeWidth="2" fill="none"/>
  </svg>
);

interface Transaction {
  id: string;
  type: 'sent' | 'received' | 'deposit' | 'deal_credit';
  currency: string;
  amount: number;
  address?: string;
  deal_id?: number;
  timestamp: string;
  date: string;
}

interface FilterState {
  categories: {
    sent: boolean;
    received: boolean;
  };
  assets: {
    usdt: boolean;
    btc: boolean;
    eth: boolean;
    ltc: boolean;
  };
  dateRange: {
    start: string;
    end: string;
  };
}

// Helper to format a date string into relative time
function formatRelativeTimestamp(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatDateGroup(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const getCoinIcon = (currency: string, size = 32) => {
  const curr = currency.toLowerCase();
  if (curr.includes('usdt')) return <CoinUsdt size={size} />;
  if (curr.includes('btc')) return <CoinBtc size={size} />;
  if (curr.includes('eth')) return <CoinEth size={size} />;
  if (curr.includes('ltc')) return <CoinLtc size={size} />;
  return <CoinUsdt size={size} />;
};

const formatCurrency = (currency: string): string => {
  const curr = currency.toLowerCase();
  if (curr.includes('usdt')) return 'USDT';
  if (curr.includes('btc')) return 'BTC';
  if (curr.includes('eth')) return 'ETH';
  if (curr.includes('ltc')) return 'LTC';
  return currency.toUpperCase();
};

const formatAmount = (amount: number, currency: string): string => {
  const curr = currency.toLowerCase();
  if (curr.includes('btc') || curr.includes('eth') || curr.includes('ltc')) {
    return amount.toString().replace('.', ',');
  }
  return amount.toLocaleString('en-US');
};

const defaultFilters: FilterState = {
  categories: { sent: true, received: true },
  assets: { usdt: true, btc: true, eth: true, ltc: true },
  dateRange: { start: '', end: '' }
};

export function ActivityPage() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [txLoading, setTxLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [tempFilters, setTempFilters] = useState<FilterState>(defaultFilters);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus input when search mode is activated
  useEffect(() => {
    if (isSearching && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearching]);

  // Fetch real transactions from API
  const fetchTransactions = useCallback(async () => {
    setTxLoading(true);
    try {
      const params: Record<string, string | number> = { pageSize: 50 };
      if (filters.dateRange.start) params.startDate = filters.dateRange.start;
      if (filters.dateRange.end) params.endDate = filters.dateRange.end;
      if (searchQuery) params.search = searchQuery;

      const result = await api.getTransactions(params as Parameters<typeof api.getTransactions>[0]);
      const mapped: Transaction[] = (result.items || []).map((item: unknown) => {
        const rec = item as Record<string, unknown>;
        const txType = (rec.txType as string) || (rec.type as string) || 'received';
        let type: Transaction['type'] = 'received';
        if (txType === 'sent' || txType === 'withdrawal') type = 'sent';
        else if (txType === 'deposit') type = 'deposit';
        else if (txType === 'deal_credit') type = 'deal_credit';

        const createdAt = (rec.createdAt as string) || new Date().toISOString();
        return {
          id: (rec.id as string) || String(Math.random()),
          type,
          currency: (rec.currency as string) || 'USDT',
          amount: parseFloat((rec.amount as string) || '0'),
          address: rec.address as string | undefined,
          deal_id: rec.dealId as number | undefined,
          timestamp: formatRelativeTimestamp(createdAt),
          date: formatDateGroup(createdAt),
        };
      });
      setTransactions(mapped);
    } catch {
      setTransactions([]);
    } finally {
      setTxLoading(false);
    }
  }, [filters.dateRange.start, filters.dateRange.end, searchQuery]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Filter transactions based on search query and filters
  const filteredTransactions = transactions.filter(tx => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const label = tx.type === 'deal_credit' ? `#${tx.deal_id}` : tx.address || '';
      const matchesSearch = (
        tx.currency.toLowerCase().includes(query) ||
        tx.type.toLowerCase().includes(query) ||
        label.toLowerCase().includes(query) ||
        tx.amount.toString().includes(query)
      );
      if (!matchesSearch) return false;
    }

    // Category filter
    const isSent = tx.type === 'sent';
    const isReceived = tx.type !== 'sent';
    if (isSent && !filters.categories.sent) return false;
    if (isReceived && !filters.categories.received) return false;

    // Asset filter
    const curr = tx.currency.toLowerCase();
    if (curr.includes('usdt') && !filters.assets.usdt) return false;
    if (curr.includes('btc') && !filters.assets.btc) return false;
    if (curr.includes('eth') && !filters.assets.eth) return false;
    if (curr.includes('ltc') && !filters.assets.ltc) return false;

    return true;
  });

  // Group transactions by date
  const groupedTransactions = filteredTransactions.reduce((groups, tx) => {
    const date = tx.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(tx);
    return groups;
  }, {} as Record<string, Transaction[]>);

  const isOutgoing = (type: string) => type === 'sent';

  const getTransactionLabel = (tx: Transaction) => {
    switch (tx.type) {
      case 'sent':
        return { prefix: 'Sent to', value: tx.address || '' };
      case 'deal_credit':
        return { prefix: 'From deal', value: `#${tx.deal_id}` };
      case 'deposit':
        return { prefix: 'Deposit from', value: tx.address || '' };
      case 'received':
        return { prefix: 'Received from', value: tx.address || '' };
      default:
        return { prefix: 'Transaction', value: '' };
    }
  };

  const handleSearchClick = () => {
    setIsSearching(true);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handleCloseSearch = () => {
    setIsSearching(false);
    setSearchQuery('');
  };

  const handleOpenFilters = () => {
    setTempFilters({ ...filters });
    setShowFilters(true);
  };

  const handleCloseFilters = () => {
    setShowFilters(false);
  };

  const handleResetFilters = () => {
    setTempFilters(defaultFilters);
  };

  const handleApplyFilters = () => {
    setFilters(tempFilters);
    setShowFilters(false);
  };

  const toggleCategory = (category: 'sent' | 'received') => {
    setTempFilters(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [category]: !prev.categories[category]
      }
    }));
  };

  const toggleAsset = (asset: 'usdt' | 'btc' | 'eth' | 'ltc') => {
    setTempFilters(prev => ({
      ...prev,
      assets: {
        ...prev.assets,
        [asset]: !prev.assets[asset]
      }
    }));
  };

  return (
    <div className="figma-activity">
      {/* Background gradients */}
      {/* <div className="figma-home-v3-bg-1" /> */}
      <div className="figma-home-v3-bg-2" />

      {/* Header - Normal mode */}
      {!isSearching && (
        <div className="figma-activity-header">
          <button className="figma-activity-back" onClick={() => navigate(-1)}>
            <BackArrow />
          </button>
          <span className="figma-activity-title">Activity</span>
          <div className="figma-activity-header-actions">
            <button className="figma-activity-icon-btn" onClick={handleSearchClick}>
              <SearchIcon />
            </button>
            <button className="figma-activity-icon-btn" onClick={handleOpenFilters}>
              <FilterIcon />
            </button>
          </div>
        </div>
      )}

      {/* Search bar - Search mode */}
      {isSearching && (
        <div className="figma-activity-search-header">
          <div className="figma-activity-search-bar">
            <div className="figma-activity-search-icon">
              <SearchIcon size={18} />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              className="figma-activity-search-input"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="figma-activity-search-clear" onClick={searchQuery ? handleClearSearch : handleCloseSearch}>
              <CloseIcon />
            </button>
          </div>
          <button className="figma-activity-icon-btn" onClick={handleOpenFilters}>
            <FilterIcon />
          </button>
        </div>
      )}

      {/* Transaction list */}
      <div className="figma-activity-content">
        {Object.entries(groupedTransactions).map(([date, txs]) => (
          <div key={date} className="figma-activity-section">
            <h3 className="figma-activity-date">{date}</h3>
            <div className="figma-activity-list">
              {txs.map((tx) => {
                const label = getTransactionLabel(tx);
                const outgoing = isOutgoing(tx.type);
                return (
                  <div key={tx.id} className="figma-activity-item">
                    <div className="figma-activity-item-left">
                      <div className="figma-activity-coin">
                        {getCoinIcon(tx.currency)}
                        <div className="figma-activity-direction">
                          {outgoing ? <ArrowUpRight /> : <ArrowDownLeft />}
                        </div>
                      </div>
                      <div className="figma-activity-info">
                        <div className="figma-activity-label">
                          <span className="figma-activity-prefix">{label.prefix}</span>
                          <span className="figma-activity-value">{label.value}</span>
                        </div>
                        <span className="figma-activity-time">{tx.timestamp}</span>
                      </div>
                    </div>
                    <span className={`figma-activity-amount ${outgoing ? 'outgoing' : 'incoming'}`}>
                      {outgoing ? '- ' : '+ '}{formatAmount(tx.amount, tx.currency)} {formatCurrency(tx.currency)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Loading */}
        {txLoading && (
          <div className="figma-activity-empty">
            <p>Loading transactions...</p>
          </div>
        )}

        {/* No results message */}
        {!txLoading && Object.keys(groupedTransactions).length === 0 && (
          <div className="figma-activity-empty">
            <p>{searchQuery ? `No transactions found for "${searchQuery}"` : transactions.length === 0 ? 'No transactions yet' : 'No transactions match the selected filters'}</p>
          </div>
        )}
      </div>

      {/* Filters Modal */}
      {showFilters && (
        <>
          <div className="figma-filters-overlay" onClick={handleCloseFilters} />
          <div className="figma-filters-modal">
            {/* Modal Header */}
            <div className="figma-filters-header">
              <button className="figma-filters-close" onClick={handleCloseFilters}>
                <CloseIconfilter size={24} />
              </button>
              <span className="figma-filters-title">Filters</span>
              <button className="figma-filters-reset" onClick={handleResetFilters}>
                Reset
              </button>
            </div>

            {/* Filters Content */}
            <div className="figma-filters-content">
              {/* Category Section */}
              <div className="figma-filters-section">
                <span className="figma-filters-section-title">Category</span>
                <div className="figma-filters-options">
                  <button className="figma-filters-option" onClick={() => toggleCategory('sent')}>
                    <span className="figma-filters-option-label">Sent</span>
                    {tempFilters.categories.sent ? <CheckboxChecked /> : <CheckboxUnchecked />}
                  </button>
                  <button className="figma-filters-option" onClick={() => toggleCategory('received')}>
                    <span className="figma-filters-option-label">Received</span>
                    {tempFilters.categories.received ? <CheckboxChecked /> : <CheckboxUnchecked />}
                  </button>
                </div>
              </div>

              {/* Assets Section */}
              <div className="figma-filters-section">
                <span className="figma-filters-section-title">Assets</span>
                <div className="figma-filters-options">
                  <button className="figma-filters-option" onClick={() => toggleAsset('usdt')}>
                    <div className="figma-filters-asset">
                      <CoinUsdt size={24} />
                      <span className="figma-filters-option-label">USDT</span>
                    </div>
                    {tempFilters.assets.usdt ? <CheckboxChecked /> : <CheckboxUnchecked />}
                  </button>
                  <button className="figma-filters-option" onClick={() => toggleAsset('btc')}>
                    <div className="figma-filters-asset">
                      <CoinBtc size={24} />
                      <span className="figma-filters-option-label">BTC</span>
                    </div>
                    {tempFilters.assets.btc ? <CheckboxChecked /> : <CheckboxUnchecked />}
                  </button>
                  <button className="figma-filters-option" onClick={() => toggleAsset('eth')}>
                    <div className="figma-filters-asset">
                      <CoinEth size={24} />
                      <span className="figma-filters-option-label">ETH</span>
                    </div>
                    {tempFilters.assets.eth ? <CheckboxChecked /> : <CheckboxUnchecked />}
                  </button>
                  <button className="figma-filters-option" onClick={() => toggleAsset('ltc')}>
                    <div className="figma-filters-asset">
                      <CoinLtc size={24} />
                      <span className="figma-filters-option-label">LTC</span>
                    </div>
                    {tempFilters.assets.ltc ? <CheckboxChecked /> : <CheckboxUnchecked />}
                  </button>
                </div>
              </div>

              {/* Date Range Section */}
              <div className="figma-filters-section">
                <span className="figma-filters-section-title">Date range</span>
                <div className="figma-filters-date-range">
                  <label className="figma-filters-date-input">
                    <input
                      type="date"
                      className="figma-filters-date-native"
                      value={tempFilters.dateRange.start}
                      onChange={(e) => setTempFilters(prev => ({
                        ...prev,
                        dateRange: { ...prev.dateRange, start: e.target.value }
                      }))}
                    />
                    <span className={`figma-filters-date-placeholder ${tempFilters.dateRange.start ? 'has-value' : ''}`}>
                      {tempFilters.dateRange.start || 'Start date'}
                    </span>
                    <CalendarIcon />
                  </label>
                  <span className="figma-filters-date-separator">-</span>
                  <label className="figma-filters-date-input">
                    <input
                      type="date"
                      className="figma-filters-date-native"
                      value={tempFilters.dateRange.end}
                      onChange={(e) => setTempFilters(prev => ({
                        ...prev,
                        dateRange: { ...prev.dateRange, end: e.target.value }
                      }))}
                    />
                    <span className={`figma-filters-date-placeholder ${tempFilters.dateRange.end ? 'has-value' : ''}`}>
                      {tempFilters.dateRange.end || 'End date'}
                    </span>
                    <CalendarIcon />
                  </label>
                </div>
              </div>
            </div>

            {/* Apply Button */}
            <div className="figma-filters-footer">
              <button className="figma-filters-apply" onClick={handleApplyFilters}>
                Apply
              </button>
            </div>

            {/* Home Indicator */}
            <div className="figma-filters-home-indicator">
              <div className="figma-filters-home-indicator-bar" />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
