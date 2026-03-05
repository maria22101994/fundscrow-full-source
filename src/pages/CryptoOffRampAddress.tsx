import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode'; // Make sure this is installed: npm install html5-qrcode
import { useAddressBookStore, useUIStore } from '@/store';
import type { Currency } from '@/types';

interface WalletData {
  label: string;
  address: string;
  network: string;
  currency: Currency;
  amount: string;
}

const NETWORKS = [
  { id: 'trc20', name: 'Tron (TRC20)', icon: 'tron', currency: 'USDT' as Currency },
  { id: 'erc20', name: 'Ethereum (ERC20)', icon: 'ethereum', currency: 'ETH' as Currency },
  { id: 'bitcoin', name: 'Bitcoin', icon: 'bitcoin', currency: 'BTC' as Currency },
  { id: 'bep20', name: 'BSC (BEP20)', icon: 'ethereum', currency: 'USDT' as Currency },
];

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

const NetworkIcon = ({ icon }: { icon: string }) => {
  switch (icon) {
    case 'tron': return <TronIcon />;
    case 'ethereum': return <EthIcon />;
    case 'bitcoin': return <BtcIcon />;
    default: return <TronIcon />;
  }
};

const ScanQrIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M3 7V5C3 3.89543 3.89543 3 5 3H7"
      stroke="rgba(255,255,255,0.7)"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M17 3H19C20.1046 3 21 3.89543 21 5V7"
      stroke="rgba(255,255,255,0.7)"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M21 17V19C21 20.1046 20.1046 21 19 21H17"
      stroke="rgba(255,255,255,0.7)"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M7 21H5C3.89543 21 3 20.1046 3 19V17"
      stroke="rgba(255,255,255,0.7)"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M7 12H17"
      stroke="rgba(255,255,255,0.7)"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

