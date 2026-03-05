import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { openTransakOfframp } from '@/services/transak';
import { useAuthStore, useWalletStore, useUIStore } from '@/store';
import { api } from '@/services/api';
import type { Currency } from '@/types';

// Crypto coin icons
const CoinEth = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
    <circle cx="16" cy="16" r="16" fill="#627EEA"/>
    <path d="M16.498 4v8.87l7.497 3.35L16.498 4z" fill="white" fillOpacity="0.6"/>
    <path d="M16.498 4L9 16.22l7.498-3.35V4z" fill="white"/>
    <path d="M16.498 21.968v6.027l7.502-10.376-7.502 4.349z" fill="white" fillOpacity="0.6"/>
    <path d="M16.498 27.995v-6.028L9 17.62l7.498 10.376z" fill="white"/>
  </svg>
);

const CoinUsdt = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
    <circle cx="16" cy="16" r="16" fill="#26A17B"/>
    <path d="M17.922 17.383v-.002c-.11.008-.677.042-1.942.042-1.01 0-1.721-.03-1.971-.042v.003c-3.888-.171-6.79-.848-6.79-1.658 0-.809 2.902-1.486 6.79-1.66v2.644c.254.018.982.061 1.988.061 1.207 0 1.812-.05 1.926-.06v-2.643c3.88.173 6.775.85 6.775 1.658 0 .81-2.895 1.485-6.775 1.658zm0-3.59v-2.366h5.414V8.616H8.595v2.811h5.414v2.364c-4.4.202-7.709 1.074-7.709 2.118 0 1.044 3.309 1.915 7.709 2.118v7.582h3.913v-7.584c4.393-.202 7.694-1.073 7.694-2.116 0-1.043-3.301-1.914-7.694-2.117z" fill="white"/>
  </svg>
);

const CoinBtc = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
    <circle cx="16" cy="16" r="16" fill="#F7931A"/>
    <path d="M22.5 13.56c.313-2.088-1.28-3.212-3.456-3.962l.706-2.83-1.723-.43-.688 2.757c-.453-.113-.918-.22-1.382-.326l.692-2.773-1.722-.43-.707 2.83c-.375-.086-.743-.17-1.1-.259l.002-.01-2.376-.593-.459 1.84s1.28.293 1.252.312c.698.174.824.636.803 1.002l-.804 3.228c.048.012.11.03.179.057l-.182-.045-1.127 4.52c-.086.212-.302.53-.79.408.017.025-1.253-.313-1.253-.313l-.856 1.973 2.243.56c.417.104.826.214 1.229.316l-.715 2.872 1.722.43.707-2.835c.47.128.927.245 1.374.357l-.705 2.822 1.723.43.715-2.866c2.948.558 5.164.333 6.098-2.334.752-2.147-.037-3.385-1.588-4.193 1.13-.26 1.98-1.003 2.208-2.538z" fill="white"/>
  </svg>
);

const CoinEur = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
    <circle cx="16" cy="16" r="16" fill="#003399"/>
    <text x="16" y="21" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold">€</text>
  </svg>
);

type PaymentMethod = 'sepa' | 'visa';

const CURRENCY_ICONS: Record<string, React.ReactNode> = {
  ETH: <CoinEth />,
  USDT: <CoinUsdt />,
  BTC: <CoinBtc />,
  EUR: <CoinEur />,
};

// Mock exchange rates
const RATES: Record<string, number> = {
  ETH: 2512.82,
  BTC: 94500,
  USDT: 0.92,
};

