import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAddressBookStore, useUIStore } from '@/store';
import type { Currency } from '@/types';

interface WalletData {
  label: string;
  address: string;
  network: string;
  currency: Currency;
}

// Network icons matching Figma exactly
const TronIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="12" fill="#EB0029" />
    <path d="M17.3 7.5L12 17.4l-5.3-9.9h10.6z" fill="white" />
    <path d="M12 5.4L6.7 7.5 12 17.4V5.4z" fill="white" fillOpacity="0.6" />
  </svg>
);

const EthIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="12" fill="#627EEA" />
    <path d="M12.37 3v6.65l5.62 2.51L12.37 3z" fill="white" fillOpacity="0.6" />
    <path d="M12.37 3L6.75 12.16l5.62-2.51V3z" fill="white" />
    <path d="M12.37 16.48v4.52l5.63-7.78-5.63 3.26z" fill="white" fillOpacity="0.6" />
    <path d="M12.37 21v-4.52L6.75 13.22 12.37 21z" fill="white" />
  </svg>
);

const BtcIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="12" fill="#F7931A" />
    <path d="M16.5 10.17c.24-1.57-.96-2.41-2.59-2.97l.53-2.12-1.29-.32-.52 2.07c-.34-.09-.69-.17-1.04-.24l.52-2.08-1.29-.32-.53 2.12c-.28-.06-.56-.13-.82-.19l-1.78-.45-.34 1.38s.96.22.94.23c.52.13.62.48.6.75l-.6 2.42c.04.01.08.02.13.04l-.13-.03-.85 3.39c-.06.16-.23.4-.59.31.01.02-.94-.24-.94-.24l-.64 1.48 1.68.42c.31.08.62.16.92.24l-.53 2.15 1.29.32.53-2.13c.35.1.69.18 1.03.27l-.53 2.11 1.29.32.53-2.15c2.21.42 3.87.25 4.57-1.75.56-1.61-.03-2.54-1.19-3.14.85-.2 1.49-.75 1.66-1.9zm-2.96 4.16c-.4 1.61-3.11.74-3.99.52l.71-2.86c.88.22 3.7.66 3.28 2.34zm.4-4.18c-.36 1.46-2.62.72-3.35.54l.65-2.59c.73.18 3.08.52 2.7 2.05z" fill="white" />
  </svg>
);

const NETWORKS = [
  { id: 'trc20', name: 'Tron (TRC20)', icon: 'tron', currency: 'USDT' as Currency },
  { id: 'erc20', name: 'Ethereum (ERC20)', icon: 'ethereum', currency: 'ETH' as Currency },
  { id: 'bitcoin', name: 'Bitcoin', icon: 'bitcoin', currency: 'BTC' as Currency },
  { id: 'bep20', name: 'BSC (BEP20)', icon: 'ethereum', currency: 'USDT' as Currency },
];

const NetworkIcon = ({ icon }: { icon: string }) => {
  switch (icon) {
    case 'tron': return <TronIcon />;
    case 'ethereum': return <EthIcon />;
    case 'bitcoin': return <BtcIcon />;
    default: return <TronIcon />;
  }
};

