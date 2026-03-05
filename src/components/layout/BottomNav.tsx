import { Link, useLocation } from 'react-router-dom';
import { ROUTES } from '@/config/constants';
import { useEffect } from 'react';
// Icons matching Figma design exactly
const HomeIcon = ({ active }: { active: boolean }) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M8.46538 2.63814C9.36814 1.93608 10.6323 1.93602 11.535 2.63814L18.0121 7.67558L18.0764 7.73092C18.3819 8.02255 18.4226 8.50441 18.1578 8.84501C17.9937 9.0558 17.7482 9.16545 17.5002 9.16565V16.2498C17.5002 17.4004 16.5674 18.3331 15.4169 18.3331H4.58354C3.43295 18.3331 2.50021 17.4004 2.50021 16.2498V9.16565C2.25212 9.16553 2.0068 9.05586 1.84266 8.84501C1.56017 8.48182 1.62528 7.95819 1.98833 7.67558L8.46538 2.63814ZM10.8335 11.6665C9.6006 11.6665 8.50904 11.6668 8.31157 11.6803C8.12188 11.6932 8.04925 11.7156 8.01453 11.7299C7.81046 11.8145 7.64827 11.9767 7.56368 12.1808C7.54932 12.2155 7.52701 12.288 7.51404 12.4778C7.50057 12.6753 7.50021 12.9335 7.50021 13.3331V16.6665H12.5002V13.3331C12.5002 12.9335 12.4998 12.6753 12.4864 12.4778C12.4734 12.288 12.4511 12.2155 12.4367 12.1808C12.3522 11.9767 12.1899 11.8145 11.9859 11.7299C11.9512 11.7156 11.8787 11.6933 11.6888 11.6803C11.4914 11.6668 11.2332 11.6665 10.8335 11.6665Z"
      fill={active ? '#0E0D1F' : '#BAB9BE'}
    />
  </svg>
);

// History/Clock icon for Deals tab (Figma exact)
const DealsIcon = ({ active }: { active: boolean }) => (
 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
  <path d="M18.2559 6.50098L14.2559 9.83496V7.35352H3C2.58579 7.35352 2.25 6.97007 2.25 6.49707C2.25 6.02407 2.58579 5.64063 3 5.64062H14.2559V3.16797L18.2559 6.50098Z" fill={active ? '#0E0D1F' : '#BAB9BE'}/>
  <path d="M6.34766 12.6318H16.6484C17.0478 12.6318 17.3711 13.0188 17.3711 13.4961C17.3711 13.9734 17.0478 14.3604 16.6484 14.3604H6.34766V16.8311L2.34766 13.498L6.34766 10.1641V12.6318Z" fill={active ? '#0E0D1F' : '#BAB9BE'}/>
</svg>
);

// Plus icon inside the add button (dark color for contrast)
const AddIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path d="M6 1V11" stroke="#0E0D1F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M1 6H11" stroke="#0E0D1F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Paper plane icon (Figma exact)
const SendIcon = ({ active }: { active: boolean }) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path
      d="M16.1149 1.29132C17.4686 0.997076 18.654 2.27836 18.2544 3.62123L14.2766 17.0164C13.8221 18.5453 11.7734 18.8158 10.9457 17.4453L8.07863 12.6943L12.8508 7.88962C13.1751 7.56307 13.1733 7.03474 12.8467 6.71043C12.5201 6.38667 11.9925 6.38823 11.6683 6.71449L6.90595 11.5086L2.12649 8.56752C0.770303 7.73262 1.0401 5.67261 2.5757 5.22524L15.9839 1.32468L16.1149 1.29132Z"
      fill={active ? '#0E0D1F' : '#BAB9BE'}
    />
  </svg>
);

