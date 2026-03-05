import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store';

// Level definitions with icons and colors matching Figma exactly
const LEVELS = [
  {
    id: 1,
    name: 'Starter',
    ringColor: '#4f4f4f',
    badgeColor: '#3a3a4e',
    icon: 'chevron',
    benefits: [],
    escrowsNeeded: 1,
    image: './images/starter.png',
    nextPoints: 500
  },
  {
    id: 2,
    name: 'Verified',
    ringColor: '#22c55e',
    badgeColor: '#22c55e',
    icon: 'check',
    benefits: [
      { icon: 'discount', title: 'Discount', desc: 'One free escrow credit per month' }
    ],
    escrowsNeeded: 5,
    image: './images/verified.png',
    nextPoints: 1500
  },
  {
    id: 3,
    name: 'Bronze',
    ringColor: '#CD7F32',
    badgeColor: '#CD7F32',
    icon: 'shield',
    benefits: [
      { icon: 'discount', title: 'Discount', desc: '0.25% fee discount' },
      { icon: 'cashback', title: 'Cashback', desc: '2 USDT cashback credit for every completed escrow' }
    ],
    escrowsNeeded: 15,
    image: './images/bronze.png',
    nextPoints: 3000
  },
  {
    id: 4,
    name: 'Silver',
    ringColor: '#C0C0C0',
    badgeColor: '#C0C0C0',
    image: './images/silver.png',
    icon: 'shield',
    benefits: [
      { icon: 'discount', title: 'Discount', desc: '0.5% fee discount' },
      { icon: 'cashback', title: 'Cashback', desc: '2 USDT cashback credit for every completed escrow' },
      { icon: 'visa', title: 'One free escrow credit per month', desc: 'A free escrow credit equals your minimum fee amount (example: 25 USDT).' }
    ],
    escrowsNeeded: 30,
    nextPoints: 6000
  },
  {
    id: 5,
    name: 'Gold',
    ringColor: '#FFD700',
    badgeColor: '#FFD700',
    image: './images/gold.png',
    icon: 'star',
    benefits: [
      { icon: 'discount', title: 'Discount', desc: '1% fee discount' },
      { icon: 'cashback', title: 'Cashback', desc: '3 USDT cashback credit per completed escrow' },
      { icon: 'priority', title: 'Priority handling', desc: 'Priority handling during peak times' }
    ],
    escrowsNeeded: 50,
    nextPoints: 12000
  },
  {
    id: 6,
    name: 'Platinum',
    ringColor: '#00BCD4',
    badgeColor: '#00BCD4',
    icon: 'crown',
    image: './images/platinum.png',
    benefits: [
      { icon: 'discount', title: 'Discount', desc: '1.5% fee discount' },
      { icon: 'cashback', title: 'Cashback', desc: '5 USDT cashback credit per completed escrow' },
      { icon: 'priority', title: 'Priority handling', desc: 'Highest payout priority on Fundscrow’s side' },
      { icon: 'visa', title: 'Payment', desc: 'Access to reduced fees for large-value deals' }
    ],
    escrowsNeeded: 100,
    nextPoints: 25000
  },
  {
    id: 7,
    name: 'Elite',
    ringColor: '#9333EA',
    badgeColor: '#9333EA',
    image: './images/elite.png',
    icon: 'crown',
    benefits: [
      { icon: 'discount', title: 'Discount', desc: 'Custom fee discount up to 2% (set manually)' },
      { icon: 'cashback', title: 'Cashback', desc: '10 USDT cashback credit per completed escrow' },
      { icon: 'priority', title: 'Priority', desc: 'Custom fee discount up to 2% (set manually)' },
      { icon: 'visa', title: 'Payment', desc: 'Fast-track release priority' }
    ],
    escrowsNeeded: 200,
    nextPoints: 50000
  },
];

