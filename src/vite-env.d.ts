/// <reference types="vite/client" />

interface TelegramWebApp {
  initData: string;
  initDataUnsafe: object;
  ready: () => void;
  close: () => void;
  expand: () => void;
  onEvent: (event: string, callback: () => void) => void;
  offEvent: (event: string, callback: () => void) => void;
  BackButton: {
    show: () => void;
    hide: () => void;
  };
}

interface Window {
  Telegram?: {
    WebApp?: TelegramWebApp;
  };
}

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_BOT_USERNAME: string;
  readonly VITE_TRANSAK_API_KEY: string;
  readonly VITE_TRANSAK_ENV: 'STAGING' | 'PRODUCTION';
  readonly VITE_CARD_PROVIDER: string;
  readonly VITE_CARD_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
