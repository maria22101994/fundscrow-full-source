import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { useWalletStore, useAddressBookStore, useAuthStore, useUIStore } from '@/store';
import { CURRENCIES } from '@/config/constants';
import { api } from '@/services/api';
import { validateWalletAddress } from '@/lib/utils';
import type { Currency } from '@/types';
import { NoKycDetailModal } from '@/components/withdraw';

const SUPPORTED_CRYPTO = [
  { symbol: 'USDT', name: 'USDT', coingeckoId: 'tether', icon: 'USDT' },
  { symbol: 'USDT_TRC20', name: 'USDT (TRC20)', coingeckoId: 'tether', icon: 'USDT' },
  { symbol: 'BTC', name: 'Bitcoin', coingeckoId: 'bitcoin', icon: 'BTC' },
  { symbol: 'ETH', name: 'Ethereum', coingeckoId: 'ethereum', icon: 'ETH' },
] as const;
const SUPPORTED_FIAT = [
  { symbol: 'USDT',       code: 'USDT',   name: 'USDT',       coingeckoId: 'tether', icon: 'USDT' },
  { symbol: 'USDT_TRC20', code: 'USDT',   name: 'USDT (TRC20)', coingeckoId: 'tether', icon: 'USDT' },
  { symbol: 'BTC',        code: 'BTC',    name: 'Bitcoin',    coingeckoId: 'bitcoin', icon: 'BTC' },
  { symbol: 'ETH',        code: 'ETH',    name: 'Ethereum',   coingeckoId: 'ethereum', icon: 'ETH' },
] as const;

type FiatOption = typeof SUPPORTED_FIAT[number];
// Icons
const BackIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M9.66135 4.72394C10.054 4.40371 10.6331 4.42659 10.9992 4.7923C11.3653 5.1584 11.3879 5.73742 11.0676 6.13019L10.9992 6.20636L6.20529 11.0003H20.0022C20.5545 11.0003 21.0022 11.448 21.0022 12.0003C21.002 12.5524 20.5543 13.0003 20.0022 13.0003H6.20725L10.9992 17.7923C11.3898 18.1828 11.3897 18.8158 10.9992 19.2064C10.6087 19.5969 9.9757 19.5969 9.58518 19.2064L3.43869 13.0599L3.33615 12.9456C2.88807 12.3958 2.88782 11.6028 3.33615 11.053L3.43869 10.9388L9.58518 4.7923L9.66135 4.72394Z" fill="white" />
  </svg>
);
const ChevronRightIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18l6-6-6-6" />
  </svg>
);
// Image picker icon (Figma exact)
const ImageIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="5" width="18" height="14" rx="2" stroke="white" strokeWidth="1.5" />
    <circle cx="8.5" cy="10.5" r="1.5" stroke="white" strokeWidth="1.5" />
    <path d="M21 15L16 10L6 19" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
// Edit/pencil icon for "Enter code manually" (Figma exact)
const EditIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M13.5 2.25L15.75 4.5L5.25 15H3V12.75L13.5 2.25Z" stroke="#BFED33" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
// Checkbox unchecked icon (Figma exact)
const CheckboxUnchecked = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <rect x="1" y="1" width="18" height="18" rx="4" stroke="rgba(255,255,255,0.56)" strokeWidth="1.5" />
  </svg>
);
// Checkbox checked icon (Figma exact)
const CheckboxChecked = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <rect x="1" y="1" width="18" height="18" rx="4" fill="#BFED33" />
    <path d="M6 10L9 13L14 7" stroke="#221E37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
// Success checkmark icon (Figma exact - large animated style)
const SuccessCheckIcon = () => (
  <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
    <defs>
      <linearGradient id="successGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#BFED33" />
        <stop offset="100%" stopColor="#627EEA" />
      </linearGradient>
    </defs>
    <circle cx="60" cy="60" r="50" fill="url(#successGradient)" opacity="0.9" />
    <circle cx="60" cy="60" r="40" fill="rgba(255,255,255,0.15)" />
    <path d="M40 60L55 75L80 45" stroke="#BFED33" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
// Sparkle decoration for success screen
const Sparkles = () => (
  <svg width="200" height="200" viewBox="0 0 200 200" fill="none" style={{ position: 'absolute', top: -40, left: -40 }}>
    <line x1="20" y1="30" x2="30" y2="30" stroke="#BFED33" strokeWidth="2" strokeLinecap="round" />
    <line x1="25" y1="25" x2="25" y2="35" stroke="#BFED33" strokeWidth="2" strokeLinecap="round" />
    <line x1="170" y1="50" x2="180" y2="50" stroke="#627EEA" strokeWidth="2" strokeLinecap="round" />
    <line x1="175" y1="45" x2="175" y2="55" stroke="#627EEA" strokeWidth="2" strokeLinecap="round" />
    <line x1="40" y1="160" x2="48" y2="160" stroke="#BFED33" strokeWidth="2" strokeLinecap="round" />
    <line x1="44" y1="156" x2="44" y2="164" stroke="#BFED33" strokeWidth="2" strokeLinecap="round" />
    <line x1="160" y1="140" x2="166" y2="140" stroke="#627EEA" strokeWidth="2" strokeLinecap="round" />
    <line x1="163" y1="137" x2="163" y2="143" stroke="#627EEA" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
// Modal Icons (Figma exact)
const ModalCardIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <rect x="2" y="4" width="20" height="14" rx="2" stroke="white" strokeWidth="1.5" />
    <path d="M2 9H22" stroke="white" strokeWidth="1.5" />
    <path d="M6 14H10" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);
const ModalBankIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M3 21H21" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M3 10H21" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M5 6L12 3L19 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4 10V21" stroke="white" strokeWidth="1.5" />
    <path d="M20 10V21" stroke="white" strokeWidth="1.5" />
    <path d="M8 14V17" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M12 14V17" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M16 14V17" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);
const ModalChainIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="3" width="7" height="7" rx="1" stroke="white" strokeWidth="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1" stroke="white" strokeWidth="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1" stroke="white" strokeWidth="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1" stroke="white" strokeWidth="1.5" />
    <path d="M10 6.5H14" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M10 17.5H14" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M6.5 10V14" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M17.5 10V14" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);
// Tron Network Icon (Figma exact)
const TronIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="12" fill="#FF0013" />
    <path d="M17.7 7.8L12.5 4.2C12.2 4 11.8 4 11.5 4.2L6.3 7.8C6.1 7.9 6 8.2 6.1 8.4L11.3 19.6C11.4 19.9 11.7 20 12 20C12.3 20 12.6 19.9 12.7 19.6L17.9 8.4C18 8.2 17.9 7.9 17.7 7.8ZM12 17.5L8.2 9L12 6.5L15.8 9L12 17.5Z" fill="white" />
  </svg>
);
// Scan QR Icon (Figma exact - for address input)
const ScanQrIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M3 7V5C3 3.89543 3.89543 3 5 3H7" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M17 3H19C20.1046 3 21 3.89543 21 5V7" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M21 17V19C21 20.1046 20.1046 21 19 21H17" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M7 21H5C3.89543 21 3 20.1046 3 19V17" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M7 12H17" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);
// Address Book Icon (Figma exact)
const AddressBookIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="8" r="4" stroke="white" strokeWidth="1.5" />
    <path d="M5 20C5 16.134 8.13401 13 12 13C15.866 13 19 16.134 19 20" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);
// Currency Icon Component
const CurrencyIcon = ({ currency, size = 40 }: { currency: string; size?: number }) => {
  if (currency === 'USDT' || currency === 'USDT_TRC20') {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={{ flexShrink: 0 }}>
        <circle cx="16" cy="16" r="16" fill="#26A17B" />
        <path d="M17.922 17.383v-.002c-.11.008-.677.042-1.942.042-1.01 0-1.721-.03-1.971-.042v.003c-3.888-.171-6.79-.848-6.79-1.658 0-.809 2.902-1.486 6.79-1.66v2.644c.254.018.982.061 1.988.061 1.207 0 1.812-.05 1.925-.06v-2.643c3.88.173 6.775.85 6.775 1.658 0 .81-2.895 1.485-6.775 1.657m0-3.59v-2.366h5.414V7.819H8.595v3.608h5.414v2.365c-4.4.202-7.709 1.074-7.709 2.118 0 1.044 3.309 1.915 7.709 2.118v7.582h3.913v-7.584c4.393-.202 7.694-1.073 7.694-2.116 0-1.043-3.301-1.914-7.694-2.117" fill="#fff" />
      </svg>
    );
  }
  if (currency === 'BTC') {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={{ flexShrink: 0 }}>
        <circle cx="16" cy="16" r="16" fill="#F7931A" />
        <path d="M22.5 13.5c.3-2-1.2-3.1-3.3-3.8l.7-2.7-1.6-.4-.7 2.6c-.4-.1-.8-.2-1.3-.3l.7-2.6-1.6-.4-.7 2.7c-.3-.1-.7-.2-1-.2v-.1l-2.3-.6-.4 1.7s1.2.3 1.2.3c.7.2.8.6.8 1l-.8 3.2c0 0 .1 0 .2.1h-.2l-1.1 4.5c-.1.2-.3.5-.8.4 0 0-1.2-.3-1.2-.3l-.8 1.9 2.1.5c.4.1.8.2 1.2.3l-.7 2.8 1.6.4.7-2.7c.4.1.9.2 1.3.3l-.7 2.7 1.6.4.7-2.8c2.9.5 5.1.3 6-2.3.7-2.1 0-3.3-1.5-4.1 1.1-.3 1.9-1 2.1-2.5zm-3.8 5.3c-.5 2.1-4.1 1-5.2.7l.9-3.8c1.2.3 4.9.9 4.3 3.1zm.6-5.4c-.5 1.9-3.4.9-4.4.7l.8-3.4c1 .2 4.1.7 3.6 2.7z" fill="#fff" />
      </svg>
    );
  }
  if (currency === 'ETH') {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={{ flexShrink: 0 }}>
        <circle cx="16" cy="16" r="16" fill="#627EEA" />
        <path d="M16 4v8.87l7.5 3.35L16 4z" fill="#fff" fillOpacity=".6" />
        <path d="M16 4L8.5 16.22 16 12.87V4z" fill="#fff" />
        <path d="M16 21.97v6.03l7.5-10.4L16 21.97z" fill="#fff" fillOpacity=".6" />
        <path d="M16 28v-6.03L8.5 17.6 16 28z" fill="#fff" />
        <path d="M16 20.57l7.5-4.35L16 12.87v7.7z" fill="#fff" fillOpacity=".2" />
        <path d="M8.5 16.22l7.5 4.35v-7.7l-7.5 3.35z" fill="#fff" fillOpacity=".6" />
      </svg>
    );
  }
  if (currency === 'LTC') {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={{ flexShrink: 0 }}>
        <circle cx="16" cy="16" r="16" fill="#345D9D" />
        <path d="M12.5 24h10.8l.8-3h-6.5l1.8-6.8 2.5-.9.5-2-2.5.9L21.5 6h-4l-2.3 9.1-2.5.9-.5 2 2.5-.9L12.5 24z" fill="#fff" />
      </svg>
    );
  }
  return (
    <div
      style={{
        background: '#6B6B80',
        width: size,
        height: size,
        fontSize: size * 0.45,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontWeight: 700,
        flexShrink: 0,
      }}
    >
      {'?'}
    </div>
  );
};
type WithdrawMethod = 'visa_nokyc' | 'bank_kyc' | 'onchain';
type ViewState = 'select' | 'visa_nokyc' | 'bank_kyc' | 'onchain';
// KYC Step type
type KYCStep = 'welcome' | 'code' | 'sell' | 'personal' | 'address' | 'purpose' | 'verification';
// Info Icon
const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M7 20H11C11 21.1 10.1 22 9 22C7.9 22 7 21.1 7 20ZM5 19H13V17H5V19ZM16.5 9.5C16.5 13.32 13.84 15.36 12.73 16H5.27C4.16 15.36 1.5 13.32 1.5 9.5C1.5 5.36 4.86 2 9 2C13.14 2 16.5 5.36 16.5 9.5ZM14.5 9.5C14.5 6.47 12.03 4 9 4C5.97 4 3.5 6.47 3.5 9.5C3.5 11.97 4.99 13.39 5.85 14H12.15C13.01 13.39 14.5 11.97 14.5 9.5ZM21.37 7.37L20 8L21.37 8.63L22 10L22.63 8.63L24 8L22.63 7.37L22 6L21.37 7.37ZM19 6L19.94 3.94L22 3L19.94 2.06L19 0L18.06 2.06L16 3L18.06 3.94L19 6Z" fill="white" fill-opacity="0.64" />
  </svg>
);
// Copy Icon
const CopyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);
// External Link Icon
const ExternalLinkIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

// Progress Bar Component
const KYCProgressBar = ({ step, totalSteps }: { step: number; totalSteps: number }) => (
  <div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 16px', marginBottom: 24 }}>
      <div style={{
        flex: 1,
        height: 6,
        background: 'rgba(255, 255, 255, 0.64)',
        borderRadius: 2,
        overflow: 'hidden',
      }}>
        <div style={{
          width: `${(step / totalSteps) * 100}%`,
          height: '100%',
          background: 'var(--accent-primary)',
          borderRadius: 2,
          transition: 'width 0.3s ease',
        }} />
      </div>
    </div>
    <div style={{ padding: '0 16px', marginBottom: '14px' }}>
      <div style={{ textAlign: 'right', fontSize: '12px', color: 'rgba(255, 255, 255, 0.64)', fontWeight: '600' }}>
        KYC STEP 1/4
      </div>
    </div>
  </div>
);
// Transak KYC Withdraw Form Component (Figma 1:1)
function TransakKYCWithdrawForm({
  initialCurrency,
  availableBalance,
  amount,
  onBack,
}: {
  currency: string;
  initialCurrency: string;
  availableBalance: number;
  amount: string;
  onBack: () => void;
}) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addToast } = useUIStore();
  // Current step in KYC flow
  const [kycStep, setKycStep] = useState<KYCStep>('welcome');
  // Welcome screen state
  const [email, setEmail] = useState('');
  // Sell screen state
  const [withdrawMethod] = useState<'bank' | 'visa'>('bank');
  const [fiatCurrency] = useState('EUR');
