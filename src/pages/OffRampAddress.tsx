import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SavedWallet } from '@/types';

// Extend the interface locally to match your global SavedWallet requirements
interface OffRampWallet extends SavedWallet {
  type?: 'onchain' | 'offramp';
}

interface OffRampAddressesProps {
  isOpen?: boolean;
  onClose?: () => void;
  onAddAddress?: () => void;
}

// Dummy Data with the missing 'network' property added
const DUMMY_OFFRAMP_DATA: OffRampWallet[] = [
  {
    id: '1',
    label: 'Fiat off ramp card',
    currency: 'USDT',
    network: 'TRC20',
    address: 'T9yD9szE298623490861234',
    type: 'offramp',
  },
  {
    id: '2',
    label: 'My wallet',
    currency: 'USDT',
    network: 'ERC20',
    address: '0x789012345678901234567890',
    type: 'offramp',
  },
  {
    id: '3',
    label: 'Personal wallet',
    currency: 'BTC',
    network: 'Bitcoin',
    address: 'bc1qxyz1234567890',
    type: 'offramp',
  },
  {
    id: '4',
    label: 'New wallet',
    currency: 'ETH',
    network: 'Ethereum',
    address: '0xabcdef1234567890',
    type: 'offramp',
  }
];

// Magnifying glass illustration
const SearchIllustration = () => (
  <div className="figma-nokyc-illustration-image-container">
    <div className="figma-deals-container">
      <svg className="glow-svg" viewBox="0 0 393 611" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g filter="url(#filter0_f_2_18389)">
          <ellipse cx="205.155" cy="325.415" rx="115.733" ry="67.0966" transform="rotate(-15 205.155 325.415)" fill="#3A18DC" fillOpacity="0.3" />
        </g>
        <defs>
          <filter id="filter0_f_2_18389" x="-141.99" y="0" width="694.291" height="610.83" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feGaussianBlur stdDeviation="117" result="effect1_foregroundBlur_2_18389" />
          </filter>
        </defs>
      </svg>
      <img src="./images/emptyoff.png" alt="Empty" className="figma-nokyc-main-img" />
    </div>
  </div>
);

const CURRENCY_ICONS: Record<string, React.ReactNode> = {
  USDT: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="16" fill="#26A17B" />
      <path d="M17.922 17.383v-.002c-.11.008-.677.042-1.942.042-1.01 0-1.721-.03-1.971-.042v.003c-3.888-.171-6.79-.848-6.79-1.658 0-.809 2.902-1.486 6.79-1.66v2.644c.254.018.982.061 1.988.061 1.207 0 1.812-.05 1.926-.06v-2.643c3.88.173 6.775.85 6.775 1.658 0 .81-2.895 1.485-6.775 1.658zm0-3.59v-2.366h5.414V8.616H8.595v2.811h5.414v2.364c-4.4.202-7.709 1.074-7.709 2.118 0 1.044 3.309 1.915 7.709 2.118v7.582h3.913v-7.584c4.393-.202 7.694-1.073 7.694-2.116 0-1.043-3.301-1.914-7.694-2.117z" fill="white" />
    </svg>
  ),
  BTC: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="16" fill="#F7931A" />
      <path d="M22.5 13.56c.313-2.088-1.28-3.212-3.456-3.962l.706-2.83-1.723-.43-.688 2.757c-.453-.113-.918-.22-1.382-.326l.692-2.773-1.722-.43-.707 2.83c-.375-.086-.743-.17-1.1-.259l.002-.01-2.376-.593-.459 1.84s1.28.293 1.252.312c.698.174.824.636.803 1.002l-.804 3.228c.048.012.11.03.179.057l-.182-.045-1.127 4.52c-.086.212-.302.53-.79.408.017.025-1.253-.313-1.253-.313l-.856 1.973 2.243.56c.417.104.826.214 1.229.316l-.715 2.872 1.722.43.707-2.835c.47.128.927.245 1.374.357l-.705 2.822 1.723.43.715-2.866c2.948.558 5.164.333 6.098-2.334.752-2.147-.037-3.385-1.588-4.193 1.13-.26 1.98-1.003 2.208-2.538zm-3.95 5.538c-.535 2.147-4.152.986-5.326.695l.95-3.81c1.174.293 4.93.874 4.376 3.115zm.535-5.569c-.488 1.953-3.496.96-4.47.717l.862-3.453c.974.243 4.11.696 3.608 2.736z" fill="white" />
    </svg>
  ),
  ETH: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="16" fill="#627EEA" />
      <path d="M16.498 4v8.87l7.497 3.35L16.498 4z" fill="white" fillOpacity="0.6" />
      <path d="M16.498 4L9 16.22l7.498-3.35V4z" fill="white" />
      <path d="M16.498 21.968v6.027l7.502-10.376-7.502 4.349z" fill="white" fillOpacity="0.6" />
      <path d="M16.498 27.995v-6.028L9 17.62l7.498 10.376z" fill="white" />
      <path d="M16.498 20.573l7.497-4.353-7.497-3.348v7.701z" fill="white" fillOpacity="0.2" />
      <path d="M9 16.22l7.498 4.353v-7.701L9 16.22z" fill="white" fillOpacity="0.6" />
    </svg>
  ),
};

