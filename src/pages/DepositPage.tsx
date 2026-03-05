import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { api } from '@/services/api';
import type { Currency } from '@/types';

interface DepositInfo {
  address: string;
  network: string;
}

// Coin icons
const CoinUsdt = ({ size = 40 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <circle cx="16" cy="16" r="16" fill="#26A17B"/>
    <path d="M17.922 17.383v-.002c-.11.008-.677.042-1.942.042-1.01 0-1.721-.03-1.971-.042v.003c-3.888-.171-6.79-.848-6.79-1.658 0-.809 2.902-1.486 6.79-1.66v2.644c.254.018.982.061 1.988.061 1.207 0 1.812-.05 1.925-.06v-2.643c3.88.173 6.775.85 6.775 1.658 0 .81-2.895 1.485-6.775 1.657m0-3.59v-2.366h5.414V7.819H8.595v3.608h5.414v2.365c-4.4.202-7.709 1.074-7.709 2.118 0 1.044 3.309 1.915 7.709 2.118v7.582h3.913v-7.584c4.393-.202 7.694-1.073 7.694-2.116 0-1.043-3.301-1.914-7.694-2.117" fill="#fff"/>
  </svg>
);

const CoinBtc = ({ size = 40 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <circle cx="16" cy="16" r="16" fill="#F7931A"/>
    <path d="M22.5 13.5c.3-2-1.2-3.1-3.3-3.8l.7-2.7-1.6-.4-.7 2.6c-.4-.1-.8-.2-1.3-.3l.7-2.6-1.6-.4-.7 2.7c-.3-.1-.7-.2-1-.2v-.1l-2.3-.6-.4 1.7s1.2.3 1.2.3c.7.2.8.6.8 1l-.8 3.2c0 0 .1 0 .2.1h-.2l-1.1 4.5c-.1.2-.3.5-.8.4 0 0-1.2-.3-1.2-.3l-.8 1.9 2.1.5c.4.1.8.2 1.2.3l-.7 2.8 1.6.4.7-2.7c.4.1.9.2 1.3.3l-.7 2.7 1.6.4.7-2.8c2.9.5 5.1.3 6-2.3.7-2.1 0-3.3-1.5-4.1 1.1-.3 1.9-1 2.1-2.5zm-3.8 5.3c-.5 2.1-4.1 1-5.2.7l.9-3.8c1.2.3 4.9.9 4.3 3.1zm.6-5.4c-.5 1.9-3.4.9-4.4.7l.8-3.4c1 .2 4.1.7 3.6 2.7z" fill="#fff"/>
  </svg>
);

const CoinEth = ({ size = 40 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <circle cx="16" cy="16" r="16" fill="#627EEA"/>
    <path d="M16 4v8.87l7.5 3.35L16 4z" fill="#fff" fillOpacity=".6"/>
    <path d="M16 4L8.5 16.22 16 12.87V4z" fill="#fff"/>
    <path d="M16 21.97v6.03l7.5-10.4L16 21.97z" fill="#fff" fillOpacity=".6"/>
    <path d="M16 28v-6.03L8.5 17.6 16 28z" fill="#fff"/>
    <path d="M16 20.57l7.5-4.35L16 12.87v7.7z" fill="#fff" fillOpacity=".2"/>
    <path d="M8.5 16.22l7.5 4.35v-7.7l-7.5 3.35z" fill="#fff" fillOpacity=".6"/>
  </svg>
);

const CoinLtc = ({ size = 40 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <circle cx="16" cy="16" r="16" fill="#345D9D"/>
    <path d="M12.5 24h10.8l.8-3h-6.5l1.8-6.8 2.5-.9.5-2-2.5.9L21.5 6h-4l-2.3 9.1-2.5.9-.5 2 2.5-.9L12.5 24z" fill="#fff"/>
  </svg>
);

// Icons - Figma exact
const BackArrow = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M9.66135 4.72394C10.054 4.40371 10.6331 4.42659 10.9992 4.7923C11.3653 5.1584 11.3879 5.73742 11.0676 6.13019L10.9992 6.20636L6.20529 11.0003H20.0022C20.5545 11.0003 21.0022 11.448 21.0022 12.0003C21.002 12.5524 20.5543 13.0003 20.0022 13.0003H6.20725L10.9992 17.7923C11.3898 18.1828 11.3897 18.8158 10.9992 19.2064C10.6087 19.5969 9.9757 19.5969 9.58518 19.2064L3.43869 13.0599L3.33615 12.9456C2.88807 12.3958 2.88782 11.6028 3.33615 11.053L3.43869 10.9388L9.58518 4.7923L9.66135 4.72394Z" fill="white"/>
  </svg>
);

const MoreIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M12.0244 17.5C12.8393 17.5 13.5 18.1716 13.5 19C13.5 19.8284 12.8393 20.5 12.0244 20.5H11.9756C11.1607 20.5 10.5 19.8284 10.5 19C10.5 18.1716 11.1607 17.5 11.9756 17.5H12.0244Z" fill="white"/>
    <path d="M12.0244 10.5C12.8393 10.5 13.5 11.1716 13.5 12C13.5 12.8284 12.8393 13.5 12.0244 13.5H11.9756C11.1607 13.5 10.5 12.8284 10.5 12C10.5 11.1716 11.1607 10.5 11.9756 10.5H12.0244Z" fill="white"/>
    <path d="M12.0244 3.5C12.8393 3.5 13.5 4.17157 13.5 5C13.5 5.82843 12.8393 6.5 12.0244 6.5H11.9756C11.1607 6.5 10.5 5.82843 10.5 5C10.5 4.17157 11.1607 3.5 11.9756 3.5H12.0244Z" fill="white"/>
  </svg>
);

const CopyIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path fillRule="evenodd" clipRule="evenodd" d="M18.7041 2.51074C19.7128 2.61301 20.5 3.46436 20.5 4.5V14.5C20.5 15.6046 19.6046 16.5 18.5 16.5H16.5V19.5C16.5 20.6046 15.6046 21.5 14.5 21.5H5.5C4.46436 21.5 3.613 20.7128 3.51074 19.7041L3.5 19.5V9.5C3.5 8.39543 4.39543 7.5 5.5 7.5H7.5V4.5C7.5 3.39543 8.39543 2.5 9.5 2.5H18.5L18.7041 2.51074ZM9.5 7.5H14.5L14.7041 7.51074C15.7128 7.613 16.5 8.46436 16.5 9.5V14.5H18.5V4.5H9.5V7.5Z" fill="white" fillOpacity="0.64"/>
  </svg>
);

const AlertIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path fillRule="evenodd" clipRule="evenodd" d="M6.60432 2.19419C7.24509 1.03988 8.90444 1.04811 9.53401 2.20852L15.1278 11.8563C15.7333 12.973 14.9268 14.3327 13.659 14.3329H2.34065C1.06583 14.3325 0.259828 12.9589 0.879716 11.842L6.60432 2.19419ZM7.99039 10.1017C7.59817 10.1019 7.28013 10.4207 7.28011 10.814V10.9813C7.28021 11.3745 7.59822 11.694 7.99039 11.6942C8.3827 11.6942 8.70057 11.3746 8.70068 10.9813V10.814C8.70066 10.4206 8.38275 10.1018 7.99039 10.1017ZM7.99039 5.57701C7.62265 5.57717 7.32035 5.85724 7.28401 6.21633L7.28011 6.28925V8.30031L7.28401 8.37258C7.3204 8.73162 7.62269 9.01239 7.99039 9.01255C8.38264 9.01254 8.70048 8.6935 8.70068 8.30031V6.28925L8.69677 6.21633C8.66043 5.85714 8.35827 5.57702 7.99039 5.57701Z" fill="#C2FF0A"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M13 4L6 12L3 9" stroke="#C2FF0A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CURRENCY_CONFIG: Record<Currency, { network: string; icon: React.ComponentType<{ size?: number }> }> = {
  USDT: { network: 'TRC-20', icon: CoinUsdt },
  USDT_TRC20: { network: 'TRC-20', icon: CoinUsdt },
  BTC: { network: 'Bitcoin', icon: CoinBtc },
  ETH: { network: 'ERC-20', icon: CoinEth },
  LTC: { network: 'Litecoin', icon: CoinLtc },
};