// Settings gear icon (Figma exact - filled)
const SettingsIcon = ({ active }: { active: boolean }) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M10.1489 0.837321C11.6871 0.915442 12.9037 2.1864 12.9037 3.73283C12.9037 4.29337 13.504 4.62682 13.973 4.35702L14.1048 4.2854C15.4748 3.58412 17.1675 4.07504 17.9435 5.41821L18.0151 5.54924C18.6904 6.86841 18.2571 8.49152 17.0093 9.29842L16.8815 9.37655L16.7977 9.4327C16.4057 9.73753 16.4335 10.3634 16.8815 10.6233L17.0093 10.7022C18.2564 11.5097 18.6905 13.1319 18.0151 14.4506L17.9435 14.5816L17.8678 14.7053C17.0877 15.9142 15.5362 16.3643 14.2342 15.7771L14.1048 15.7153L13.973 15.6436C13.5041 15.3731 12.9037 15.7063 12.9037 16.267L12.8996 16.4159C12.822 17.9436 11.5571 19.1664 9.99919 19.1666L9.84945 19.1625C8.36072 19.0871 7.17234 17.8945 7.09718 16.4159L7.09392 16.267C7.09388 15.7413 6.56572 15.4156 6.1141 15.5997L6.0254 15.6436C4.71969 16.397 3.07255 16.0224 2.21274 14.8274L2.13217 14.7094L2.05405 14.5816C1.28071 13.2417 1.69938 11.5369 2.9891 10.7022L3.11687 10.6233C3.56442 10.364 3.59262 9.73891 3.20151 9.43351L3.11768 9.37655L2.98992 9.29842C1.69919 8.46458 1.2811 6.75956 2.05405 5.41903L2.13217 5.29045C2.96623 4.00254 4.67692 3.57852 6.0254 4.35702L6.1141 4.40096C6.53744 4.57337 7.0278 4.29766 7.08741 3.82886L7.09392 3.73283C7.09392 2.13643 8.39085 0.833331 9.99919 0.833252L10.1489 0.837321ZM9.99838 7.21509C8.51584 7.21555 7.28482 8.37469 7.20948 9.85588L7.20623 9.99992L7.20948 10.144C7.28482 11.6251 8.51666 12.7843 9.99919 12.7847C11.4824 12.7846 12.7128 11.625 12.7881 10.144L12.7922 9.99992C12.7922 8.49906 11.6076 7.29226 10.1416 7.21834L9.99838 7.21509Z"
      fill={active ? '#0E0D1F' : '#BAB9BE'}
    />
  </svg>
);

export function BottomNav() {
 const location = useLocation();

const isWalletDetails = location.pathname.startsWith('/wallet-details/');
const idepositDetails = location.pathname === '/deposit';
const isChatDetails = /^\/deals\/[^/]+\/chat/.test(location.pathname) || location.pathname === '/chat';  // Other static paths you might want to hide
  const isOtherHiddenPath = ['/create'].includes(location.pathname);
const isDealDetail = location.pathname.startsWith('/deal/');
const isnokyconboarding = location.pathname ==='/nokyc-onboarding'
const isnokycpayment = location.pathname ==='/nokyc-payment'
const ispreorderform = location.pathname ==='/pre-order-form'
const iscryptoofframp = location.pathname.startsWith('/crypto-offramp');
const iswithdrawsuccessful = location.pathname ==='/withdraw-successful'
const ispaymentsuccess = location.pathname ==='/payment-success'
const iswithdraw = location.pathname.startsWith('/withdraw');

  const shouldHide = iswithdraw || ispaymentsuccess || iswithdrawsuccessful || iscryptoofframp || ispreorderform || isnokycpayment || isnokyconboarding || isWalletDetails || isOtherHiddenPath || idepositDetails || isChatDetails || isDealDetail;

  useEffect(() => {
    const container = document.querySelector('.app-container');
    
    if (shouldHide) {
      container?.classList.add('no-padding');
    } else {
      container?.classList.remove('no-padding');
    }

    return () => container?.classList.remove('no-padding');
  }, [shouldHide]);
  if (shouldHide) {
    return null;
  }
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="figma-bottom-nav">
      <div className="figma-nav-tabs">
        {/* Home */}
        <Link to={ROUTES.HOME} className="figma-nav-tab">
          <div className={`figma-nav-icon ${isActive(ROUTES.HOME) ? 'active' : ''}`}>
            <HomeIcon active={isActive(ROUTES.HOME)} />
          </div>
        </Link>

        {/* Deals/Transfer */}
       <Link to={ROUTES.DEALS} className="figma-nav-tab">
          <div className={`figma-nav-icon ${isActive(ROUTES.DEALS) ? 'active' : ''}`}>
            <DealsIcon active={isActive(ROUTES.DEALS)} />
          </div>
        </Link>

        {/* Create - Center button */}
        <Link to={ROUTES.CREATE_DEAL} className="figma-nav-tab">
          <div className={`figma-nav-add-btn ${isActive(ROUTES.CREATE_DEAL) ? 'active' : ''}`}>
            <AddIcon />
          </div>
        </Link>
<Link to="/messages" className="figma-nav-tab">
          <div className={`figma-nav-icon ${isActive('/messages') ? 'active' : ''}`}>
            <SendIcon active={isActive('/messages')} />
          </div>
        </Link>
        <Link to={ROUTES.SETTINGS} className="figma-nav-tab">
          <div className={`figma-nav-icon ${isActive(ROUTES.SETTINGS) ? 'active' : ''}`}>
            <SettingsIcon active={isActive(ROUTES.SETTINGS)} />
          </div>
        </Link>
      </div>

      {/* Home Indicator */}
      <div className="figma-home-indicator">
        <div className="figma-home-indicator-bar" />
      </div>
    </nav>
  );
}
