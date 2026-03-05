import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { useDealStore, useUIStore, useWalletStore } from '@/store';
import { api } from '@/services/api';
import { useCryptoPrices } from '@/hooks/useCryptoPrices';
import {
  MIN_DEAL_AMOUNT,
  MAX_DEAL_AMOUNT,
  MIN_FEE_AMOUNT,
  FEE_TIERS,
  CURRENCIES,
} from '@/config/constants';
import type { Currency, UserRole } from '@/types';

// Icons
const BackIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M9.66135 4.72394C10.054 4.40371 10.6331 4.42659 10.9992 4.7923C11.3653 5.1584 11.3879 5.73742 11.0676 6.13019L10.9992 6.20636L6.20529 11.0003H20.0022C20.5545 11.0003 21.0022 11.448 21.0022 12.0003C21.002 12.5524 20.5543 13.0003 20.0022 13.0003H6.20725L10.9992 17.7923C11.3898 18.1828 11.3897 18.8158 10.9992 19.2064C10.6087 19.5969 9.9757 19.5969 9.58518 19.2064L3.43869 13.0599L3.33615 12.9456C2.88807 12.3958 2.88782 11.6028 3.33615 11.053L3.43869 10.9388L9.58518 4.7923L9.66135 4.72394Z" fill="white" />
  </svg>
);

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

const ChevronDownIcon = ({ open }: { open?: boolean }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}
  >
    <path d="M6 9l6 6 6-6" />
  </svg>
);

const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 12 12" fill="none">
    <g clipPath="url(#clip0_2_22822)">
      <path d="M6 5.3125C6.31066 5.3125 6.5625 5.56434 6.5625 5.875V8.25C6.5625 8.56066 6.31066 8.8125 6 8.8125C5.68934 8.8125 5.4375 8.56066 5.4375 8.25V5.875C5.4375 5.56434 5.68934 5.3125 6 5.3125Z" fill="white" fillOpacity="0.64" />
      <path d="M6 3.1875C6.31066 3.1875 6.5625 3.43934 6.5625 3.75V4.125C6.5625 4.43566 6.31066 4.6875 6 4.6875C5.68934 4.6875 5.4375 4.43566 5.4375 4.125V3.75C5.4375 3.43934 5.68934 3.1875 6 3.1875Z" fill="white" fillOpacity="0.64" />
      <path fillRule="evenodd" clipRule="evenodd" d="M6 0.5C9.03757 0.5 11.5 2.96243 11.5 6C11.5 9.03757 9.03757 11.5 6 11.5C2.96243 11.5 0.5 9.03757 0.5 6C0.5 2.96243 2.96243 0.5 6 0.5ZM6 1.5C3.51472 1.5 1.5 3.51472 1.5 6C1.5 8.48528 3.51472 10.5 6 10.5C8.48528 10.5 10.5 8.48528 10.5 6C10.5 3.51472 8.48528 1.5 6 1.5Z" fill="white" fillOpacity="0.64" />
    </g>
    <defs>
      <clipPath id="clip0_2_22822">
        <rect width="12" height="12" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

const MenuDotsIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="5" r="1.5" fill="currentColor" />
    <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    <circle cx="12" cy="19" r="1.5" fill="currentColor" />
  </svg>
);

const CopyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="17" height="19" viewBox="0 0 17 19" fill="none">
    <path fillRule="evenodd" clipRule="evenodd" d="M15.2041 0.0107422C16.2128 0.113013 17 0.964364 17 2V12C17 13.1046 16.1046 14 15 14H13V17C13 18.1046 12.1046 19 11 19H2C0.964362 19 0.113004 18.2128 0.0107422 17.2041L0 17V7C7.82226e-07 5.89543 0.895433 5 2 5H4V2C4 0.895431 4.89543 9.78057e-07 6 0H15L15.2041 0.0107422ZM6 5H11L11.2041 5.01074C12.2128 5.113 13 5.96436 13 7V12H15V2H6V5Z" fill="white" fillOpacity="0.64" />
  </svg>
);

const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path fillRule="evenodd" clipRule="evenodd" d="M8.00033 0.666504C12.0504 0.666548 15.3336 3.94979 15.3337 7.99984C15.3336 12.0499 12.0504 15.3331 8.00033 15.3332C3.95029 15.3331 0.667014 12.0499 0.666992 7.99984C0.667014 3.94979 3.95029 0.666548 8.00033 0.666504ZM7.75684 4.33903C7.38866 4.33903 7.09019 4.63753 7.09017 5.0057V8.30973C7.09017 8.66187 7.2754 8.98803 7.5778 9.16846L10.1325 10.6925C10.4487 10.8811 10.8579 10.7776 11.0465 10.4614C11.2351 10.1453 11.1316 9.73598 10.8154 9.54736L8.4235 8.12028V5.0057C8.42348 4.63755 8.12497 4.33907 7.75684 4.33903Z" fill="white" fillOpacity="0.64" />
  </svg>
);

const WarningIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path fillRule="evenodd" clipRule="evenodd" d="M6.60432 2.19419C7.24509 1.03988 8.90444 1.04811 9.53401 2.20852L15.1278 11.8563C15.7333 12.973 14.9268 14.3327 13.659 14.3329H2.34065C1.06583 14.3325 0.259828 12.9589 0.879716 11.842L6.60432 2.19419ZM7.99039 10.1017C7.59817 10.1019 7.28013 10.4207 7.28011 10.814V10.9813C7.28021 11.3745 7.59822 11.694 7.99039 11.6942C8.3827 11.6942 8.70057 11.3746 8.70068 10.9813V10.814C8.70066 10.4206 8.38275 10.1018 7.99039 10.1017ZM7.99039 5.57701C7.62265 5.57717 7.32035 5.85724 7.28401 6.21633L7.28011 6.28925V8.30031L7.28401 8.37258C7.3204 8.73162 7.62269 9.01239 7.99039 9.01255C8.38264 9.01254 8.70048 8.6935 8.70068 8.30031V6.28925L8.69677 6.21633C8.66043 5.85714 8.35827 5.57702 7.99039 5.57701Z" fill="#C2FF0A" />
  </svg>
);

// Buyer icon - person with $ badge
const BuyerIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
    <path d="M13.3333 16.0001C9.65144 16.0001 6.66667 13.0153 6.66667 9.33341C6.66667 5.65152 9.65144 2.66675 13.3333 2.66675C17.0152 2.66675 20 5.65152 20 9.33341C20 13.0153 17.0152 16.0001 13.3333 16.0001ZM13.3333 16.0001C8.17868 16.0001 4 20.1787 4 25.3334M13.3333 16.0001C14.7648 16.0001 16.1209 16.3223 17.3333 16.8982M28 19.3334H22C20.8955 19.3334 20 20.2289 20 21.3334C20 22.4379 20.8955 23.3334 22 23.3334H26C27.1045 23.3334 28 24.2289 28 25.3334C28 26.4379 27.1045 27.3334 26 27.3334H20M24 17.3334V29.3334" stroke="white" strokeOpacity="0.88" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Seller icon - box/package
const SellerIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
    <path d="M16 29.3334C14.9091 29.3334 13.8669 28.8931 11.7826 28.0127C6.59419 25.821 4 24.7251 4 22.8818C4 22.3657 4 13.4194 4 9.33341M16 29.3334C17.0909 29.3334 18.1331 28.8931 20.2175 28.0127C25.4059 25.821 28 24.7251 28 22.8818V9.33341M16 29.3334V15.1398M8 16.0001L10.6667 17.3334M22.6667 5.33341L9.33333 12.0001M11.1012 12.9219L7.20629 11.0372C5.06876 10.0029 4 9.48572 4 8.66675C4 7.84777 5.06876 7.33061 7.20629 6.29628L11.1012 4.41157C13.5051 3.24836 14.7071 2.66675 16 2.66675C17.2929 2.66675 18.4949 3.24835 20.8988 4.41157L24.7937 6.29628C26.9312 7.33061 28 7.84777 28 8.66675C28 9.48572 26.9312 10.0029 24.7937 11.0372L20.8988 12.9219C18.4949 14.0851 17.2929 14.6667 16 14.6667C14.7071 14.6667 13.5051 14.0851 11.1012 12.9219Z" stroke="white" strokeOpacity="0.88" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Grid icon for external payment
const GridIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M11.1196 6.95984V9.55484C11.1264 9.8709 11.0377 10.1817 10.865 10.4464C10.6922 10.7112 10.4436 10.9177 10.1516 11.0388C9.95767 11.1196 9.74971 11.1614 9.53961 11.1618H6.93961C6.52016 11.1619 6.11769 10.9961 5.81988 10.7007C5.52207 10.4054 5.35304 10.0043 5.34961 9.58484V6.98984C5.34935 6.78111 5.39031 6.57437 5.47016 6.38152C5.55001 6.18866 5.66717 6.01347 5.8149 5.86601C5.96264 5.71855 6.13805 5.60173 6.33106 5.52224C6.52407 5.44276 6.73088 5.40218 6.93961 5.40284H9.53961C9.95392 5.40536 10.3509 5.56949 10.646 5.8603C10.9411 6.15111 11.111 6.54562 11.1196 6.95984ZM11.1196 14.4548V17.0498C11.1201 17.4697 10.9541 17.8726 10.6579 18.1701C10.3616 18.4677 9.95946 18.6355 9.53961 18.6368H6.93961C6.51844 18.6368 6.11447 18.4697 5.81637 18.1722C5.51827 17.8747 5.35041 17.471 5.34961 17.0498V14.4548C5.35173 14.035 5.52034 13.6331 5.81844 13.3375C6.11653 13.0418 6.51976 12.8765 6.93961 12.8778H9.53961C9.95813 12.8778 10.3596 13.0439 10.6558 13.3396C10.952 13.6352 11.1188 14.0363 11.1196 14.4548ZM18.6596 6.95984V9.55484C18.6656 9.97132 18.5073 10.3734 18.2191 10.6741C17.9309 10.9749 17.536 11.1501 17.1196 11.1618H14.5296C14.1102 11.1619 13.7077 10.9961 13.4099 10.7007C13.1121 10.4054 12.943 10.0043 12.9396 9.58484V6.98984C12.9393 6.78111 12.9803 6.57437 13.0602 6.38152C13.14 6.18866 13.2572 6.01347 13.4049 5.86601C13.5526 5.71855 13.7281 5.60173 13.9211 5.52224C14.1141 5.44276 14.3209 5.40218 14.5296 5.40284H17.1196C17.5269 5.41557 17.9138 5.58421 18.2004 5.87395C18.487 6.16369 18.6514 6.5524 18.6596 6.95984ZM18.6596 14.4748V17.0698C18.6603 17.4829 18.4997 17.8799 18.2121 18.1763C17.9245 18.4727 17.5325 18.6451 17.1196 18.6568H14.5296C14.1084 18.6568 13.7045 18.4897 13.4064 18.1922C13.1083 17.8947 12.9404 17.491 12.9396 17.0698V14.4748C12.942 14.0551 13.1107 13.6534 13.4087 13.3578C13.7068 13.0622 14.1098 12.8968 14.5296 12.8978H17.1196C17.5303 12.9108 17.9201 13.0822 18.2072 13.3762C18.4943 13.6702 18.6565 14.0639 18.6596 14.4748Z" fill="#C2FF0A" />
    <path d="M21.25 9.695C21.0521 9.69242 20.863 9.6127 20.7229 9.47282C20.5828 9.33294 20.5029 9.14393 20.5 8.946V5.862C20.5072 5.54951 20.4506 5.23884 20.3337 4.94896C20.2168 4.65908 20.042 4.39608 19.82 4.176C19.3807 3.74155 18.7879 3.49762 18.17 3.497H15.12C14.9215 3.497 14.731 3.41826 14.5904 3.27804C14.4498 3.13782 14.3706 2.94757 14.37 2.749C14.3703 2.55026 14.4494 2.35975 14.5901 2.21932C14.7307 2.07888 14.9213 2 15.12 2H18.2C19.2134 2.02554 20.176 2.44867 20.88 3.178C21.2362 3.5323 21.5186 3.95371 21.7108 4.41785C21.9031 4.88198 22.0014 5.37963 22 5.882V8.966C21.9946 9.16125 21.9131 9.34666 21.7731 9.48281C21.633 9.61895 21.4454 9.69508 21.25 9.695ZM18.17 22H15.12C14.9215 22 14.731 21.9213 14.5904 21.781C14.4498 21.6408 14.3706 21.4506 14.37 21.252C14.3703 21.0533 14.4494 20.8628 14.5901 20.7223C14.7307 20.5819 14.9213 20.503 15.12 20.503H18.2C18.6612 20.4993 19.1108 20.3583 19.4915 20.0979C19.8721 19.8374 20.1665 19.4695 20.337 19.041C20.4502 18.7571 20.5056 18.4535 20.5 18.148V15.094C20.5003 14.8953 20.5794 14.7048 20.7201 14.5643C20.8607 14.4239 21.0513 14.345 21.25 14.345C21.4488 14.345 21.6394 14.4239 21.78 14.5643C21.9206 14.7048 21.9998 14.8953 22 15.094V18.148C22.0019 18.9052 21.7781 19.6458 21.3573 20.2752C20.9364 20.9047 20.3375 21.3944 19.637 21.682C19.172 21.873 18.673 21.972 18.17 21.97V22ZM8.92004 22H5.84004C5.33434 21.9996 4.83367 21.8997 4.36663 21.7058C3.89958 21.5119 3.4753 21.2279 3.11804 20.87C2.76155 20.5125 2.47925 20.0881 2.28738 19.6211C2.09551 19.1541 1.99786 18.6538 2.00004 18.149V15.095C2.0003 14.8963 2.07944 14.7058 2.22006 14.5653C2.36068 14.4249 2.5513 14.346 2.75004 14.346C2.94877 14.346 3.13939 14.4249 3.28001 14.5653C3.42064 14.7058 3.49977 14.8963 3.50004 15.095V18.149C3.50242 18.7675 3.7502 19.3598 4.18895 19.7957C4.6277 20.2316 5.22154 20.4756 5.84004 20.474H8.92004C9.11878 20.474 9.30939 20.5529 9.45001 20.6933C9.59064 20.8338 9.66977 21.0243 9.67004 21.223C9.67017 21.3214 9.65084 21.4189 9.61318 21.5099C9.57551 21.6008 9.52024 21.6834 9.45054 21.7529C9.38084 21.8224 9.29809 21.8775 9.20705 21.9149C9.11601 21.9523 9.01847 21.9714 8.92004 21.971V22ZM2.75004 9.695C2.5521 9.69242 2.36298 9.6127 2.22291 9.47282C2.08285 9.33294 2.00288 9.14393 2.00004 8.946V5.862C2.00269 4.85421 2.40556 3.88875 3.12004 3.178C3.8412 2.46346 4.81483 2.06179 5.83004 2.06H8.91004C9.10877 2.06 9.29939 2.13888 9.44001 2.27932C9.58064 2.41975 9.65977 2.61026 9.66004 2.809C9.65951 3.00757 9.58025 3.19782 9.43966 3.33804C9.29906 3.47826 9.1086 3.557 8.91004 3.557H5.83004C5.21146 3.55514 4.61746 3.79902 4.17865 4.23501C3.73985 4.67101 3.49215 5.26342 3.49004 5.882V8.966C3.48463 9.15953 3.40459 9.34348 3.26667 9.47935C3.12875 9.61522 2.94363 9.69249 2.75004 9.695Z" fill="#C2FF0A" />
  </svg>
);

// Currency Icon
const CurrencyIcon = ({
  currency,
  size = 24,
  disabled = false
}: {
  currency: string;
  size?: number;
  disabled?: boolean
}) => {
  const colors: Record<string, string> = {
    USDT: '#26A17B',
    USDT_TRC20: '#26A17B',
    BTC: '#F7931A',
    ETH: '#627EEA',
    LTC: '#345D9D',
  };

  const icons: Record<string, string> = {
    USDT: '₮',
    USDT_TRC20: '₮',
    BTC: '₿',
    ETH: 'Ξ',
    LTC: 'Ł',
  };

  return (
    <div
      style={{
        /* Use #959595 if disabled, otherwise use currency color */
        background: disabled ? '#959595' : (colors[currency] || '#6B6B80'),
        width: size,
        height: size,
        fontSize: size * 0.5,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#FFFFFF',
        fontWeight: 700,
        flexShrink: 0,
        /* Icon itself gets low opacity in the disabled state */
        opacity: disabled ? 0.4 : 1,
      }}
    >
      {icons[currency] || '?'}
    </div>
  );
};
type FormStep = 'basic' | 'seller_info' | 'terms' | 'preview' | 'preview_invite' | 'invite_sent' | 'payment' | 'success';

const AVAILABLE_CURRENCIES = ['USDT', 'BTC', 'ETH', 'LTC'] as const;

function calculateFee(amount: number): { feePercent: number; feeAmount: number; tierName: string; minFeeApplied: boolean } {
  let feePercent: number = FEE_TIERS.tier1.percentage;
  let tierName: string = FEE_TIERS.tier1.label;

  if (amount >= FEE_TIERS.tier3.threshold) {
    feePercent = FEE_TIERS.tier3.percentage;
    tierName = FEE_TIERS.tier3.label;
  } else if (amount >= FEE_TIERS.tier2.threshold) {
    feePercent = FEE_TIERS.tier2.percentage;
    tierName = FEE_TIERS.tier2.label;
  }

  let feeAmount = amount * (feePercent / 100);
  const minFeeApplied = feeAmount < MIN_FEE_AMOUNT && amount > 0;

  if (minFeeApplied) {
    feeAmount = MIN_FEE_AMOUNT;
  }

  return { feePercent, feeAmount, tierName, minFeeApplied };
}