export function WalletDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const isNew = id === 'new';

  const { addAddress, updateAddress, removeAddress, getAddress } = useAddressBookStore();
  const { addToast } = useUIStore();

  const [showNetworkPicker, setShowNetworkPicker] = useState(false);
  const [wallet, setWallet] = useState<WalletData>({
    label: '',
    address: '',
    network: 'trc20',
    currency: 'USDT',
  });

  useEffect(() => {
    if (location.state?.wallet) {
      const w = location.state.wallet;
      const networkId = w.network.toLowerCase().includes('trc') ? 'trc20' :
        w.network.toLowerCase().includes('erc') ? 'erc20' :
          w.network.toLowerCase().includes('btc') || w.network.toLowerCase() === 'bitcoin' ? 'bitcoin' : 'trc20';
      setWallet({
        label: w.label,
        address: w.address,
        network: networkId,
        currency: w.currency || 'USDT',
      });
    } else if (!isNew && id) {
      const existing = getAddress(id);
      if (existing) {
        const networkId = existing.network.toLowerCase().includes('trc') ? 'trc20' :
          existing.network.toLowerCase().includes('erc') ? 'erc20' :
            existing.network.toLowerCase().includes('btc') || existing.network.toLowerCase() === 'bitcoin' ? 'bitcoin' : 'trc20';
        setWallet({
          label: existing.label,
          address: existing.address,
          network: networkId,
          currency: existing.currency,
        });
      }
    }
  }, [location.state, id, isNew, getAddress]);

  const selectedNetwork = NETWORKS.find(n => n.id === wallet.network) || NETWORKS[0];

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setWallet({ ...wallet, address: text });
    } catch {
      addToast('Could not paste from clipboard', 'error');
    }
  };

  const handleClearAddress = () => {
    setWallet({ ...wallet, address: '' });
  };

  const handleSave = () => {
    const networkData = NETWORKS.find(n => n.id === wallet.network) || NETWORKS[0];

    if (isNew) {
      addAddress({
        label: wallet.label.trim(),
        address: wallet.address.trim(),
        network: networkData.name,
        currency: networkData.currency,
      });
      addToast('Wallet added successfully', 'success');
    } else if (id) {
      updateAddress(id, {
        label: wallet.label.trim(),
        address: wallet.address.trim(),
        network: networkData.name,
        currency: networkData.currency,
      });
      addToast('Wallet updated successfully', 'success');
    }

    navigate('/address-book');
  };

  const handleDelete = () => {
    if (id && !isNew) {
      removeAddress(id);
      addToast('Wallet removed', 'info');
      navigate('/address-book');
    }
  };

  const canSave = wallet.label.trim() && wallet.address.trim();

  return (
    <div className="figma-wallet-details">
      {/* Header */}
      <div className="figma-wallet-details-header">
        <button className="figma-wallet-details-back" onClick={() => navigate(-1)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M9.66135 4.72394C10.054 4.40371 10.6331 4.42659 10.9992 4.7923C11.3653 5.1584 11.3879 5.73742 11.0676 6.13019L10.9992 6.20636L6.20529 11.0003H20.0022C20.5545 11.0003 21.0022 11.448 21.0022 12.0003C21.002 12.5524 20.5543 13.0003 20.0022 13.0003H6.20725L10.9992 17.7923C11.3898 18.1828 11.3897 18.8158 10.9992 19.2064C10.6087 19.5969 9.9757 19.5969 9.58518 19.2064L3.43869 13.0599L3.33615 12.9456C2.88807 12.3958 2.88782 11.6028 3.33615 11.053L3.43869 10.9388L9.58518 4.7923L9.66135 4.72394Z" fill="white" />
          </svg>
        </button>
        <h1 className="figma-wallet-details-title">{isNew ? 'On-chain address' : 'Wallet details'}</h1>
        {!isNew ? (
          <button className="figma-wallet-details-header-delete" onClick={handleDelete}>
            Delete
          </button>
        ) : (
          <div style={{ width: 24 }} />
        )}
      </div>

      <div className="figma-wallet-details-content">
        {/* Address Label Field */}
        <div className="figma-wallet-details-field">
          <label className="figma-wallet-details-label">Address label</label>
          <div className="figma-wallet-details-input-wrap">
            <input
              type="text"
              className="figma-wallet-details-input"
              placeholder="e.g. Binance wallet, My savings"
              value={wallet.label}
              onChange={(e) => setWallet({ ...wallet, label: e.target.value })}
            />
          </div>
        </div>

        {/* Address Field */}
        <div className="figma-wallet-details-field">
          <label className="figma-wallet-details-label">Address or Domain name</label>
          <div className="figma-wallet-details-input-wrap">
            <input
              type="text"
              className="figma-wallet-details-input figma-wallet-details-input--with-actions"
              placeholder="Enter address"
              value={wallet.address}
              onChange={(e) => setWallet({ ...wallet, address: e.target.value })}
            />
            <div className="figma-wallet-details-actions">
              {wallet.address && (
                <button className="figma-wallet-details-action-btn" onClick={handleClearAddress}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <g clip-path="url(#clip0_2_18593)">
                      <path fill-rule="evenodd" clip-rule="evenodd" d="M3.51892 3.51819C7.09873 -0.0616185 12.9027 -0.0616185 16.4825 3.51819C20.0624 7.09799 20.0624 12.902 16.4825 16.4818C12.9027 20.0616 7.09873 20.0616 3.51892 16.4818C-0.0608845 12.902 -0.0608845 7.09799 3.51892 3.51819ZM7.05446 7.05372C6.72902 7.37916 6.72902 7.9068 7.05446 8.23223L8.82222 10L7.05446 11.7678C6.72902 12.0932 6.72902 12.6208 7.05446 12.9463C7.37989 13.2717 7.90753 13.2717 8.23297 12.9463L10.0007 11.1785L11.7685 12.9463C12.0939 13.2717 12.6216 13.2717 12.947 12.9463C13.2724 12.6208 13.2724 12.0932 12.947 11.7678L11.1792 10L12.947 8.23223C13.2724 7.9068 13.2724 7.37916 12.947 7.05372C12.6216 6.72828 12.0939 6.72829 11.7685 7.05372L10.0007 8.82149L8.23297 7.05372C7.90753 6.72828 7.37989 6.72828 7.05446 7.05372Z" fill="#8F8C9C" />
                    </g>
                    <defs>
                      <clipPath id="clip0_2_18593">
                        <rect width="20" height="20" fill="white" transform="matrix(-1 0 0 -1 20 20)" />
                      </clipPath>
                    </defs>
                  </svg>
                </button>
              )}
              <button className="figma-wallet-details-action-text" onClick={handlePaste}>
                Paste
              </button>
              <button className="figma-wallet-details-action-btn">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M16.0042 2.5C17.9974 2.61348 19.2576 2.93381 20.1619 3.83811C21.0662 4.74243 21.3865 6.00268 21.5 7.99598M7.99582 2.5C6.00261 2.61348 4.74241 2.93381 3.83812 3.83811C2.9338 4.74243 2.61347 6.00268 2.5 7.99598M21.5 16.004C21.3865 17.9973 21.0662 19.2576 20.1619 20.1619C19.2576 21.0662 17.9973 21.3865 16.004 21.5M2.5 16.004C2.61347 17.9973 2.9338 19.2576 3.83812 20.1619C4.74244 21.0662 6.00268 21.3865 7.99597 21.5" stroke="white" stroke-opacity="0.48" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                  <path d="M5 12H19" stroke="white" stroke-opacity="0.48" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                </svg>

              </button>
            </div>
          </div>
        </div>

        {/* Network Selector */}
        <div className="figma-wallet-details-field">
          <label className="figma-wallet-details-label">Destination network</label>
          <div
            className="figma-wallet-details-network"
            onClick={() => setShowNetworkPicker(true)}
          >
            <div className="figma-wallet-details-network-icon">
              <NetworkIcon icon={selectedNetwork.icon} />
            </div>
            <span className="figma-wallet-details-network-name">{selectedNetwork.name}</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="figma-wallet-details-network-chevron">
              <path d="M9 18l6-6-6-6" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

      </div>

      {/* Footer Save Button */}
      <div className="figma-wallet-details-footer">
        <button
          className={`figma-wallet-details-save ${canSave ? 'figma-wallet-details-save--active' : ''}`}
          onClick={handleSave}
          disabled={!canSave}
        >
          Save
        </button>
         <div className="figma-home-indicator">
        <div className="figma-home-indicator-bar-specific" />
      </div>
      </div>

      {/* Network Picker Modal */}
      {showNetworkPicker && (
        <div className="figma-modal-overlay" onClick={() => setShowNetworkPicker(false)}>
          <div className="figma-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="figma-modal-handle" />
            <h3 className="figma-modal-title">Select Network</h3>
            <div className="figma-network-list">
              {NETWORKS.map((network) => (
                <div
                  key={network.id}
                  className={`figma-network-item ${wallet.network === network.id ? 'figma-network-item--active' : ''}`}
                  onClick={() => {
                    setWallet({ ...wallet, network: network.id });
                    setShowNetworkPicker(false);
                  }}
                >
                  <div className="figma-network-item-icon">
                    <NetworkIcon icon={network.icon} />
                  </div>
                  <span className="figma-network-item-name">{network.name}</span>
                  {wallet.network === network.id && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M20 6L9 17l-5-5" stroke="#bfed33" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