export function DepositPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [selectedCurrency] = useState<Currency>(
    (searchParams.get('currency') as Currency) || 'USDT'
  );
  const [depositInfo, setDepositInfo] = useState<DepositInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [addressError, setAddressError] = useState<string | null>(null);

  useEffect(() => {
    fetchDepositAddress();
  }, [selectedCurrency]);

  const fetchDepositAddress = async () => {
    setIsLoading(true);
    setAddressError(null);
    try {
      const info = await api.getDepositAddress(selectedCurrency);
      setDepositInfo(info);
    } catch {
      setAddressError('Failed to load deposit address. Please try again.');
      setDepositInfo(null);
    } finally {
      setIsLoading(false);
    }
  };

  const copyAddress = async () => {
    if (!depositInfo?.address) return;

    try {
      await navigator.clipboard.writeText(depositInfo.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = depositInfo.address;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareAddress = async () => {
    if (!depositInfo?.address) return;

    const shareData = {
      title: `${selectedCurrency} Deposit Address`,
      text: `My ${selectedCurrency} (${CURRENCY_CONFIG[selectedCurrency].network}) address: ${depositInfo.address}`,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await copyAddress();
      }
    } catch {
      await copyAddress();
    }
  };

  const CoinIcon = CURRENCY_CONFIG[selectedCurrency].icon;
  const network = CURRENCY_CONFIG[selectedCurrency].network;

  return (
    <div className="figma-deposit">
      {/* Header */}
      <div className="figma-deposit-header">
        <button className="figma-deposit-back" onClick={() => navigate(-1)}>
          <BackArrow />
        </button>
        <span className="figma-deposit-title">Deposit</span>
        <button className="figma-deposit-more">
          <MoreIcon />
        </button>
      </div>

      {/* Content */}
      <div className="figma-deposit-content">
        {/* QR Card */}
        <div className="figma-deposit-card">
          <div className="figma-deposit-card-inner">
            {/* Top - Currency info */}
            <div className="figma-deposit-currency">
              <CoinIcon size={40} />
              <span className="figma-deposit-currency-name">{selectedCurrency}</span>
              <span className="figma-deposit-network">Network: {network}</span>
            </div>

            {/* QR Code */}
            <div className="figma-deposit-qr">
              {isLoading ? (
                <div className="figma-deposit-qr-loading">Loading...</div>
              ) : addressError ? (
                <div className="figma-deposit-qr-loading" style={{ color: '#ff6b6b', padding: '1rem', textAlign: 'center' }}>
                  {addressError}
                  <button onClick={fetchDepositAddress} style={{ display: 'block', margin: '0.5rem auto 0', color: '#BFED33', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                    Retry
                  </button>
                </div>
              ) : depositInfo?.address ? (
                <div className="figma-deposit-qr-wrapper">
                  <QRCodeSVG
                    value={depositInfo.address}
                    size={200}
                    bgColor="#ffffff"
                    fgColor="#000000"
                    level="M"
                  />
                  <div className="figma-deposit-qr-logo">
                    <CoinIcon size={24} />
                  </div>
                </div>
              ) : null}
            </div>

            {/* Address */}
            <div className="figma-deposit-address">
              <span className="figma-deposit-address-label">Address of the wallet</span>
              <div className="figma-deposit-address-row">
                <span className="figma-deposit-address-value">
                  {isLoading ? 'Loading...' : addressError ? 'Error' : depositInfo?.address || ''}
                </span>
                {depositInfo?.address && (
                  <button className="figma-deposit-copy" onClick={copyAddress}>
                    {copied ? <CheckIcon /> : <CopyIcon />}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Warning Note */}
        <div className="figma-deposit-warning">
          <div className="figma-deposit-warning-icon">
            <AlertIcon />
          </div>
          <div className="figma-deposit-warning-content">
            <p className="figma-deposit-warning-title">
              Send {selectedCurrency} only via {network} network
            </p>
            <p className="figma-deposit-warning-text">
              Sending via another network may result in permanent loss of funds.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Button */}
      <div className="figma-deposit-footer">
        <button className="figma-deposit-share-btn" onClick={shareAddress}>
          Share address
        </button>
        <div className="figma-deposit-home-indicator">
          <div className="figma-deposit-home-indicator-bar" />
        </div>
      </div>
    </div>
  );
}
