import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, useDealStore } from '@/store';
import type { Deal, DealStatus } from '@/types';

type RoleFilter = 'all' | 'buyer' | 'seller';
type StatusFilter = 'all' | 'accepted' | 'funded' | 'in_progress' | 'delivered';

const STATUS_FILTERS: { key: StatusFilter; label: string; statuses: DealStatus[] }[] = [
  { key: 'all', label: 'All', statuses: [] },
  { key: 'accepted', label: 'Accepted', statuses: ['created', 'awaiting_deposit'] },
  { key: 'funded', label: 'Funded', statuses: ['funded'] },
  { key: 'in_progress', label: 'In Progress', statuses: ['in_progress'] },
  { key: 'delivered', label: 'Delivered', statuses: ['delivered', 'completed', 'cancelled', 'refunded'] },
];

export function DealsPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { deals, fetchDeals, isLoading } = useDealStore();
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    fetchDeals();
  }, [fetchDeals]);

  const getUserRole = (deal: Deal): 'buyer' | 'seller' | null => {
    if (!user?.id) return null;
    return deal.buyerId === user.id ? 'buyer' : 'seller';
  };

  // Count deals by role
  const buyerCount = deals.filter(d => getUserRole(d) === 'buyer').length;
  const sellerCount = deals.filter(d => getUserRole(d) === 'seller').length;

  // Filter deals
  const filteredDeals = deals.filter((deal) => {
    if (roleFilter !== 'all') {
      const userRole = getUserRole(deal);
      if (userRole !== roleFilter) return false;
    }

    const statusConfig = STATUS_FILTERS.find((t) => t.key === statusFilter);
    if (statusConfig && statusConfig.statuses.length > 0) {
      if (!statusConfig.statuses.includes(deal.status)) return false;
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesNumber = deal.dealNumber.toString().includes(query);
      const matchesDescription = deal.description?.toLowerCase().includes(query);
      const matchesCounterparty =
        deal.buyerUsername?.toLowerCase().includes(query) ||
        deal.sellerUsername?.toLowerCase().includes(query);

      if (!matchesNumber && !matchesDescription && !matchesCounterparty) {
        return false;
      }
    }

    return true;
  });

  const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      created: 'Accepted',
      awaiting_deposit: 'Accepted',
      funded: 'Funded',
      in_progress: 'In Progress',
      delivered: 'Delivered',
      completed: 'Complete',
      disputed: 'Disputed',
      cancelled: 'Cancelled',
      refunded: 'Refunded',
    };
    return labels[status] || status;
  };

  const formatCurrency = (currency: string): string => {
    if (currency.toLowerCase().includes('usdt')) return 'USDT';
    return currency.toUpperCase();
  };

  // const handleClearSearch = () => {
  //   setSearchQuery('');
  // };

  const toggleSearch = () => {
    if (showSearch && searchQuery) {
      setSearchQuery('');
    }
    setShowSearch(!showSearch);
  };

  return (
    <div className="figma-deals">
      {/* Header */}
      <div className="figma-deals-header">
        <h1 className="figma-deals-title">My deals</h1>
      </div>

      {/* Search Input (when active) */}
      {showSearch && (
        <div className="figma-deals-search">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M8.74935 1.66602C12.6614 1.66602 15.8327 4.83733 15.8327 8.74935C15.8327 10.405 15.2627 11.9264 14.3109 13.1325L18.0885 16.9102L18.1455 16.9736C18.4125 17.3009 18.3936 17.7834 18.0885 18.0885C17.7834 18.3936 17.3009 18.4125 16.9736 18.1455L16.9102 18.0885L13.1325 14.3109C11.9264 15.2627 10.405 15.8327 8.74935 15.8327C4.83733 15.8327 1.66602 12.6614 1.66602 8.74935C1.66602 4.83733 4.83733 1.66602 8.74935 1.66602ZM8.74935 3.33268C5.75781 3.33268 3.33268 5.75781 3.33268 8.74935C3.33268 11.7409 5.75781 14.166 8.74935 14.166C11.7409 14.166 14.166 11.7409 14.166 8.74935C14.166 5.75781 11.7409 3.33268 8.74935 3.33268Z"
              fill="white"
              fillOpacity="0.64"
            />
          </svg>
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />

          {/* The button is now always rendered when showSearch is true */}
          <button
            className="figma-deals-search-clear"
            onClick={() => {
              if (searchQuery) {
                setSearchQuery(''); // Clear text if it exists
              } else {
                setShowSearch(false); // Close container if text is empty
              }
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M14.8343 14.8336C11.6125 18.0555 6.3889 18.0555 3.16708 14.8336C-0.0547492 11.6118 -0.0547492 6.38819 3.16708 3.16637C6.3889 -0.0554563 11.6125 -0.0554563 14.8343 3.16637C18.0562 6.38819 18.0562 11.6118 14.8343 14.8336ZM11.6524 11.6517C11.9453 11.3588 11.9453 10.8839 11.6524 10.591L10.0614 9L11.6524 7.40901C11.9453 7.11612 11.9453 6.64124 11.6524 6.34835C11.3595 6.05546 10.8846 6.05546 10.5917 6.34835L9.00071 7.93934L7.40972 6.34835C7.11682 6.05546 6.64195 6.05546 6.34906 6.34835C6.05616 6.64124 6.05616 7.11612 6.34906 7.40901L7.94005 9L6.34906 10.591C6.05616 10.8839 6.05616 11.3588 6.34906 11.6517C6.64195 11.9445 7.11682 11.9445 7.40972 11.6517L9.00071 10.0607L10.5917 11.6517C10.8846 11.9445 11.3595 11.9445 11.6524 11.6517Z"
                fill="white"
                fillOpacity="0.64"
              />
            </svg>
          </button>
        </div>
      )}

      {/* Role Tabs Row with Divider */}
      {!showSearch && filteredDeals.length > 0 && (
        <div className="figma-messages-tabs-container">
          <div className="figma-messages-tabs">
            <button
              className={`figma-messages-tab ${roleFilter === 'all' ? 'figma-messages-tab--active' : ''}`}
              onClick={() => setRoleFilter('all')}
            >
              <span className="All-tab">All</span>
              {/* {roleFilter === 'all' && <span className="figma-deals-role-underline" />} */}
            </button>
            <button
              className={`figma-messages-tab ${roleFilter === 'buyer' ? 'figma-messages-tab--active' : ''}`}
              onClick={() => setRoleFilter('buyer')}
            >
              As buyer {buyerCount > 0 && <span className="figma-messages-tab-badge">{buyerCount}</span>}
              {/* {roleFilter === 'buyer' && <span className="figma-deals-role-underline" />} */}
            </button>
            <button
              className={`figma-messages-tab ${roleFilter === 'seller' ? 'figma-messages-tab--active' : ''}`}
              onClick={() => setRoleFilter('seller')}
            >
              As seller {sellerCount > 0 && <span className="figma-messages-tab-badge">{sellerCount}</span>}
              {/* {roleFilter === 'seller' && <span className="figma-deals-role-underline" />} */}
            </button>
            <button className="figma-deals-search-btn" onClick={toggleSearch}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M8.74935 1.66602C12.6614 1.66602 15.8327 4.83733 15.8327 8.74935C15.8327 10.405 15.2627 11.9264 14.3109 13.1325L18.0885 16.9102L18.1455 16.9736C18.4125 17.3009 18.3936 17.7834 18.0885 18.0885C17.7834 18.3936 17.3009 18.4125 16.9736 18.1455L16.9102 18.0885L13.1325 14.3109C11.9264 15.2627 10.405 15.8327 8.74935 15.8327C4.83733 15.8327 1.66602 12.6614 1.66602 8.74935C1.66602 4.83733 4.83733 1.66602 8.74935 1.66602ZM8.74935 3.33268C5.75781 3.33268 3.33268 5.75781 3.33268 8.74935C3.33268 11.7409 5.75781 14.166 8.74935 14.166C11.7409 14.166 14.166 11.7409 14.166 8.74935C14.166 5.75781 11.7409 3.33268 8.74935 3.33268Z"
                  fill="white"
                  fillOpacity="0.64"
                />
              </svg>
            </button>
          </div>
          <div className="figma-messages-tabs-line" />
        </div>
      )}

      {/* Status Filter Chips */}
      {!showSearch && filteredDeals.length > 0 && (
        <div className="figma-messages-filters">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.key}
              className={`figma-deals-filter ${statusFilter === filter.key ? 'figma-messages-chip--active' : ''}`}
              onClick={() => setStatusFilter(filter.key)}
            >
              {filter.label}
            </button>
          ))}
        </div>
      )}
      {/* Content */}
      {isLoading ? (
        <div className="figma-deals-loading">
          <div className="figma-deals-spinner" />
        </div>
      ) : filteredDeals.length === 0 ? (
        <div className="figma-deals-empty">
          {/* Empty State Illustration - Figma exact */}
          <div className="figma-deals-container">
            {/* The Background Glow */}
            <svg
              className="glow-svg"
              viewBox="0 0 393 611"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g filter="url(#filter0_f_2_18389)">
                <ellipse cx="205.155" cy="305.415" rx="115.733" ry="67.0966" transform="rotate(-15 205.155 305.415)" fill="#3A18DC" />
              </g>
              <defs>
                <filter id="filter0_f_2_18389" x="-141.99" y="0" width="694.291" height="610.83" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                  <feFlood flood-opacity="0" result="BackgroundImageFix" />
                  <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                  <feGaussianBlur stdDeviation="117" result="effect1_foregroundBlur_2_18389" />
                </filter>
              </defs>
            </svg>

            {/* The Foreground Image */}
            <div className="figma-deals-empty-illustration">
              <img src='./images/EmptyDeals.png' alt="Empty Deals" />
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" className='searchsvg' width="72" height="71" viewBox="0 0 72 71" fill="none">
              <path d="M28.2609 55.7017C43.4547 55.7017 55.7717 43.4004 55.7717 28.2259C55.7717 13.0514 43.4547 0.75 28.2609 0.75C13.067 0.75 0.75 13.0514 0.75 28.2259C0.75 43.4004 13.067 55.7017 28.2609 55.7017Z" fill="url(#paint0_linear_2_18402)" stroke="url(#paint1_linear_2_18402)" stroke-width="1.5" />
              <path fill-rule="evenodd" clip-rule="evenodd" d="M23.7844 49.959C25.2232 50.2278 26.687 50.3675 28.1759 50.3781C40.1493 50.3781 49.8557 40.5548 49.8557 28.4371C49.8557 16.3194 40.1493 6.49609 28.1759 6.49609C25.1001 6.49609 22.1739 7.14433 19.5235 8.31317C14.9175 10.3444 11.1442 13.9477 8.86532 18.4534C7.35061 21.4482 6.49609 24.8417 6.49609 28.4371C6.49609 31.6993 7.19954 34.7952 8.4613 37.5779C9.3621 39.5645 10.5475 41.3916 11.9646 43.0056" fill="#19104E" />
              <path d="M23.7844 49.959C25.2232 50.2278 26.687 50.3675 28.1759 50.3781C40.1493 50.3781 49.8557 40.5548 49.8557 28.4371C49.8557 16.3194 40.1493 6.49609 28.1759 6.49609C25.1001 6.49609 22.1739 7.14433 19.5235 8.31317C14.9175 10.3444 11.1442 13.9477 8.86532 18.4534C7.35061 21.4482 6.49609 24.8417 6.49609 28.4371C6.49609 31.6993 7.19954 34.7952 8.4613 37.5779C9.3621 39.5645 10.5475 41.3916 11.9646 43.0056" stroke="url(#paint2_linear_2_18402)" stroke-width="1.5" stroke-linecap="round" />
              <path d="M14.4219 44.9023C16.186 46.3344 18.1789 47.496 20.3375 48.324" stroke="url(#paint3_linear_2_18402)" stroke-width="1.5" stroke-linecap="round" />
              <path d="M50.7207 49.7617L55.648 54.6828" stroke="#6654CE" stroke-width="1.5" />
              <path fill-rule="evenodd" clip-rule="evenodd" d="M54.8513 53.8869C53.297 55.4393 53.297 57.9562 54.8513 59.5085L63.9548 68.6004C65.5091 70.1528 68.0292 70.1528 69.5835 68.6004C71.1378 67.048 71.1378 64.5312 69.5835 62.9788L60.48 53.8869C58.9257 52.3346 56.4056 52.3346 54.8513 53.8869Z" fill="url(#paint4_linear_2_18402)" stroke="url(#paint5_linear_2_18402)" stroke-width="1.5" />
              <path d="M58.9336 55.5039L67.967 64.5258" stroke="#6746FF" stroke-width="1.5" stroke-linecap="round" />
              <path fill-rule="evenodd" clip-rule="evenodd" d="M23.9473 18.5699C23.9473 28.0823 31.6684 35.7936 41.1929 35.7936C43.0639 35.7936 44.8653 35.496 46.5523 34.9457C43.7987 41.7703 37.1053 46.5877 29.2852 46.5877C19.0075 46.5877 10.6758 38.2665 10.6758 28.0019C10.6758 18.7008 17.5168 10.9954 26.4479 9.63086C24.8612 12.2376 23.9473 15.2971 23.9473 18.5699Z" fill="white" fill-opacity="0.05" />
              <path d="M28.5485 12.8535C27.5028 12.8535 26.4811 12.9563 25.4929 13.1522M22.5082 14.0642C16.8903 16.422 12.9453 21.9693 12.9453 28.4368" stroke="#6746FF" stroke-width="1.5" stroke-linecap="round" />
              <defs>
                <linearGradient id="paint0_linear_2_18402" x1="28.2609" y1="-21.2537" x2="33.5236" y2="57.6294" gradientUnits="userSpaceOnUse">
                  <stop offset="0.160779" stop-color="#C2FF0A" />
                  <stop offset="1" stop-color="#3B18DE" />
                </linearGradient>
                <linearGradient id="paint1_linear_2_18402" x1="28.2609" y1="0.75" x2="28.2609" y2="55.7017" gradientUnits="userSpaceOnUse">
                  <stop stop-color="#C2FF0A" />
                  <stop offset="1" stop-color="#4E28FF" />
                </linearGradient>
                <linearGradient id="paint2_linear_2_18402" x1="28.1759" y1="6.49609" x2="28.1759" y2="50.3781" gradientUnits="userSpaceOnUse">
                  <stop stop-color="#C2FF0A" />
                  <stop offset="1" stop-color="#2D00FF" />
                </linearGradient>
                <linearGradient id="paint3_linear_2_18402" x1="14.3334" y1="44.6321" x2="20.8634" y2="48.8113" gradientUnits="userSpaceOnUse">
                  <stop stop-color="#634DD5" />
                  <stop offset="1" stop-color="#502CFB" />
                </linearGradient>
                <linearGradient id="paint4_linear_2_18402" x1="59.2585" y1="43.064" x2="62.393" y2="67.8782" gradientUnits="userSpaceOnUse">
                  <stop stop-color="#C2FF0A" />
                  <stop offset="1" stop-color="#3B18DE" />
                </linearGradient>
                <linearGradient id="paint5_linear_2_18402" x1="58.4749" y1="46.7208" x2="62.2174" y2="69.7647" gradientUnits="userSpaceOnUse">
                  <stop stop-color="#C2FF0A" />
                  <stop offset="1" stop-color="#4E28FF" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="figma-deals-empty-text">
            <h3>No deals yet</h3>
            <p>Start your first deal, we'll keep the funds safe in escrow</p>
          </div>
          <button onClick={() => navigate('/create')}>Start a deal</button>
        </div>
      ) : (
        <div className="figma-deals-list">
          {filteredDeals.map((deal) => {
            const role = getUserRole(deal);
            const counterparty = role === 'buyer' ? deal.sellerUsername : deal.buyerUsername;
            const currency = formatCurrency(deal.currency);

            return (
              <div
                key={deal.id}
                className="figma-deal-card"
                onClick={() => navigate(`/deal/${deal.id}`)}
              >
                {/* Top section: Amount + Badge + Description */}
                <div className="figma-deal-card-top">
                  <div className="figma-deal-card-header">
                    <span className="figma-deal-card-amount">
                      {parseFloat(deal.amount).toLocaleString()} {currency}
                    </span>
                    <span className={`figma-deal-card-badge figma-deal-card-badge--${deal.status}`}>
                      {getStatusLabel(deal.status)}
                    </span>
                  </div>
                  <p className="figma-deal-card-desc">{deal.description || 'No description'}</p>
                </div>

                {/* Divider */}
                <div className="figma-deal-card-divider" />

                {/* Footer */}
                <div className="figma-deal-card-footer">
                  <div className="figma-deal-card-user-row">
                    {/* Avatar with exchange arrows icon */}
                    <div >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="12" fill="#403F4D" />
                        <path d="M13.828 14.8205C14.0801 14.7949 14.2769 14.5819 14.2771 14.323C14.2771 14.064 14.0802 13.8512 13.828 13.8256L13.7768 13.8228L10.1777 13.8228L14.9121 9.08894C15.1074 8.89358 15.1074 8.57683 14.9121 8.38147C14.7167 8.18622 14.3999 8.18615 14.2045 8.38147L9.47086 13.1147L9.47086 9.51729C9.47086 9.24101 9.24691 9.01709 8.97061 9.01709C8.6943 9.01709 8.47036 9.24101 8.47036 9.51729L8.47036 14.0729L8.4745 14.1496C8.51051 14.5026 8.79096 14.7832 9.14404 14.8191L9.22073 14.8232L13.7768 14.8232L13.828 14.8205Z" fill="#BAB9BE" />
                      </svg>
                    </div>
                    {/* User tag with chat icon */}
                    <div className="figma-deal-card-user-tag">
                      <span className="figma-deal-card-username">{counterparty || 'unknown'}</span>
                      <div className="figma-deal-card-chat-icon">
                        {!deal.hasUnreadMessages &&
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 12 12"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            {/* The three dots inside the bubble */}
                            <path
                              d="M6.00166 6H6.00616H6.00166ZM7.99941 6H8.00391H7.99941ZM4.00391 6H4.00839H4.00391Z"
                              fill="white"
                              fillOpacity="0.48"
                            />
                            <path
                              d="M6.00166 6H6.00616M7.99941 6H8.00391M4.00391 6H4.00839"
                              stroke="white"
                              strokeOpacity="0.48"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            {/* The main bubble outline */}
                            <path
                              d="M10.75 6C10.75 8.62335 8.62335 10.75 6 10.75C5.18595 10.75 4.4197 10.5452 3.75 10.1844C2.81589 9.681 2.18731 10.149 1.63296 10.2329C1.54887 10.2457 1.46512 10.2151 1.40498 10.155C1.3137 10.0637 1.29633 9.92255 1.34675 9.8037C1.56433 9.2909 1.7641 8.3191 1.4917 7.5C1.3349 7.0285 1.25 6.52415 1.25 6C1.25 3.37665 3.37665 1.25 6 1.25C8.62335 1.25 10.75 3.37665 10.75 6Z"
                              stroke="white"
                              strokeOpacity="0.48"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        }
                        {/* Notification dot - show if there are unread messages */}
                        {deal.hasUnreadMessages &&
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 14 14"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            {/* Chat Bubble Group moved down by 2px */}
                            <g transform="translate(0,2)">
                              <path
                                d="M6.00166 6H6.00616M7.99941 6H8.00391M4.00391 6H4.00839"
                                stroke="white"
                                strokeOpacity="0.48"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M10.75 6C10.75 8.62335 8.62335 10.75 6 10.75 C5.18595 10.75 4.4197 10.5452 3.75 10.1844 C2.81589 9.681 2.18731 10.149 1.63296 10.2329 C1.54887 10.2457 1.46512 10.2151 1.40498 10.155 C1.3137 10.0637 1.29633 9.92255 1.34675 9.8037 C1.56433 9.2909 1.7641 8.3191 1.4917 7.5 C1.3349 7.0285 1.25 6.52415 1.25 6 C1.25 3.37665 3.37665 1.25 6 1.25 C8.62335 1.25 10.75 3.37665 10.75 6Z"
                                stroke="white"
                                strokeOpacity="0.48"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </g>

                            {/* Notification Dot */}
                            <circle cx="11.5" cy="2.5" r="2" fill="#FF6C5F" />
                          </svg>

                        }
                      </div>
                    </div>
                  </div>
                  <span className="figma-deal-card-number">{deal.dealNumber}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bottom spacing */}
      {/* <div style={{ height: 100 }} /> */}
    </div>
  );
}
