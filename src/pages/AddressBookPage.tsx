import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAddressBookStore } from '@/store';
import type { SavedWallet } from '@/types';

// Coin icons matching Figma exactly
const CoinUsdt = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
    <circle cx="16" cy="16" r="16" fill="#26A17B" />
    <path d="M17.922 17.383v-.002c-.11.008-.677.042-1.942.042-1.01 0-1.721-.03-1.971-.042v.003c-3.888-.171-6.79-.848-6.79-1.658 0-.809 2.902-1.486 6.79-1.66v2.644c.254.018.982.061 1.988.061 1.207 0 1.812-.05 1.926-.06v-2.643c3.88.173 6.775.85 6.775 1.658 0 .81-2.895 1.485-6.775 1.658zm0-3.59v-2.366h5.414V8.616H8.595v2.811h5.414v2.364c-4.4.202-7.709 1.074-7.709 2.118 0 1.044 3.309 1.915 7.709 2.118v7.582h3.913v-7.584c4.393-.202 7.694-1.073 7.694-2.116 0-1.043-3.301-1.914-7.694-2.117z" fill="white" />
  </svg>
);

const CoinBtc = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
    <circle cx="16" cy="16" r="16" fill="#F7931A" />
    <path d="M22.5 13.56c.313-2.088-1.28-3.212-3.456-3.962l.706-2.83-1.723-.43-.688 2.757c-.453-.113-.918-.22-1.382-.326l.692-2.773-1.722-.43-.707 2.83c-.375-.086-.743-.17-1.1-.259l.002-.01-2.376-.593-.459 1.84s1.28.293 1.252.312c.698.174.824.636.803 1.002l-.804 3.228c.048.012.11.03.179.057l-.182-.045-1.127 4.52c-.086.212-.302.53-.79.408.017.025-1.253-.313-1.253-.313l-.856 1.973 2.243.56c.417.104.826.214 1.229.316l-.715 2.872 1.722.43.707-2.835c.47.128.927.245 1.374.357l-.705 2.822 1.723.43.715-2.866c2.948.558 5.164.333 6.098-2.334.752-2.147-.037-3.385-1.588-4.193 1.13-.26 1.98-1.003 2.208-2.538zm-3.95 5.538c-.535 2.147-4.152.986-5.326.695l.95-3.81c1.174.293 4.93.874 4.376 3.115zm.535-5.569c-.488 1.953-3.496.96-4.47.717l.862-3.453c.974.243 4.11.696 3.608 2.736z" fill="white" />
  </svg>
);

const CoinEth = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
    <circle cx="16" cy="16" r="16" fill="#627EEA" />
    <path d="M16.498 4v8.87l7.497 3.35L16.498 4z" fill="white" fillOpacity="0.6" />
    <path d="M16.498 4L9 16.22l7.498-3.35V4z" fill="white" />
    <path d="M16.498 21.968v6.027l7.502-10.376-7.502 4.349z" fill="white" fillOpacity="0.6" />
    <path d="M16.498 27.995v-6.028L9 17.62l7.498 10.376z" fill="white" />
    <path d="M16.498 20.573l7.497-4.353-7.497-3.348v7.701z" fill="white" fillOpacity="0.2" />
    <path d="M9 16.22l7.498 4.353v-7.701L9 16.22z" fill="white" fillOpacity="0.6" />
  </svg>
);

const CoinLtc = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
    <circle cx="16" cy="16" r="16" fill="#345D9D" />
    <path d="M16 6.4l-6.4 9.6 6.4 9.6 6.4-9.6L16 6.4zm0 3.2l4.4 6.4H11.6L16 9.6z" fill="white" />
    <path d="M12 17.6l-2.4 4.8h12.8l-2.4-4.8H12z" fill="white" fillOpacity="0.6" />
  </svg>
);

const CURRENCY_ICONS: Record<string, React.ReactNode> = {
  USDT: <CoinUsdt />,
  USDT_TRC20: <CoinUsdt />,
  BTC: <CoinBtc />,
  ETH: <CoinEth />,
  LTC: <CoinLtc />,
};

type TabType = 'onchain' | 'offramp';

