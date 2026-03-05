import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { AppRoot } from '@telegram-apps/telegram-ui';
import {
  retrieveLaunchParams,
  bindThemeParamsCssVars,
  bindViewportCssVars,
  postEvent,
} from '@telegram-apps/sdk-react';

import { BottomNav } from '@/components/layout/BottomNav';
import { HomePage } from '@/pages/HomePage';
import { DealsPage } from '@/pages/DealsPage';
import { OfframpPage } from '@/pages/OfframpPage';
import { CreateDealPage } from '@/pages/CreateDealPage';
import { DealDetailPage } from '@/pages/DealDetailPage';
import { DepositPage } from '@/pages/DepositPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { WalletPage } from '@/pages/WalletPage';
import { WithdrawPage } from '@/pages/WithdrawPage';
import { PaymentPage } from '@/pages/PaymentPage';
import { AddressBookPage } from '@/pages/AddressBookPage';
import { WalletDetailsPage } from '@/pages/WalletDetailsPage';
import { RewardsPage } from '@/pages/RewardsPage';
import { ChatPage } from '@/pages/ChatPage';
import { MessagesPage } from '@/pages/MessagesPage';
import { ActivityPage } from '@/pages/ActivityPage';
import { NoKycOnboardingPage } from '@/pages/NoKycOnboardingPage';
import { NoKycRequestPage } from '@/pages/NoKycRequestPage';
import { NoKycProcessingPage } from '@/pages/NoKycProcessingPage';
import { PaymentSuccessPage } from '@/pages/PaymentSuccessPage';
import { NoKYCPayment } from '@/pages/NoKYCPayment';
import { PreOrderForm } from '@/pages/PreOrderForm';
import { OffRampAddress } from '@/pages/OffRampAddress';
import { CryptoOffRampAddress } from '@/pages/CryptoOffRampAddress';
import { useAuthStore } from '@/store';
import { api } from '@/services/api';
import { ROUTES } from '@/config/constants';
import { WithdrawSuccess } from '@/pages/WithdrawSuccessful'
import { CurrencySelector } from '@/pages/SelectCurrency'
// Theme colors matching Iryna's design
const THEME = {
  bgColor: '#0F0F1A' as const,
  headerColor: '#0F0F1A' as const,
};

// Development mode - bypasses Telegram auth for UI development
const DEV_MODE = import.meta.env.VITE_DEV_MODE === 'true';

// Mock user for dev mode
const DEV_USER = {
  id: 123456789,
  firstName: 'Dev',
  lastName: 'User',
  username: 'devuser',
  photoUrl: undefined,
  languageCode: 'en',
};

// Back button handler component
function BackButtonHandler() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Show/hide back button based on route
    const isHomePage = location.pathname === ROUTES.HOME;

    try {
      if (isHomePage) {
        postEvent('web_app_setup_back_button', { is_visible: false });
      } else {
        postEvent('web_app_setup_back_button', { is_visible: true });
      }
    } catch {
      // Not in Telegram context
    }

    // Listen for back button press
    const handleBackButton = () => {
      if (!isHomePage) {
        navigate(-1);
      }
    };

    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.onEvent('backButtonClicked', handleBackButton);
    }

    return () => {
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.offEvent('backButtonClicked', handleBackButton);
      }
    };
  }, [location.pathname, navigate]);

  return null;
}