// Benefit icons
const DiscountIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22" fill="none">
    <path d="M9.09471 1.48974C9.3031 1.25699 9.55824 1.07081 9.84347 0.943347C10.1287 0.815883 10.4376 0.75 10.75 0.75C11.0624 0.75 11.3713 0.815883 11.6565 0.943347C11.9418 1.07081 12.1969 1.25699 12.4053 1.48974L13.1829 2.35849C13.4052 2.60678 13.6805 2.8019 13.9883 2.92939C14.2962 3.05689 14.6288 3.1135 14.9616 3.09504L16.128 3.03061C16.44 3.01341 16.7522 3.06221 17.044 3.17383C17.3359 3.28545 17.6009 3.45738 17.8218 3.67838C18.0427 3.89938 18.2145 4.1645 18.326 4.45641C18.4375 4.74832 18.4861 5.06046 18.4688 5.37246L18.4043 6.53783C18.386 6.87036 18.4427 7.20276 18.5702 7.51044C18.6977 7.81811 18.8927 8.09319 19.1409 8.31532L20.0096 9.09297C20.2426 9.30138 20.4289 9.55658 20.5565 9.84191C20.6841 10.1272 20.75 10.4363 20.75 10.7488C20.75 11.0614 20.6841 11.3704 20.5565 11.6557C20.4289 11.9411 20.2426 12.1963 20.0096 12.4047L19.1409 13.1823C18.8926 13.4046 18.6975 13.6798 18.57 13.9877C18.4425 14.2956 18.3859 14.6282 18.4043 14.9609L18.4688 16.1274C18.486 16.4394 18.4372 16.7515 18.3255 17.0434C18.2139 17.3352 18.042 17.6003 17.821 17.8212C17.6 18.0421 17.3349 18.2139 17.043 18.3254C16.7511 18.4368 16.4389 18.4855 16.1269 18.4682L14.9616 18.4037C14.629 18.3854 14.2966 18.4421 13.9889 18.5696C13.6813 18.6971 13.4062 18.8921 13.1841 19.1403L12.4064 20.009C12.198 20.2419 11.9428 20.4283 11.6575 20.5559C11.3721 20.6834 11.0631 20.7494 10.7506 20.7494C10.438 20.7494 10.129 20.6834 9.84364 20.5559C9.55831 20.4283 9.30311 20.2419 9.09471 20.009L8.31705 19.1403C8.0948 18.892 7.81954 18.6969 7.51166 18.5694C7.20378 18.4419 6.87117 18.3853 6.53845 18.4037L5.37197 18.4682C5.05996 18.4854 4.74784 18.4365 4.45599 18.3249C4.16413 18.2133 3.8991 18.0414 3.6782 17.8204C3.4573 17.5994 3.2855 17.3343 3.17402 17.0423C3.06253 16.7504 3.01388 16.4383 3.03123 16.1263L3.09566 14.9609C3.11396 14.6284 3.05726 14.296 2.92977 13.9883C2.80228 13.6806 2.60725 13.4056 2.35911 13.1834L1.49036 12.4058C1.25743 12.1974 1.07109 11.9422 0.943517 11.6568C0.815942 11.3715 0.75 11.0625 0.75 10.7499C0.75 10.4374 0.815942 10.1283 0.943517 9.84302C1.07109 9.55769 1.25743 9.30249 1.49036 9.09409L2.35911 8.31643C2.6074 8.09418 2.80252 7.81892 2.93001 7.51104C3.05751 7.20316 3.11412 6.87055 3.09566 6.53783L3.03123 5.37134C3.01419 5.05943 3.06311 4.74744 3.17481 4.45571C3.2865 4.16399 3.45845 3.8991 3.67944 3.67832C3.90042 3.45754 4.16548 3.28584 4.45731 3.17443C4.74914 3.06301 5.06118 3.01438 5.37308 3.03172L6.53845 3.09615C6.87098 3.11445 7.20338 3.05775 7.51106 2.93026C7.81873 2.80277 8.09381 2.60774 8.31594 2.3596L9.09471 1.48974Z" stroke="#C2FF0A" stroke-width="1.5" />
    <path d="M7.97266 7.97119H7.98377V7.9823H7.97266V7.97119ZM13.5273 13.5259H13.5384V13.537H13.5273V13.5259Z" stroke="#C2FF0A" stroke-width="2.25" stroke-linejoin="round" />
    <path d="M14.0826 7.41553L7.41699 14.0811" stroke="#C2FF0A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
);

const CashbackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
    <g clip-path="url(#clip0_2_19272)">
      <path d="M1.66602 9.99935C1.66602 14.6018 5.39685 18.3327 9.99935 18.3327C14.6018 18.3327 18.3327 14.6018 18.3327 9.99935C18.3327 5.39685 14.6018 1.66602 9.99935 1.66602C6.58268 1.66602 3.64518 3.72268 2.35935 6.66602M1.66602 3.74935L2.08268 7.08268L5.41602 6.24935" stroke="#C2FF0A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M12.2705 8.38268C12.1872 7.74768 11.4597 6.72018 10.1497 6.72018C8.62805 6.72018 7.98805 7.56518 7.85805 7.98685C7.65555 8.55185 7.69555 9.71268 9.47971 9.83935C11.7089 9.99768 12.6022 10.2618 12.488 11.6285C12.3747 12.9952 11.1322 13.291 10.1497 13.2593C9.16721 13.2277 7.56055 12.776 7.49805 11.5593M9.99388 5.41602V6.72435M9.99388 13.2518V14.5827" stroke="#C2FF0A" stroke-width="1.5" stroke-linecap="round" />
    </g>
    <defs>
      <clipPath id="clip0_2_19272">
        <rect width="20" height="20" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

const PriorityIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
    <g clip-path="url(#clip0_2_18817)">
      <path d="M10.0006 5.83391L13.3339 9.16724M10.0006 5.83391L6.66724 9.30641M10.0006 5.83391V13.3339M9.64724 1.18724C9.74099 1.09361 9.86808 1.04102 10.0006 1.04102C10.1331 1.04102 10.2602 1.09361 10.3539 1.18724L18.8139 9.64724C18.9075 9.74099 18.9601 9.86808 18.9601 10.0006C18.9601 10.1331 18.9075 10.2602 18.8139 10.3539L10.3539 18.8139C10.2602 18.9075 10.1331 18.9601 10.0006 18.9601C9.86808 18.9601 9.74099 18.9075 9.64724 18.8139L1.18724 10.3539C1.09361 10.2602 1.04102 10.1331 1.04102 10.0006C1.04102 9.86808 1.09361 9.74099 1.18724 9.64724L9.64724 1.18724Z" stroke="#C2FF0A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
    </g>
    <defs>
      <clipPath id="clip0_2_18817">
        <rect width="20" height="20" fill="white" />
      </clipPath>
    </defs>
  </svg>
);
const VisaIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M13 14.5C13 14.2348 13.1054 13.9804 13.2929 13.7929C13.4804 13.6054 13.7348 13.5 14 13.5H17C17.2652 13.5 17.5196 13.6054 17.7071 13.7929C17.8946 13.9804 18 14.2348 18 14.5C18 14.7652 17.8946 15.0196 17.7071 15.2071C17.5196 15.3946 17.2652 15.5 17 15.5H14C13.7348 15.5 13.4804 15.3946 13.2929 15.2071C13.1054 15.0196 13 14.7652 13 14.5Z" fill="#C2FF0A" />
    <path d="M16.83 4.75H7.17C6.635 4.75 6.19 4.75 5.825 4.78C5.445 4.81 5.089 4.878 4.752 5.05C4.23445 5.31367 3.81367 5.73445 3.55 6.252C3.378 6.589 3.31 6.945 3.28 7.325C3.25 7.69 3.25 8.135 3.25 8.67V15.33C3.25 15.865 3.25 16.31 3.28 16.675C3.31 17.055 3.378 17.411 3.55 17.748C3.81367 18.2656 4.23445 18.6863 4.752 18.95C5.089 19.122 5.445 19.19 5.825 19.22C6.19 19.25 6.635 19.25 7.17 19.25H16.83C17.365 19.25 17.81 19.25 18.175 19.22C18.555 19.19 18.911 19.122 19.248 18.95C19.7654 18.6866 20.1862 18.2662 20.45 17.749C20.622 17.411 20.69 17.055 20.72 16.675C20.75 16.31 20.75 15.865 20.75 15.331V8.67C20.75 8.135 20.75 7.69 20.72 7.325C20.69 6.945 20.622 6.589 20.45 6.252C20.1869 5.73475 19.7668 5.31401 19.25 5.05C18.912 4.878 18.556 4.81 18.176 4.78C17.811 4.75 17.365 4.75 16.83 4.75ZM5.433 6.386C5.523 6.34 5.66 6.298 5.947 6.275C6.243 6.251 6.627 6.25 7.2 6.25H16.8C17.372 6.25 17.757 6.25 18.052 6.275C18.34 6.298 18.477 6.34 18.567 6.386C18.803 6.506 18.994 6.697 19.114 6.933C19.16 7.023 19.202 7.16 19.225 7.447C19.246 7.707 19.249 8.036 19.25 8.5H4.75C4.75 8.036 4.754 7.707 4.775 7.447C4.798 7.16 4.84 7.023 4.886 6.933C5.00591 6.69741 5.19741 6.50591 5.433 6.386ZM4.75 10.5H19.25V15.3C19.25 15.872 19.25 16.257 19.225 16.552C19.202 16.84 19.16 16.977 19.114 17.067C18.9941 17.3026 18.8026 17.4941 18.567 17.614C18.477 17.66 18.34 17.702 18.052 17.725C17.757 17.749 17.372 17.75 16.8 17.75H7.2C6.628 17.75 6.243 17.75 5.947 17.725C5.66 17.702 5.523 17.66 5.433 17.614C5.19741 17.4941 5.00591 17.3026 4.886 17.067C4.84 16.977 4.798 16.84 4.775 16.552C4.751 16.257 4.75 15.872 4.75 15.3V10.5Z" fill="#C2FF0A" />
  </svg>
);

const SupportIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
    <g clip-path="url(#clip0_2_19061)">
      <path d="M10.0006 5.83391L13.3339 9.16724M10.0006 5.83391L6.66724 9.30641M10.0006 5.83391V13.3339M9.64724 1.18724C9.74099 1.09361 9.86808 1.04102 10.0006 1.04102C10.1331 1.04102 10.2602 1.09361 10.3539 1.18724L18.8139 9.64724C18.9075 9.74099 18.9601 9.86808 18.9601 10.0006C18.9601 10.1331 18.9075 10.2602 18.8139 10.3539L10.3539 18.8139C10.2602 18.9075 10.1331 18.9601 10.0006 18.9601C9.86808 18.9601 9.74099 18.9075 9.64724 18.8139L1.18724 10.3539C1.09361 10.2602 1.04102 10.1331 1.04102 10.0006C1.04102 9.86808 1.09361 9.74099 1.18724 9.64724L9.64724 1.18724Z" stroke="#C2FF0A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
    </g>
    <defs>
      <clipPath id="clip0_2_19061">
        <rect width="20" height="20" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

const BenefitIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'discount': return <DiscountIcon />;
    case 'cashback': return <CashbackIcon />;
    case 'priority': return <PriorityIcon />;
    case 'support': return <SupportIcon />;
    case 'visa': return <VisaIcon />;
    default: return <DiscountIcon />;
  }
};

// Badge icons for each level
// const StarBadgeIcon = ({ color }: { color: string }) => (
//   <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
//     <path d="M20 4l4 12h12l-10 8 4 12-10-8-10 8 4-12L4 16h12l4-12z" fill={color} />
//   </svg>
// );

// const CrownBadgeIcon = ({ color }: { color: string }) => (
//   <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
//     <path d="M6 28V16l8 6 6-10 6 10 8-6v12H6z" fill={color} />
//     <rect x="6" y="28" width="28" height="4" rx="1" fill={color} />
//   </svg>
// );

// const ShieldBadgeIcon = ({ color }: { color: string }) => (
//   <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
//     <path d="M20 4L6 10v10c0 9 6 14 14 18 8-4 14-9 14-18V10L20 4z" fill={color} />
//     <path d="M16 20l4 4 8-8" stroke="#0e0d1f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
//   </svg>
// );

