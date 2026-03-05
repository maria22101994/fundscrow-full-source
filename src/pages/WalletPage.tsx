import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWalletStore } from '@/store';
import { WithdrawMethodModal, NoKycDetailModal } from '@/components/withdraw';

// --- Currency Icons (Figma Exact) ---
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
    <path d="M16.2 7l-1.1 6.9-3.1 1.2.4 1.7 2.6-1-1.8 7.2h11.3l.7-2.8h-7.5l1.2-4.7 3.1-1.2-.4-1.7-2.6 1L20.1 7h-3.9z" fill="white" />
  </svg>
);

const CURRENCY_INFO: Record<string, { icon: React.ReactNode; name: string; fullName: string }> = {
  USDT: { icon: <CoinUsdt />, name: 'USDT', fullName: 'TetherUS' },
  USDT_TRC20: { icon: <CoinUsdt />, name: 'USDT', fullName: 'TetherUS' },
  BTC: { icon: <CoinBtc />, name: 'BTC', fullName: 'Bitcoin' },
  ETH: { icon: <CoinEth />, name: 'ETH', fullName: 'Ethereum' },
  LTC: { icon: <CoinLtc />, name: 'LTC', fullName: 'Litecoin' },
};

export function WalletPage() {
  const navigate = useNavigate();
  const { balances, fetchBalances, isLoading } = useWalletStore();

  const [prices, setPrices] = useState<Record<string, number>>({
    USDT: 1, BTC: 100000, ETH: 3300, LTC: 100,
  });

  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showNoKycModal, setShowNoKycModal] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<string>('USDT');

  // Set this to true/false depending on if the user has completed the card setup
  const isCardUnlocked = false; 

  const handleWithdrawClick = (currency: string) => {
    setSelectedCurrency(currency);
    setShowWithdrawModal(true);
  };

