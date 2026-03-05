import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';

// ────────────────────────────────────────────────
// Coin icons (unchanged)
// ────────────────────────────────────────────────

const CoinUsdt = ({ size = 40 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <circle cx="16" cy="16" r="16" fill="#26A17B"/>
    <path d="M17.922 17.383v-.002c-.11.008-.677.042-1.942.042-1.01 0-1.721-.03-1.971-.042v.003c-3.888-.171-6.79-.848-6.79-1.658 0-.809 2.902-1.486 6.79-1.66v2.644c.254.018.982.061 1.988.061 1.207 0 1.812-.05 1.925-.06v-2.643c3.88.173 6.775.85 6.775 1.658 0 .81-2.895 1.485-6.775 1.657m0-3.59v-2.366h5.414V7.819H8.595v3.608h5.414v2.365c-4.4.202-7.709 1.074-7.709 2.118 0 1.044 3.309 1.915 7.709 2.118v7.582h3.913v-7.584c4.393-.202 7.694-1.073 7.694-2.116 0-1.043-3.301-1.914-7.694-2.117" fill="#fff"/>
  </svg>
);

// Icons - unchanged
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

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M13 4L6 12L3 9" stroke="#C2FF0A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const AlertIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path fillRule="evenodd" clipRule="evenodd" d="M6.60432 2.19419C7.24509 1.03988 8.90444 1.04811 9.53401 2.20852L15.1278 11.8563C15.7333 12.973 14.9268 14.3327 13.659 14.3329H2.34065C1.06583 14.3325 0.259828 12.9589 0.879716 11.842L6.60432 2.19419ZM7.99039 10.1017C7.59817 10.1019 7.28013 10.4207 7.28011 10.814V10.9813C7.28021 11.3745 7.59822 11.694 7.99039 11.6942C8.3827 11.6942 8.70057 11.3746 8.70068 10.9813V10.814C8.70066 10.4206 8.38275 10.1018 7.99039 10.1017ZM7.99039 5.57701C7.62265 5.57717 7.32035 5.85724 7.28401 6.21633L7.28011 6.28925V8.30031L7.28401 8.37258C7.3204 8.73162 7.62269 9.01239 7.99039 9.01255C8.38264 9.01254 8.70048 8.6935 8.70068 8.30031V6.28925L8.69677 6.21633C8.66043 5.85714 8.35827 5.57702 7.99039 5.57701Z" fill="#C2FF0A"/>
  </svg>
);

// ────────────────────────────────────────────────
// Hardcoded configuration
// ────────────────────────────────────────────────

const HARDCODED_CURRENCY = 'USDT' as const;
const HARDCODED_NETWORK = 'TRC-20';
const HARDCODED_ADDRESS = 'TQwerty1234567890abcdef1234567890xyz';

const CURRENCY_CONFIG = {
  USDT: { network: HARDCODED_NETWORK, icon: CoinUsdt },
  // You can add others if needed later, but we're hardcoding to USDT
};

export function NoKYCPayment() {
  const navigate = useNavigate();
  // const [searchParams] = useSearchParams();
  const [copied, setCopied] = useState(false);

  // Fixed values - no fetching, no loading, no errors
  const selectedCurrency = HARDCODED_CURRENCY;
  const depositAddress = HARDCODED_ADDRESS;
  const network = HARDCODED_NETWORK;

  const CoinIcon = CURRENCY_CONFIG.USDT.icon;

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(depositAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = depositAddress;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // const shareAddress = async () => {
  //   const shareData = {
  //     title: `${selectedCurrency} Deposit Address`,
  //     text: `My ${selectedCurrency} (${network}) address: ${depositAddress}`,
  //   };

  //   try {
  //     if (navigator.share) {
  //       await navigator.share(shareData);
  //     } else {
  //       await copyAddress();
  //     }
  //   } catch {
  //     await copyAddress();
  //   }
  // };

  return (
    <div className="figma-deposit">
      {/* Header */}
      <div className="figma-deposit-header">
        <button className="figma-deposit-back" onClick={() => navigate(-1)}>
          <BackArrow />
        </button>
        <span className="figma-deposit-title">Activate no-KYC withdrawals</span>
        <button className="figma-deposit-more">
          <MoreIcon />
        </button>
      </div>

      {/* Content */}
      <div className="figma-deposit-content">
        {/* QR Card */}
        <h5 className='nokycpaytitle'>Get <span className='nokycpaytitlespan'>unlimited access</span> to no-KYC withdrawals with a <span className='nokycpaytitlespan'>one-time fee</span> of 4,000 USDT.</h5>
        <div className="figma-deposit-card">
          <div className="figma-deposit-card-inner">
            {/* Top - Currency info */}
            <div className="figma-deposit-currency">
              <span className="figma-deposit-network">Network: {network}</span>
              <span className="figma-deposit-currency-name-nokyc">1000 {selectedCurrency}</span>

            </div>

            {/* QR Code */}
            <div className="figma-deposit-qr">
              <div className="figma-deposit-qr-wrapper">
                <QRCodeSVG
                  value={depositAddress}
                  size={180}
                  bgColor="#ffffff"
                  fgColor="#000000"
                  level="M"
                />
                <div className="figma-deposit-qr-logo">
                  <CoinIcon size={24} />
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="figma-deposit-address">
              <span className="figma-deposit-address-label">Address of the wallet</span>
              <div className="figma-deposit-address-row">
                <span className="figma-deposit-address-value">
                  {depositAddress}
                </span>
                <button className="figma-deposit-copy" onClick={copyAddress}>
                  {copied ? <CheckIcon /> : <CopyIcon />}
                </button>
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
<div className='bottomspac'></div>
      {/* Bottom Button */}
      <div className="figma-deposit-footer">
        <button className="figma-deposit-share-btn" onClick={() => navigate('/payment-success')}>
          Mark as Paid
        </button>
        <div className="figma-deposit-home-indicator">
          <div className="figma-deposit-home-indicator-bar" />
        </div>
      </div>
    </div>
  );
}