import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, useDealStore } from '@/store';

type RoleFilter = 'all' | 'buyer' | 'seller';
type TypeFilter = 'all' | 'deals' | 'disputes' | 'support';

interface ChatPreview {
  dealId: string;
  dealNumber: number;
  counterpartyUsername: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isRead: boolean;
  type: 'deal' | 'dispute' | 'support';
  role: 'buyer' | 'seller';
}

export function MessagesPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { deals, fetchDeals } = useDealStore();
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [chatPreviews, setChatPreviews] = useState<ChatPreview[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDeals().finally(() => setIsLoading(false));
  }, [fetchDeals]);

  useEffect(() => {
    const activeDeals = deals.filter(d =>
      ['funded', 'delivered', 'disputed', 'awaiting_deposit', 'created'].includes(d.status)
    );

    const previews: ChatPreview[] = activeDeals.map((deal) => {
      const isBuyer = deal.buyerId === user?.id;
      const msgTime = deal.lastMessageAt || deal.updatedAt || deal.createdAt;
      return {
        dealId: deal.id,
        dealNumber: deal.dealNumber,
        counterpartyUsername: isBuyer ? (deal.sellerUsername || 'seller') : (deal.buyerUsername || 'buyer'),
        lastMessage: deal.lastMessage || 'No messages yet',
        lastMessageTime: new Date(msgTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        unreadCount: 0,
        isRead: !deal.hasUnreadMessages,
        type: deal.status === 'disputed' ? 'dispute' : 'deal',
        role: isBuyer ? 'buyer' : 'seller',
      };
    });

    setChatPreviews(previews);
  }, [deals, user?.id]);

  // Count unread messages by role (for badge)
  const unreadBuyerCount = chatPreviews.filter(c => c.role === 'buyer' && c.unreadCount > 0).length;

  // Filter chats
  const filteredChats = chatPreviews.filter(chat => {
    if (roleFilter === 'buyer' && chat.role !== 'buyer') return false;
    if (roleFilter === 'seller' && chat.role !== 'seller') return false;
    if (typeFilter === 'deals' && chat.type !== 'deal') return false;
    if (typeFilter === 'disputes' && chat.type !== 'dispute') return false;
    if (typeFilter === 'support' && chat.type !== 'support') return false;
    return true;
  });

  if (isLoading) {
    return (
      <div className="figma-messages">
        <h1 className="figma-messages-title-inbox">Messages</h1>
        <div className="figma-messages-loading">
          <div className="figma-messages-spinner" />
        </div>
      </div>
    );
  }

  // Show empty state if no chats at all
  if (chatPreviews.length === 0) {
    return (
      <div className="figma-messages figma-messages--empty">
        <h1 className="figma-messages-title-inbox">Messages</h1>

        {/* Empty State Illustration */}
        <div className="figma-messages-empty-state">
          <div className="figma-messages-empty-illustration">
            <img src='./images/EmptyState.png' />
          </div>

          <h2 className="figma-messages-empty-title">No messages yet</h2>
          <p className="figma-messages-empty-text">
            Your deal chats will appear here as soon as you start one
          </p>
          <button
            className="figma-messages-empty-btn"
            onClick={() => navigate('/create')}
          >
            Start a deal
          </button>
        </div>

        <div style={{ height: 100 }} />
      </div>
    );
  }

  return (
    <div className="figma-messages">
      {/* Title */}
      <h1 className="figma-messages-title-inbox">Messages</h1>

      {/* Role Tabs with underline style */}
      <div className="figma-messages-tabs-container">
        <div className="figma-messages-tabs">
          <button
            className={`figma-messages-tab ${roleFilter === 'all' ? 'figma-messages-tab--active' : ''}`}
            onClick={() => setRoleFilter('all')}
          >
            <span className="All-tab">All</span>
          </button>
          <button
            className={`figma-messages-tab ${roleFilter === 'buyer' ? 'figma-messages-tab--active' : ''}`}
            onClick={() => setRoleFilter('buyer')}
          >
            As buyer
            {unreadBuyerCount > 0 && (
              <span className="figma-messages-tab-badge">{unreadBuyerCount}</span>
            )} 
          </button>
          <button
            className={`figma-messages-tab ${roleFilter === 'seller' ? 'figma-messages-tab--active' : ''}`}
            onClick={() => setRoleFilter('seller')}
          >
            As seller
          </button>
          <button className="figma-messages-search-btn">
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

      {/* Type Filter Chips */}
      <div className="figma-messages-filters">
        <button
          className={`figma-messages-chip ${typeFilter === 'all' ? 'figma-messages-chip--active' : ''}`}
          onClick={() => setTypeFilter('all')}
        >
          All
        </button>
        <button
          className={`figma-messages-chip ${typeFilter === 'deals' ? 'figma-messages-chip--active' : ''}`}
          onClick={() => setTypeFilter('deals')}
        >
          Deals
        </button>
        <button
          className={`figma-messages-chip ${typeFilter === 'disputes' ? 'figma-messages-chip--active' : ''}`}
          onClick={() => setTypeFilter('disputes')}
        >
          Disputes
        </button>
        <button
          className={`figma-messages-chip ${typeFilter === 'support' ? 'figma-messages-chip--active' : ''}`}
          onClick={() => setTypeFilter('support')}
        >
          Support
        </button>
      </div>

      {/* Chat List */}
      <div className="figma-messages-list">
        {filteredChats.length === 0 ? (
          <div className="figma-messages-no-results">
            <p>No messages in this category</p>
          </div>
        ) : (
          filteredChats.map((chat, index) => (
            <div key={chat.dealId}>
              <div
                className="figma-messages-item"
                onClick={() => navigate(`/deals/${chat.dealId}/chat`)}
              >
                <div className="figma-messages-item-content">
                  <div className="figma-messages-item-header">
                    <span className="figma-messages-item-user">@{chat.counterpartyUsername}</span>
                    <span className="figma-messages-item-dot">•</span>
                    <span className="figma-messages-item-deal">Deal #{chat.dealNumber}</span>
                  </div>
                  <p className="figma-messages-item-preview">{chat.lastMessage}</p>
                </div>
                <div className="figma-messages-item-meta">
                  <div className="figma-messages-item-time-row">
                    {chat.isRead && chat.unreadCount === 0 && (
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M1.45703 8.06877L3.4987 10.2077L4.09604 9.58188M9.6237 3.79102L6.08695 7.49617" stroke="#BFED33" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round" />
                        <path d="M4.375 8.06877L6.41667 10.2077L12.5417 3.79102" stroke="#BFED33" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round" />
                      </svg>
                    )}
                    <span className="figma-messages-item-time">{chat.lastMessageTime}</span>
                  </div>
                  {chat.unreadCount > 0 && (
                    <div className="figma-messages-tab-badge">{chat.unreadCount}</div>
                   )} 
                </div>
              </div>
              {index < filteredChats.length - 1 && (
                <div className="figma-messages-item-divider" />
              )}
            </div>
          ))
        )}
      </div>

      {/* Bottom spacing */}
      <div style={{ height: 100 }} />
    </div>
  );
}