export function CryptoOffRampAddress() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const isNew = id === 'new';

  const { getAddress, addAddress } = useAddressBookStore();
  const { addToast } = useUIStore();

  // ─── Main Form State ────────────────────────────────────────
  const [showNetworkPicker, setShowNetworkPicker] = useState(false);
  const [saveAddress, setSaveAddress] = useState(false);
  const [wallet, setWallet] = useState<WalletData>({
    label: '',
    address: '',
    network: 'trc20',
    currency: 'USDT',
    amount: '',
  });

  // ─── QR Scanner State & Refs ───────────────────────────────
  const [showQrScanner, setShowQrScanner] = useState(false);
  const qrScannerRef = useRef<Html5Qrcode | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // ─── Load existing wallet if editing ───────────────────────
  useEffect(() => {
    if (location.state?.wallet) {
      const w = location.state.wallet;
      const networkId = w.network?.toLowerCase().includes('trc')
        ? 'trc20'
        : w.network?.toLowerCase().includes('erc')
        ? 'erc20'
        : w.network?.toLowerCase().includes('btc')
        ? 'bitcoin'
        : w.network?.toLowerCase().includes('bep')
        ? 'bep20'
        : 'trc20';

      setWallet((prev) => ({
        ...prev,
        label: w.label || '',
        address: w.address || '',
        currency: (w.currency as Currency) || 'USDT',
        network: networkId,
      }));
      setSaveAddress(false);
    } else if (!isNew && id) {
      const existing = getAddress(id);
      if (existing) {
        setWallet((prev) => ({
          ...prev,
          label: existing.label,
          address: existing.address,
          currency: existing.currency,
        }));
      }
    }
  }, [location.state, id, isNew, getAddress]);

  const selectedNetwork = NETWORKS.find((n) => n.id === wallet.network) || NETWORKS[0];

  // ─── QR Scanner Functions ──────────────────────────────────
  const startQrScanner = async () => {
    setShowQrScanner(true);

    // Wait for #qr-reader div to be in DOM
    setTimeout(async () => {
      try {
        const scanner = new Html5Qrcode('qr-reader');
        qrScannerRef.current = scanner;

        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            setWallet((prev) => ({ ...prev, address: decodedText.trim() }));
            addToast('QR code scanned successfully!', 'success');
            stopQrScanner();
          },
          (err) => {
            // Ignore "no code found" errors
            // if (err?.name !== 'NotFoundException') {
              console.warn('QR scan warning:', err);
            // }
          }
        );
      } catch (err) {
        console.error('Failed to start QR scanner:', err);
        addToast('Could not access camera. Please allow camera permission.', 'error');
        setShowQrScanner(false);
      }
    }, 300);
  };

  const stopQrScanner = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop().catch((err) => console.warn('Stop error:', err));
      qrScannerRef.current = null;
    }
    setShowQrScanner(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const scanner = new Html5Qrcode('image-qr-reader', { verbose: false });
      const result = await scanner.scanFile(file, true);
      setWallet((prev) => ({ ...prev, address: result.trim() }));
      addToast('QR code scanned from image!', 'success');
      setShowQrScanner(false);
    } catch (err) {
      console.error('Image QR scan failed:', err);
      addToast('Failed to read QR from image', 'error');
    }

    if (e.target) e.target.value = '';
  };

  // ─── Other Handlers ────────────────────────────────────────
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setWallet({ ...wallet, address: text });
    } catch {
      addToast('Could not paste from clipboard', 'error');
    }
  };

  const handleSaveAndOffRamp = () => {
    if (isNew && saveAddress && wallet.label.trim()) {
      addAddress({
        label: wallet.label,
        address: wallet.address,
        currency: wallet.currency,
        network: selectedNetwork.name,
      });
    }
    addToast('Off-ramp transaction initiated', 'success');
    navigate('/withdraw-successful');
  };

  const canSave =
    wallet.address.trim() &&
    wallet.amount.trim() &&
    (!isNew || !saveAddress || wallet.label.trim());

  return (
    <div className="figma-wallet-details" style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#0B0819' }}>
      {/* Header */}
      <div className="figma-wallet-details-header">
        <button className="figma-wallet-details-back" onClick={() => navigate(-1)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M9.66135 4.72394C10.054 4.40371 10.6331 4.42659 10.9992 4.7923C11.3653 5.1584 11.3879 5.73742 11.0676 6.13019L10.9992 6.20636L6.20529 11.0003H20.0022C20.5545 11.0003 21.0022 11.448 21.0022 12.0003C21.002 12.5524 20.5543 13.0003 20.0022 13.0003H6.20725L10.9992 17.7923C11.3898 18.1828 11.3897 18.8158 10.9992 19.2064C10.6087 19.5969 9.9757 19.5969 9.58518 19.2064L3.43869 13.0599L3.33615 12.9456C2.88807 12.3958 2.88782 11.6028 3.33615 11.053L3.43869 10.9388L9.58518 4.7923L9.66135 4.72394Z"
              fill="white"
            />
          </svg>
        </button>
        <h1 className="figma-crypto-title">Add crypto off ramp address</h1>
      </div>

      <div className="figma-wallet-details-content" style={{ flex: 1, overflowY: 'auto', padding: '0 20px' }}>
        {/* Address Field */}
        <div className="figma-wallet-details-field">
          <label className="figma-wallet-details-label">Address or Domain name</label>
          <div className="figma-wallet-details-input-wrap">
            <input
              type="text"
              className="figma-wallet-details-input"
              placeholder="Enter address"
              value={wallet.address}
              onChange={(e) => setWallet({ ...wallet, address: e.target.value })}
            />
            <div className="figma-wallet-details-actions" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button className="figma-wallet-details-action-text" onClick={handlePaste}>
                Paste
              </button>

              {/* QR Scanner Button */}
              <button
                className="figma-wallet-details-action-icon"
                onClick={startQrScanner}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '6px',
                  cursor: 'pointer',
                  borderRadius: '8px',
                }}
              >
                <ScanQrIcon />
              </button>

              {/* Contacts / Address Book Placeholder */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2">
                <circle cx="12" cy="8" r="4" />
                <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
              </svg>
            </div>
          </div>
        </div>

        {/* Network Selector */}
        <div className="figma-wallet-details-field">
          <label className="figma-wallet-details-label">Destination network</label>
          <div className="figma-wallet-details-network" onClick={() => setShowNetworkPicker(true)}>
            <div className="figma-wallet-details-network-icon">
              <NetworkIcon icon={selectedNetwork.icon} />
            </div>
            <span className="figma-wallet-details-network-name">{selectedNetwork.name}</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="figma-wallet-details-network-chevron">
              <path d="M9 18l6-6-6-6" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Withdraw Amount Field */}
        <div className="figma-wallet-details-field">
          <label className="figma-wallet-details-label">Withdraw amount</label>
          <div className="figma-wallet-details-input-wrap" style={{ position: 'relative' }}>
            <input
              type="number"
              className="figma-wallet-details-input"
              placeholder="Enter amount"
              value={wallet.amount}
              onChange={(e) => setWallet({ ...wallet, amount: e.target.value })}
              style={{ paddingRight: '64px' }}
            />
            <span
              className="figma-input-currency-suffix"
              style={{
                position: 'absolute',
                right: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#FFFFFF',
                fontWeight: '500',
              }}
            >
              {wallet.currency}
            </span>
          </div>
          <div
            className="figma-wallet-available-balance"
            style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '13px', color: '#8F8C9C' }}
          >
            <span>Available</span>
            <span style={{ color: '#FFFFFF' }}>10,000.00 {wallet.currency}</span>
          </div>
        </div>

        {/* Save Address Toggle - Only for new addresses */}
        {isNew && (
          <>
            <div
              className="figma-save-address-toggle"
              onClick={() => setSaveAddress(!saveAddress)}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '20px', cursor: 'pointer' }}
            >
              <div
                className={`figma-checkbox ${saveAddress ? 'checked' : ''}`}
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '6px',
                  border: saveAddress ? 'none' : '2px solid #312F42',
                  backgroundColor: saveAddress ? '#BFED33' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {saveAddress && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2.5 6L5 8.5L9.5 3.5" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <span style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: '500' }}>Save address</span>
            </div>

            {saveAddress && (
              <div className="figma-wallet-details-field" style={{ marginTop: '20px' }}>
                <label className="figma-wallet-details-label">Address label</label>
                <div className="figma-wallet-details-input-wrap">
                  <input
                    type="text"
                    className="figma-wallet-details-input"
                    placeholder="e.g. Fiat off ramp card"
                    value={wallet.label}
                    onChange={(e) => setWallet({ ...wallet, label: e.target.value })}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Sticky Footer */}
      <div className="figma-deposit-footer">
        <button
          className={`figma-deposit-share-btn ${canSave ? 'active' : ''}`}
          style={{
            width: '100%',
            backgroundColor: canSave ? '#BFED33' : 'rgba(191, 237, 51, 0.3)',
            color: canSave ? '#000' : 'rgba(0,0,0,0.3)',
          }}
          onClick={handleSaveAndOffRamp}
          disabled={!canSave}
        >
          Off ramp
        </button>
        <div className="figma-deposit-home-indicator">
          <div className="figma-deposit-home-indicator-bar" />
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
                  className={`figma-network-item ${wallet.network === network.id ? 'active' : ''}`}
                  onClick={() => {
                    setWallet({ ...wallet, network: network.id, currency: network.currency });
                    setShowNetworkPicker(false);
                  }}
                >
                  <div className="figma-network-item-icon">
                    <NetworkIcon icon={network.icon} />
                  </div>
                  <span className="figma-network-item-name">{network.name}</span>
                  {wallet.network === network.id && (
                    <div className="figma-radio-circle active">
                      <div className="figma-radio-dot checked" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── QR Scanner Modal ────────────────────────────────────── */}
      {showQrScanner && (
        <div
          onClick={stopQrScanner}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.95)',
            zIndex: 2000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '90%',
              maxWidth: '360px',
              textAlign: 'center',
              padding: '20px',
            }}
          >
            <h3 style={{ marginBottom: '16px', fontSize: '20px' }}>Scan QR Code</h3>
            <p style={{ marginBottom: '24px', opacity: 0.8, fontSize: '15px' }}>
              Position the QR code within the frame
            </p>

            {/* Live Camera Scanner Area */}
            <div
              id="qr-reader"
              style={{
                width: '280px',
                height: '280px',
                margin: '0 auto 24px',
                border: '4px dashed #BFED33',
                borderRadius: '16px',
                overflow: 'hidden',
                background: '#000',
              }}
            />

            {/* Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <button
                onClick={() => imageInputRef.current?.click()}
                style={{
                  background: 'rgba(191, 237, 51, 0.15)',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px',
                  color: '#BFED33',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Upload from Gallery
              </button>

              <div
                onClick={() => {
                  stopQrScanner();
                  // You can focus the address input here if you want
                }}
                style={{
                  color: '#BFED33',
                  cursor: 'pointer',
                  fontSize: '15px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M15 3H19C20.1046 3 21 3.89543 21 5V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3H9"
                    stroke="#BFED33"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path d="M9 17H15" stroke="#BFED33" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Enter code manually
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden inputs for QR functionality */}
      <input
        type="file"
        accept="image/*"
        ref={imageInputRef}
        onChange={handleImageUpload}
        style={{ display: 'none' }}
      />
      <div id="image-qr-reader" style={{ display: 'none' }} />
    </div>
  );
}