export function AddressBookPage() {
  const navigate = useNavigate();
  const { addresses: wallets } = useAddressBookStore();
  const [activeTab, setActiveTab] = useState<TabType>('onchain');

  const handleAddNew = () => {
    navigate('/wallet-details/new');
  };

  const handleEditWallet = (wallet: SavedWallet) => {
    navigate(`/wallet-details/${wallet.id}`, { state: { wallet } });
  };

  // Filter wallets based on tab (for now, all are on-chain)
  const filteredWallets = wallets.filter(() => {
    return activeTab === 'onchain'; // All wallets shown on onchain tab
  });

  return (
    <div className="figma-addressbook">
      {/* Header */}
      <div className="figma-addressbook-header">
        <button className="figma-addressbook-back" onClick={() => navigate(-1)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M9.66135 4.72394C10.054 4.40371 10.6331 4.42659 10.9992 4.7923C11.3653 5.1584 11.3879 5.73742 11.0676 6.13019L10.9992 6.20636L6.20529 11.0003H20.0022C20.5545 11.0003 21.0022 11.448 21.0022 12.0003C21.002 12.5524 20.5543 13.0003 20.0022 13.0003H6.20725L10.9992 17.7923C11.3898 18.1828 11.3897 18.8158 10.9992 19.2064C10.6087 19.5969 9.9757 19.5969 9.58518 19.2064L3.43869 13.0599L3.33615 12.9456C2.88807 12.3958 2.88782 11.6028 3.33615 11.053L3.43869 10.9388L9.58518 4.7923L9.66135 4.72394Z" fill="white" />
          </svg>
        </button>
        <h1 className="figma-addressbook-title">Address book</h1>
        <div style={{ width: 24 }} />
      </div>

      {/* Underline Tabs - Figma exact */}
      <div className="figma-addressbook-tabs-container">
        <div className="figma-addressbook-tabs">
          <button
            className={`figma-addressbook-tab ${activeTab === 'onchain' ? 'figma-addressbook-tab--active' : ''}`}
            onClick={() => setActiveTab('onchain')}
          >
            On-chain
          </button>
          <button
            className={`figma-addressbook-tab ${activeTab === 'offramp' ? 'figma-addressbook-tab--active' : ''}`}
            onClick={() => setActiveTab('offramp')}
          >
            Off-ramp
          </button>
        </div>
        <div className="figma-addressbook-tabs-line" />
      </div>

      {/* Content */}
      <div className="figma-addressbook-content">
        {/* Section Label */}
        <span className="figma-addressbook-section">Your saved wallets</span>

        {/* Wallet List */}
        <div className="figma-addressbook-list">
          {filteredWallets.length === 0 ? (
            <div className="figma-addressbook-empty">
              {/* Search illustration from Figma */}
              <div className="figma-deals-container">
                {/* Decorative Glow Background */}
                <svg
                  className="glow-svg"
                  viewBox="0 0 393 611"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g filter="url(#filter0_f_2_18389)">
                    <ellipse
                      cx="205.155"
                      cy="325.415"
                      rx="115.733"
                      ry="67.0966"
                      transform="rotate(-15 205.155 325.415)"
                      fill="#3A18DC"
                      fillOpacity="0.3"
                    />
                  </g>
                  <defs>
                    <filter id="filter0_f_2_18389" x="-141.99" y="0" width="694.291" height="610.83" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                      <feFlood floodOpacity="0" result="BackgroundImageFix" />
                      <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                      <feGaussianBlur stdDeviation="117" result="effect1_foregroundBlur_2_18389" />
                    </filter>
                  </defs>
                </svg>

                {/* Dynamic Image based on Step */}
                <img src="./images/emptyoff.png" alt="Onboarding Phase" className="figma-nokyc-main-img" />
              </div>
              <h3 className="figma-addressbook-empty-title">Your Address Book is empty</h3>
              <p className="figma-addressbook-empty-desc">
                Save your favorite wallet addresses to withdraw in one tap
              </p>
            </div>
          ) : (
            filteredWallets.map((wallet) => (
              <div
                key={wallet.id}
                className="figma-addressbook-item"
                onClick={() => handleEditWallet(wallet)}
              >
                <div className="figma-addressbook-item-icon">
                  {CURRENCY_ICONS[wallet.currency] || CURRENCY_ICONS['USDT']}
                </div>
                <div className="figma-addressbook-item-info">
                  <span className="figma-addressbook-item-label">{wallet.label}</span>
                  <span className="figma-addressbook-item-currency">{wallet.currency}</span>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M7.74408 4.40996C8.04917 4.10486 8.53167 4.08604 8.85899 4.35299L8.92246 4.40996L13.9225 9.40996C14.2479 9.7354 14.2479 10.2629 13.9225 10.5883L8.92246 15.5883C8.59703 15.9138 8.06951 15.9138 7.74408 15.5883C7.41864 15.2629 7.41864 14.7354 7.74408 14.41L12.1549 9.99915L7.74408 5.58835L7.68711 5.52487C7.42015 5.19756 7.43898 4.71506 7.74408 4.40996Z" fill="#8F8C9C" />
                </svg>
              </div>
            ))
          )}
        </div>

        {/* Add Button */}
        <button className="figma-addressbook-add-btn" onClick={handleAddNew}>
          Add on-chain address
        </button>
      </div>

      {/* Bottom spacing for nav */}
      {/* <div style={{ height: 100 }} /> */}
    </div>
  );
}