// const CheckBadgeIcon = ({ color }: { color: string }) => (
//   <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
//     <circle cx="20" cy="20" r="16" fill={color} />
//     <path d="M12 20l6 6 10-12" stroke="#0e0d1f" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
//   </svg>
// );

// const ChevronBadgeIcon = () => (
//   <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
//     <path d="M20 6L32 14v12L20 34 8 26V14L20 6z" fill="#3a3a4e" stroke="#4a4a5e" strokeWidth="2" />
//     <path d="M20 14l-6 6 6 6 6-6-6-6z" fill="white" fillOpacity="0.5" />
//   </svg>
// );

// const LevelBadgeIcon = ({ level }: { level: typeof LEVELS[0] }) => {
//   switch (level.icon) {
//     case 'star': return <StarBadgeIcon color={level.badgeColor} />;
//     case 'crown': return <CrownBadgeIcon color={level.badgeColor} />;
//     case 'shield': return <ShieldBadgeIcon color={level.badgeColor} />;
//     case 'check': return <CheckBadgeIcon color={level.badgeColor} />;
//     default: return <ChevronBadgeIcon />;
//   }
// };

export function RewardsPage() {
  const navigate = useNavigate();
  const { userData, fetchUserData } = useAuthStore();

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const userLevel = userData?.rewardLevel || 1;
  // const userLevel = 7;
  const completedEscrows = userData?.completedEscrows || 0;
  const totalVolume = userData?.totalVolume || 0;
  const activeStreak = userData?.activeStreakDays || 0;

  const currentLevelIndex = LEVELS.findIndex(l => l.id === userLevel);
  const currentLevel = LEVELS[currentLevelIndex] || LEVELS[0];
  const nextLevel = LEVELS[currentLevelIndex + 1];

  // Progress calculation
  const escrowProgress = nextLevel
    ? Math.min(100, (completedEscrows / nextLevel.escrowsNeeded) * 100)
    : 100;

  const escrowsRemaining = nextLevel ? nextLevel.escrowsNeeded - completedEscrows : 0;

  return (
    <div className="figma-rewards">
      {/* Background decorative lines */}
      <div className="figma-rewards-bg-lines figma-rewards-bg-lines--top" />
      <div className="figma-rewards-bg-lines figma-rewards-bg-lines--bottom" />

      {/* Header */}
      <div className="figma-rewards-header">
        <button className="figma-rewards-back" onClick={() => navigate(-1)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M9.66135 4.72394C10.054 4.40371 10.6331 4.42659 10.9992 4.7923C11.3653 5.1584 11.3879 5.73742 11.0676 6.13019L10.9992 6.20636L6.20529 11.0003H20.0022C20.5545 11.0003 21.0022 11.448 21.0022 12.0003C21.002 12.5524 20.5543 13.0003 20.0022 13.0003H6.20725L10.9992 17.7923C11.3898 18.1828 11.3897 18.8158 10.9992 19.2064C10.6087 19.5969 9.9757 19.5969 9.58518 19.2064L3.43869 13.0599L3.33615 12.9456C2.88807 12.3958 2.88782 11.6028 3.33615 11.053L3.43869 10.9388L9.58518 4.7923L9.66135 4.72394Z" fill="white" />
          </svg>
        </button>
        <span className="figma-rewards-title">Rewards</span>
        <div style={{ width: 24 }} />
      </div>

      {/* Badge Section */}
      <div className="figma-rewards-badge-section">
        <img
          src={currentLevel.image}
          alt={currentLevel.name}
        />

      </div>

      {/* Level Name & Description */}
      <div className="figma-rewards-level-info">
        <h2 className="figma-rewards-level-name">{currentLevel.name} level</h2>
        <p className="figma-rewards-level-desc">
          {nextLevel
            ? `${(nextLevel.nextPoints - (userData?.rewardPoints || 0)).toLocaleString()} points to ${nextLevel.name} level`
            : 'Maximum level reached!'}
        </p>
      </div>

      {/* Main Content Card */}
      <div className="figma-rewards-content">
        {/* Your Benefits Section */}
        {currentLevel.benefits.length > 0 && (
          <div className="figma-rewards-section">
            <h3 className="figma-rewards-section-title">Your benefits</h3>
            <div className="figma-rewards-benefits">
              {currentLevel.benefits.map((benefit, index) => (
                <div key={index} className="figma-rewards-benefit">
                  <div className="figma-rewards-benefit-icon">
                    <BenefitIcon type={benefit.icon} />
                  </div>
                  <div className="figma-rewards-benefit-info">
                    <span className="figma-rewards-benefit-title">{benefit.title}</span>
                    <span className="figma-rewards-benefit-desc">{benefit.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Your Statistics Section */}
        <div className="figma-rewards-section">
          <h3 className="figma-rewards-section-title">Your statistics</h3>
          <div className="figma-rewards-stats">
            <div className="figma-rewards-stat">
              <span className="figma-rewards-stat-value">{completedEscrows}</span>
              <span className="figma-rewards-stat-label">Completed<br />escrows</span>
            </div>
            <div className="figma-rewards-stat">
              <span className="figma-rewards-stat-value">{totalVolume.toLocaleString()}</span>
              <span className="figma-rewards-stat-label">Total volume<br />(USDT)</span>
            </div>
            <div className="figma-rewards-stat">
              <span className="figma-rewards-stat-value">{activeStreak}</span>
              <span className="figma-rewards-stat-label">Active streak<br />(days)</span>
            </div>
          </div>
        </div>

        {/* Next Milestone Section */}
        {nextLevel && (
          <div className="figma-rewards-section">
            <h3 className="figma-rewards-section-title">Next milestone</h3>
            <div className="figma-rewards-milestone">
              <div className="figma-rewards-milestone-header">
                <span className="figma-rewards-milestone-title">{nextLevel.escrowsNeeded} completed escrows</span>
                <button className="figma-rewards-milestone-info-btn">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <g clip-path="url(#clip0_2_18843)">
                      <path d="M9 7.96875C9.46599 7.96875 9.84375 8.34651 9.84375 8.8125V12.375C9.84375 12.841 9.46599 13.2188 9 13.2188C8.53401 13.2188 8.15625 12.841 8.15625 12.375V8.8125C8.15625 8.34651 8.53401 7.96875 9 7.96875Z" fill="white" fill-opacity="0.64" />
                      <path d="M9 4.78125C9.46599 4.78125 9.84375 5.15901 9.84375 5.625V6.1875C9.84375 6.65349 9.46599 7.03125 9 7.03125C8.53401 7.03125 8.15625 6.65349 8.15625 6.1875V5.625C8.15625 5.15901 8.53401 4.78125 9 4.78125Z" fill="white" fill-opacity="0.64" />
                      <path fill-rule="evenodd" clip-rule="evenodd" d="M9 0.75C13.5563 0.75 17.25 4.44365 17.25 9C17.25 13.5563 13.5563 17.25 9 17.25C4.44365 17.25 0.75 13.5563 0.75 9C0.75 4.44365 4.44365 0.75 9 0.75ZM9 2.25C5.27208 2.25 2.25 5.27208 2.25 9C2.25 12.7279 5.27208 15.75 9 15.75C12.7279 15.75 15.75 12.7279 15.75 9C15.75 5.27208 12.7279 2.25 9 2.25Z" fill="white" fill-opacity="0.64" />
                    </g>
                    <defs>
                      <clipPath id="clip0_2_18843">
                        <rect width="18" height="18" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                </button>
              </div>
              <div className="figma-rewards-milestone-meta">
                <span className="figma-rewards-milestone-reward">Reward: 25 USDT escrow credit</span>
                <span className="figma-rewards-milestone-remaining">{escrowsRemaining}/{nextLevel.escrowsNeeded} left</span>
              </div>
              <div className="figma-rewards-milestone-bar">
                <div
                  className="figma-rewards-milestone-fill"
                  style={{ width: `${escrowProgress}%` }}
                />
              </div>
              <span className="figma-rewards-milestone-count">
                {completedEscrows} / {nextLevel.escrowsNeeded} completed
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom spacing */}
      <div style={{ height: 100 }} />
    </div>
  );
}