const handleSelectMethod = (method: 'nokyc' | 'bank' | 'onchain') => {
  setShowWithdrawModal(false);

  if (method === 'nokyc') {
    if (isCardUnlocked) {
      navigate('/off-ramp-addresses');
    } else {
      setShowNoKycModal(true);
    }
    return;
  }

  if (method === 'bank') {
    navigate('/withdraw'); 
  } else if (method === 'onchain') {
    // FIX: Uncomment and use the selectedCurrency state here
    navigate(`/withdraw?currency=${selectedCurrency}`);
  }
};

  const handleLearnMore = () => {
    setShowWithdrawModal(false);
    setShowNoKycModal(true);
  };

  const handleGetStarted = () => {
    setShowNoKycModal(false);
    navigate('/nokyc-onboarding');
  };

  useEffect(() => { fetchBalances(); }, [fetchBalances]);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,litecoin,tether&vs_currencies=usd');
        if (res.ok) {
          const data = await res.json();
          setPrices({
            USDT: data.tether?.usd || 1,
            BTC: data.bitcoin?.usd || 100000,
            ETH: data.ethereum?.usd || 3300,
            LTC: data.litecoin?.usd || 100,
          });
        }
      } catch (err) { console.error(err); }
    };
    fetchPrices();
  }, []);

  const getBalance = (currency: string) => {
    const balance = balances.find(b => b.currency === currency || (currency === 'USDT' && b.currency === 'USDT_TRC20'));
    return balance?.total || '0';
  };

  const getUsdValue = (currency: string, balance: string) => {
    const amount = parseFloat(balance);
    const value = (currency === 'USDT' || currency === 'USDT_TRC20') ? amount : amount * (prices[currency] || 0);
    return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const totalBalance = balances.reduce((acc, b) => {
    const amount = parseFloat(b.total || '0');
    if (b.currency === 'USDT' || b.currency === 'USDT_TRC20') return acc + amount;
    if (b.currency === 'BTC') return acc + amount * prices.BTC;
    if (b.currency === 'ETH') return acc + amount * prices.ETH;
    if (b.currency === 'LTC') return acc + amount * prices.LTC;
    return acc;
  }, 0);

  const currencies = ['USDT', 'BTC', 'ETH', 'LTC'];

  return (
    <div className="figma-wallet">
      <div className="figma-home-v3-bg-1" />
      <div className="figma-home-v3-bg-2" />
      
      <div className="figma-wallet-header">
        <button className="figma-wallet-back" onClick={() => navigate(-1)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M9.66135 4.72394C10.054 4.40371 10.6331 4.42659 10.9992 4.7923C11.3653 5.1584 11.3879 5.73742 11.0676 6.13019L10.9992 6.20636L6.20529 11.0003H20.0022C20.5545 11.0003 21.0022 11.448 21.0022 12.0003C21.002 12.5524 20.5543 13.0003 20.0022 13.0003H6.20725L10.9992 17.7923C11.3898 18.1828 11.3897 18.8158 10.9992 19.2064C10.6087 19.5969 9.9757 19.5969 9.58518 19.2064L3.43869 13.0599L3.33615 12.9456C2.88807 12.3958 2.88782 11.6028 3.33615 11.053L3.43869 10.9388L9.58518 4.7923L9.66135 4.72394Z" fill="white" /></svg>
        </button>
        <h1 className="figma-wallet-title">My wallet</h1>
        <button className="figma-wallet-history" onClick={() => navigate('/activity')}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="white" strokeWidth="2" /><path d="M12 7v5l3 3" stroke="white" strokeWidth="2" strokeLinecap="round" /></svg>
        </button>
      </div>

      <div className="figma-wallet-balance">
        <span className="figma-wallet-balance-label">Escrow balance</span>
        <div className="figma-wallet-balance-row">
          <span className="figma-wallet-balance-amount">{totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          <span className="figma-wallet-balance-currency">USDT</span>
        </div>
      </div>

      <div className="figma-wallet-currencies">
        {isLoading ? (
          <div className="figma-wallet-loading"><div className="figma-wallet-spinner" /></div>
        ) : (
          currencies.map((currency) => {
            const info = CURRENCY_INFO[currency];
            const balance = getBalance(currency);
            const usdValue = getUsdValue(currency, balance);
            const numericUsdValue = parseFloat(usdValue.replace(/,/g, ''));

            return (
              <div key={currency} className="figma-wallet-card">
                <div className="figma-wallet-card-top">
                  <div className="figma-wallet-card-info">
                    {info.icon}
                    <div className="figma-wallet-card-names">
                      <span className="figma-wallet-card-name">{info.name}</span>
                      <span className="figma-wallet-card-fullname">{info.fullName}</span>
                    </div>
                  </div>
                  <div className="figma-wallet-card-balance">
                    <span className="figma-wallet-card-amount">
                      {currency === 'USDT' ? parseFloat(balance).toFixed(2) : parseFloat(balance).toFixed(3).replace('.', ',')}
                    </span>
                    <span className="figma-wallet-card-usd">{usdValue} USDT</span>
                  </div>
                </div>

                <div className="figma-wallet-card-actions">
                  <button className="figma-wallet-btn figma-wallet-btn--deposit" onClick={() => navigate(`/deposit?currency=${currency}`)}>
                    Deposit
                  </button>
                  <button 
                    className={`figma-wallet-btn figma-wallet-btn--withdraw ${numericUsdValue <= 0 ? 'depocp' : ''}`}
                    onClick={() => handleWithdrawClick(currency)}
                    // Removed 'disabled' entirely so it opens even when 0
                  >
                    Withdraw
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path d="M6.21789 3.75414C5.83984 3.79254 5.54484 4.1118 5.54462 4.49992C5.54462 4.88822 5.83973 5.20726 6.21789 5.2457L6.29454 5.24984L11.6899 5.24984L4.59272 12.3471C4.29982 12.64 4.29982 13.1148 4.59272 13.4077C4.88562 13.7005 5.36054 13.7006 5.65338 13.4077L12.7496 6.31154V11.7049C12.7496 12.1191 13.0853 12.4548 13.4995 12.4548C13.9137 12.4548 14.2494 12.1191 14.2494 11.7049V4.87488L14.2432 4.75991C14.1892 4.23067 13.7688 3.80998 13.2395 3.75621L13.1245 3.75L6.29454 3.75L6.21789 3.75414Z" fill="white" fillOpacity="0.72" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <WithdrawMethodModal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        onSelectMethod={handleSelectMethod}
        onLearnMore={handleLearnMore}
        isCardUnlocked={isCardUnlocked} 
      />

      <NoKycDetailModal
        isOpen={showNoKycModal}
        onClose={() => setShowNoKycModal(false)}
        onGetStarted={handleGetStarted}
      />
    </div>
  );
}