const [currencyTarget, setCurrencyTarget] =
  useState<'pay' | 'receive'>('pay');// 'pay' | 'receive'
  const CRYPTO_LIST = [
  { symbol: 'ETH', name: 'Ethereum', network: 'ethereum', color: '#627EEA'},
        { symbol: 'BTC', name: 'Bitcoin', network: 'mainnet', color: '#F7931A' },
        { symbol: 'USDT', name: 'Tether', network: 'ethereum', color: '#26A17B' },
        { symbol: 'USDT_TRC20', name: 'Tether', network: 'mainnet', color: '#A6A9AA' },
];

const FIAT_LIST = SUPPORTED_FIAT; // already exists in your code
  // Personal details state (Step 1/4)
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [countryCode] = useState('+1');
  const [dobDay, setDobDay] = useState('');
  const [dobMonth, setDobMonth] = useState('');
  const [dobYear, setDobYear] = useState('');

  // const [payCurrency, setPayCurrency] = useState<CryptoOption>(
  // SUPPORTED_CRYPTO.find(c => c.symbol === initialCurrency) || SUPPORTED_CRYPTO[0]
  // );
  const [selectedMethod1, setSelectedMethod1] = useState('visa');
  const [receiveFiat, setReceiveFiat] = useState<FiatOption>(SUPPORTED_FIAT[0]);
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const currencyFromUrl = searchParams.get('currency');

  // 1. Check if we have data in location.state
  // 2. If not (e.g. on refresh), create a placeholder so it doesn't crash
  const [payCurrency, setPayCurrency] = useState(
    location.state?.selectedCurrency || {
      symbol: currencyFromUrl || 'ETH',
      network: 'Mainnet',
      color: '#627EEA'
    }
  );

  const EthIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
      <g clip-path="url(#clip0_2_14808)">
        <path d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24Z" fill="#627EEA" />
        <path d="M12 3V9.6525L17.6228 12.165L12 3Z" fill="white" fill-opacity="0.602" />
        <path d="M12.3735 3L6.75 12.165L12.3735 9.6525V3Z" fill="white" />
        <path d="M12 16.764V21.2843L17.6265 13.5L12 16.764Z" fill="white" fill-opacity="0.602" />
        <path d="M12.3735 21.2843V16.7632L6.75 13.5L12.3735 21.2843Z" fill="white" />
        <path d="M12 15.5258L17.6228 12.261L12 9.75V15.5258Z" fill="white" fill-opacity="0.2" />
        <path d="M6.75 12.261L12.3735 15.5258V9.75L6.75 12.261Z" fill="white" fill-opacity="0.602" />
      </g>
      <defs>
        <clipPath id="clip0_2_14808">
          <rect width="24" height="24" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
  const BtcIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
      <g clip-path="url(#clip0_2_14817)">
        <path d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24Z" fill="#F7931A" />
        <path d="M17.274 10.515C17.5095 8.943 16.3118 8.09775 14.6753 7.53375L15.2062 5.40375L13.9103 5.08125L13.3928 7.155C13.0523 7.0695 12.7028 6.99 12.354 6.9105L12.8752 4.82325L11.5793 4.5L11.0483 6.62925C10.7663 6.56475 10.4888 6.50175 10.2203 6.43425L10.2218 6.4275L8.43375 5.98125L8.08875 7.36575C8.08875 7.36575 9.051 7.58625 9.03075 7.59975C9.55575 7.731 9.65025 8.07825 9.6345 8.35425L9.03 10.7805C9.066 10.7895 9.1125 10.803 9.165 10.8232L9.02775 10.7895L8.18025 14.1885C8.11575 14.3475 7.953 14.5867 7.5855 14.496C7.599 14.5147 6.6435 14.2612 6.6435 14.2612L6 15.7448L7.6875 16.1655C8.001 16.2443 8.3085 16.3267 8.61075 16.404L8.0745 18.558L9.36975 18.8805L9.90075 16.7505C10.2548 16.8457 10.5983 16.9342 10.9343 17.0182L10.4047 19.1392L11.7008 19.4618L12.237 17.3123C14.448 17.7308 16.11 17.562 16.8097 15.5625C17.3737 13.953 16.782 13.0238 15.6188 12.4185C16.4663 12.2235 17.1037 11.6663 17.274 10.515ZM14.3115 14.6685C13.9118 16.2788 11.2005 15.408 10.3215 15.1898L11.034 12.336C11.913 12.5557 14.7308 12.99 14.3115 14.6685ZM14.7128 10.4918C14.3475 11.9565 12.0915 11.2118 11.3603 11.0295L12.0052 8.442C12.7365 8.62425 15.0938 8.964 14.7128 10.4918Z" fill="white" />
      </g>
      <defs>
        <clipPath id="clip0_2_14817">
          <rect width="24" height="24" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
  const UsdtIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
      <g clip-path="url(#clip0_2_14826)">
        <path d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24Z" fill="#26A17B" />
        <path fill-rule="evenodd" clip-rule="evenodd" d="M13.2165 13.173V13.1715C13.134 13.1775 12.7087 13.203 11.76 13.203C11.0025 13.203 10.4692 13.1805 10.2817 13.1715V13.1738C7.36575 13.0455 5.18925 12.5378 5.18925 11.9303C5.18925 11.3235 7.36575 10.8158 10.2817 10.6853V12.6682C10.4722 12.6817 11.0182 12.714 11.7727 12.714C12.678 12.714 13.1318 12.6765 13.2165 12.669V10.6867C16.1265 10.8165 18.2977 11.3243 18.2977 11.9303C18.2977 12.5378 16.1265 13.044 13.2165 13.173ZM13.2165 10.4805V8.706H17.277V6H6.22125V8.706H10.2817V10.4798C6.98175 10.6312 4.5 11.2852 4.5 12.0682C4.5 12.8512 6.98175 13.5045 10.2817 13.6567V19.3433H13.2165V13.6552C16.5113 13.5037 18.987 12.8505 18.987 12.0682C18.987 11.286 16.5113 10.6328 13.2165 10.4805Z" fill="white" />
      </g>
      <defs>
        <clipPath id="clip0_2_14826">
          <rect width="24" height="24" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
  const LtcIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
      <g clip-path="url(#clip0_2_14835)">
        <path d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24Z" fill="#BFBBBB" />
        <path fill-rule="evenodd" clip-rule="evenodd" d="M7.82025 14.4105L6.75 14.826L7.266 12.7568L8.349 12.3218L9.90975 6H13.7565L12.6172 10.647L13.6747 10.2188L13.1647 12.2812L12.0945 12.7095L11.4585 15.3218H17.25L16.5953 18H6.939L7.82025 14.4105Z" fill="white" />
      </g>
      <defs>
        <clipPath id="clip0_2_14835">
          <rect width="24" height="24" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
  const renderIcon = (symbol: string): React.ReactNode => {
    switch (symbol) {
      case 'BTC': return <BtcIcon />;
      case 'ETH': return <EthIcon />;
      case 'USDT': return <UsdtIcon />;
      case 'LTC': return <LtcIcon />;
      default: return <EthIcon />;
    }
  };
  
  // Sync if navigation state changes
  useEffect(() => {
    if (location.state?.selectedCurrency) {
      setPayCurrency(location.state.selectedCurrency);
    }
  }, [location.state]);
  useEffect(() => {
    // 1. Try to get data from the 'magic' navigation state first
    const passedCurrency = location.state?.selectedCurrency;

    // 2. Try to get data from the URL second
    const urlSymbol = searchParams.get('currency');
    if (passedCurrency) {
      // This handles the 'navigate(-1)' case
      setPayCurrency(passedCurrency);
    } else if (urlSymbol) {
      // This handles direct links or refreshes
      // const found = currencies.find(c => c.symbol === urlSymbol);
      // if (found) setPayCurrency(found);
    }
  }, [location.state, searchParams]);
  // 2. Listen for the return data from CurrencySelector
  useEffect(() => {
    if (location.state?.selectedCurrency) {
      setPayCurrency(location.state.selectedCurrency);

      // Optional: Clear the state so it doesn't trigger again on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);
  // We'll fetch rates for ALL supported pairs, but show current one
  const [rates, setRates] = useState<Record<string, number>>({});
  const [addressMode, setAddressMode] = useState<'search' | 'manual'>('search');
  const [addressSearch, setAddressSearch] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [stateRegion, setStateRegion] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');
  // Add these states (adjust types/names to match your codebase)
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState('All Networks');
  const [searchQuery, setSearchQuery] = useState('');
  const [code, setCode] = useState('');
  // Purpose state (Step 3/4)
  const [purpose, setPurpose] = useState<'investment' | 'nfts' | 'web3' | null>(null);
  // Verification state (Step 4/4)
  const [onfidoUrl, setOnfidoUrl] = useState<string | null>(null);
  const [onfidoLoading, setOnfidoLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const isButtonDisabled = code.trim().length === 0;
  // Loading state
  const [isLoading, setIsLoading] = useState(false);
  // Calculate values - fetch exchange rate from CoinGecko
  const enteredAmount = parseFloat(amount || '0');
  // const [exchangeRate, setExchangeRate] = useState(0);
  const [totalFees, setTotalFees] = useState(0);
  
// const [rateLoading, setRateLoading] = useState(true);

useEffect(() => {
  const fetchRates = async () => {
    // setRateLoading(true);
    try {
      const cryptoIds = SUPPORTED_CRYPTO.map(c => c.coingeckoId).join(',');
      const fiatCurrencies = SUPPORTED_FIAT.map(f => f.symbol.toLowerCase()).join(','); // or use .code if you add it

      const res = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${cryptoIds}&vs_currencies=${fiatCurrencies}`
      );
      const data = await res.json();

      const newRates: Record<string, number> = {};
      SUPPORTED_CRYPTO.forEach(coin => {
        SUPPORTED_FIAT.forEach(fiat => {
          const key = `${coin.symbol}_${fiat.symbol}`;   // ← change to .code later
          newRates[key] = data[coin.coingeckoId]?.[fiat.symbol.toLowerCase()] || 0;
        });
      });

      setRates(newRates);
    } catch (err) {
      console.error("Rate fetch failed", err);
    } finally {
      // setRateLoading(false);
    }
  };

  fetchRates();
  const timer = setInterval(fetchRates, 60000);
  return () => clearInterval(timer);
}, []); // run once on mount
  // Current conversion values
  // const currentRate = rates[`${payCurrency.symbol}_${receiveFiat.code}`] || 0;
  // const cryptoAmount = Number(amount) || 0;
  // const fiatAmount = cryptoAmount * currentRate;
  // You can add fee logic here later
  // const estimatedReceive = fiatAmount; // - fee
  // const receiveAmount = exchangeRate > 0 ? (enteredAmount * exchangeRate) - totalFees : 0;
  const isValidAmount = enteredAmount > 0 && enteredAmount <= availableBalance;
  // State (add / replace these lines)
  const [payAmount, setPayAmount] = useState(''); // ← user types crypto amount here
  // ... rest of your states (payCurrency, receiveFiat, rates, etc.)
  // Calculations (keep or move inside useMemo if you prefer)
  // const cryptoAmountNum = Number(payAmount) || 0;
  const currentRate = rates[`${payCurrency.symbol}_${receiveFiat.code}`] || 0;
  // const fiatAmount = cryptoAmountNum * currentRate;
  // const estimatedReceive = fiatAmount; // later: fiatAmount - fee
  // Validation for each step
  // const isPersonalValid = firstName.trim() && lastName.trim() && mobileNumber.trim() && dobDay && dobMonth && dobYear;
  const isAddressValid = addressMode === 'search' ? addressSearch.trim() : (addressLine.trim() && city.trim() && postalCode.trim() && country);
  const isPurposeValid = purpose !== null;
  // Copy URL to clipboard
  const handleCopyUrl = async () => {
    if (!onfidoUrl) return;
    try {
      await navigator.clipboard.writeText(onfidoUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.error('Failed to copy');
    }
  };
  // Handle final submission
  const handleComplete = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      // Create offramp transaction with all KYC data
      const response = await api.createOfframpTransaction({
        amount,
        currency: (initialCurrency === 'USDT_TRC20' ? 'USDT' : initialCurrency) as Currency,
        fiat_currency: fiatCurrency,
        withdraw_method: withdrawMethod,
        kyc_personal: {
          first_name: firstName,
          last_name: lastName,
          mobile_number: mobileNumber,
          country_code: countryCode,
          dob_day: dobDay,
          dob_month: dobMonth,
          dob_year: dobYear,
        },
        kyc_address: addressMode === 'search'
          ? {
            address_line: addressSearch,
            city: '',
            postal_code: '',
            country: '',
          }
          : {
            address_line: addressLine,
            address_line2: addressLine2 || undefined,
            city,
            state_region: stateRegion || undefined,
            postal_code: postalCode,
            country,
          },
        kyc_purpose: purpose || undefined,
      });
      console.log('Offramp created:', response);
      addToast('KYC verification initiated! Complete verification via the link.', 'success');
      navigate('/');
    } catch (error) {
      addToast(`Failed to initiate withdrawal: ${(error as Error).message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };
// Make onBack optional (?:) with a default fallback to navigate(-1)
const renderHeader = (title: string, onBack?: () => void) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    padding: '0 16px',
  }}>
    <button
      onClick={onBack || (() => navigate(-1))}   // ← use provided onBack if exists, otherwise default back
      style={{
        width: 24,
        height: 24,
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: 'var(--text-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0,
      }}
    >
      <BackIcon />
    </button>
    <h1 style={{
      fontSize: 18,
      fontWeight: 600,
      color: 'var(--text-primary)',
      margin: 0,
    }}>
      {title}
    </h1>
    <div style={{ width: 24 }} />
  </div>
);
  // Email validation
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  // const [totalFees, setTotalFees] = useState<number>(0);

useEffect(() => {
  const cryptoAmount = Number(payAmount) || 0;
  if (cryptoAmount <= 0) {
    setTotalFees(0);
    return;
  }

  // Very simple example fee logic — change to your real rules
  const percentFee = cryptoAmount * 0.015;  // 1.5%
  const minFee = 1.00;                      // minimum $1 or equivalent
  const calculated = Math.max(minFee, percentFee);

  setTotalFees(calculated);
}, [payAmount, currentRate]);   // recalculate when amount or rate changes
  // ==================== WELCOME SCREEN (Figma Design) ====================
  if (kycStep === 'welcome') {
    return (
      <div className="transak-welcome">
        <div>
          {/* Header */}
          <div className="transak-welcome-header">
            <button className="transak-welcome-back" onClick={onBack}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M9.66135 4.72394C10.054 4.40371 10.6331 4.42659 10.9992 4.7923C11.3653 5.1584 11.3879 5.73742 11.0676 6.13019L10.9992 6.20636L6.20529 11.0003H20.0022C20.5545 11.0003 21.0022 11.448 21.0022 12.0003C21.002 12.5524 20.5543 13.0003 20.0022 13.0003H6.20725L10.9992 17.7923C11.3898 18.1828 11.3897 18.8158 10.9992 19.2064C10.6087 19.5969 9.9757 19.5969 9.58518 19.2064L3.43869 13.0599L3.33615 12.9456C2.88807 12.3958 2.88782 11.6028 3.33615 11.053L3.43869 10.9388L9.58518 4.7923L9.66135 4.72394Z" fill="white" />
              </svg>
            </button>
            <button className="transak-welcome-menu">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M4 6H20M4 12H20M4 18H20" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          {/* Content */}
          <div className="transak-welcome-content">
            {/* Intro */}
            <div className="transak-welcome-intro">
              <h1 className="transak-welcome-title">Welcome to Transak</h1>
              <p className="transak-welcome-subtitle">
                Enter your email to continue with your crypto purchase.
              </p>
            </div>
            {/* Form */}
            <div className="transak-welcome-form">
              <div className="transak-welcome-field">
                <label className="transak-welcome-label">Email Address</label>
                <input
                  type="email"
                  className="transak-welcome-input"
                  placeholder="Enter email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <button
                className={`transak-welcome-send-btn ${isEmailValid ? 'active' : ''}`}
                onClick={() => isEmailValid && setKycStep('code')}
                disabled={!isEmailValid}
              >
                Send Code
              </button>
            </div>
            {/* Divider */}
            <div className="transak-welcome-divider">
              <div className="transak-welcome-divider-line" />
              <span className="transak-welcome-divider-text">or</span>
              <div className="transak-welcome-divider-line" />
            </div>
            {/* Google Button */}
            <button
              className="transak-welcome-google-btn"
              onClick={() => setKycStep('sell')}
            >
              <svg className="transak-welcome-google-icon" viewBox="0 0 20 20" fill="none">
                <path d="M19.8055 8.0415H19V8H10V12H15.6515C14.827 14.3285 12.6115 16 10 16C6.6865 16 4 13.3135 4 10C4 6.6865 6.6865 4 10 4C11.5295 4 12.921 4.577 13.9805 5.5195L16.809 2.691C15.023 1.0265 12.634 0 10 0C4.4775 0 0 4.4775 0 10C0 15.5225 4.4775 20 10 20C15.5225 20 20 15.5225 20 10C20 9.3295 19.931 8.675 19.8055 8.0415Z" fill="#FFC107" />
                <path d="M1.15234 5.3455L4.43834 7.755C5.32684 5.554 7.47984 4 9.99934 4C11.5288 4 12.9203 4.577 13.9798 5.5195L16.8083 2.691C15.0223 1.0265 12.6333 0 9.99934 0C6.15834 0 2.82734 2.1685 1.15234 5.3455Z" fill="#FF3D00" />
                <path d="M10.0002 20C12.5832 20 14.9302 19.0115 16.7047 17.404L13.6097 14.785C12.5719 15.5742 11.3039 16.001 10.0002 16C7.39916 16 5.19066 14.3415 4.35866 12.027L1.09766 14.5395C2.75266 17.778 6.11366 20 10.0002 20Z" fill="#4CAF50" />
                <path d="M19.8055 8.0415H19V8H10V12H15.6515C15.2571 13.1082 14.5567 14.0766 13.608 14.7855L13.6095 14.7845L16.7045 17.4035C16.4855 17.6025 20 15 20 10C20 9.3295 19.931 8.675 19.8055 8.0415Z" fill="#1976D2" />
              </svg>
              Continue With Google
            </button>
          </div>
        </div>
        {/* Footer */}
        <div className="transak-welcome-footer">
          <div className="transak-welcome-indicator" />
        </div>
      </div>
    );
  }
  if (kycStep === 'code') {
    return (
      <div className="bee-email-container">
        {/* Top Header */}
        <div className="bee-email-header">
          <button className="bee-email-back-btn" onClick={() => setKycStep('welcome')}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9.66135 4.72394C10.054 4.40371 10.6331 4.42659 10.9992 4.7923C11.3653 5.1584 11.3879 5.73742 11.0676 6.13019L10.9992 6.20636L6.20529 11.0003H20.0022C20.5545 11.0003 21.0022 11.448 21.0022 12.0003C21.002 12.5524 20.5543 13.0003 20.0022 13.0003H6.20725L10.9992 17.7923C11.3898 18.1828 11.3897 18.8158 10.9992 19.2064C10.6087 19.5969 9.9757 19.5969 9.58518 19.2064L3.43869 13.0599L3.33615 12.9456C2.88807 12.3958 2.88782 11.6028 3.33615 11.053L3.43869 10.9388L9.58518 4.7923L9.66135 4.72394Z" fill="white" />
            </svg>
          </button>
          <div className="bee-email-header-title">Verify Your Email</div>
          <button className="bee-email-menu-btn">
            <div className="bee-email-menu-line"></div>
            <div className="bee-email-menu-line"></div>
            <div className="bee-email-menu-line"></div>
          </button>
        </div>

        {/* Info Card */}
        <div className="bee-email-info-card">
          <p className="bee-email-info-text">
            You will receive a verification code at
            {/* DYNAMIC EMAIL USED HERE */}
            <span className="bee-email-highlight"> {email}</span>.
            Check your spam folder in case you cannot find it in your inbox.
          </p>
        </div>

        {/* Form Section */}
        <div className="bee-email-form-group">
          <label className="bee-email-label">Verification Code</label>
          <input
            type="text"
            placeholder="Enter verification code"
            className="bee-email-input-field"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </div>

        {/* Footer / Action Button */}
        <div className="figma-offramp-footer">
          <button
            className="figma-deposit-share-btn"
            onClick={() => setKycStep('sell')}
            disabled={isButtonDisabled}
            style={{
              opacity: isButtonDisabled ? 0.5 : 1,
              cursor: isButtonDisabled ? 'not-allowed' : 'pointer'
            }}
          >
            Continue
          </button>
          <div className="figma-deposit-home-indicator">
            <div className="figma-deposit-home-indicator-bar" />
          </div>
        </div>
      </div>
    );
  }
  // ==================== SELL SCREEN ====================
if (kycStep === 'sell' || searchParams.get('currency')) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0E0D1F',
        color: 'white',
        position: 'relative', // Necessary for modal positioning
        overflow: showCurrencyDropdown ? 'hidden' : 'auto' // Prevents background scroll when modal open
      }}>

        {/* --- CURRENCY SELECTOR MODAL OVERLAY --- */}
        {showCurrencyDropdown && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: '#0E0D1F',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Modal Header */}
            <div className="figma-deposit-header" style={{ display: 'flex', alignItems: 'center', padding: '16px' }}>
              <button
                onClick={() => setShowCurrencyDropdown(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M9.66 4.72L3.43 10.93L3.33 11.05C2.88 11.6 2.88 12.39 3.33 12.94L3.43 13.05L9.58 19.2L10.99 17.79L6.2 13H20V11H6.2L10.99 6.2L9.66 4.72Z" fill="white" />
                </svg>
              </button>
              <span style={{ color: 'white', fontSize: '18px', fontWeight: 'bold', marginLeft: '12px' }}>Select Currency</span>
            </div>

            {/* Modal Search Bar */}
            {/* Modal Search Bar & Network Filter */}
            <div className="bee-action-bar" style={{
              padding: '0 16px',
              marginBottom: '16px',
              display: 'flex',
              gap: '10px',
              alignItems: 'center'
            }}>
              {/* Search Input */}
              <div className="bee-search-container" style={{
                flex: 1,
                background: '#1b1b2f',
                borderRadius: '12px',
                padding: '4px 12px',
                display: 'flex',
                alignItems: 'center'
              }}>
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery} // Ensure you have this state defined
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ width: '100%', padding: '12px', background: 'transparent', border: 'none', color: 'white', outline: 'none' }}
                />
              </div>

              {/* NETWORK DROPDOWN */}
              <div style={{ position: 'relative' }}>
                <div
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  style={{
                    background: '#1b1b2f',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    textTransform: 'capitalize'
                  }}
                >
                  {selectedNetwork}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"
                    style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.2s' }}>
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>

                {isDropdownOpen && (
                  <div style={{
                    position: 'absolute',
                    top: '110%',
                    right: 0,
                    background: '#1b1b2f',
                    borderRadius: '12px',
                    padding: '8px',
                    zIndex: 10000,
                    minWidth: '140px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}>
                    {['All Networks', 'ethereum', 'mainnet', 'solana'].map((net) => (
                      <div
                        key={net}
                        onClick={() => {
                          setSelectedNetwork(net);
                          setIsDropdownOpen(false);
                        }}
                        style={{
                          padding: '10px 12px',
                          color: selectedNetwork === net ? '#c5ff00' : 'white',
                          cursor: 'pointer',
                          fontSize: '14px',
                          textTransform: 'capitalize',
                          borderRadius: '8px',
                          background: selectedNetwork === net ? 'rgba(197, 255, 0, 0.1)' : 'transparent'
                        }}
                      >
                        {net}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {/* Modal List of Currencies */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px' }}>
             {(currencyTarget === 'pay' ? CRYPTO_LIST : FIAT_LIST).map((coin, index) => (
                <div
                  key={index}
              onClick={() => {
  if (currencyTarget === 'pay') {
    setPayCurrency(coin);
  } else {
    setReceiveFiat(coin as FiatOption); // ✅ THIS FIXES YOUR ISSUE
  }
  setShowCurrencyDropdown(false);
}}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '16px 0',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ width: 32, height: 32 }}>{renderIcon(coin.symbol)}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: 'white', fontWeight: '600' }}>{coin.symbol}</div>
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>{coin.name}</div>
                  </div>
<div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', border: '1px solid rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '10px' }}>
  {currencyTarget === 'pay' && 'network' in coin && coin.network 
    ? coin.network 
    : 'Fiat'}
</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {renderHeader(`Withdraw ${payCurrency.symbol}`, onBack)}

        <div style={{ padding: '0 16px' }}>
          {/* You pay section */}
          <div style={{ marginBottom: 16 }}>
            <p style={{
              fontSize: 14,
              color: 'rgba(255,255,255,0.56)',
              margin: '0 0 8px 0'
            }}>
              You pay
            </p>
            <div style={{
              display: 'flex',
              background: '#1b1b2f',
              borderRadius: 12,
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.05)'
            }}>
              {/* Input Section */}
              <input
                type="text"
                inputMode="decimal"
                placeholder="0.00"
                value={payAmount}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '' || /^\d*[.,]?\d{0,8}$/.test(val)) {
                    setPayAmount(val);
                  }
                }}
                style={{
                  flex: 1,
                  minWidth: 0,
                  background: 'transparent',
                  border: 'none',
                  padding: '14px 16px',
                  fontSize: 16,
                  fontWeight: 500,
                  color: 'white',
                  outline: 'none',
                }}
              />
              {/* Currency Side Panel - TRIGGER MODAL */}
              <div
               onClick={() => {
  setCurrencyTarget('pay');
  setShowCurrencyDropdown(true);
}}
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '0 16px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
                  cursor: 'pointer',
                }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {renderIcon(payCurrency.symbol)}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    color: 'white',
                    fontSize: 20,
                    fontWeight: 'bold'
                  }}>
                    {payCurrency.symbol}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </div>
                  <div style={{
                    fontSize: 11,
                    color: 'rgba(255,255,255,0.4)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    padding: '1px 10px',
                    borderRadius: 20,
                    marginTop: 2,
                    textAlign: 'center',
                    width: 'fit-content'
                  }}>
                    {payCurrency?.network?.toLowerCase() || payCurrency?.symbol?.toLowerCase() || 'network'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Rate line */}
          <div style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            color: 'white',
            background: '#0b0a1a',
            padding: '20px 0px'
          }}>
            <div style={{ position: 'relative', paddingLeft: '32px' }}>
              <div style={{
                position: 'absolute',
                left: '12px',
                top: '12px',
                bottom: '55px',
                width: '1px',
                borderLeft: '1px dashed rgba(255, 255, 255, 0.2)',
                zIndex: 0
              }} />

              <div style={{ position: 'relative', marginBottom: '32px' }}>
                <div style={{
                  position: 'absolute',
                  left: '-24px',
                  top: '6px',
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: '#71707e',
                  zIndex: 1,
                  boxShadow: '0 0 0 4px #0b0a1a'
                }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px' }}>
                  <span style={{ fontWeight: '600' }}>
                    1 {payCurrency.symbol} = {currentRate.toFixed(2)} {receiveFiat.code}
                  </span>
                  <span style={{ color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Rate
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <g clipPath="url(#clip0_2_14568)">
                        <path d="M6 5.3125C6.31066 5.3125 6.5625 5.56434 6.5625 5.875V8.25C6.5625 8.56066 6.31066 8.8125 6 8.8125C5.68934 8.8125 5.4375 8.56066 5.4375 8.25V5.875C5.4375 5.56434 5.68934 5.3125 6 5.3125Z" fill="white" fillOpacity="0.64" />
                        <path d="M6 3.1875C6.31066 3.1875 6.5625 3.43934 6.5625 3.75V4.125C6.5625 4.43566 6.31066 4.6875 6 4.6875C5.68934 4.6875 5.4375 4.43566 5.4375 4.125V3.75C5.4375 3.43934 5.68934 3.1875 6 3.1875Z" fill="white" fillOpacity="0.64" />
                        <path fillRule="evenodd" clipRule="evenodd" d="M6 0.5C9.03757 0.5 11.5 2.96243 11.5 6C11.5 9.03757 9.03757 11.5 6 11.5C2.96243 11.5 0.5 9.03757 0.5 6C0.5 2.96243 2.96243 0.5 6 0.5ZM6 1.5C3.51472 1.5 1.5 3.51472 1.5 6C1.5 8.48528 3.51472 10.5 6 10.5C8.48528 10.5 10.5 8.48528 10.5 6C10.5 3.51472 8.48528 1.5 6 1.5Z" fill="white" fillOpacity="0.64" />
                      </g>
                      <defs>
                        <clipPath id="clip0_2_14568">
                          <rect width="12" height="12" fill="white" />
                        </clipPath>
                      </defs>
                    </svg>
                  </span>
                </div>
                <div style={{
                  fontSize: '13px',
                  color: 'rgba(255,255,255,0.4)',
                  marginTop: '4px',
                  cursor: 'pointer'
                }}>
                  See fees calculation
                </div>
              </div>

              <div style={{ position: 'relative', marginBottom: '32px' }}>
                <div style={{
                  position: 'absolute',
                  left: '-24px',
                  top: '6px',
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: '#71707e',
                  zIndex: 1,
                  boxShadow: '0 0 0 4px #0b0a1a'
                }} />
                <div style={{ fontSize: '15px' }}>
                  <span style={{ fontWeight: '600' }}>{totalFees.toFixed(0)} {receiveFiat.code}</span>
                  <span style={{ color: 'rgba(255,255,255,0.4)', marginLeft: '8px' }}>Total fees</span>
                </div>
              </div>

              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  left: '-24px',
                  top: '6px',
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: '#71707e',
                  zIndex: 1,
                  boxShadow: '0 0 0 4px #0b0a1a'
                }} />
                <p style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  marginBottom: '16px',
                  marginTop: 0
                }}>
                  Withdraw method
                </p>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'stretch' }}>
                  <div
                    onClick={() => setSelectedMethod1('bank')}
                    style={{
                      flex: 1,
                      background: 'rgba(255, 255, 255, 0.09)',
                      borderRadius: '16px',
                      padding: '12px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      border: selectedMethod1 === 'bank' ? '1px solid #c5ff00' : '1px solid rgba(255,255,255,0.05)',
                    }}>
                    <div style={{ background: 'white', padding: '4px 8px', borderRadius: '4px', height: '24px', display: 'flex', alignItems: 'center' }}>
                      <img src="./images/manual.png" alt="SEPA" style={{ width: '40px' }} />
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: '500', flex: 1 }}>Manual bank Transfer</span>
                    <div style={{
                      width: '20px', height: '20px', borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      backgroundColor: selectedMethod1 === 'bank' ? '#c5ff00' : 'transparent',
                      border: selectedMethod1 === 'bank' ? 'none' : '2px solid rgba(255,255,255,0.2)'
                    }}>
                      {selectedMethod1 === 'bank' && <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#1b1b2f' }} />}
                    </div>
                  </div>

                  <div
                    onClick={() => setSelectedMethod1('visa')}
                    style={{
                      flex: '0 1 auto',
                      background: 'rgba(255, 255, 255, 0.09)',
                      borderRadius: '16px',
                      padding: '12px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      border: selectedMethod1 === 'visa' ? '1px solid #c5ff00' : '1px solid rgba(255,255,255,0.05)',
                    }}>
                    <div style={{ background: 'white', padding: '4px', borderRadius: '4px', height: '24px', display: 'flex', alignItems: 'center' }}>
                      <img src="./images/visacard.png" alt="Visa" style={{ width: '30px' }} />
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: '500' }}>Visa</span>
                    <div style={{
                      width: '20px', height: '20px', borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      backgroundColor: selectedMethod1 === 'visa' ? '#c5ff00' : 'transparent',
                      border: selectedMethod1 === 'visa' ? 'none' : '2px solid rgba(255,255,255,0.2)'
                    }}>
                      {selectedMethod1 === 'visa' && <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#1b1b2f' }} />}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* You receive (estimate) */}
          <div style={{ marginBottom: 24 }}>
            <p style={{
              fontSize: 14,
              color: 'rgba(255,255,255,0.56)',
              margin: '0 0 8px 0'
            }}>
              You receive
            </p>
            <div style={{
              display: 'flex',
              background: 'rgba(255,255,255,0.09)',
              borderRadius: 12,
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.12)',
            }}>
              <div style={{ flex: 1, padding: '14px 16px' }}>
                <input
                  type="text"
                  readOnly
                  value={(Number(payAmount) * currentRate).toFixed(2)}
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    fontSize: 22,
                    fontWeight: 600,
                    color: 'white',
                    outline: 'none',
                    padding: 0,
                  }}
                />
              </div>
            <div
  onClick={() => {
    setCurrencyTarget('receive');
    setShowCurrencyDropdown(true);
  }}
  style={{
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '0 16px',
    minWidth: '160px',
    background: 'rgba(255, 255, 255, 0.04)',
    borderLeft: '1px solid rgba(255, 255, 255, 0.12)',
    cursor: 'pointer',
  }}