export function OfframpPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { balances } = useWalletStore();
  const { addToast } = useUIStore();

  const [amount, setAmount] = useState('0.1776236');
  const [cryptoCurrency, setCryptoCurrency] = useState<Currency>('ETH');
  const [fiatCurrency, setFiatCurrency] = useState('EUR');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('visa');
  const [isLoading, setIsLoading] = useState(false);
  const [showCryptoDropdown, setShowCryptoDropdown] = useState(false);
  const [showFiatDropdown, setShowFiatDropdown] = useState(false);

  const balance = balances.find((b) => b.currency === cryptoCurrency);
  const availableAmount = parseFloat(balance?.available || '0');
  const enteredAmount = parseFloat(amount || '0');

  // Calculate rates and fees
  const rate = RATES[cryptoCurrency] || 1;
  const totalFees = 3; // EUR
  const estimatedReceive = (enteredAmount * rate) - totalFees;

  const isValidAmount = enteredAmount > 0 && enteredAmount <= availableAmount;

  useEffect(() => {
    // Close dropdowns on outside click
    const handleClick = () => {
      setShowCryptoDropdown(false);
      setShowFiatDropdown(false);
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const handleOfframp = useCallback(async () => {
    if (!isValidAmount || !user) return;

    setIsLoading(true);

    try {
      const { id, walletAddress } = await api.createOfframpTransaction({
        amount,
        currency: cryptoCurrency,
      });

      await openTransakOfframp({
        amount: enteredAmount,
        currency: cryptoCurrency,
        walletAddress,
        userId: user.id.toString(),
        orderId: id,
        onSuccess: () => {
          addToast('Withdrawal initiated successfully!', 'success');
          navigate('/');
        },
        onError: (error) => {
          addToast(`Withdrawal failed: ${error.message}`, 'error');
        },
        onClose: () => {
          setIsLoading(false);
        },
      });
    } catch (error) {
      addToast(`Failed to initiate withdrawal: ${(error as Error).message}`, 'error');
      setIsLoading(false);
    }
  }, [amount, cryptoCurrency, enteredAmount, isValidAmount, user, navigate, addToast]);

  return (
    <div className="figma-sell">
      {/* Header */}
      <div className="figma-sell-header">
        <button className="figma-sell-back" onClick={() => navigate(-1)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M9.66135 4.72394C10.054 4.40371 10.6331 4.42659 10.9992 4.7923C11.3653 5.1584 11.3879 5.73742 11.0676 6.13019L10.9992 6.20636L6.20529 11.0003H20.0022C20.5545 11.0003 21.0022 11.448 21.0022 12.0003C21.002 12.5524 20.5543 13.0003 20.0022 13.0003H6.20725L10.9992 17.7923C11.3898 18.1828 11.3897 18.8158 10.9992 19.2064C10.6087 19.5969 9.9757 19.5969 9.58518 19.2064L3.43869 13.0599L3.33615 12.9456C2.88807 12.3958 2.88782 11.6028 3.33615 11.053L3.43869 10.9388L9.58518 4.7923L9.66135 4.72394Z" fill="white"/>
          </svg>
        </button>
        <h1 className="figma-sell-title">Withdraw {cryptoCurrency}</h1>
        <div style={{ width: 24 }} />
      </div>

      {/* Form */}
      <div className="figma-sell-form">
        {/* You Pay Section */}
        <div className="figma-sell-section">
          <label className="figma-sell-label">You pay</label>
          <div className="figma-sell-input-row">
            <input
              type="text"
              inputMode="decimal"
              className="figma-sell-input"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
            />
            <button
              className="figma-sell-currency-btn"
              onClick={(e) => { e.stopPropagation(); setShowCryptoDropdown(!showCryptoDropdown); }}
            >
              {CURRENCY_ICONS[cryptoCurrency]}
              <span className="figma-sell-currency-name">{cryptoCurrency}</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M6 9L12 15L18 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="figma-sell-currency-network">ethereum</span>
            </button>
            {showCryptoDropdown && (
              <div className="figma-sell-dropdown">
                {['ETH', 'USDT', 'BTC'].map(c => (
                  <button key={c} className="figma-sell-dropdown-item" onClick={() => { setCryptoCurrency(c as Currency); setShowCryptoDropdown(false); }}>
                    {CURRENCY_ICONS[c]}
                    <span>{c}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Rate and Fees */}
        <div className="figma-sell-details">
          <div className="figma-sell-detail-row">
            <div className="figma-sell-step-dot" />
            <div className="figma-sell-detail-content">
              <div className="figma-sell-rate-row">
                <span className="figma-sell-rate">1 {cryptoCurrency} = {rate.toLocaleString()} {fiatCurrency}</span>
                <span className="figma-sell-rate-label">Rate</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="rgba(255,255,255,0.64)" strokeWidth="2"/>
                  <path d="M12 8v4M12 16h.01" stroke="rgba(255,255,255,0.64)" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <span className="figma-sell-fee-link">See fees calculation</span>
            </div>
          </div>

          <div className="figma-sell-detail-row">
            <div className="figma-sell-step-dot" />
            <div className="figma-sell-detail-content">
              <div className="figma-sell-fees-row">
                <span className="figma-sell-fees">{totalFees} {fiatCurrency}</span>
                <span className="figma-sell-fees-label">Total fees</span>
              </div>

              {/* Withdraw Method */}
              <div className="figma-sell-method-section">
                <span className="figma-sell-method-title">Withdraw method</span>
                <div className="figma-sell-methods">
                  <button
                    className={`figma-sell-method ${paymentMethod === 'sepa' ? 'figma-sell-method--active' : ''}`}
                    onClick={() => setPaymentMethod('sepa')}
                  >
                    <div className="figma-sell-method-logo figma-sell-method-logo--sepa">
                      <span style={{ fontSize: 10, fontWeight: 700, color: '#003399' }}>SEPA</span>
                    </div>
                    <span className="figma-sell-method-name">Manual bank Transfer</span>
                    <div className={`figma-sell-radio ${paymentMethod === 'sepa' ? 'figma-sell-radio--selected' : ''}`} />
                  </button>
                  <button
                    className={`figma-sell-method ${paymentMethod === 'visa' ? 'figma-sell-method--active' : ''}`}
                    onClick={() => setPaymentMethod('visa')}
                  >
                    <div className="figma-sell-method-logo figma-sell-method-logo--visa">
                      <span style={{ fontSize: 10, fontWeight: 700, color: '#1A1F71' }}>VISA</span>
                    </div>
                    <span className="figma-sell-method-name">Visa</span>
                    <div className={`figma-sell-radio ${paymentMethod === 'visa' ? 'figma-sell-radio--selected' : ''}`} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* You Receive Section */}
        <div className="figma-sell-section">
          <label className="figma-sell-label">You receive (estimate)</label>
          <div className="figma-sell-input-row">
            <input
              type="text"
              className="figma-sell-input figma-sell-input--readonly"
              value={estimatedReceive > 0 ? estimatedReceive.toFixed(2) : '0.00'}
              readOnly
            />
            <button
              className="figma-sell-currency-btn figma-sell-currency-btn--fiat"
              onClick={(e) => { e.stopPropagation(); setShowFiatDropdown(!showFiatDropdown); }}
            >
              {CURRENCY_ICONS[fiatCurrency]}
              <span className="figma-sell-currency-name">{fiatCurrency}</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M6 9L12 15L18 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            {showFiatDropdown && (
              <div className="figma-sell-dropdown figma-sell-dropdown--fiat">
                {['EUR', 'USD', 'GBP'].map(c => (
                  <button key={c} className="figma-sell-dropdown-item" onClick={() => { setFiatCurrency(c); setShowFiatDropdown(false); }}>
                    <span>{c}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Transak Promotional Banner */}
        <div className="figma-sell-promo">
          <div className="figma-sell-promo-content">
            <h3 className="figma-sell-promo-title">Transak Off-Ramp Stream</h3>
            <p className="figma-sell-promo-subtitle">One Click to Convert Crypto to Fiat</p>
            <button className="figma-sell-promo-btn">
              Explore now
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14M14 5l7 7-7 7" stroke="#0e0d1f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
          <div className="figma-sell-promo-icon">
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
              <circle cx="40" cy="40" r="35" fill="rgba(194,255,10,0.2)"/>
              <circle cx="40" cy="40" r="25" fill="#C2FF0A"/>
              <text x="40" y="46" textAnchor="middle" fill="#0e0d1f" fontSize="24" fontWeight="bold">$</text>
            </svg>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="figma-sell-footer">
        <button
          className="figma-sell-cta"
          disabled={!isValidAmount || isLoading}
          onClick={handleOfframp}
        >
          {isLoading ? (
            <div className="figma-sell-spinner" />
          ) : (
            'Sell now'
          )}
        </button>
      </div>
    </div>
  );
}