export function CreateDealPage() {
  const navigate = useNavigate();
  const { createDeal, isLoading } = useDealStore();
  const { addToast } = useUIStore();
  const { balances } = useWalletStore();

  const [step, setStep] = useState<FormStep>('basic');
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [showPaymentMethod, setShowPaymentMethod] = useState(false);
  const [currencySearch, setCurrencySearch] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'external'>('wallet');
  const [termsExpanded, setTermsExpanded] = useState(false);
  const [createdDeal, setCreatedDeal] = useState<{ id: string; dealNumber: number } | null>(null);
  const [isTermsExpanded, setIsTermsExpanded] = useState(false);
  // Seller bot status states
  const [_sellerHasBot, setSellerHasBot] = useState<boolean | null>(null);
  const [checkingSellerStatus, setCheckingSellerStatus] = useState(false);
  const [inviteSending, setInviteSending] = useState(false);
  const [inviteSent, setInviteSent] = useState(false);

  // Form fields
  const [role, setRole] = useState<UserRole>('buyer');
  const [counterpartyUsername, setCounterpartyUsername] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<Currency>('USDT');
  const [description, setDescription] = useState('');
  const [terms, setTerms] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const counterpartyLabel = role === 'buyer' ? 'Seller' : 'Buyer';

  const numAmount = parseFloat(amount) || 0;
  const { feePercent, feeAmount: escrowFee } = calculateFee(numAmount);

  // Currency-appropriate estimated network fees
  const NETWORK_FEE_ESTIMATES: Record<string, number> = {
    USDT: 1.0,
    USDT_TRC20: 1.0,
    BTC: 0.0001,
    ETH: 0.005,
    LTC: 0.001,
  };
  const networkFee = NETWORK_FEE_ESTIMATES[currency] ?? 1.0;
  const totalAmount = numAmount + escrowFee + networkFee;
  const sellerReceives = numAmount;

  const displayCurrency = currency === 'USDT_TRC20' ? 'USDT' : currency;

  // Currency network mapping
  const CURRENCY_NETWORKS: Record<string, string> = {
    USDT: 'TRC-20',
    USDT_TRC20: 'TRC-20',
    BTC: 'Bitcoin',
    ETH: 'ERC-20',
    LTC: 'Litecoin',
  };
  const networkName = CURRENCY_NETWORKS[currency] ?? currency;

  // Format network fee with appropriate decimal places per currency
  const formatNetworkFee = (fee: number, curr: string): string => {
    if (curr === 'BTC') return fee.toFixed(4);
    if (curr === 'ETH' || curr === 'LTC') return fee.toFixed(3);
    return fee.toFixed(2);
  };

  // Get wallet balance for selected currency
  const walletBalance = balances.find(b => b.currency === currency)?.available || 0;

  // Escrow deposit address - fetched from API
  const [escrowAddress, setEscrowAddress] = useState<string | null>(null);
  const [addressLoading, setAddressLoading] = useState(false);
  const [addressError, setAddressError] = useState<string | null>(null);

  // Fetch real prices
  const { prices, isLoading: pricesLoading } = useCryptoPrices();

  // Fetch deposit address when entering payment step
  useEffect(() => {
    if (step === 'payment' && !escrowAddress) {
      setAddressLoading(true);
      setAddressError(null);
      api.getDepositAddress(currency)
        .then((info) => {
          setEscrowAddress(info.address);
        })
        .catch(() => {
          setAddressError('Failed to load deposit address. Please try again.');
        })
        .finally(() => {
          setAddressLoading(false);
        });
    }
  }, [step, currency, escrowAddress]);

  // Validation
  const validateBasic = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!amount || numAmount <= 0) {
      newErrors.amount = 'Valid amount is required';
    } else if (numAmount < MIN_DEAL_AMOUNT) {
      newErrors.amount = `Minimum amount is $${MIN_DEAL_AMOUNT}`;
    } else if (numAmount > MAX_DEAL_AMOUNT) {
      newErrors.amount = `Maximum amount is $${MAX_DEAL_AMOUNT.toLocaleString()}`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const stages = [
    {
      id: 1,
      status: 'pending',
      label: 'Waiting for seller acceptance',
      time: null,
    },
    {
      id: 2,
      status: 'completed',
      label: 'You created the deal',
      time: '12:45',
    },
  ];
  const validateSellerInfo = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!counterpartyUsername.trim()) {
      newErrors.counterparty = `${counterpartyLabel} telegram ID is required`;
    } else if (!counterpartyUsername.startsWith('@')) {
      newErrors.counterparty = 'Username must start with @';
    }

    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Check if seller has started the bot
  const checkSellerBotStatus = async () => {
    if (!counterpartyUsername.trim()) return;

    setCheckingSellerStatus(true);
    try {
      const result = await api.checkUserBotStatus(counterpartyUsername.replace('@', ''));
      setSellerHasBot(result.hasStartedBot);
      return result.hasStartedBot;
    } catch {
      // If check fails, assume they haven't started the bot
      setSellerHasBot(false);
      return false;
    } finally {
      setCheckingSellerStatus(false);
    }
  };
  const [showTerms, setShowTerms] = useState(false);

  const TickIcon = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="figma-deal-stage-icon figma-deal-stage-icon--tick">
      <path fillRule="evenodd" clipRule="evenodd" d="M9.99992 0.833008C15.0625 0.833008 19.1666 4.93706 19.1666 9.99967C19.1666 15.0623 15.0625 19.1663 9.99992 19.1663C4.93731 19.1663 0.833252 15.0623 0.833252 9.99967C0.833252 4.93706 4.93731 0.833008 9.99992 0.833008ZM14.0364 6.9292C13.7038 6.57892 13.1646 6.579 12.832 6.9292L8.81014 11.1667L7.1687 9.43408C6.83605 9.08495 6.29725 9.08332 5.96346 9.43246C5.63083 9.78278 5.63114 10.3513 5.96265 10.7028L8.20711 13.0702C8.36606 13.2387 8.58339 13.333 8.80933 13.333C9.03504 13.3329 9.25154 13.2385 9.41154 13.0702L14.0364 8.19792C14.369 7.84765 14.3689 7.27954 14.0364 6.9292Z" fill="#C2FF0A" />
    </svg>
  );
  const LoaderIcon = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="figma-deal-stage-icon figma-deal-stage-icon--loader">
      <path d="M9.99992 14.5057C10.486 14.5057 10.8803 14.8993 10.8805 15.3854V18.2858C10.8805 18.772 10.4862 19.1663 9.99992 19.1663C9.51368 19.1663 9.11938 18.772 9.11938 18.2858V15.3854C9.11957 14.8993 9.51379 14.5057 9.99992 14.5057Z" fill="#FFD552" />
      <path d="M5.56877 13.1857C5.91256 12.8419 6.47006 12.842 6.81388 13.1857C7.1577 13.5295 7.1577 14.087 6.81388 14.4308L4.7631 16.4816C4.41928 16.8254 3.8618 16.8254 3.51799 16.4816C3.17427 16.1378 3.17422 15.5803 3.51799 15.2365L5.56877 13.1857Z" fill="#FFD552" />
      <path d="M13.186 13.1857C13.5298 12.8419 14.0873 12.8419 14.4311 13.1857L16.4819 15.2365C16.8256 15.5803 16.8256 16.1378 16.4819 16.4816C16.1381 16.8254 15.5806 16.8253 15.2367 16.4816L13.186 14.4308C12.8421 14.087 12.8421 13.5295 13.186 13.1857Z" fill="#FFD552" />
      <path d="M4.61418 9.11914C5.10026 9.11932 5.49389 9.51355 5.4939 9.99967C5.4939 10.4858 5.10027 10.88 4.61418 10.8802H1.71379C1.22755 10.8802 0.833252 10.4859 0.833252 9.99967C0.833262 9.51344 1.22755 9.11914 1.71379 9.11914H4.61418Z" fill="#FFD552" />
      <path d="M18.2861 9.11914C18.7723 9.11914 19.1666 9.51344 19.1666 9.99967C19.1666 10.4859 18.7723 10.8802 18.2861 10.8802H15.3857C14.8996 10.88 14.5059 10.4858 14.5059 9.99967C14.506 9.51355 14.8996 9.11932 15.3857 9.11914H18.2861Z" fill="#FFD552" />
      <path d="M3.51799 3.51774C3.8618 3.17393 4.41928 3.17395 4.7631 3.51774L6.81388 5.56852C7.1577 5.91235 7.1577 6.46982 6.81388 6.81364C6.47006 7.15738 5.91256 7.15743 5.56877 6.81364L3.51799 4.76286C3.17422 4.41906 3.17425 3.86156 3.51799 3.51774Z" fill="#FFD552" />
      <path d="M15.2367 3.51774C15.5806 3.17403 16.1381 3.17396 16.4819 3.51774C16.8256 3.86153 16.8256 4.41903 16.4819 4.76286L14.4311 6.81364C14.0872 7.15746 13.5298 7.15746 13.186 6.81364C12.8421 6.46982 12.8421 5.91235 13.186 5.56852L15.2367 3.51774Z" fill="#FFD552" />
      <path d="M9.99992 0.833008C10.4862 0.833008 10.8805 1.2273 10.8805 1.71354V4.61393C10.8803 5.10002 10.4861 5.49365 9.99992 5.49365C9.51379 5.49365 9.11956 5.10002 9.11938 4.61393V1.71354C9.11938 1.2273 9.51368 0.833008 9.99992 0.833008Z" fill="#FFD552" />
    </svg>
  );
  // Send invitation to seller
  const handleSendInvite = async () => {
    if (!counterpartyUsername.trim()) return;

    setInviteSending(true);
    try {
      await api.sendBotInvitation(counterpartyUsername.replace('@', ''), {
        amount: amount,
        currency: displayCurrency,
        description: description,
      });
      setInviteSent(true);
      setStep('invite_sent');
      addToast('Invitation sent!', 'success');
    } catch (error) {
      addToast((error as Error).message || 'Failed to send invitation', 'error');
    } finally {
      setInviteSending(false);
    }
  };

  // Resend invitation
  // const handleResendInvite = async () => {
  //   setInviteSending(true);
  //   try {
  //     await api.sendBotInvitation(counterpartyUsername.replace('@', ''), {
  //       amount: amount,
  //       currency: displayCurrency,
  //       description: description,
  //     });
  //     addToast('Invitation sent again!', 'success');
  //   } catch (error) {
  //     addToast((error as Error).message || 'Failed to send invitation', 'error');
  //   } finally {
  //     setInviteSending(false);
  //   }
  // };
  const [showMenu, setShowMenu] = useState(false); const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);

  const handleOpenCancel = () => {
    setShowMenu(false); // Close the small dropdown
    setShowCancelConfirmation(true); // Open the big bottom confirmation
  };
  const handleNext = async () => {
    if (step === 'basic') {
      if (validateBasic()) {
        setStep('seller_info');
      }
    } else if (step === 'seller_info') {
      if (validateSellerInfo()) {
        setStep('terms');
      }
    } else if (step === 'terms') {
      // Check seller bot status before showing preview
      setCheckingSellerStatus(true);
      const hasBot = await checkSellerBotStatus();
      if (hasBot) {
        setStep('preview');
      } else {
        setStep('preview_invite');
      }
    } else if (step === 'preview_invite') {
      // Go to invite flow
      handleSendInvite();
    } else if (step === 'invite_sent') {
      // Continue to payment after seller has been notified
      setShowPaymentMethod(true);
    } else if (step === 'preview') {
      setShowPaymentMethod(true);
    }
  };

  const handleBack = () => {
    if (step === 'seller_info') {
      setStep('basic');
    } else if (step === 'terms') {
      setStep('seller_info');
    } else if (step === 'preview' || step === 'preview_invite') {
      setStep('terms');
    } else if (step === 'invite_sent') {
      setStep('preview_invite');
    } else if (step === 'payment') {
      setStep(inviteSent ? 'invite_sent' : 'preview');
    } else {
      navigate(-1);
    }
  };

  const handleClose = () => {
    navigate(-1);
  };

  const handlePaymentMethodContinue = async () => {
    setShowPaymentMethod(false);

    try {
      const deal = await createDeal({
        role,
        counterpartyUsername: counterpartyUsername.replace('@', ''),
        amount: amount.toString(),
        currency,
        description,
        terms,
      });

      setCreatedDeal({ id: deal.id, dealNumber: deal.dealNumber });
      setStep('payment');
    } catch (error) {
      addToast((error as Error).message || 'Failed to create deal', 'error');
    }
  };

  const handleMarkAsPaid = async () => {
    if (!createdDeal) {
      navigate('/deals');
      return;
    }
    try {
      await api.fundDeal(createdDeal.id);
    } catch {
      // Fund endpoint may fail if already funded or not applicable - that's OK
    }
    addToast('Payment submitted. The system will verify your deposit automatically.', 'success');
    navigate(`/deal/${createdDeal.id}`);
  };

  const handleDone = () => {
    if (createdDeal) {
      navigate(`/deal/${createdDeal.id}`);
    } else {
      navigate('/deals');
    }
  };

  const handleCopyAddress = () => {
    if (escrowAddress) {
      navigator.clipboard.writeText(escrowAddress);
      addToast('Address copied!', 'success');
    }
  };

  // Step 1: Basic Info (Currency, Amount, Role)
  if (step === 'basic') {
    return (
      <div className="figma-create-deal">
        {/* Header */}
        <div className="figma-create-deal-header">
          <button onClick={handleBack} className="figma-create-deal-back">
            <BackIcon />
          </button>
          <h1 className="figma-create-deal-title">Create new deal</h1>
          <div className="figma-create-deal-spacer" />
        </div>

        <div className="figma-create-deal-content">
          {/* Currency Selector */}
          <div className="figma-create-deal-field">
            <label className="figma-create-deal-label">Currency</label>
            <button
              className="figma-create-deal-currency-btn"
              onClick={() => setShowCurrencyPicker(true)}
            >
              <div className="figma-create-deal-currency-left">
                <CurrencyIcon currency={currency} size={32} />
                <span className="figma-create-deal-currency-name">{displayCurrency}</span>
              </div>
              <ChevronDownIcon />
            </button>
          </div>

          {/* Amount Input */}
          <div className="figma-create-deal-field">
            <label className="figma-create-deal-label">Deal amount</label>
            <div className="figma-create-deal-input-wrap">
              <input
                type="number"
                inputMode="decimal"
                className={`figma-create-deal-input ${errors.amount ? 'error' : ''}`}
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <span className="figma-create-deal-input-suffix">{displayCurrency}</span>
            </div>
            {numAmount > 0 && (
              <span className="figma-create-deal-hint">
                {pricesLoading ? '...' : prices[currency] ? `≈ $${(numAmount * prices[currency]).toFixed(2)}` : ''}
              </span>
            )}
            {errors.amount && <p className="figma-create-deal-error">{errors.amount}</p>}
          </div>

          {/* Role Selection */}
          <div className="figma-create-deal-field">
            <label className="figma-create-deal-label">What's your role?</label>
            <div className="figma-create-deal-role-grid">

              {/* Buyer Button */}
              <button
                onClick={() => setRole('buyer')}
                className={`figma-create-deal-role-card ${role === 'buyer' ? 'active' : ''}`}
              >
                <div className={`figma-create-deal-role-icon ${role === 'buyer' ? 'active-role' : ''}`}>
                  <BuyerIcon />
                </div>
                <span className={`figma-create-deal-role-text ${role === 'buyer' ? 'active-role' : ''}`}>
                  I am buyer
                </span>
              </button>

              {/* Seller Button */}
              <button
                onClick={() => setRole('seller')}
                className={`figma-create-deal-role-card ${role === 'seller' ? 'active' : ''}`}
              >
                <div className={`figma-create-deal-role-icon ${role === 'seller' ? 'active-role' : ''}`}>
                  <SellerIcon />
                </div>
                <span className={`figma-create-deal-role-text ${role === 'seller' ? 'active-role' : ''}`}>
                  I am seller
                </span>
              </button>

            </div>
          </div>
        </div>

        {/* Bottom Fee Summary */}
        <div className="figma-deals-footer">
          {/* Only show fees if amount, currency, and role are present */}
          {numAmount > 0 && currency && role && (
            <div className="figma-create-deal-fees-animated">
              <div className="figma-create-deal-fee-row main">
                <span className="figma-create-deal-fee-label">Total amount</span>
                <span className="figma-create-deal-fee-value highlight">
                  {`${totalAmount.toFixed(1)} ${displayCurrency}`}
                </span>
              </div>

              <div className="figma-create-deal-fee-row">
                <span className="figma-create-deal-fee-label with-icon">
                  <span className="underline-deal-text">
                    Escrow fee {feePercent}%
                  </span>
                  <InfoIcon />
                </span>
                <span className="figma-create-deal-fee-value">
                  {`${escrowFee.toFixed(0)} ${displayCurrency}`}
                </span>
              </div>

              <div className="figma-create-deal-fee-row network-space">
                <span className="figma-create-deal-fee-label with-icon">
                  <span className="underline-deal-text"> Network fee (est.)</span>
                  <InfoIcon />
                </span>
                <span className="figma-create-deal-fee-value">
                  {formatNetworkFee(networkFee, currency)} {displayCurrency}
                </span>
              </div>
            </div>
          )}

          {/* Next Button - Always visible, but disabled until valid */}
          <button
            className={`figma-create-deal-btn ${(!numAmount || !role) ? 'disabled' : ''}`}
            onClick={handleNext}
            disabled={!numAmount || numAmount <= 0 || !role}
          >
            Next
          </button>
          <div className="figma-home-indicator">
            <div className="figma-home-indicator-bar-specific" />
          </div>
        </div>

        {/* Currency Picker Modal */}
        {showCurrencyPicker && (
          <div className="figma-modal-overlay" onClick={() => setShowCurrencyPicker(false)}>
            <div className="figma-modal-sheet" onClick={(e) => e.stopPropagation()}>
              <div className="figma-modal-handle" />
              <h2 className="figma-modal-title">Currency</h2>

              <div className="figma-currency-list">
                {AVAILABLE_CURRENCIES
                  .filter(c => {
                    if (!currencySearch) return true;
                    const search = currencySearch.toLowerCase();
                    const currInfo = CURRENCIES[c as keyof typeof CURRENCIES];
                    return (
                      c.toLowerCase().includes(search) ||
                      currInfo?.name?.toLowerCase().includes(search)
                    );
                  })
                  .map((c) => (
                    <button
                      key={c}
                      className={`figma-currency-item ${currency === c ? 'selected' : ''}`}
                      onClick={() => {
                        setCurrency(c as Currency);
                        setShowCurrencyPicker(false);
                        setCurrencySearch('');
                      }}
                    >
                      <CurrencyIcon currency={c} size={32} />
                      <span className="figma-currency-item-name">{c}</span>
                      <div className={`figma-radio ${currency === c ? 'checked' : 'radiobuttonborder'}`}>
                        {currency === c && <div className="figma-radio-dot" />}
                      </div>
                    </button>
                  ))}
              </div>

              <div className="figma-modal-bottom">
                <button
                  className="figma-create-deal-btn"
                  onClick={() => setShowCurrencyPicker(false)}
                >
                  Continue
                </button>
                <div className="figma-home-indicator">
                  <div className="figma-home-indicator-bar-specific" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Step 2: Seller Information
  if (step === 'seller_info') {
    return (
      <div className="figma-create-deal">
        <div className="figma-create-deal-header">
          <button onClick={handleBack} className="figma-create-deal-back">
            <BackIcon />
          </button>
          <h1 className="figma-create-deal-title">Create new deal</h1>
          <div className="figma-create-deal-spacer" />
        </div>

        <div className="figma-create-deal-content">
          <h2 className="figma-create-deal-section-title">{counterpartyLabel} information</h2>

          {/* Seller Telegram ID */}
          <div className="figma-create-deal-field">
            <label className="figma-create-deal-label">{counterpartyLabel} telegram ID</label>
            <input
              type="text"
              className={`figma-create-deal-input full ${errors.counterparty ? 'error' : ''}`}
              placeholder="@username"
              value={counterpartyUsername}
              onChange={(e) => setCounterpartyUsername(e.target.value)}
            />
            {errors.counterparty && <p className="figma-create-deal-error">{errors.counterparty}</p>}
          </div>

          {/* Description */}
          <div className="figma-create-deal-field">
            <label className="figma-create-deal-label">Description</label>
            <textarea
              className={`figma-create-deal-textarea ${errors.description ? 'error' : ''}`}
              placeholder="Logo design, 3 revisions included"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
            {errors.description && <p className="figma-create-deal-error">{errors.description}</p>}
          </div>
        </div>

        <div className="figma-deals-footer">
          <button
            className="figma-create-deal-btn"
            onClick={handleNext}
          >
            Next
          </button>
          <div className="figma-home-indicator">
            <div className="figma-home-indicator-bar-specific" />
          </div>
        </div>
      </div>
    );
  }

  // Step 3: Terms of the deal
  if (step === 'terms') {
    return (
      <div className="figma-create-deal">
        <div className="figma-create-deal-header">
          <button onClick={handleBack} className="figma-create-deal-back">
            <BackIcon />
          </button>
          <h1 className="figma-create-deal-title">Create new deal</h1>
          <div className="figma-create-deal-spacer" />
        </div>

        <div className="figma-create-deal-content">
          <h2 className="figma-create-deal-section-title">Terms of the deal</h2>

          {/* Seller Card */}
          <div className="figma-create-deal-user-card">
            <div className="figma-create-deal-user-avatar">
              {counterpartyUsername.replace('@', '').charAt(0).toUpperCase()}
            </div>
            <div className="figma-create-deal-user-info">
              <span className="figma-create-deal-user-role">{counterpartyLabel}</span>
              <span className="figma-create-deal-user-name">{counterpartyUsername}</span>
            </div>
          </div>

          {/* Deal Summary Card */}
          <div className="figma-create-deal-summary-card">
            <div className="figma-create-deal-summary-row main">
              <span className="figma-create-deal-summary-label-total">Total</span>
              <span className="figma-create-deal-summary-value highlight">
                {totalAmount.toFixed(1)} {displayCurrency}
              </span>
            </div>
            <div className="figma-create-deal-summary-row">
              <span className="figma-create-deal-summary-label">{counterpartyLabel} receives</span>
              <span className="figma-create-deal-summary-value">
                {sellerReceives.toLocaleString()} {displayCurrency}
              </span>
            </div>
            <div className="figma-create-deal-summary-row">
              <span className="figma-create-deal-summary-label with-icon">
                <span className="underline-deal-text">
                  Escrow fee {feePercent}%
                </span>
                <InfoIcon />
              </span>
              <span className="figma-create-deal-summary-value">
                {escrowFee.toFixed(0)} {displayCurrency}
              </span>
            </div>
            <div className="figma-create-deal-summary-row">
              <span className="figma-create-deal-summary-label with-icon">
                <span className="underline-deal-text">
                  Network fee
                </span>
                <InfoIcon />
              </span>
              <span className="figma-create-deal-summary-value">
                {formatNetworkFee(networkFee, currency)} {displayCurrency}
              </span>
            </div>

            <div className="figma-create-deal-summary-divider" />

            <div className="figma-create-deal-summary-section">
              <span className="figma-create-deal-summary-section-label">Description</span>
              <p className="figma-create-deal-summary-section-text">{description}</p>
            </div>
            {displayCurrency === 'BTC' && (
              <>
                <div className="figma-create-deal-summary-divider" />
                <div className="figma-create-deal-summary-section btc-terms-container">
                  <span className="figma-create-deal-summary-section-label">Terms</span>
                  <div className={`figma-btc-terms-preview ${isTermsExpanded ? 'expanded' : 'collapsed'}`}>
                    <p className="figma-create-deal-summary-section-text">
                      Some additional text regarding the terms. Can be few rows and very long, which describes some ...
                    </p>
                  </div>

                  {/* Expand/Collapse Arrow */}
                  <button
                    className={`figma-btc-expand-btn ${isTermsExpanded ? 'active' : ''}`}
                    onClick={() => setIsTermsExpanded(!isTermsExpanded)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path d="M14.0302 6.59467C14.3048 6.86926 14.3217 7.30351 14.0815 7.59809L14.0302 7.65522L9.53022 12.1552C9.23732 12.4481 8.76256 12.4481 8.46967 12.1552L3.96967 7.65522C3.67678 7.36232 3.67678 6.88756 3.96967 6.59467C4.26256 6.30178 4.73732 6.30178 5.03022 6.59467L8.99994 10.5644L12.9697 6.59467L13.0268 6.5434C13.3214 6.30314 13.7556 6.32008 14.0302 6.59467Z" fill="white" fillOpacity="0.32" />
                    </svg>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Terms Input */}
          <div className="figma-create-deal-field">
            <label className="figma-create-deal-label">Describe the terms</label>
            <textarea
              className="figma-create-deal-textarea"
              placeholder="Some description about the terms, like a little contract"
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <div className="figma-deals-footer">
          <button
            className={`figma-create-deal-btn ${checkingSellerStatus ? 'disabled' : ''}`}
            onClick={handleNext}
            disabled={checkingSellerStatus}
          >
            {checkingSellerStatus ? 'Checking...' : 'Next'}
          </button>
          <div className="figma-home-indicator">
            <div className="figma-home-indicator-bar-specific" />
          </div>
        </div>
      </div>
    );
  }

  // Step 4a: Preview Deal - Seller hasn't started bot (Invite flow)
  if (step === 'preview_invite') {
    return (
      <div className="figma-create-deal">
        <div className="figma-create-deal-header">
          <button onClick={handleBack} className="figma-create-deal-back">
            <BackIcon />
          </button>
          <h1 className="figma-create-deal-title">Preview deal</h1>
          <button
            className="figma-create-deal-menu"
            onClick={() => setShowMenu(!showMenu)}
          >
            <MenuDotsIcon />
            {showMenu && (
              <div className="figma-menu-dropdown">
                <button className="figma-menu-item danger" onClick={handleOpenCancel}>
                  Cancel deal
                </button>
              </div>
            )}
          </button>
        </div>
        <div className="figma-create-deal-content top-space-deal">
          {/* Seller Card */}
          <div className="figma-create-deal-user-card">
            <div className="figma-create-deal-user-avatar blue">
              {counterpartyUsername.replace('@', '').charAt(0).toUpperCase()}
            </div>
            <div className="figma-create-deal-user-info">
              <span className="figma-create-deal-user-role">{counterpartyLabel}</span>
              <span className="figma-create-deal-user-name">{counterpartyUsername}</span>
            </div>
          </div>

          {/* Deal Summary Card with Pending Badge */}
          <div className="figma-create-deal-summary-card">
            <div className="figma-create-deal-summary-row main">
              <span className="figma-create-deal-amount-large">
                {totalAmount.toFixed(1)} {displayCurrency}
              </span>
              <span className="figma-create-deal-status-badge pending">
                Pending seller acceptance
              </span>
            </div>
            <div className="figma-create-deal-summary-divider" />
            <div className="figma-create-deal-summary-section">
              <span className="figma-create-deal-summary-section-label">Description</span>
              <p className="figma-create-deal-summary-section-text">{description ? description : "There is no description"}</p>
            </div>
            {!showTerms && (
              <button className="figma-seller-expand-btn left-aligned" onClick={() => setShowTerms(true)}>
                <span className='deal-detail-text'>Deal details</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M14.0304 6.96967C14.305 7.24426 14.322 7.67851 14.0817 7.97309L14.0304 8.03022L9.53045 12.5302C9.23756 12.8231 8.7628 12.8231 8.4699 12.5302L3.9699 8.03022C3.67701 7.73732 3.67701 7.26256 3.9699 6.96967C4.2628 6.67678 4.73756 6.67678 5.03045 6.96967L9.00018 10.9394L12.9699 6.96967L13.027 6.9184C13.3216 6.67814 13.7559 6.69508 14.0304 6.96967Z" fill="white" fillOpacity="0.64" />
                </svg>
              </button>
            )}
            {showTerms && (
              <div>
                <div className="figma-seller-section">
                  <span className="figma-seller-label">Terms</span>
                  <p className="figma-seller-text">{terms ? terms : "No Terms Defined yet"}</p>
                </div>
                <div className="figma-create-deal-summary-divider" />

                <div className="figma-create-deal-summary-row">
                  <span className="figma-create-deal-summary-label">{counterpartyLabel} receives</span>
                  <span className="figma-create-deal-summary-value">
                    {sellerReceives.toLocaleString()} {displayCurrency}
                  </span>
                </div>
                <div className="figma-create-deal-fee-row deal-row">
                  <span className="figma-create-deal-fee-label with-icon">
                    <span className="underline-deal-text">
                      Escrow fee {feePercent}%
                    </span>
                    <InfoIcon />
                  </span>
                  <span className="figma-create-deal-summary-value">
                    {`${escrowFee.toFixed(0)} ${displayCurrency}`}
                  </span>
                </div>

                <div className="figma-create-deal-fee-row network-space">
                  <span className="figma-create-deal-fee-label with-icon">
                    <span className="underline-deal-text"> Network fee (est.)</span>
                    <InfoIcon />
                  </span>
                  <span className="figma-create-deal-summary-value">
                    {formatNetworkFee(networkFee, currency)} {displayCurrency}
                  </span>
                </div>
                <div className="figma-create-deal-summary-divider" />
                <div className="figma-create-deal-fee-row main">
                  <span className="figma-create-deal-fee-label">Total amount</span>
                  <span className="figma-create-deal-summary-value">
                    {`${totalAmount.toFixed(1)} ${displayCurrency}`}
                  </span>
                </div>
                <button className="figma-seller-expand-btn left-aligned" onClick={() => setShowTerms(false)}>
                  <span className='deal-detail-text'>Hide</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M3.96955 11.0303C3.69496 10.7557 3.67802 10.3215 3.91828 10.0269L3.96955 9.96978L8.46955 5.46978C8.76244 5.17689 9.2372 5.17689 9.5301 5.46978L14.0301 9.96978C14.323 10.2627 14.323 10.7374 14.0301 11.0303C13.7372 11.3232 13.2624 11.3232 12.9696 11.0303L8.99982 7.0606L5.0301 11.0303L4.97297 11.0816C4.67839 11.3219 4.24414 11.3049 3.96955 11.0303Z" fill="white" fillOpacity="0.64" />
                  </svg>
                </button>
              </div>
            )}
          </div>
          <div className="figma-create-deal-summary-card">
            <h3 className="deal-title">Deal stages</h3>
            <div className="figma-seller-stages-list">
              {stages.map((stage, index) => {
                // Mapping the new data status to your existing CSS logic
                const isCompleted = stage.status === 'completed';
                const isWaiting = stage.status === 'pending'; // assuming pending maps to waiting
                const isCancelled = stage.status === 'cancelled';

                return (
                  <div key={stage.id} className="figma-seller-stage">
                    <div className="figma-seller-stage-indicator">
                      <div className={`figma-seller-stage-dot ${isCompleted ? 'completed' : isWaiting ? 'waiting' : isCancelled ? 'cancelled' : ''}`}>
                        {isCompleted ? (
                          <TickIcon />
                        ) : isWaiting ? (
                          <LoaderIcon />
                        ) : null}
                      </div>

                      {/* Only show the line if it's NOT the last item in the list */}
                      {index !== stages.length - 1 && (
                        <div className={`figma-seller-stage-line ${isCompleted ? 'completed' : ''}`} />
                      )}
                    </div>

                    <div className="figma-seller-stage-content">
                      <div className="figma-seller-stage-text">
                        <span className={`figma-seller-stage-label ${isCompleted ? 'completed' : isWaiting ? 'waiting' : isCancelled ? 'cancelled' : ''}`}>
                          {stage.label}
                        </span>
                        {stage.time && <span className="figma-seller-stage-time">{stage.time}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        {showCancelConfirmation && (
          <div
            onClick={() => setShowCancelConfirmation(false)}
          />
        )}
        {/* Bottom: Invitation sent message */}
        <div className={`figma-deals-footer ${showCancelConfirmation ? 'modal-open' : ''}`}>
          {!showCancelConfirmation ? (
            <div className="figma-footer-content">
              <p className="figma-create-deal-invite-text">
                {counterpartyUsername} hasn't started the bot yet. Invite seller to continue the deal
              </p>
              <button
                className={`figma-create-deal-btn ${inviteSending ? 'disabled' : ''}`}
                onClick={handleNext}
                disabled={inviteSending}
              >
                {inviteSending ? 'Sending...' : 'Invite seller'}
              </button>
              <div className="figma-home-indicator">
                <div className="figma-home-indicator-bar-specific" />
              </div>
            </div>
          ) : (
            <div className="figma-cancel-modal">
              <h2 className="figma-cancel-title">Cancel deal?</h2>
              <p className="figma-cancel-description">
                This will stop the deal. If funds were not released, no payment will be sent to the seller.
              </p>

              <button className="figma-btn-continue" onClick={() => setShowCancelConfirmation(false)}>
                Continue creating
              </button>

              <button
                className="figma-btn-cancel-final"
                onClick={() => {
                  setShowCancelConfirmation(false);
                }}
              >
                Cancel deal
              </button>

              <div className="figma-home-indicator">
                <div className="figma-home-indicator-bar-specific" />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Step 4b: Invitation Sent - Pending seller acceptance
  if (step === 'invite_sent') {
    return (
      <div className="figma-create-deal">
        <div className="figma-create-deal-header">
          <button onClick={handleBack} className="figma-create-deal-back">
            <BackIcon />
          </button>
          <h1 className="figma-create-deal-title">Preview deal</h1>
          <button
            className="figma-create-deal-menu"
            onClick={() => setShowMenu(!showMenu)}
          >
            <MenuDotsIcon />
            {showMenu && (
              <div className="figma-menu-dropdown">
                <button className="figma-menu-item danger" onClick={handleOpenCancel}>
                  Cancel deal
                </button>
              </div>
            )}
          </button>
        </div>
        <div className="figma-create-deal-content top-space-deal">
          {/* Seller Card */}
          <div className="figma-create-deal-user-card">
            <div className="figma-create-deal-user-avatar blue">
              {counterpartyUsername.replace('@', '').charAt(0).toUpperCase()}
            </div>
            <div className="figma-create-deal-user-info">
              <span className="figma-create-deal-user-role">{counterpartyLabel}</span>
              <span className="figma-create-deal-user-name">{counterpartyUsername}</span>
            </div>
          </div>

          {/* Deal Summary Card with Pending Badge */}
          <div className="figma-create-deal-summary-card">
            <div className="figma-create-deal-summary-row main">
              <span className="figma-create-deal-amount-large">
                {totalAmount.toFixed(1)} {displayCurrency}
              </span>
              <span className="figma-create-deal-status-badge pending">
                Pending seller acceptance
              </span>
            </div>
            <div className="figma-create-deal-summary-divider" />
            <div className="figma-create-deal-summary-section">
              <span className="figma-create-deal-summary-section-label">Description</span>
              <p className="figma-create-deal-summary-section-text">{description ? description : "There is no description"}</p>
            </div>
            {!showTerms && (
              <button className="figma-seller-expand-btn left-aligned" onClick={() => setShowTerms(true)}>
                <span className='deal-detail-text'>Deal details</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M14.0304 6.96967C14.305 7.24426 14.322 7.67851 14.0817 7.97309L14.0304 8.03022L9.53045 12.5302C9.23756 12.8231 8.7628 12.8231 8.4699 12.5302L3.9699 8.03022C3.67701 7.73732 3.67701 7.26256 3.9699 6.96967C4.2628 6.67678 4.73756 6.67678 5.03045 6.96967L9.00018 10.9394L12.9699 6.96967L13.027 6.9184C13.3216 6.67814 13.7559 6.69508 14.0304 6.96967Z" fill="white" fillOpacity="0.64" />
                </svg>
              </button>
            )}
            {showTerms && (
              <div>
                <div className="figma-seller-section">
                  <span className="figma-seller-label">Terms</span>
                  <p className="figma-seller-text">{terms ? terms : "No Terms Defined yet"}</p>
                </div>
                <div className="figma-create-deal-summary-divider" />

                <div className="figma-create-deal-summary-row">
                  <span className="figma-create-deal-summary-label">{counterpartyLabel} receives</span>
                  <span className="figma-create-deal-summary-value">
                    {sellerReceives.toLocaleString()} {displayCurrency}
                  </span>
                </div>
                <div className="figma-create-deal-fee-row deal-row">
                  <span className="figma-create-deal-fee-label with-icon">
                    <span className="underline-deal-text">
                      Escrow fee {feePercent}%
                    </span>
                    <InfoIcon />
                  </span>
                  <span className="figma-create-deal-summary-value">
                    {`${escrowFee.toFixed(0)} ${displayCurrency}`}
                  </span>
                </div>

                <div className="figma-create-deal-fee-row network-space">
                  <span className="figma-create-deal-fee-label with-icon">
                    <span className="underline-deal-text"> Network fee (est.)</span>
                    <InfoIcon />
                  </span>
                  <span className="figma-create-deal-summary-value">
                    {formatNetworkFee(networkFee, currency)} {displayCurrency}
                  </span>
                </div>
                <div className="figma-create-deal-summary-divider" />
                <div className="figma-create-deal-fee-row main">
                  <span className="figma-create-deal-fee-label">Total amount</span>
                  <span className="figma-create-deal-summary-value">
                    {`${totalAmount.toFixed(1)} ${displayCurrency}`}
                  </span>
                </div>
                <button className="figma-seller-expand-btn left-aligned" onClick={() => setShowTerms(false)}>
                  <span className='deal-detail-text'>Hide</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M3.96955 11.0303C3.69496 10.7557 3.67802 10.3215 3.91828 10.0269L3.96955 9.96978L8.46955 5.46978C8.76244 5.17689 9.2372 5.17689 9.5301 5.46978L14.0301 9.96978C14.323 10.2627 14.323 10.7374 14.0301 11.0303C13.7372 11.3232 13.2624 11.3232 12.9696 11.0303L8.99982 7.0606L5.0301 11.0303L4.97297 11.0816C4.67839 11.3219 4.24414 11.3049 3.96955 11.0303Z" fill="white" fillOpacity="0.64" />
                  </svg>
                </button>
              </div>
            )}
          </div>
          <div className="figma-create-deal-summary-card">
            <h3 className="deal-title">Deal stages</h3>
            <div className="figma-seller-stages-list">
              {stages.map((stage, index) => {
                // Mapping the new data status to your existing CSS logic
                const isCompleted = stage.status === 'completed';
                const isWaiting = stage.status === 'pending'; // assuming pending maps to waiting
                const isCancelled = stage.status === 'cancelled';

                return (
                  <div key={stage.id} className="figma-seller-stage">
                    <div className="figma-seller-stage-indicator">
                      <div className={`figma-seller-stage-dot ${isCompleted ? 'completed' : isWaiting ? 'waiting' : isCancelled ? 'cancelled' : ''}`}>
                        {isCompleted ? (
                          <TickIcon />
                        ) : isWaiting ? (
                          <LoaderIcon />
                        ) : null}
                      </div>

                      {/* Only show the line if it's NOT the last item in the list */}
                      {index !== stages.length - 1 && (
                        <div className={`figma-seller-stage-line ${isCompleted ? 'completed' : ''}`} />
                      )}
                    </div>

                    <div className="figma-seller-stage-content">
                      <div className="figma-seller-stage-text">
                        <span className={`figma-seller-stage-label ${isCompleted ? 'completed' : isWaiting ? 'waiting' : isCancelled ? 'cancelled' : ''}`}>
                          {stage.label}
                        </span>
                        {stage.time && <span className="figma-seller-stage-time">{stage.time}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        {showCancelConfirmation && (
          <div
            onClick={() => setShowCancelConfirmation(false)}
          />
        )}
        {/* Bottom: Invitation sent message */}
        <div className={`figma-deals-footer ${showCancelConfirmation ? 'modal-open' : ''}`}>
          {!showCancelConfirmation ? (
            <div className="figma-footer-content">
              <p className="figma-create-deal-invite-text">
                When the seller accept the deal you can fund it
              </p>
              <div className="figma-home-indicator">
                <div className="figma-home-indicator-bar-specific" />
              </div>
            </div>
          ) : (
            <div className="figma-cancel-modal">
              <h2 className="figma-cancel-title">Cancel deal?</h2>
              <p className="figma-cancel-description">
                This will stop the deal. If funds were not released, no payment will be sent to the seller.
              </p>

              <button className="figma-btn-continue" onClick={() => setShowCancelConfirmation(false)}>
                Continue creating
              </button>

              <button
                className="figma-btn-cancel-final"
                onClick={() => {
                  setShowCancelConfirmation(false);
                }}
              >
                Cancel deal
              </button>

              <div className="figma-home-indicator">
                <div className="figma-home-indicator-bar-specific" />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Step 4: Preview Deal
  if (step === 'preview') {
    return (
      <div className="figma-create-deal">
        <div className="figma-create-deal-header">
          <button onClick={handleBack} className="figma-create-deal-back">
            <BackIcon />
          </button>
          <h1 className="figma-create-deal-title">Preview deal</h1>
          <button onClick={handleClose} className="figma-create-deal-close">
            <CloseIcon />
          </button>
        </div>

        <div className="figma-create-deal-content">
          {/* Seller Card */}
          <div className="figma-create-deal-user-card">
            <div className="figma-create-deal-user-avatar">
              {counterpartyUsername.replace('@', '').charAt(0).toUpperCase()}
            </div>
            <div className="figma-create-deal-user-info">
              <span className="figma-create-deal-user-role">{counterpartyLabel}</span>
              <span className="figma-create-deal-user-name">{counterpartyUsername}</span>
            </div>
          </div>

          {/* Deal Summary Card */}
          <div className="figma-create-deal-summary-card">
            <div className="figma-create-deal-summary-row main">
              <span className="figma-create-deal-summary-label-total">Total</span>
              <span className="figma-create-deal-summary-value highlight">
                {totalAmount.toFixed(1)} {displayCurrency}
              </span>
            </div>
            <div className="figma-create-deal-summary-row">
              <span className="figma-create-deal-summary-label">{counterpartyLabel} receives</span>
              <span className="figma-create-deal-summary-value">
                {sellerReceives.toLocaleString()} {displayCurrency}
              </span>
            </div>
            <div className="figma-create-deal-fee-row">
              <span className="figma-create-deal-fee-label with-icon">
                <span className="underline-deal-text">
                  Escrow fee {feePercent}%
                </span>
                <InfoIcon />
              </span>
              <span className="figma-create-deal-fee-value">
                {`${escrowFee.toFixed(0)} ${displayCurrency}`}
              </span>
            </div>

            <div className="figma-create-deal-fee-row network-space">
              <span className="figma-create-deal-fee-label with-icon">
                <span className="underline-deal-text"> Network fee (est.)</span>
                <InfoIcon />
              </span>
              <span className="figma-create-deal-fee-value">
                {formatNetworkFee(networkFee, currency)} {displayCurrency}
              </span>
            </div>

            <div className="figma-create-deal-summary-divider" />

            <div className="figma-create-deal-summary-section">
              <span className="figma-create-deal-summary-section-label">Description</span>
              <p className="figma-create-deal-summary-section-text">{description}</p>
            </div>

            {terms && (
              <>
                <div className="figma-create-deal-summary-divider" />
                <div className="figma-create-deal-summary-section">
                  <span className="figma-create-deal-summary-section-label">Terms</span>
                  <p className="figma-create-deal-summary-section-text">
                    {termsExpanded || terms.length <= 100 ? terms : `${terms.slice(0, 100)}...`}
                  </p>
                  {terms.length > 100 && (
                    <button
                      className="figma-create-deal-expand-btn"
                      onClick={() => setTermsExpanded(!termsExpanded)}
                    >
                      <ChevronDownIcon open={termsExpanded} />
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="figma-deals-footer">
          <button
            className={`figma-create-deal-btn ${isLoading ? 'disabled' : ''}`}
            onClick={handleNext}
            disabled={isLoading}
          >
            {isLoading ? 'Creating...' : 'Confirm and notify seller'}
          </button>
          <div className="figma-home-indicator">
            <div className="figma-home-indicator-bar-specific" />
          </div>
        </div>

        {/* Payment Method Modal */}
        {showPaymentMethod && (
          <div className="figma-modal-overlay" onClick={() => setShowPaymentMethod(false)}>
            <div className="figma-modal-sheet" onClick={(e) => e.stopPropagation()}>
              <div className="figma-modal-handle" />
              <h2 className="figma-modal-title">Choose payment method</h2>

              <div className="figma-payment-methods">
                {/* Wallet Button */}
                {/* Wallet Button */}
                <button
                  className={`figma-payment-method ${paymentMethod === 'wallet' ? 'selected' : ''} ${walletBalance === 0 ? 'disabled' : ''}`}
                  onClick={() => Number(walletBalance) > 0 && setPaymentMethod('wallet')}
                  disabled={walletBalance === 0}
                >
                  <CurrencyIcon
                    currency={currency}
                    size={40}
                    /* This prop must be true for the background to change to gray */
                    disabled={Number(walletBalance) === 0}
                  />
                  <div className="figma-payment-method-info">
                    <span className="figma-payment-method-title">From my wallet</span>
                    <span className="figma-payment-method-subtitle">
                      {walletBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })} {displayCurrency}
                    </span>
                  </div>

                  {/* Radio Logic: Only shows border if balance is 0, since it can't be 'checked' */}
                  <div className={`figma-radio ${walletBalance === 0 ? 'radiobuttonborder' : (paymentMethod === 'wallet' ? 'checked' : 'radiobuttonborder')}`}>
                    {paymentMethod === 'wallet' && Number(walletBalance) > 0 && <div className="figma-radio-dot" />}
                  </div>
                </button>

                {/* External Button */}
                <button
                  className={`figma-payment-method ${paymentMethod === 'external' ? 'selected' : ''}`}
                  onClick={() => setPaymentMethod('external')}
                >
                  <div className="figma-payment-method-icon">
                    <GridIcon />
                  </div>
                  <div className="figma-payment-method-info">
                    <span className="figma-payment-method-title">Send payment externally</span>
                    <span className="figma-payment-method-subtitle">Transfer from any crypto wallet</span>
                  </div>
                  {/* Updated Radio Logic */}
                  <div className={`figma-radio ${paymentMethod === 'external' ? 'checked' : 'radiobuttonborder'}`}>
                    {paymentMethod === 'external' && <div className="figma-radio-dot" />}
                  </div>
                </button>
              </div>

              <div className="figma-modal-bottom">
                <button
                  className="figma-create-deal-btn"
                  onClick={handlePaymentMethodContinue}
                >
                  Continue
                </button>

              </div>
              <div className="figma-home-indicator">
                <div className="figma-home-indicator-bar-specific" />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Step 5: Payment Screen (QR Code)
  if (step === 'payment') {
    return (
      <div className="figma-create-deal">
        <div className="figma-create-deal-header">
          <button onClick={handleBack} className="figma-create-deal-back">
            <BackIcon />
          </button>
          <h1 className="figma-create-deal-title">Deal #{createdDeal?.dealNumber || 1001}</h1>
          <button className="figma-create-deal-menu">
            <MenuDotsIcon />
          </button>
        </div>

        <div className="figma-deposit-content">
          {/* Payment Card */}
          <div className="figma-deposit-card">
            <div className="figma-deposit-card-inner">
              <div className="figma-deposit-currency">
                <span className="figma-payment-card-network">Network: {networkName}</span>
                <span className="figma-payment-card-amount">{numAmount.toLocaleString()} {displayCurrency}</span>
              </div>
              {/* QR Code */}
              <div className="figma-payment-qr">
                <div className="figma-payment-qr-inner">
                  {addressLoading ? (
                    <div style={{ width: 140, height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white', borderRadius: 8 }}>
                      <span style={{ color: '#333', fontSize: 14 }}>Loading...</span>
                    </div>
                  ) : addressError ? (
                    <div style={{ width: 140, height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,0,0,0.1)', borderRadius: 8, padding: 8 }}>
                      <span style={{ color: '#ff6b6b', fontSize: 12, textAlign: 'center' }}>{addressError}</span>
                    </div>
                  ) : escrowAddress ? (
                    <>
                      <div className="figma-deposit-qr-wrapper">
                        <QRCodeSVG
                          value={escrowAddress}
                          size={200}
                          bgColor="#ffffff"
                          fgColor="#000000"
                          level="M"
                        // style={{ borderRadius: 8 }}
                        />
                        <div className="figma-deposit-qr-logo">
                          <CurrencyIcon currency={currency} size={28} />
                        </div>
                      </div>
                    </>
                  ) : null}
                </div>
              </div>

              <div className="figma-deposit-address">
                <span className="figma-deposit-address-label">Address of the wallet</span>
                <div className="figma-deposit-address-row">
                  <span className="figma-deposit-address-value">
                    {addressLoading ? 'Loading...' : addressError ? 'Error loading address' : escrowAddress || ''}
                  </span>
                  {escrowAddress && (
                    <button className="figma-deposit-copy" onClick={handleCopyAddress}>
                      <CopyIcon />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* Warning */}
          <div className="figma-deposit-warning">
            <div className="figma-deposit-warning-icon">
              <WarningIcon />
            </div>
            <div className="figma-deposit-warning-content">
              <p className="figma-deposit-warning-title">
                Send {displayCurrency} only via {networkName} network
              </p>
              <p className="figma-deposit-warning-text">
                Sending via another network may result in permanent loss of funds.
              </p>
            </div>
          </div>
          {/* Timer */}
          <div className="figma-payment-timer">
            <ClockIcon />
            <span>Pay within 72 hours</span>
          </div>

          {/* Loading indicator */}
          <div className="figma-payment-loading">
            {/* <div className="figma-payment-loading-dots"> */}
            <svg xmlns="http://www.w3.org/2000/svg" className='sun-rotate' width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 17.4072C12.5834 17.4072 13.0564 17.8796 13.0566 18.4629V21.9434C13.0566 22.5268 12.5835 23 12 23C11.4165 23 10.9434 22.5268 10.9434 21.9434V18.4629C10.9436 17.8796 11.4166 17.4072 12 17.4072Z" fill="white" />
              <path d="M6.68262 15.8232C7.09517 15.4107 7.76416 15.4108 8.17676 15.8232C8.58934 16.2358 8.58933 16.9048 8.17676 17.3174L5.71582 19.7783C5.30323 20.1909 4.63426 20.1909 4.22168 19.7783C3.80922 19.3657 3.80917 18.6967 4.22168 18.2842L6.68262 15.8232Z" fill="white" />
              <path d="M15.8232 15.8232C16.2358 15.4107 16.9048 15.4107 17.3174 15.8232L19.7783 18.2842C20.1908 18.6968 20.1908 19.3658 19.7783 19.7783C19.3658 20.1909 18.6968 20.1908 18.2842 19.7783L15.8232 17.3174C15.4107 16.9048 15.4107 16.2358 15.8232 15.8232Z" fill="white" />
              <path d="M5.53711 10.9434C6.12041 10.9436 6.59276 11.4167 6.59277 12C6.59277 12.5834 6.12042 13.0564 5.53711 13.0566H2.05664C1.47315 13.0566 1 12.5835 1 12C1.00001 11.4165 1.47316 10.9434 2.05664 10.9434H5.53711Z" fill="white" />
              <path d="M21.9434 10.9434C22.5268 10.9434 23 11.4165 23 12C23 12.5835 22.5268 13.0566 21.9434 13.0566H18.4629C17.8796 13.0564 17.4072 12.5834 17.4072 12C17.4072 11.4167 17.8796 10.9436 18.4629 10.9434H21.9434Z" fill="white" />
              <path d="M4.22168 4.22168C4.63426 3.8091 5.30323 3.80913 5.71582 4.22168L8.17676 6.68262C8.58933 7.09521 8.58934 7.76417 8.17676 8.17676C7.76417 8.58925 7.09517 8.5893 6.68262 8.17676L4.22168 5.71582C3.80916 5.30326 3.8092 4.63426 4.22168 4.22168Z" fill="white" />
              <path d="M18.2842 4.22168C18.6968 3.80923 19.3658 3.80914 19.7783 4.22168C20.1909 4.63422 20.1908 5.30322 19.7783 5.71582L17.3174 8.17676C16.9048 8.58935 16.2358 8.58935 15.8232 8.17676C15.4107 7.76417 15.4107 7.0952 15.8232 6.68262L18.2842 4.22168Z" fill="white" />
              <path d="M12 1C12.5835 1 13.0566 1.47315 13.0566 2.05664V5.53711C13.0564 6.12042 12.5834 6.59277 12 6.59277C11.4166 6.59277 10.9436 6.12042 10.9434 5.53711V2.05664C10.9434 1.47315 11.4165 1 12 1Z" fill="white" />
            </svg>
            {/* </div> */}
          </div>
        </div>

        <div className="figma-deals-footer">
          <button
            className="figma-create-deal-btn"
            onClick={handleMarkAsPaid}
          >
            Mark as paid
          </button>
          <div className="figma-home-indicator">
            <div className="figma-home-indicator-bar-specific" />
          </div>
        </div>
      </div>
    );
  }

  // Step 6: Success Screen
  if (step === 'success') {
    return (
      <div className="figma-payment-success">
        {/* Purple gradient background */}
        <div className="figma-payment-success-bg" />

        <div className="figma-payment-success-content">
          <img className="success-img" src='./images/Done.png' />
          <svg
            className="glow-svg"
            viewBox="0 0 393 611"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g filter="url(#filter0_f_2_18389)">
              <ellipse cx="205.155" cy="305.415" rx="115.733" ry="67.0966" transform="rotate(-15 205.155 305.415)" fill="#3A18DC" />
            </g>
            <defs>
              <filter id="filter0_f_2_18389" x="-141.99" y="0" width="694.291" height="610.83" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                <feFlood flood-opacity="0" result="BackgroundImageFix" />
                <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                <feGaussianBlur stdDeviation="117" result="effect1_foregroundBlur_2_18389" />
              </filter>
            </defs>
          </svg>
          <h1 className="figma-payment-success-title">Payment received</h1>
        </div>

        <div className="figma-deals-footer">
          <button
            className="figma-create-deal-btn"
            onClick={handleDone}
          >
            Done
          </button>
          <div className="figma-home-indicator">
            <div className="figma-home-indicator-bar-specific" />
          </div>
        </div>
      </div>
    );
  }

  return null;
}
