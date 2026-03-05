import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

// Icons
const BackIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M9.66135 4.72394C10.054 4.40371 10.6331 4.42659 10.9992 4.7923C11.3653 5.1584 11.3879 5.73742 11.0676 6.13019L10.9992 6.20636L6.20529 11.0003H20.0022C20.5545 11.0003 21.0022 11.448 21.0022 12.0003C21.002 12.5524 20.5543 13.0003 20.0022 13.0003H6.20725L10.9992 17.7923C11.3898 18.1828 11.3897 18.8158 10.9992 19.2064C10.6087 19.5969 9.9757 19.5969 9.58518 19.2064L3.43869 13.0599L3.33615 12.9456C2.88807 12.3958 2.88782 11.6028 3.33615 11.053L3.43869 10.9388L9.58518 4.7923L9.66135 4.72394Z" fill="white"/>
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 9l6 6 6-6" />
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const BankIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3" />
  </svg>
);

const CardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
    <line x1="1" y1="10" x2="23" y2="10" />
  </svg>
);

const InfoIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

// Currency data
const FIAT_CURRENCIES = [
  { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺' },
  { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸' },
  { code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧' },
];

const CRYPTO_CURRENCIES = [
  { code: 'USDT', symbol: '₮', name: 'Tether', color: '#26A17B', coingeckoId: 'tether' },
  { code: 'BTC', symbol: '₿', name: 'Bitcoin', color: '#F7931A', coingeckoId: 'bitcoin' },
  { code: 'ETH', symbol: 'Ξ', name: 'Ethereum', color: '#627EEA', coingeckoId: 'ethereum' },
];

// Crypto prices in USD (will be fetched from API)
interface CryptoPrices {
  USDT: number;
  BTC: number;
  ETH: number;
}

// Fiat rates relative to USD
const FIAT_TO_USD: Record<string, number> = {
  USD: 1.0,
  EUR: 1.08, // 1 EUR = 1.08 USD
  GBP: 1.27, // 1 GBP = 1.27 USD
};

type PaymentMethod = 'bank' | 'card';
type Mode = 'buy' | 'sell';

export function BuySellPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const initialMode = (searchParams.get('mode') as Mode) || 'buy';
  const initialCrypto = searchParams.get('crypto') || 'USDT';
  
  const [mode, setMode] = useState<Mode>(initialMode);
  const [amount, setAmount] = useState('');
  const [fiatCurrency, setFiatCurrency] = useState(FIAT_CURRENCIES[0]);
  const [cryptoCurrency, setCryptoCurrency] = useState(
    CRYPTO_CURRENCIES.find(c => c.code === initialCrypto) || CRYPTO_CURRENCIES[0]
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [showFiatPicker, setShowFiatPicker] = useState(false);
  const [showCryptoPicker, setShowCryptoPicker] = useState(false);
  const [showFees, setShowFees] = useState(false);
  
  // Real-time crypto prices
  const [cryptoPrices, setCryptoPrices] = useState<CryptoPrices>({
    USDT: 1.0,
    BTC: 100000,
    ETH: 3300,
  });
  const [pricesLoading, setPricesLoading] = useState(true);
  const [pricesError, setPricesError] = useState<string | null>(null);

  // Fetch real prices from CoinGecko
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        setPricesLoading(true);
        setPricesError(null);
        
        const response = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,tether&vs_currencies=usd'
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch prices');
        }
        
        const data = await response.json();
        
        setCryptoPrices({
          USDT: data.tether?.usd || 1.0,
          BTC: data.bitcoin?.usd || 100000,
          ETH: data.ethereum?.usd || 3300,
        });
      } catch (err) {
        console.error('Price fetch error:', err);
        setPricesError('Unable to fetch live prices');
        // Keep using cached/default prices
      } finally {
        setPricesLoading(false);
      }
    };

    fetchPrices();
    // Refresh prices every 30 seconds
    const interval = setInterval(fetchPrices, 30000);
    return () => clearInterval(interval);
  }, []);

  // Calculate estimates using real prices
  const numAmount = parseFloat(amount) || 0;
  
  const calculations = useMemo(() => {
    if (numAmount <= 0) {
      return { receiveAmount: 0, fee: 0, rate: 0 };
    }

    const cryptoCode = cryptoCurrency.code as keyof CryptoPrices;
    const cryptoPriceInUsd = cryptoPrices[cryptoCode];
    const fiatToUsd = FIAT_TO_USD[fiatCurrency.code] || 1;
    
    // Price of 1 crypto in selected fiat
    const cryptoPriceInFiat = cryptoPriceInUsd / fiatToUsd;

    if (mode === 'buy') {
      // Buying crypto with fiat
      // User pays X fiat, receives Y crypto
      const feePercent = paymentMethod === 'card' ? 0.035 : 0.01; // 3.5% card, 1% bank
      const fee = numAmount * feePercent;
      const netAmountFiat = numAmount - fee;
      const receiveAmount = netAmountFiat / cryptoPriceInFiat;
      return { receiveAmount, fee, rate: cryptoPriceInFiat };
    } else {
      // Selling crypto for fiat
      // User sells X crypto, receives Y fiat
      const grossFiat = numAmount * cryptoPriceInFiat;
      const feePercent = paymentMethod === 'card' ? 0.035 : 0.01;
      const fee = grossFiat * feePercent;
      const receiveAmount = grossFiat - fee;
      return { receiveAmount, fee, rate: cryptoPriceInFiat };
    }
  }, [numAmount, mode, fiatCurrency, cryptoCurrency, paymentMethod, cryptoPrices]);

  // Format numbers
  const formatCrypto = (value: number) => {
    if (value === 0) return '0';
    if (value < 0.0001) return value.toExponential(4);
    if (value < 1) return value.toFixed(8);
    return value.toFixed(6);
  };

  const formatFiat = (value: number) => {
    return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Get display values based on mode
  const payLabel = mode === 'buy' ? 'You pay' : 'You sell';
  const receiveLabel = mode === 'buy' ? 'You receive (estimate)' : 'You receive (estimate)';
  // These are kept for future use in currency display
  const _payCurrency = mode === 'buy' ? fiatCurrency : cryptoCurrency;
  const _receiveCurrency = mode === 'buy' ? cryptoCurrency : fiatCurrency;
  void _payCurrency; void _receiveCurrency; // suppress unused warnings
  const buttonText = mode === 'buy' ? 'Buy now' : 'Sell now';

  const displayRate = `1 ${cryptoCurrency.code} = ${formatFiat(calculations.rate)} ${fiatCurrency.code}`;

  const isValidAmount = numAmount > 0;
  const minAmount = mode === 'buy' ? 20 : 0.001;
  const isAboveMin = mode === 'buy' ? numAmount >= minAmount : numAmount >= minAmount;

  return (
    <div className="buysell-page">
      {/* Header */}
      <div className="buysell-header">
        <button onClick={() => navigate(-1)} className="buysell-back-btn">
          <BackIcon />
        </button>
        <h1 className="buysell-title">
          {mode === 'buy' ? 'Buy' : 'Sell'} {cryptoCurrency.code}
        </h1>
        <div className="buysell-spacer" />
      </div>

      <div className="buysell-content">
        {/* Buy/Sell Toggle */}
        <div className="buysell-toggle">
          <button
            className={`buysell-toggle-btn ${mode === 'buy' ? 'active' : ''}`}
            onClick={() => setMode('buy')}
          >
            Buy
          </button>
          <button
            className={`buysell-toggle-btn ${mode === 'sell' ? 'active' : ''}`}
            onClick={() => setMode('sell')}
          >
            Sell
          </button>
        </div>

        {/* Amount Input */}
        <div className="buysell-section">
          <label className="buysell-label">{payLabel}</label>
          <div className="buysell-input-row">
            <input
              type="number"
              inputMode="decimal"
              className="buysell-amount-input"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <button 
              className="buysell-currency-btn"
              onClick={() => mode === 'buy' ? setShowFiatPicker(true) : setShowCryptoPicker(true)}
            >
              {mode === 'buy' ? (
                <>
                  <span className="buysell-currency-flag">{fiatCurrency.flag}</span>
                  <span>{fiatCurrency.code}</span>
                </>
              ) : (
                <>
                  <span 
                    className="buysell-crypto-icon"
                    style={{ background: cryptoCurrency.color }}
                  >
                    {cryptoCurrency.symbol}
                  </span>
                  <span>{cryptoCurrency.code}</span>
                </>
              )}
              <ChevronDownIcon />
            </button>
          </div>
        </div>

        {/* Payment Method */}
        <div className="buysell-section">
          <label className="buysell-label">
            {mode === 'buy' ? 'Using payment method' : 'Withdraw method'}
          </label>
          
          <button
            className={`buysell-method-btn ${paymentMethod === 'bank' ? 'selected' : ''}`}
            onClick={() => setPaymentMethod('bank')}
          >
            <div className="buysell-method-left">
              <div className="buysell-method-icon">
                <BankIcon />
              </div>
              <span>Manual bank transfer</span>
            </div>
            <div className={`buysell-radio ${paymentMethod === 'bank' ? 'checked' : ''}`}>
              {paymentMethod === 'bank' && <CheckIcon />}
            </div>
          </button>

          <button
            className={`buysell-method-btn ${paymentMethod === 'card' ? 'selected' : ''}`}
            onClick={() => setPaymentMethod('card')}
          >
            <div className="buysell-method-left">
              <div className="buysell-method-icon visa">
                <CardIcon />
              </div>
              <span>Visa</span>
            </div>
            <div className={`buysell-radio ${paymentMethod === 'card' ? 'checked' : ''}`}>
              {paymentMethod === 'card' && <CheckIcon />}
            </div>
          </button>
        </div>

        {/* Fees Link */}
        <button 
          className="buysell-fees-link"
          onClick={() => setShowFees(!showFees)}
        >
          <span>See fees calculation</span>
          <InfoIcon />
        </button>

        {showFees && (
          <div className="buysell-fees-breakdown">
            <div className="buysell-fee-row">
              <span>Processing fee ({paymentMethod === 'card' ? '3.5%' : '1%'})</span>
              <span>
                {mode === 'buy' 
                  ? `${fiatCurrency.symbol}${formatFiat(calculations.fee)}`
                  : `${fiatCurrency.symbol}${formatFiat(calculations.fee)}`
                }
              </span>
            </div>
            <div className="buysell-fee-row">
              <span>Network fee</span>
              <span>Included</span>
            </div>
          </div>
        )}

        {/* Rate Info */}
        {isValidAmount && (
          <div className="buysell-rate-card">
            <div className="buysell-rate-row">
              <span className="buysell-rate-label">
                {pricesLoading ? 'Loading...' : displayRate}
              </span>
              <span className="buysell-rate-badge">
                {pricesError ? '⚠️ Cached' : '● Live'}
              </span>
            </div>
            <div className="buysell-rate-row">
              <span className="buysell-fee-text">
                {fiatCurrency.symbol}{formatFiat(calculations.fee)} {fiatCurrency.code}
              </span>
              <span className="buysell-fee-badge">Total fees</span>
            </div>
          </div>
        )}

        {/* Receive Estimate */}
        <div className="buysell-section">
          <label className="buysell-label">{receiveLabel}</label>
          <div className="buysell-receive-box">
            <span className="buysell-receive-amount">
              {mode === 'buy' 
                ? formatCrypto(calculations.receiveAmount)
                : formatFiat(calculations.receiveAmount)
              }
            </span>
            <div className="buysell-receive-currency">
              {mode === 'buy' ? (
                <>
                  <span 
                    className="buysell-crypto-icon"
                    style={{ background: cryptoCurrency.color }}
                  >
                    {cryptoCurrency.symbol}
                  </span>
                  <span>{cryptoCurrency.code}</span>
                </>
              ) : (
                <>
                  <span className="buysell-currency-flag">{fiatCurrency.flag}</span>
                  <span>{fiatCurrency.code}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <button
          className={`buysell-cta-btn ${(!isValidAmount || !isAboveMin) ? 'disabled' : ''}`}
          disabled={!isValidAmount || !isAboveMin}
          onClick={() => {
            navigate('/wallet');
          }}
        >
          {buttonText}
        </button>

        {!isAboveMin && numAmount > 0 && (
          <p className="buysell-min-text">
            Minimum amount: {mode === 'buy' ? `${fiatCurrency.symbol}${minAmount}` : `${minAmount} ${cryptoCurrency.code}`}
          </p>
        )}
      </div>

      {/* Fiat Currency Picker */}
      {showFiatPicker && (
        <div className="buysell-modal-overlay" onClick={() => setShowFiatPicker(false)}>
          <div className="buysell-modal" onClick={(e) => e.stopPropagation()}>
            <div className="buysell-modal-handle" />
            <h2 className="buysell-modal-title">Select currency</h2>
            
            {FIAT_CURRENCIES.map((currency) => (
              <button
                key={currency.code}
                className={`buysell-picker-item ${fiatCurrency.code === currency.code ? 'selected' : ''}`}
                onClick={() => {
                  setFiatCurrency(currency);
                  setShowFiatPicker(false);
                }}
              >
                <span className="buysell-picker-flag">{currency.flag}</span>
                <div className="buysell-picker-info">
                  <span className="buysell-picker-code">{currency.code}</span>
                  <span className="buysell-picker-name">{currency.name}</span>
                </div>
                <div className={`buysell-radio ${fiatCurrency.code === currency.code ? 'checked' : ''}`}>
                  {fiatCurrency.code === currency.code && <CheckIcon />}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Crypto Currency Picker */}
      {showCryptoPicker && (
        <div className="buysell-modal-overlay" onClick={() => setShowCryptoPicker(false)}>
          <div className="buysell-modal" onClick={(e) => e.stopPropagation()}>
            <div className="buysell-modal-handle" />
            <h2 className="buysell-modal-title">Select cryptocurrency</h2>
            
            {CRYPTO_CURRENCIES.map((currency) => (
              <button
                key={currency.code}
                className={`buysell-picker-item ${cryptoCurrency.code === currency.code ? 'selected' : ''}`}
                onClick={() => {
                  setCryptoCurrency(currency);
                  setShowCryptoPicker(false);
                }}
              >
                <span 
                  className="buysell-crypto-icon large"
                  style={{ background: currency.color }}
                >
                  {currency.symbol}
                </span>
                <div className="buysell-picker-info">
                  <span className="buysell-picker-code">{currency.code}</span>
                  <span className="buysell-picker-name">{currency.name}</span>
                </div>
                <div className={`buysell-radio ${cryptoCurrency.code === currency.code ? 'checked' : ''}`}>
                  {cryptoCurrency.code === currency.code && <CheckIcon />}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