export function OffRampAddress({ 
  isOpen = true, 
  onClose}: OffRampAddressesProps) {
  const navigate = useNavigate();
  
  const offRampWallets = DUMMY_OFFRAMP_DATA; 
  const hasData = offRampWallets.length > 0;
  const [selectedId, setSelectedId] = useState<string | null>(hasData ? offRampWallets[0].id : null);

  const handleClose = () => onClose ? onClose() : navigate(-1);

const handleDone = () => {
  const selectedWallet = offRampWallets.find(w => w.id === selectedId);
  
  if (selectedWallet) {
    // 1. Navigate to the ID-specific route
    // This makes id !== 'new', so those extra fields won't show!
    navigate(`/crypto-offramp/${selectedWallet.id}`, { 
      state: { 
        wallet: {
          label: selectedWallet.label,
          address: selectedWallet.address,
          currency: selectedWallet.currency,
          network: selectedWallet.network
        } 
      } 
    });
  }
};

  if (!isOpen) return null;

  return (
    <div className="figma-nokyc-detail-overlay" onClick={handleClose}>
      <div 
        className="figma-nokyc-detail-modal-offramp" 
        onClick={(e) => e.stopPropagation()}
        style={{ display: 'flex', flexDirection: 'column', height: '90%' }}
      >
        
        {/* Header Section */}
        <div className="figma-offramp-header">
          <button className="figma-settings-back" onClick={handleClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
               <path d="M18 6L6 18M6 6L18 18" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          <h1 className="figma-settings-title">Off ramp addresses</h1>
          {hasData && (
            <button 
  className="figma-header-add-new-text" 
  onClick={() => navigate('/crypto-offramp/new', { 
    state: { 
      wallet: { network: 'trc20', currency: 'USDT' } 
    } 
  })}
>
  Add new
</button>
          )}
        </div>

        {/* Scrollable Content Area */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {!hasData ? (
            <div className="figma-empty-state-wrapper">
              <div className="figma-illustration-container">
                <SearchIllustration />
              </div>
              <div className="figma-nokyc-detail-header" style={{ marginTop: '32px' }}>
                <h2 className="figma-nokyc-detail-title">Add new off-ramp address</h2>
                <p className="figma-nokyc-detail-subtitle">
                  Keep provided withdrawal details here to use them anytime
                </p>
              </div>
              <div className="figma-nokyc-detail-buttons">
                <button 
                  className="figma-nokyc-detail-btn figma-nokyc-detail-btn--primary"
                  style={{ backgroundColor: '#BFED33', color: '#000', width: '100%' }}
                  onClick={() => navigate('/off-ramp/new')}
                >
                  <span style={{ fontWeight: '600' }}>Add address</span>
                </button>
              </div>
            </div>
            
          ) : (
            <div className="figma-addressbook-list">
              {offRampWallets.map((wallet) => (
                <div
                  key={wallet.id}
                  className={`figma-addressbook-item ${selectedId === wallet.id ? 'active' : ''}`}
                  onClick={() => setSelectedId(wallet.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="figma-addressbook-item-icon">
                    {CURRENCY_ICONS[wallet.currency] || CURRENCY_ICONS['USDT']}
                  </div>
                  <div className="figma-addressbook-item-info">
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span className="figma-addressbook-item-label">{wallet.label}</span>
                      <span className="figma-addressbook-item-currency">{wallet.currency}</span>
                    </div>
                  </div>

                  {/* Radio UI matching your style */}
                  <div className={`figma-radio-circle ${selectedId === wallet.id ? 'active' : ''}`}>
                    {selectedId === wallet.id && <div className="figma-radio-dot checked" />}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* The Sticky Footer */}
        {hasData && (
          <div className="figma-offramp-footer">
            <button 
              className="figma-deposit-share-btn active" 
              style={{ width: '100%' }}
              onClick={handleDone}
            >
              Done
            </button>
            <div className="figma-deposit-home-indicator">
              <div className="figma-deposit-home-indicator-bar" />
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
}