>
  {/* Icon area – try to reuse renderIcon if possible, otherwise fallback */}
  <div style={{
    width: 32,
    height: 32,
    borderRadius: '50%',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(255,255,255,0.08)',
  }}>
    {receiveFiat?.symbol && renderIcon ? (
      renderIcon(receiveFiat.symbol)   // ← best if your renderIcon supports fiat codes like USD, EUR
    ) : (
      <span style={{ fontSize: 20, fontWeight: 'bold', color: '#fff' }}>
        {receiveFiat?.symbol?.slice(0, 2) || '?'}
      </span>
    )}
  </div>

  {/* Text column – symbol/code + name + badge */}
  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
    <div style={{
      color: 'white',
      fontSize: 18,
      fontWeight: 600,
      display: 'flex',
      alignItems: 'center',
      gap: 4,
    }}>
      {receiveFiat?.symbol || 'Select'}
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
    </div>

    {/* Name – this was missing completely */}
    <div style={{
      color: 'rgba(255,255,255,0.6)',
      fontSize: 13,
      fontWeight: 400,
    }}>
      {receiveFiat?.name || 'Fiat currency'}
    </div>
  </div>
</div>
            </div>
          </div>

          {/* Transak Off-Ramp Stream Banner */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            background: 'rgba(255,255,255,0.05)',
            borderRadius: 16,
            padding: 16,
            marginBottom: 32,
          }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 16, fontWeight: 600, margin: '0 0 8px 0' }}>
                Transak Off-Ramp Stream
              </p>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', margin: '0 0 12px 0' }}>
                One Click to Convert Crypto to Fiat
              </p>
              <button style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: '#c5ff00', color: '#000', border: 'none',
                borderRadius: 8, padding: '8px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}>
                Explore now
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M10.8936 3.81547L10.8936 3.81547C10.6318 3.60199 10.2355 3.62312 9.99849 3.86475L7.84432 6.06176L5.69014 3.86475C5.4531 3.62312 5.0568 3.60199 4.79502 3.81547L4.79502 3.81547C4.53323 4.02896 4.5121 4.42526 4.74786 4.66576L7.37318 7.34318C7.63393 7.60911 8.0547 7.60911 8.31545 7.34318L10.9408 4.66576C11.1765 4.42526 11.1554 4.02896 10.8936 3.81547Z" fill="#0E0D1F" transform="rotate(-90 8 8)" />
                </svg>
              </button>
            </div>
            <img src="./images/transek.png" alt="Transak" style={{ width: 80, height: 80, objectFit: 'contain' }} />
          </div>
        </div>

        <div className="figma-deposit-footer">
          <button className="figma-deposit-share-btn" onClick={() => setKycStep('personal')} disabled={!isValidAmount}>
            Sell Now
          </button>
          <div className="figma-deposit-home-indicator">
            <div className="figma-deposit-home-indicator-bar" />
          </div>
        </div>
      </div>
    );
  }
  // ==================== PERSONAL DETAILS (Step 1/4) ====================
 if (kycStep === 'personal') {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0E0D1F',
      color: '#FFFFFF',
      fontFamily: '-apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', height: '56px' }}>
        <span style={{ fontSize: '22px', cursor: 'pointer' }} onClick={() => navigate(-1)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M9.66135 4.72394C10.054 4.40371 10.6331 4.42659 10.9992 4.7923C11.3653 5.1584 11.3879 5.73742 11.0676 6.13019L10.9992 6.20636L6.20529 11.0003H20.0022C20.5545 11.0003 21.0022 11.448 21.0022 12.0003C21.002 12.5524 20.5543 13.0003 20.0022 13.0003H6.20725L10.9992 17.7923C11.3898 18.1828 11.3897 18.8158 10.9992 19.2064C10.6087 19.5969 9.9757 19.5969 9.58518 19.2064L3.43869 13.0599L3.33615 12.9456C2.88807 12.3958 2.88782 11.6028 3.33615 11.053L3.43869 10.9388L9.58518 4.7923L9.66135 4.72394Z" fill="white" />
          </svg>
        </span>
        <div style={{ flex: 1, textAlign: 'center', fontSize: '17px', fontWeight: '600', marginRight: '22px' }}>
          Personal Details
        </div>
      </div>

      {/* Progress Bar & Steps */}
      <div style={{ padding: '0 16px', marginBottom: '24px' }}>
        <div style={{ height: '6px', background: '#2B3139', borderRadius: '2px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ width: '25%', height: '100%', background: '#C5FF2D' }} />
        </div>
        <div style={{ textAlign: 'right', fontSize: '12px', color: 'rgba(255, 255, 255, 0.64)', marginTop: '8px', fontWeight: '600' }}>
          KYC STEP 1/4
        </div>
      </div>

      <div style={{ padding: '0 16px' }}>
        <p style={{ fontSize: '17px', color: '#FFFFFF', marginBottom: '28px', lineHeight: '1.4' }}>
          Please enter your personal details as they<br /> appear on official documents.
        </p>

        {/* First & Last Name Row */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '13px', color: '#848E9C', marginBottom: '8px' }}>First Name</label>
            <input
              placeholder="Satoshi"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              style={{ width: '100%', height: '48px', background: 'rgba(255, 255, 255, 0.09)', border: '1px solid rgba(255, 255, 255, 0.03)', borderRadius: '8px', padding: '0 16px', fontSize: '16px', color: '#FFFFFF', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '13px', color: '#848E9C', marginBottom: '8px' }}>Last Name</label>
            <input
              placeholder="Nakamoto"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              style={{ width: '100%', height: '48px', background: 'rgba(255, 255, 255, 0.09)', border: '1px solid rgba(255, 255, 255, 0.03)', borderRadius: '8px', padding: '0 16px', fontSize: '16px', color: '#FFFFFF', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        {/* Mobile Number */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '13px', color: '#848E9C', marginBottom: '8px' }}>Mobile Number</label>
          <div style={{ display: 'flex' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255, 255, 255, 0.09)', border: '1px solid rgba(255, 255, 255, 0.03)', borderRight: 'none', borderRadius: '8px 0 0 8px', padding: '0 12px', height: '48px' }}>
              <span style={{ fontSize: '16px' }}>🇺🇸</span>
              <span style={{ borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: '5px solid #848E9C', marginTop: '2px' }} />
            </div>
            <input
              placeholder="Phone Number"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              style={{ flex: 1, height: '48px', background: 'rgba(255, 255, 255, 0.09)', border: '1px solid rgba(255, 255, 255, 0.03)', borderRadius: '0 8px 8px 0', padding: '0 16px', fontSize: '16px', color: '#FFFFFF', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        {/* Date of Birth Dropdowns */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '13px', color: '#848E9C', marginBottom: '8px' }}>Date Of Birth</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <select 
              value={dobDay} 
              onChange={(e) => setDobDay(e.target.value)}
              style={{ flex: 1, height: '48px', background: 'rgba(255, 255, 255, 0.09)', border: '1px solid rgba(255, 255, 255, 0.03)', borderRadius: '8px', padding: '0 8px', fontSize: '15px', color: '#FFFFFF', outline: 'none', appearance: 'none' }}
            >
              <option value="">Day</option>
              {[...Array(31)].map((_, i) => (
                <option key={i+1} value={i+1}>{i+1}</option>
              ))}
            </select>
            
            <select 
              value={dobMonth} 
              onChange={(e) => setDobMonth(e.target.value)}
              style={{ flex: 2, height: '48px', background: 'rgba(255, 255, 255, 0.09)', border: '1px solid rgba(255, 255, 255, 0.03)', borderRadius: '8px', padding: '0 12px', fontSize: '15px', color: '#FFFFFF', outline: 'none', appearance: 'none' }}
            >
              <option value="">Month</option>
              {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>

            <select 
              value={dobYear} 
              onChange={(e) => setDobYear(e.target.value)}
              style={{ flex: 1.5, height: '48px', background: 'rgba(255, 255, 255, 0.09)', border: '1px solid rgba(255, 255, 255, 0.03)', borderRadius: '8px', padding: '0 8px', fontSize: '15px', color: '#FFFFFF', outline: 'none', appearance: 'none' }}
            >
              <option value="">Year</option>
              {Array.from({ length: 100 }, (_, i) => 2024 - i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="figma-deposit-footer">
        <button 
          className="figma-deposit-share-btn" 
          onClick={() => setKycStep('address')}
          disabled={!firstName || !lastName || !mobileNumber || !dobDay || !dobMonth || !dobYear}
          style={{ opacity: (!firstName || !lastName || !mobileNumber) ? 0.5 : 1 }}
        >
          Continue
        </button>
        <div className="figma-deposit-home-indicator">
          <div className="figma-deposit-home-indicator-bar" />
        </div>
      </div>
    </div>
  );
}
  // ==================== ADDRESS (Step 2/4) ====================
  if (kycStep === 'address') {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0E0D1F',
        paddingBottom: 'calc(100px + env(safe-area-inset-bottom))',
      }}>
        {renderHeader('Address', () => setKycStep('personal'))}
        <KYCProgressBar step={2} totalSteps={4} />
        <div style={{ padding: '0 16px' }}>
          <p style={{
            fontSize: 14,
            color: 'var(--text-muted)',
            margin: '0 0 24px 0',
            lineHeight: 1.5,
          }}>
            Please enter your residential country address.
          </p>
          {addressMode === 'search' ? (
            <>
              {/* Search Mode */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <label style={{ fontSize: 13, color: 'var(--text-muted)' }}>Your Address</label>
                  <button
                    onClick={() => setAddressMode('manual')}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: 13,
                      color: 'var(--accent-primary)',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    Add Address Manually
                  </button>
                </div>
                <input
                  type="text"
                  value={addressSearch}
                  onChange={(e) => setAddressSearch(e.target.value)}
                  placeholder="Search by house or street number"
                  style={{
                    width: '100%',
                    height: 48,
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 8,
                    padding: '0 16px',
                    fontSize: 16,
                    color: 'var(--text-primary)',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </>
          ) : (
            <>
              {/* Manual Mode */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Manual Entry</span>
                <button
                  onClick={() => setAddressMode('search')}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: 13,
                    color: 'var(--accent-primary)',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  Search Instead
                </button>
              </div>
              {/* Address Line */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>
                  Address Line
                </label>
                <input
                  type="text"
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                  placeholder="1234 Main St."
                  style={{
                    width: '100%',
                    height: 48,
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 8,
                    padding: '0 16px',
                    fontSize: 16,
                    color: 'var(--text-primary)',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              {/* Address Line 2 */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>
                  Address Line 2 (Optional)
                </label>
                <input
                  type="text"
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                  placeholder="Apartment, studio, or floor"
                  style={{
                    width: '100%',
                    height: 48,
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 8,
                    padding: '0 16px',
                    fontSize: 16,
                    color: 'var(--text-primary)',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              {/* State/Region and City */}
              <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>
                    State/Region
                  </label>
                  <input
                    type="text"
                    value={stateRegion}
                    onChange={(e) => setStateRegion(e.target.value)}
                    placeholder="State"
                    style={{
                      width: '100%',
                      height: 48,
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-default)',
                      borderRadius: 8,
                      padding: '0 16px',
                      fontSize: 16,
                      color: 'var(--text-primary)',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>
                    City
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City"
                    style={{
                      width: '100%',
                      height: 48,
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-default)',
                      borderRadius: 8,
                      padding: '0 16px',
                      fontSize: 16,
                      color: 'var(--text-primary)',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>
              {/* Postal Code and Country */}
              <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>
                    Postal/Zip Code
                  </label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="12345"
                    style={{
                      width: '100%',
                      height: 48,
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-default)',
                      borderRadius: 8,
                      padding: '0 16px',
                      fontSize: 16,
                      color: 'var(--text-primary)',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>
                    Country
                  </label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    style={{
                      width: '100%',
                      height: 48,
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-default)',
                      borderRadius: 8,
                      padding: '0 12px',
                      fontSize: 14,
                      color: country ? 'var(--text-primary)' : 'var(--text-muted)',
                      outline: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="">Select</option>
                    <option value="US">United States</option>
                    <option value="UK">United Kingdom</option>
                    <option value="DE">Germany</option>
                    <option value="FR">France</option>
                    <option value="ES">Spain</option>
                    <option value="IT">Italy</option>
                    <option value="NL">Netherlands</option>
                    <option value="BE">Belgium</option>
                    <option value="AT">Austria</option>
                    <option value="CH">Switzerland</option>
                  </select>
                </div>
              </div>
            </>
          )}
        </div>
        {/* Continue Button */}
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '16px',
          borderRadius: '12px 0px',
          paddingBottom: 'calc(16px + env(safe-area-inset-bottom))',
          background: 'rgba(255, 255, 255, 0.09)',
        }}>
          <button
            onClick={() => setKycStep('purpose')}
            disabled={!isAddressValid}
            style={{
              width: '100%',
              height: 48,
              background: isAddressValid ? 'var(--accent-primary)' : 'var(--text-disabled)',
              border: 'none',
              borderRadius: 12,
              fontSize: 16,
              fontWeight: 600,
              color: isAddressValid ? '#000' : 'var(--text-muted)',
              cursor: isAddressValid ? 'pointer' : 'not-allowed',
            }}
          >
            Continue
          </button>
        </div>
      </div>
    );
  }
  // ==================== PURPOSE (Step 3/4) ====================
  if (kycStep === 'purpose') {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0E0D1F',
        paddingBottom: 'calc(100px + env(safe-area-inset-bottom))',
      }}>
        {renderHeader('Purpose of Transak', () => setKycStep('address'))}
        <KYCProgressBar step={3} totalSteps={4} />
        <div style={{ padding: '0 16px' }}>
          <p style={{
            fontSize: 16,
            fontWeight: 500,
            color: 'var(--text-primary)',
            margin: '0 0 24px 0',
          }}>
            What's Your Purpose For Using Transak?
          </p>
          {/* Investment Option */}
          <button
            onClick={() => setPurpose('investment')}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--bg-card)',
              border: purpose === 'investment' ? '1px solid var(--accent-primary)' : '1px solid transparent',
              borderRadius: 12,
              padding: 16,
              marginBottom: 12,
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <span style={{ fontSize: 15, color: 'var(--text-primary)' }}>
              Buying/selling crypto for investment
            </span>
            <div style={{
              width: 20,
              height: 20,
              borderRadius: '50%',
              border: purpose === 'investment' ? '5px solid var(--accent-primary)' : '2px solid var(--text-muted)',
              background: purpose === 'investment' ? 'var(--bg-primary)' : 'transparent',
            }} />
          </button>
          {/* NFTs Option */}
          <button
            onClick={() => setPurpose('nfts')}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--bg-card)',
              border: purpose === 'nfts' ? '1px solid var(--accent-primary)' : '1px solid transparent',
              borderRadius: 12,
              padding: 16,
              marginBottom: 12,
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <span style={{ fontSize: 15, color: 'var(--text-primary)' }}>
              Buying NFTs
            </span>
            <div style={{
              width: 20,
              height: 20,
              borderRadius: '50%',
              border: purpose === 'nfts' ? '5px solid var(--accent-primary)' : '2px solid var(--text-muted)',
              background: purpose === 'nfts' ? 'var(--bg-primary)' : 'transparent',
            }} />
          </button>
          {/* Web3 Option */}
          <button
            onClick={() => setPurpose('web3')}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--bg-card)',
              border: purpose === 'web3' ? '1px solid var(--accent-primary)' : '1px solid transparent',
              borderRadius: 12,
              padding: 16,
              marginBottom: 12,
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <span style={{ fontSize: 15, color: 'var(--text-primary)' }}>
              Buying crypto to use a web3 protocol
            </span>
            <div style={{
              width: 20,
              height: 20,
              borderRadius: '50%',
              border: purpose === 'web3' ? '5px solid var(--accent-primary)' : '2px solid var(--text-muted)',
              background: purpose === 'web3' ? 'var(--bg-primary)' : 'transparent',
            }} />
          </button>
        </div>
        {/* Continue Button */}
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '16px',
          borderRadius: "12px 0px",
          paddingBottom: 'calc(16px + env(safe-area-inset-bottom))',
          background: 'rgba(255, 255, 255, 0.09)',
        }}>
          <button
            onClick={async () => {
              setOnfidoLoading(true);
              setKycStep('verification');
              try {
                const result = await api.createOfframpTransaction({
                  amount: amount || '0',
                  currency: initialCurrency,
                  fiat_currency: fiatCurrency,
                  withdraw_method: withdrawMethod,
                  kyc_personal: {
                    first_name: firstName,
                    last_name: lastName,
                    mobile_number: mobileNumber,
                    country_code: countryCode,
                    dob_day: dobDay,
                    dob_month: dobMonth,
                    dob_year: dobYear,
                  },
                  kyc_address: addressMode === 'search'
                    ? { address_line: addressSearch, city: '', postal_code: '', country: '' }
                    : { address_line: addressLine, address_line2: addressLine2, city, state_region: stateRegion, postal_code: postalCode, country },
                  kyc_purpose: purpose || undefined,
                });
                if (result.onfidoUrl) {
                  setOnfidoUrl(result.onfidoUrl);
                } else {
                  setOnfidoUrl(null);
                }
              } catch {
                setOnfidoUrl(null);
              } finally {
                setOnfidoLoading(false);
              }
            }}
            disabled={!isPurposeValid}
            style={{
              width: '100%',
              height: 48,
              background: isPurposeValid ? 'var(--accent-primary)' : 'var(--text-disabled)',
              border: 'none',
              borderRadius: 12,
              fontSize: 16,
              fontWeight: 600,
              color: isPurposeValid ? '#000' : 'var(--text-muted)',
              cursor: isPurposeValid ? 'pointer' : 'not-allowed',
            }}
          >
            Continue
          </button>
        </div>
      </div>
    );
  }
  // ==================== VERIFICATION (Step 4/4) ====================
  if (kycStep === 'verification') {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'var(--bg-primary)',
        paddingBottom: 'calc(100px + env(safe-area-inset-bottom))',
      }}>
        {renderHeader('Purpose of Transak', () => setKycStep('purpose'))}
        <KYCProgressBar step={4} totalSteps={4} />
        <div style={{ padding: '0 16px', textAlign: 'left' }}>
          {/* Transak Logo */}
          <img src='./images/transak.png' />
          {/* URL Display */}
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
            marginTop: 16,
            wordBreak: 'break-all',
          }}>
            {onfidoLoading ? (
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
                Generating verification link...
              </p>
            ) : onfidoUrl ? (
              <p style={{
                fontSize: 13,
                color: 'var(--text-secondary)',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}>
                {onfidoUrl}
                <ExternalLinkIcon />
              </p>
            ) : (
              <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
                Please complete KYC verification through the Fundscrow bot. Use the /kyc command to get started.
              </p>
            )}
          </div>
          {/* Copy URL Button */}
          {onfidoUrl && (
            <button
              onClick={handleCopyUrl}
              style={{
                width: '100%',
                height: 48,
                background: 'rgba(255, 255, 255, 0.09)',
                border: 'none',
                borderRadius: 12,
                fontSize: 16,
                fontWeight: 600,
                color: '#000',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                marginBottom: 16,
              }}
            >
              <CopyIcon />
              {copied ? 'Copied!' : 'Copy URL'}
            </button>
          )}
          {/* Instructions */}
          <p style={{
            fontSize: 13,
            color: 'rgba(255, 255, 255, 0.48)',
            margin: '0 0 24px 0',
          }}>
            {onfidoUrl ? 'Paste the link in your browser to complete the KYC' : ''}
          </p>
          {/* Email option */}
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: 12,
            padding: 16,
            marginBottom: 24,
            textAlign: 'left',
          }}>
            <p style={{
              fontSize: 13,
              color: 'rgba(255, 255, 255, 0.48)',
              margin: '0 0 4px 0',
            }}>
              You can also complete the KYC via the email sent to:
            </p>
            <p style={{
              fontSize: 14,
              color: 'rgba(255, 255, 255, 0.48)',
              margin: 0,
              fontWeight: 600,
            }}>
              {user?.username ? `${user.username}@telegram.com` : 'your-email@example.com'}
            </p>
          </div>
          {/* Keep page open notice */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
            background: 'rgba(255, 255, 255, 0.09)',
            borderRadius: 12,
            padding: 16,
            textAlign: 'left',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <InfoIcon />
            </div>
            <p style={{
              fontSize: 13,
              color: 'rgba(255, 255, 255, 0.48)',
              margin: 0,
              lineHeight: 1.5,
            }}>
              Keep this page open. It will be updated automatically once you complete the KYC.
            </p>
          </div>
        </div>
        {/* Continue Button */}
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '16px',
          paddingBottom: 'calc(16px + env(safe-area-inset-bottom))',
          background: 'var(--bg-primary)',
        }}>
          <button
            onClick={handleComplete}
            disabled={isLoading}
            style={{
              width: '100%',
              height: 48,
              background: 'var(--accent-primary)',
              border: 'none',
              borderRadius: 12,
              fontSize: 16,
              fontWeight: 600,
              color: '#000',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1,
            }}
          >
            {isLoading ? 'Processing...' : 'Continue'}
          </button>
        </div>
      </div>
    );
  }
  return null;
}
export function WithdrawPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { balances, fetchBalances } = useWalletStore();
  const { addresses: savedWallets } = useAddressBookStore();
  const initialCurrency = searchParams.get('currency') || 'USDT';
  const [viewState, setViewState] = useState<ViewState>('select');
  const [selectedMethod, setSelectedMethod] = useState<WithdrawMethod | null>(null);
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [showAddressBook, setShowAddressBook] = useState(false);
  const [showQrScanner, setShowQrScanner] = useState(false);
  const [showMethodModal, setShowMethodModal] = useState(false); // Show modal by default
  const [saveAddress, setSaveAddress] = useState(false);
  const [addressLabel, setAddressLabel] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successData, setSuccessData] = useState<{
    address: string;
    amount: string;
    currency: string;
    network: string;
    transactionId: string;
    date: string;
  } | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [addressFocused, setAddressFocused] = useState(false);
  const [amountFocused, setAmountFocused] = useState(false);
  const qrScannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerRef = useRef<HTMLDivElement>(null);
  // Filter saved wallets by compatible currency
  const compatibleWallets = savedWallets.filter(w => {
    // USDT and USDT_TRC20 are compatible
    if (initialCurrency === 'USDT' || initialCurrency === 'USDT_TRC20') {
      return w.currency === 'USDT' || w.currency === 'USDT_TRC20';
    }
    return w.currency === initialCurrency;
  });
  useEffect(() => {
    fetchBalances();
  }, [fetchBalances]);
  // Fetch exchange rate for NO-KYC flow
  // const [nokycExchangeRate, setNokycExchangeRate] = useState(0);
  // const [nokycRateLoading, setNokycRateLoading] = useState(true);
  // useEffect(() => {
  //   const fetchRate = async () => {
  //     setNokycRateLoading(true);
  //     try {
  //       const curr = initialCurrency === 'USDT_TRC20' ? 'tether' :
  //         initialCurrency === 'BTC' ? 'bitcoin' :
  //           initialCurrency === 'ETH' ? 'ethereum' :
  //             initialCurrency === 'LTC' ? 'litecoin' : 'tether';
  //       const response = await fetch(
  //         `https://api.coingecko.com/api/v3/simple/price?ids=${curr}&vs_currencies=eur`
  //       );
  //       if (response.ok) {
  //         const data = await response.json();
  //         const rate = data[curr]?.eur || 0;
  //         setNokycExchangeRate(rate);
  //       }
  //     } catch {
  //       setNokycExchangeRate(0);
  //     } finally {
  //       setNokycRateLoading(false);
  //     }
  //   };
  //   fetchRate();
  // }, [initialCurrency]);
  // Fetch NO-KYC status when entering visa_nokyc view
  // useEffect(() => {
  //   if (viewState === 'visa_nokyc') {
  //     const fetchNokycStatus = async () => {
  //       try {
  //         const status = await api.getNoKycStatus();
  //         if (status.unlocked) {
  //           // User has NO-KYC access, show amount entry screen
  //           setNokycRecipients(status.recipients || []);
  //           setNokycStep('amount');
  //         } else {
  //           // User needs to pay for access
  //           setNokycStep('locked');
  //         }
  //       } catch (error) {
  //         console.error('Failed to fetch NO-KYC status:', error);
  //         // Assume locked if we can't fetch status
  //         setNokycStep('locked');
  //       }
  //     };
  //     fetchNokycStatus();
  //   }
  // }, [viewState]);
  // Get balance for selected currency - check both USDT and USDT_TRC20
  const balance = balances.find(b => {
    const curr = initialCurrency.toUpperCase();
    const bCurr = b.currency.toUpperCase();
    // Match USDT with USDT_TRC20 and vice versa
    if (curr === 'USDT' || curr === 'USDT_TRC20') {
      return bCurr === 'USDT' || bCurr === 'USDT_TRC20';
    }
    return bCurr === curr;
  });
  // Use available balance (total includes funds locked in escrow)
  const availableBalance = parseFloat(balance?.available || balance?.total || '0');
  const currencyInfo = CURRENCIES[initialCurrency as keyof typeof CURRENCIES];
  const displayCurrency = initialCurrency === 'USDT_TRC20' ? 'USDT' : initialCurrency;
  const network = currencyInfo?.network || 'Unknown';
  // Handle paste from clipboard
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setAddress(text);
    } catch {
      console.error('Failed to read clipboard');
    }
  };
  // const [initialViewSet, setInitialViewSet] = useState(false);
  // QR Scanner functions
  const startQrScanner = async () => {
    setShowQrScanner(true);
    // Wait for modal to render
    setTimeout(async () => {
      try {
        const scanner = new Html5Qrcode('qr-reader');
        qrScannerRef.current = scanner;
        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText) => {
            // Handle successful scan
            setAddress(decodedText);
            stopQrScanner();
          },
          () => {
            // Ignore errors during scanning
          }
        );
      } catch (err) {
        console.error('QR Scanner error:', err);
        setShowQrScanner(false);
      }
    }, 100);
  };
  const stopQrScanner = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop().catch(console.error);
      qrScannerRef.current = null;
    }
    setShowQrScanner(false);
  };
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // NO-KYC Visa Card onboarding state - must be at top level for hooks consistency
  // NO-KYC state - supports both locked (first time) and unlocked (recurring) flows
  const [nokycStep, setNokycStep] = useState<
    | 'locked' | 'contact' | 'payment' | 'processing' | 'success' // First-time flow
    | 'amount' | 'recipient' | 'confirm' | 'withdraw_processing' | 'withdraw_success' // Unlocked flow
  >('locked');
  const [nokycEmail, setNokycEmail] = useState('');
  const [nokycPhone, setNokycPhone] = useState('');
  // const [nokycRecipients, setNokycRecipients] = useState<NoKycRecipient[]>([]);
  // const [selectedRecipient, setSelectedRecipient] = useState<NoKycRecipient | null>(null);
  // const [nokycAmount, setNokycAmount] = useState('');
  // const [nokycFiatCurrency, setNokycFiatCurrency] = useState('EUR');
  // const [nokycIsLoading, setNokycIsLoading] = useState(false);
  const handleWithdraw = async () => {
    if (!address || !amount || isSubmitting) return;
    // Validate wallet address format
    const currencyForValidation = (initialCurrency === 'USDT_TRC20' ? 'USDT' : initialCurrency) as Currency;
    if (!validateWalletAddress(address, currencyForValidation)) {
      setError(`Invalid ${currencyForValidation} wallet address format. Please check and try again.`);
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const data = await api.withdraw({
        amount,
        currency: currencyForValidation,
        address,
      });
      if (data.success) {
        // Save address to address book if checkbox is checked
        if (saveAddress) {
          const { addAddress } = useAddressBookStore.getState();
          addAddress({
            label: addressLabel.trim() || `Wallet ${new Date().toLocaleDateString()}`,
            address: address,
            currency: (initialCurrency === 'USDT_TRC20' ? 'USDT' : initialCurrency) as Currency,
            network: network,
          });
        }
        // Format date for success screen
        const now = new Date();
        const formattedDate = now.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }) + ' ' + now.toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
        });
        // Show success screen with transaction details
        setSuccessData({
          address: address,
          amount: amount,
          currency: displayCurrency,
          network: network,
          transactionId: data.transactionId || 'Processing...',
          date: formattedDate,
        });
        setShowSuccess(true);
      } else {
        setError(data.message || 'Withdrawal not available');
      }
    } catch (err) {
      setError((err as Error).message || 'Withdrawal failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  const isValid = address.length > 0 && parseFloat(amount) > 0 && parseFloat(amount) <= availableBalance;
  // Success screen (Figma exact design)
  if (showSuccess && successData) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'var(--bg-primary)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background gradient ellipse */}
        <div style={{
          position: 'absolute',
          top: 80,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 320,
          height: 240,
          background: 'radial-gradient(ellipse, rgba(98, 126, 234, 0.3) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        {/* Success Icon with Sparkles */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginTop: 80,
          marginBottom: 40,
          position: 'relative',
        }}>
          <div style={{ position: 'relative' }}>
            <Sparkles />
            <SuccessCheckIcon />
          </div>
        </div>
        {/* Title and Subtitle */}
        <div style={{
          textAlign: 'center',
          padding: '0 16px',
          marginBottom: 48,
        }}>
          <h1 style={{
            fontSize: 32,
            fontWeight: 400,
            color: 'white',
            margin: '0 0 8px 0',
            fontFamily: "'Radio Canada Big', sans-serif",
          }}>
            Withdraw success!
          </h1>
          <p style={{
            fontSize: 15,
            color: 'rgba(255, 255, 255, 0.88)',
            margin: 0,
          }}>
            You will receive funds in few minutes
          </p>
        </div>
        {/* Transaction Details Card */}
        <div style={{
          margin: '0 16px',
          background: 'rgba(255, 255, 255, 0.09)',
          borderRadius: 12,
          padding: 16,
        }}>
          {/* Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: 'rgba(255, 255, 255, 0.56)' }}>To</span>
              <span style={{ fontSize: 13, color: 'white' }}>
                {successData.address.slice(0, 4)}…{successData.address.slice(-4)}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: 'rgba(255, 255, 255, 0.56)' }}>Network</span>
              <span style={{ fontSize: 13, color: 'white' }}>{successData.network}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: 'rgba(255, 255, 255, 0.56)' }}>Date</span>
              <span style={{ fontSize: 13, color: 'white' }}>{successData.date}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: 'rgba(255, 255, 255, 0.56)' }}>Transaction ID</span>
              <span style={{ fontSize: 13, color: 'white' }}>{successData.transactionId}</span>
            </div>
          </div>
          {/* Divider */}
          <div style={{
            height: 0,
            borderBottom: '1px dashed rgba(255, 255, 255, 0.12)',
            marginBottom: 16,
          }} />
          {/* Total */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 15, color: 'white' }}>Total</span>
            <span style={{ fontSize: 15, color: 'white' }}>{successData.amount} {successData.currency}</span>
          </div>
        </div>
        {/* Done Button */}
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          padding: 16,
          paddingBottom: 'calc(16px + env(safe-area-inset-bottom))',
          background: 'rgba(255, 255, 255, 0.09)',
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
        }}>
          <button
            onClick={() => navigate('/')}
            style={{
              width: '100%',
              height: 48,
              background: 'var(--accent-primary)',
              border: 'none',
              borderRadius: 12,
              fontSize: 15,
              fontWeight: 600,
              color: '#0F0F1A',
              cursor: 'pointer',
            }}
          >
            Done
          </button>
        </div>
      </div>
    );
  }
  // Method selection view
  if (viewState === 'select') {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'var(--bg-primary)',
        paddingBottom: 'calc(80px + env(safe-area-inset-bottom))',
      }}>
        {/* Header - 56px height */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 56,
          padding: '0 16px',
        }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              width: 24,
              height: 24,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
            }}
          >
            <BackIcon />
          </button>
          <h1 style={{
            fontSize: 15,
            fontWeight: 600,
            color: 'var(--text-primary)',
            margin: 0,
          }}>
            Withdraw {displayCurrency}
          </h1>
          <div style={{ width: 24 }} />
        </div>
        {/* From label */}
        <div style={{ padding: '0 16px', marginBottom: 8 }}>
          <span style={{ fontSize: 13, color: 'rgba(255, 255, 255, 0.56)' }}>From</span>
        </div>
        {/* Balance Card */}
        <div style={{ padding: '0 16px', marginBottom: 24 }}>
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: 16,
            padding: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}>
            <CurrencyIcon currency={initialCurrency} size={44} />
            <div style={{ flex: 1 }}>
              <p style={{
                fontSize: 15,
                fontWeight: 600,
                color: 'var(--text-primary)',
                margin: 0,
              }}>
                {displayCurrency}
              </p>
              <p style={{
                fontSize: 13,
                color: 'rgba(255, 255, 255, 0.48)',
                margin: 0,
              }}>
                {displayCurrency === 'USDT' ? 'TetherUS' : displayCurrency === 'BTC' ? 'Bitcoin' : displayCurrency === 'ETH' ? 'Ethereum' : displayCurrency === 'LTC' ? 'Litecoin' : network}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{
                fontSize: 17,
                fontWeight: 600,
                color: 'var(--text-primary)',
                margin: 0,
              }}>
                {availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p style={{
                fontSize: 12,
                color: 'var(--text-muted)',
                margin: 0,
              }}>
                ${availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
        {/* Withdraw method selection - Figma exact */}
        <div style={{ padding: '0 16px' }}>
          <p style={{
            fontSize: 14,
            color: 'var(--text-secondary)',
            margin: '0 0 12px 0',
          }}>
            Withdraw money
          </p>
          {/* --- 1. Visa Debit Card NO KYC Option --- */}
          <div
            onClick={() => setSelectedMethod('visa_nokyc')}
            style={{
              width: '100%',
              background: 'rgba(255, 255, 255, 0.09)',
              borderRadius: 12,
              padding: 4,
              border: selectedMethod === 'visa_nokyc' ? '1px solid #bfed33' : '1px solid transparent',
              cursor: 'pointer',
              marginBottom: 12,
              transition: 'border 0.2s ease',
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 12px',
            }}>
              <p style={{
                fontSize: 15,
                fontWeight: 500,
                color: 'var(--text-primary)',
                margin: 0,
              }}>
                Visa debit card (no KYC)
              </p>
              {/* Radio Indicator */}
              <div style={{
                width: 18,
                height: 18,
                borderRadius: '50%',
                border: selectedMethod === 'visa_nokyc' ? '5px solid #BFED33' : '2px solid rgba(255, 255, 255, 0.2)',
                background: selectedMethod === 'visa_nokyc' ? '#0E0D1F' : 'transparent',
                padding: '2px',
                backgroundClip: 'content-box',
                boxSizing: 'border-box',
                transition: 'all 0.2s ease',
              }} />
            </div>
            <div style={{
              background: '#0e0d1f',
              borderRadius: 8,
              padding: 12,
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute',
                top: -50,
                right: -30,
                width: 200,
                height: 150,
                background: 'radial-gradient(ellipse at center, rgba(75, 60, 150, 0.4) 0%, transparent 70%)',
                pointerEvents: 'none',
              }} />
              <div style={{
                position: 'absolute',
                right: -10,
                top: 10,
                transform: 'rotate(15deg)',
                opacity: 0.9,
              }}>
                <svg width="100" height="70" viewBox="0 0 100 70" fill="none">
                  <rect x="20" y="0" width="80" height="50" rx="6" fill="#3D3A5C" />
                  <rect x="20" y="10" width="80" height="8" fill="#2D2A4C" />
                  <rect x="0" y="15" width="80" height="50" rx="6" fill="#4A4670" />
                  <rect x="8" y="24" width="30" height="5" rx="2" fill="#6B67A0" />
                  <rect x="8" y="34" width="45" height="3" rx="1" fill="#5A5690" />
                  <rect x="8" y="42" width="25" height="3" rx="1" fill="#5A5690" />
                  <circle cx="70" cy="45" r="18" fill="url(#coinGrad)" />
                  <path d="M70 38v14M64 45h12" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" />
                  <defs>
                    <linearGradient id="coinGrad" x1="52" y1="27" x2="88" y2="63" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#BFED33" />
                      <stop offset="1" stopColor="#8BC34A" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 500, color: 'white', margin: '0 0 4px 0', lineHeight: '24px' }}>
                  Unlock anonimous crypto off-ramp
                </p>
                <p style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.64)', margin: '0 0 20px 0', lineHeight: '16px' }}>
                  Require one time fee
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setViewState('visa_nokyc');
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    height: 32,
                    padding: '4px 8px 4px 12px',
                    background: '#BFED33',
                    border: 'none',
                    borderRadius: 8,
                    cursor: 'pointer',
                  }}
                >
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#0e0d1f' }}>Learn more</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="#0e0d1f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          {/* --- 2. Bank Transfer Option --- */}
          <div
            onClick={() => setSelectedMethod('bank_kyc')}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(255, 255, 255, 0.09)',
              borderRadius: 12,
              padding: 12,
              cursor: 'pointer',
              marginBottom: 12,
              border: selectedMethod === 'bank_kyc' ? '1px solid #bfed33' : '1px solid transparent',
              transition: 'border 0.2s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ position: 'relative', width: 32, height: 32 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #4A4670 0%, #3D3A5C 100%)' }} />
                <div style={{ position: 'absolute', top: 4, left: 4, width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <rect x="2" y="5" width="20" height="14" rx="2" stroke="white" strokeWidth="1.5" />
                    <path d="M2 10H22" stroke="white" strokeWidth="1.5" />
                  </svg>
                </div>
              </div>
              <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-primary)', margin: 0 }}>Bank Transfer</p>
            </div>
            {/* Radio Indicator */}
            <div style={{
              width: 18,
              height: 18,
              borderRadius: '50%',
              border: selectedMethod === 'bank_kyc' ? '5px solid #BFED33' : '2px solid rgba(255, 255, 255, 0.2)',
              background: selectedMethod === 'bank_kyc' ? '#0E0D1F' : 'transparent',
              padding: '2px',
              backgroundClip: 'content-box',
              boxSizing: 'border-box',
              transition: 'all 0.2s ease',
            }} />
          </div>
          {/* --- 3. Debit Card Option --- */}
          <div
            onClick={() => setSelectedMethod('onchain')}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(255, 255, 255, 0.09)',
              borderRadius: 12,
              padding: 12,
              cursor: 'pointer',
              border: selectedMethod === 'onchain' ? '1px solid #bfed33' : '1px solid transparent',
              transition: 'border 0.2s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ position: 'relative', width: 32, height: 32 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #4A4670 0%, #3D3A5C 100%)' }} />
                <div style={{ position: 'absolute', top: 4, left: 4, width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M19 7H5C3.89543 7 3 7.89543 3 9V18C3 19.1046 3.89543 20 5 20H19C20.1046 20 21 19.1046 21 18V9C21 7.89543 20.1046 7 19 7Z" stroke="white" strokeWidth="1.5" />
                    <path d="M16 14C16 14.5523 15.5523 15 15 15C14.4477 15 14 14.5523 14 14C14 13.4477 14.4477 13 15 13C15.5523 13 16 13.4477 16 14Z" fill="white" />
                    <path d="M3 7L5 4H19L21 7" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
              <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-primary)', margin: 0 }}>On Chain</p>
            </div>
            {/* Radio Indicator */}
            <div style={{
              width: 18,
              height: 18,
              borderRadius: '50%',
              border: selectedMethod === 'onchain' ? '5px solid #BFED33' : '2px solid rgba(255, 255, 255, 0.2)',
              background: selectedMethod === 'onchain' ? '#0E0D1F' : 'transparent',
              padding: '2px',
              backgroundClip: 'content-box',
              boxSizing: 'border-box',
              transition: 'all 0.2s ease',
            }} />
          </div>
        </div>
        {/* Continue Button */}
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '16px',
          background: 'var(--bg-primary)',
          zIndex: 50,
        }}>
          <button
            onClick={() => selectedMethod && setViewState(selectedMethod)}
            disabled={!selectedMethod}
            style={{
              width: '100%',
              height: 48,
              background: selectedMethod ? 'var(--accent-primary)' : 'var(--text-disabled)',
              border: 'none',
              borderRadius: 12,
              fontSize: 16,
              fontWeight: 600,
              color: selectedMethod ? '#000' : 'var(--text-muted)',
              cursor: selectedMethod ? 'pointer' : 'not-allowed',
            }}
          >
            Continue
          </button>
        </div>
        {/* Withdraw Method Modal - Figma Design */}
        {showMethodModal && (
          <div
            className="withdraw-modal-overlay"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowMethodModal(false);
              }
            }}
          >
            <div className="withdraw-modal-sheet">
              <h2 className="withdraw-modal-title">Withdraw money</h2>
              <div className="withdraw-modal-methods">
                {/* Visa Debit Card - Clickable, shows locked/unlocked based on state */}
                <button
                  className={`withdraw-modal-method ${selectedMethod === 'visa_nokyc' ? 'selected' : ''}`}
                  onClick={() => setSelectedMethod('visa_nokyc')}
                >
                  <div className="withdraw-modal-method-content">
                    <div className="withdraw-modal-method-icon" style={{ background: 'rgba(191, 237, 51, 0.12)' }}>
                      <ModalCardIcon />
                    </div>
                    <div className="withdraw-modal-method-info">
                      <div className="withdraw-modal-method-header">
                        <div className="withdraw-modal-method-title-row">
                          <p className="withdraw-modal-method-title">Visa debit card</p>
                          <span className="withdraw-modal-badge" style={{ background: 'rgba(191, 237, 51, 0.15)', color: '#BFED33' }}>NO KYC</span>
                        </div>
                      </div>
                      <p className="withdraw-modal-method-desc">Anonymous crypto off-ramp</p>
                    </div>
                  </div>
                  <div className={`withdraw-modal-radio ${selectedMethod === 'visa_nokyc' ? 'selected' : ''}`} />
                </button>
                {/* Bank Account */}
                <button
                  className={`withdraw-modal-method ${selectedMethod === 'bank_kyc' ? 'selected' : ''}`}
                  onClick={() => setSelectedMethod('bank_kyc')}
                >
                  <div className="withdraw-modal-method-content">
                    <div className="withdraw-modal-method-icon">
                      <ModalBankIcon />
                    </div>
                    <div className="withdraw-modal-method-info">
                      <div className="withdraw-modal-method-header">
                        <div className="withdraw-modal-method-title-row">
                          <p className="withdraw-modal-method-title">Bank account</p>
                          <span className="withdraw-modal-badge">KYC required</span>
                        </div>
                      </div>
                      <p className="withdraw-modal-method-desc">Withdraw to your bank account</p>
                    </div>
                  </div>
                  <div className={`withdraw-modal-radio ${selectedMethod === 'bank_kyc' ? 'selected' : ''}`} />
                </button>
                {/* On Chain */}
                <button
                  className={`withdraw-modal-method ${selectedMethod === 'onchain' ? 'selected' : ''}`}
                  onClick={() => setSelectedMethod('onchain')}
                >
                  <div className="withdraw-modal-method-content">
                    <div className="withdraw-modal-method-icon">
                      <ModalChainIcon />
                    </div>
                    <div className="withdraw-modal-method-info">
                      <div className="withdraw-modal-method-header">
                        <div className="withdraw-modal-method-title-row">
                          <p className="withdraw-modal-method-title">On chain</p>
                        </div>
                      </div>
                      <p className="withdraw-modal-method-desc">Send to a crypto wallet</p>
                    </div>
                  </div>
                  <div className={`withdraw-modal-radio ${selectedMethod === 'onchain' ? 'selected' : ''}`} />
                </button>
              </div>
              <div className="withdraw-modal-footer">
                <button
                  className="withdraw-modal-btn"
                  disabled={!selectedMethod}
                  onClick={() => {
                    if (selectedMethod) {
                      setShowMethodModal(false);
                      setViewState(selectedMethod);
                    }
                  }}
                >
                  Continue
                </button>
                <div className="withdraw-modal-indicator">
                  <div className="withdraw-modal-indicator-bar" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
  // NO-KYC Visa Card view - matches Figma
  if (viewState === 'visa_nokyc') {
    // Locked/Info screen
    if (nokycStep === 'locked') {
      return (
        <NoKycDetailModal
          isOpen={true}
          onClose={() => {
            setViewState('select');
            setNokycStep('locked');
          }}
          onGetStarted={() => navigate('/nokyc-onboarding')} // Learn More logic
        />
      );
    }
    // Contact details screen - matches Figma 762:44326
    if (nokycStep === 'contact') {
      return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', paddingBottom: 'calc(100px + env(safe-area-inset-bottom))' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56, padding: '0 16px' }}>
            <button onClick={() => setNokycStep('locked')} style={{ width: 24, height: 24, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}><BackIcon /></button>
            <h1 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Confirm contact details</h1>
            <div style={{ width: 24 }} />
          </div>
          <div style={{ padding: '24px 16px' }}>
            {/* Email */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>Email</label>
              <input
                type="email"
                value={nokycEmail}
                onChange={(e) => setNokycEmail(e.target.value)}
                placeholder="Enter your email"
                style={{ width: '100%', height: 48, background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 12, padding: '0 16px', fontSize: 15, color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            {/* Phone */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>Mobile Number</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 12, padding: '0 12px', minWidth: 80, height: 48 }}>
                  <span style={{ fontSize: 16 }}>🇺🇸</span>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M3 4.5L6 7.5L9 4.5" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span style={{ fontSize: 14, color: 'var(--text-primary)' }}>+1</span>
                </div>
                <input
                  type="tel"
                  value={nokycPhone}
                  onChange={(e) => setNokycPhone(e.target.value)}
                  placeholder=""
                  style={{ flex: 1, height: 48, background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 12, padding: '0 16px', fontSize: 15, color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            </div>
            {/* Green info box - matches Figma */}
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
              background: 'rgba(191, 237, 51, 0.08)',
              borderRadius: 12,
              padding: 16
            }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
                <circle cx="10" cy="10" r="10" fill="#BFED33" />
                <path d="M6 10L9 13L14 7" stroke="#0e0d1f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#BFED33', margin: '0 0 4px 0' }}>
                  No documents required
                </p>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                  We only need your email and phone number to proceed. Your contact details are used only for notifications and secure communication.
                </p>
              </div>
            </div>
          </div>
          <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '16px', paddingBottom: 'calc(16px + env(safe-area-inset-bottom))', background: 'var(--bg-primary)', zIndex: 50 }}>
            <button
              onClick={() => setNokycStep('payment')}
              disabled={!nokycEmail || !nokycPhone}
              style={{
                width: '100%',
                height: 48,
                background: nokycEmail && nokycPhone ? '#BFED33' : 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: 12,
                fontSize: 15,
                fontWeight: 600,
                color: nokycEmail && nokycPhone ? '#0e0d1f' : 'var(--text-muted)',
                cursor: nokycEmail && nokycPhone ? 'pointer' : 'not-allowed'
              }}
            >
              Continue
            </button>
          </div>
        </div>
      );
    }
  }
  // Bank KYC withdraw form (Transak) - Full KYC wizard matching Figma
  if (viewState === 'bank_kyc') {
    return (
      <TransakKYCWithdrawForm
        currency={displayCurrency}
        initialCurrency={initialCurrency}
        availableBalance={availableBalance}
        amount={amount}
        onBack={() => setViewState('select')}
      />
    );
  }
  // On-chain withdraw form
  if (viewState !== 'onchain') return null;
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      paddingBottom: 'calc(120px + env(safe-area-inset-bottom))',
    }}>
      {/* Header - 56px height */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 56,
        padding: '0 16px',
      }}>
        <button
          onClick={() => setViewState('select')}
          style={{
            width: 24,
            height: 24,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
          }}
        >
          <BackIcon />
        </button>
        <h1 style={{
          fontSize: 15,
          fontWeight: 600,
          color: 'var(--text-primary)',
          margin: 0,
        }}>
          Withdraw {displayCurrency}
        </h1>
        <div style={{ width: 24 }} />
      </div>
      {/* Form Content */}
      <div style={{ padding: '0 16px' }}>
        {/* Choose from Address Book Button */}
        {compatibleWallets.length > 0 && (
          <button
            onClick={() => setShowAddressBook(true)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '12px 16px',
              marginBottom: 20,
              background: 'var(--bg-card)',
              border: '1px dashed var(--border-default)',
              borderRadius: 12,
              cursor: 'pointer',
              color: 'var(--accent-primary)',
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            <AddressBookIcon />
            Choose from address book
          </button>
        )}
        {/* Address Input */}
        <div style={{ marginBottom: 20 }}>
          <label style={{
            display: 'block',
            fontSize: 14,
            color: 'var(--text-secondary)',
            marginBottom: 8,
          }}>
            Address or Domain name
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Enter address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onFocus={() => setAddressFocused(true)}
              onBlur={() => setAddressFocused(false)}
              style={{
                width: '100%',
                height: 48,
                background: 'var(--bg-input)',
                border: `1px solid ${addressFocused ? 'var(--accent-primary)' : 'var(--border-default)'}`,
                borderRadius: 8,
                padding: '0 158px 0 16px',
                fontSize: 16,
                color: 'var(--text-primary)',
                outline: 'none',
                transition: 'border-color 0.2s ease',
                boxSizing: 'border-box',
              }}
            />
            <div style={{
              position: 'absolute',
              right: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              display: 'flex',
              gap: 6,
            }}>
              <button
                onClick={handlePaste}
                style={{
                  background: 'var(--accent-muted)',
                  border: 'none',
                  borderRadius: 8,
                  padding: '6px 12px',
                  color: 'var(--accent-primary)',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                Paste
              </button>
              <button
                onClick={startQrScanner}
                style={{
                  width: 32,
                  height: 32,
                  background: 'var(--bg-tertiary)',
                  border: 'none',
                  borderRadius: 8,
                  padding: 0,
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ScanQrIcon />
              </button>
              <button
                onClick={() => compatibleWallets.length > 0 ? setShowAddressBook(true) : null}
                style={{
                  width: 32,
                  height: 32,
                  background: 'var(--bg-tertiary)',
                  border: 'none',
                  borderRadius: 8,
                  padding: 0,
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        {/* Network Display */}
        <div style={{ marginBottom: 20 }}>
          <label style={{
            display: 'block',
            fontSize: 14,
            color: 'var(--text-secondary)',
            marginBottom: 8,
          }}>
            Destination network
          </label>
          <div
            style={{
              width: '100%',
              height: 48,
              background: 'var(--bg-input)',
              border: '1px solid var(--border-default)',
              borderRadius: 8,
              padding: '0 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              cursor: 'not-allowed',
              opacity: 0.7,
              boxSizing: 'border-box',
            }}
          >
            <TronIcon size={24} />
            <span style={{
              fontSize: 16,
              color: 'var(--text-primary)',
            }}>
              Tron (TRC20)
            </span>
          </div>
        </div>
        {/* Amount Input */}
        <div style={{ marginBottom: 20 }}>
          <label style={{
            display: 'block',
            fontSize: 14,
            color: 'var(--text-secondary)',
            marginBottom: 8,
          }}>
            Withdraw amount
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              onFocus={() => setAmountFocused(true)}
              onBlur={() => setAmountFocused(false)}
              style={{
                width: '100%',
                height: 48,
                background: 'var(--bg-input)',
                border: `1px solid ${amountFocused ? 'var(--accent-primary)' : 'var(--border-default)'}`,
                borderRadius: 8,
                padding: '0 70px 0 16px',
                fontSize: 16,
                color: 'var(--text-primary)',
                outline: 'none',
                transition: 'border-color 0.2s ease',
                boxSizing: 'border-box',
              }}
            />
            <span style={{
              position: 'absolute',
              right: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--text-secondary)',
            }}>
              {displayCurrency}
            </span>
          </div>
          <p style={{
            fontSize: 12,
            color: 'var(--text-muted)',
            margin: '8px 0 0 0',
          }}>
            Available: {availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {displayCurrency}
          </p>
        </div>
        {/* Save Address Checkbox */}
        <div
          onClick={() => setSaveAddress(!saveAddress)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            cursor: 'pointer',
            padding: '4px 0',
          }}
        >
          {saveAddress ? <CheckboxChecked /> : <CheckboxUnchecked />}
          <span style={{
            fontSize: 14,
            color: 'rgba(255, 255, 255, 0.72)',
          }}>
            Save address
          </span>
        </div>
        {/* Address Label Input - shown when Save address is checked */}
        {saveAddress && (
          <div style={{ marginTop: 16 }}>
            <label style={{
              display: 'block',
              fontSize: 14,
              color: 'var(--text-secondary)',
              marginBottom: 8,
            }}>
              Address label
            </label>
            <input
              type="text"
              placeholder="e.g. Binance wallet, My savings"
              value={addressLabel}
              onChange={(e) => setAddressLabel(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                height: 48,
                background: 'var(--bg-input)',
                border: '1px solid var(--border-default)',
                borderRadius: 8,
                padding: '0 16px',
                fontSize: 16,
                color: 'var(--text-primary)',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
        )}
      </div>
      {/* Withdraw Button - Fixed to bottom */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '16px',
        paddingBottom: 'calc(16px + env(safe-area-inset-bottom))',
        background: 'var(--bg-primary)',
      }}>
        {error && (
          <p style={{
            color: 'var(--error-primary)',
            fontSize: 14,
            textAlign: 'center',
            margin: '0 0 12px 0',
          }}>
            {error}
          </p>
        )}
        <button
          onClick={handleWithdraw}
          disabled={!isValid || isSubmitting}
          style={{
            width: '100%',
            height: 48,
            background: isValid && !isSubmitting ? 'var(--accent-primary)' : 'var(--text-disabled)',
            border: 'none',
            borderRadius: 10,
            fontSize: 16,
            fontWeight: 600,
            color: isValid && !isSubmitting ? '#0F0F1A' : 'var(--text-muted)',
            cursor: isValid && !isSubmitting ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s ease',
          }}
        >
          {isSubmitting ? 'Processing...' : 'Withdraw'}
        </button>
      </div>
      {/* Address Book Modal */}
      {showAddressBook && (
        <div
          onClick={() => setShowAddressBook(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            zIndex: 200,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              background: 'var(--bg-secondary)',
              borderRadius: '20px 20px 0 0',
              padding: 24,
              paddingBottom: 'calc(24px + env(safe-area-inset-bottom))',
              maxHeight: '80vh',
              overflowY: 'auto',
            }}
          >
            {/* Handle */}
            <div style={{
              width: 40,
              height: 4,
              background: 'var(--text-disabled)',
              borderRadius: 9999,
              margin: '0 auto 24px',
            }} />
            {/* Title */}
            <h2 style={{
              fontSize: 20,
              fontWeight: 700,
              color: 'var(--text-primary)',
              textAlign: 'center',
              margin: '0 0 24px 0',
            }}>
              Choose from address book
            </h2>
            {/* Saved wallet addresses */}
            {compatibleWallets.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '24px 0',
                color: 'var(--text-muted)',
              }}>
                <p style={{ margin: '0 0 12px 0' }}>No saved wallets for {displayCurrency}</p>
                <button
                  onClick={() => {
                    setShowAddressBook(false);
                    navigate('/address-book');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--accent-primary)',
                    cursor: 'pointer',
                    fontSize: 14,
                    fontWeight: 500,
                  }}
                >
                  + Add new wallet
                </button>
              </div>
            ) : (
              compatibleWallets.map((wallet) => (
                <button
                  key={wallet.id}
                  onClick={() => {
                    setAddress(wallet.address);
                    setShowAddressBook(false);
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: 16,
                    background: 'var(--bg-card)',
                    border: 'none',
                    borderRadius: 12,
                    marginBottom: 8,
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <CurrencyIcon currency={wallet.currency} size={40} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize: 16,
                      fontWeight: 500,
                      color: 'var(--text-primary)',
                      margin: 0,
                    }}>
                      {wallet.label}
                    </p>
                    <p style={{
                      fontSize: 12,
                      color: 'var(--text-muted)',
                      margin: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {wallet.address.slice(0, 12)}...{wallet.address.slice(-8)}
                    </p>
                  </div>
                  <ChevronRightIcon />
                </button>
              ))
            )}
            <div className="figma-deposit-footer">
              <button className="figma-deposit-share-btn" onClick={() => setShowAddressBook(false)}>
                Continue
              </button>
              <div className="figma-deposit-home-indicator">
                <div className="figma-deposit-home-indicator-bar" />
              </div>
            </div>

          </div>
        </div>
      )}
      {/* QR Scanner Modal - Figma exact */}
      {showQrScanner && (
        <div
          onClick={stopQrScanner}
          style={{
            position: 'fixed',
            inset: 0,
            background: '#0e0d1f',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 300,
          }}
        >
          {/* Scanner Header */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 20px',
              paddingTop: 'calc(16px + env(safe-area-inset-top))',
            }}
          >
            <button
              onClick={stopQrScanner}
              style={{
                width: 40,
                height: 40,
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M9.66135 4.72394C10.054 4.40371 10.6331 4.42659 10.9992 4.7923C11.3653 5.1584 11.3879 5.73742 11.0676 6.13019L10.9992 6.20636L6.20529 11.0003H20.0022C20.5545 11.0003 21.0022 11.448 21.0022 12.0003C21.002 12.5524 20.5543 13.0003 20.0022 13.0003H6.20725L10.9992 17.7923C11.3898 18.1828 11.3897 18.8158 10.9992 19.2064C10.6087 19.5969 9.9757 19.5969 9.58518 19.2064L3.43869 13.0599L3.33615 12.9456C2.88807 12.3958 2.88782 11.6028 3.33615 11.053L3.43869 10.9388L9.58518 4.7923L9.66135 4.72394Z" fill="white" />
              </svg>
            </button>
            <span style={{ fontSize: 17, fontWeight: 600, color: 'white' }}>Scan QR code</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                imageInputRef.current?.click();
              }}
              style={{
                width: 40,
                height: 40,
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ImageIcon />
            </button>
          </div>
          {/* Scanner Area */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 20px',
            }}
          >
            <p style={{
              fontSize: 14,
              color: 'rgba(255, 255, 255, 0.6)',
              margin: '0 0 24px 0',
              textAlign: 'center',
            }}>
              Position the QR code within the frame
            </p>
            {/* QR Scanner Container with Figma-exact dashed border */}
            <div
              id="qr-reader"
              ref={scannerContainerRef}
              style={{
                width: '280px',
                height: '280px',
                borderRadius: 16,
                overflow: 'hidden',
                position: 'relative',
                border: '4px dashed #BFED33',
              }}
            />
          </div>
          {/* Enter code manually option */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              stopQrScanner();
              // Focus on the address input
              setTimeout(() => {
                const addressInput = document.querySelector('input[placeholder*="address"]') as HTMLInputElement;
                if (addressInput) addressInput.focus();
              }, 100);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '24px 20px',
              paddingBottom: 'calc(24px + env(safe-area-inset-bottom))',
              cursor: 'pointer',
            }}
          >
            <EditIcon />
            <span style={{ fontSize: 15, color: '#BFED33', fontWeight: 500 }}>
              Enter code manually
            </span>
          </div>
        </div>
      )}
      {/* Hidden file input for image picker */}
      <input
        type="file"
        accept="image/*"
        ref={imageInputRef}
        onChange={async (event) => {
          const file = event.target.files?.[0];
          if (!file) return;
          try {
            const scanner = new Html5Qrcode('image-qr-reader', { verbose: false });
            const result = await scanner.scanFile(file, true);
            setAddress(result);
            stopQrScanner();
          } catch (err) {
            console.error('Failed to read QR from image:', err);
          }
          if (event.target) {
            event.target.value = '';
          }
        }}
        style={{ display: 'none' }}
      />
      {/* Hidden div for image QR scanning */}
      <div id="image-qr-reader" style={{ display: 'none' }} />
    </div>
  );
}