export function App() {
  const { setUser, setAuthenticated } = useAuthStore();
  const [initError, setInitError] = useState<string | null>(null);

  const initializeTelegram = useCallback(() => {
    // Dev mode - bypass Telegram auth for UI development
    if (DEV_MODE) {
      console.log('[DEV MODE] Bypassing Telegram authentication');
      setUser(DEV_USER);
      setAuthenticated(true);
      // Set a mock token for API calls (backend will need to handle this)
      api.setInitData('dev_mode_token');
      return true;
    }

    try {
      const launchParams = retrieveLaunchParams();

      // Set init data for API authentication
      if (launchParams.initDataRaw) {
        api.setInitData(launchParams.initDataRaw);
      }

      // Set user from init data
      if (launchParams.initData?.user) {
        setUser({
          id: launchParams.initData.user.id,
          firstName: launchParams.initData.user.firstName,
          lastName: launchParams.initData.user.lastName,
          username: launchParams.initData.user.username,
          photoUrl: launchParams.initData.user.photoUrl,
          languageCode: launchParams.initData.user.languageCode,
        });
        setAuthenticated(true);
      }

      // Expand viewport to full height (critical for Mini Apps)
      try {
        postEvent('web_app_expand');
      } catch {
        console.log('Viewport expand not available');
      }

      // Set header and background colors to match Iryna's design
      try {
        postEvent('web_app_set_header_color', { color: THEME.headerColor });
        postEvent('web_app_set_background_color', { color: THEME.bgColor });
      } catch {
        console.log('Color setting not available');
      }

      // Disable closing confirmation by default (enable for important flows)
      try {
        postEvent('web_app_setup_closing_behavior', { need_confirmation: false });
      } catch {
        console.log('Closing behavior setup not available');
      }

      // Bind theme CSS variables
      try {
        bindThemeParamsCssVars();
        bindViewportCssVars();
      } catch {
        console.log('Theme binding not available');
      }

      // Signal that the app is ready
      try {
        postEvent('web_app_ready');
      } catch {
        console.log('Ready event not available');
      }

      return true;
    } catch (error) {
      console.error('Failed to initialize Telegram SDK:', error);
      return false;
    }
  }, [setUser, setAuthenticated]);

  useEffect(() => {
    const initialized = initializeTelegram();

    if (!initialized) {
      setInitError('This app can only be accessed through Telegram. Please open it from the Fundscrow bot.');
    }
  }, [initializeTelegram]);

  if (initError) {
    return (
      <AppRoot appearance="dark" platform="ios">
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          padding: '2rem',
          textAlign: 'center',
          background: '#0F0F1A',
          color: 'white',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '1rem' }}>&#x1f6ab;</div>
          <h2 style={{ marginBottom: '0.5rem', fontSize: '1.25rem' }}>Access Restricted</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', maxWidth: '300px', lineHeight: 1.5 }}>
            {initError}
          </p>
        </div>
      </AppRoot>
    );
  }

  return (
    <AppRoot appearance="dark" platform="ios">
      <BrowserRouter basename="/app">
        <BackButtonHandler />
        <div className="app-container safe-area-top">
          <Routes>
            {/* Main Navigation */}
            <Route path={ROUTES.HOME} element={<HomePage />} />
            <Route path={ROUTES.DEALS} element={<DealsPage />} />
            <Route path={ROUTES.CREATE_DEAL} element={<CreateDealPage />} />
            <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
            <Route path="/nokyc-payment" element={<NoKYCPayment />} />

            {/* Deal Flow */}
            <Route path={ROUTES.DEAL_DETAIL} element={<DealDetailPage />} />
            <Route path="/deals/:dealId/chat" element={<ChatPage />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path={ROUTES.DEPOSIT} element={<DepositPage />} />

            {/* Wallet Flow */}
            <Route path="/wallet" element={<WalletPage />} />
            <Route path="/withdraw" element={<WithdrawPage />} />
            <Route path="/payment/:dealId?" element={<PaymentPage />} />
            <Route path="/address-book" element={<AddressBookPage />} />
            <Route path="/wallet-details/:id" element={<WalletDetailsPage />} />
            <Route path="/rewards" element={<RewardsPage />} />
            <Route path="/activity" element={<ActivityPage />} />
            <Route path="/nokyc-onboarding" element={<NoKycOnboardingPage />} />
            <Route path="/nokyc-request" element={<NoKycRequestPage />} />
            <Route path="/nokyc-processing" element={<NoKycProcessingPage />} />
            <Route path="/payment-success" element={<PaymentSuccessPage />} />
            <Route path="/pre-order-form" element={<PreOrderForm />} />
            <Route path="/off-ramp-addresses" element={<OffRampAddress />} />
            <Route path="/crypto-offramp/:id" element={<CryptoOffRampAddress />} />
            <Route path="/withdraw-successful" element={<WithdrawSuccess />} />
            <Route path="/select-currency" element={<CurrencySelector />} />

            <Route path={ROUTES.OFFRAMP} element={<OfframpPage />} />

            {/* Fallback */}
            <Route path="*" element={<HomePage />} />
          </Routes>
          <BottomNav />
        </div>
      </BrowserRouter>
    </AppRoot>
  );
}