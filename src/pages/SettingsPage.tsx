import { useNavigate } from 'react-router-dom';
import { useAuthStore, useSettingsStore } from '@/store';

export function SettingsPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    settings,
    updateNotificationSetting,
    updateSecuritySetting,
    updateDisplaySetting
  } = useSettingsStore();

  return (
    <div className="figma-settings">
      {/* Header */}
      <div className="figma-settings-header">
        <button className="figma-settings-back" onClick={() => navigate(-1)}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M9.66135 4.72419C10.054 4.40396 10.6331 4.42683 10.9992 4.79254C11.3653 5.15864 11.3879 5.73766 11.0676 6.13044L10.9992 6.20661L6.20529 11.0006H20.0022C20.5545 11.0006 21.0022 11.4483 21.0022 12.0006C21.002 12.5527 20.5543 13.0006 20.0022 13.0006H6.20725L10.9992 17.7925C11.3898 18.1831 11.3897 18.8161 10.9992 19.2066C10.6087 19.5971 9.9757 19.5971 9.58518 19.2066L3.43869 13.0601L3.33615 12.9459C2.88807 12.396 2.88782 11.603 3.33615 11.0533L3.43869 10.939L9.58518 4.79254L9.66135 4.72419Z" fill="white" />
          </svg>
        </button>
        <h1 className="figma-settings-title">Settings</h1>
        <div style={{ width: 24 }} />
      </div>

      <div className="figma-settings-content">
        {/* Profile Card */}
        <div className="figma-settings-profile">
          <div className="figma-settings-avatar">
            <div className="figma-settings-avatar-inner">
              {user?.firstName?.charAt(0) || 'U'}
            </div>
          </div>
          <div className="figma-settings-profile-info">
            <span className="figma-settings-profile-name">
              {user?.firstName || 'Name'}
            </span>
            <span className="figma-settings-profile-username">
              @{user?.username || 'username'}
            </span>
          </div>
        </div>

        {/* Wallet Section */}
        <div className="figma-settings-section">
          <span className="figma-settings-label">Wallet</span>
          <div className="figma-settings-card">
            <div
              className="figma-settings-row figma-settings-row--link"
              onClick={() => navigate('/address-book')}
            >
              <span className="figma-settings-row-text">Manage address book</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M9 18l6-6-6-6" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="figma-settings-section">
          <span className="figma-settings-label">Notifications</span>
          <div className="figma-settings-card">
            <div className="figma-settings-row">
              <span className="figma-settings-row-text">Deal updates</span>
              <label className="figma-toggle">
                <input
                  type="checkbox"
                  checked={settings.notifications.dealUpdates}
                  onChange={(e) => updateNotificationSetting('dealUpdates', e.target.checked)}
                />
                <span className="figma-toggle-track" />
              </label>
            </div>
            <div className="figma-settings-divider" />
            <div className="figma-settings-row">
              <span className="figma-settings-row-text">Deposits</span>
              <label className="figma-toggle">
                <input
                  type="checkbox"
                  checked={settings.notifications.deposits}
                  onChange={(e) => updateNotificationSetting('deposits', e.target.checked)}
                />
                <span className="figma-toggle-track" />
              </label>
            </div>
            <div className="figma-settings-divider" />
            <div className="figma-settings-row">
              <span className="figma-settings-row-text">Withdrawals</span>
              <label className="figma-toggle">
                <input
                  type="checkbox"
                  checked={settings.notifications.withdrawals}
                  onChange={(e) => updateNotificationSetting('withdrawals', e.target.checked)}
                />
                <span className="figma-toggle-track" />
              </label>
            </div>
            <div className="figma-settings-divider" />
            <div className="figma-settings-row">
              <span className="figma-settings-row-text">Security</span>
              <label className="figma-toggle">
                <input
                  type="checkbox"
                  checked={settings.notifications.security}
                  onChange={(e) => updateNotificationSetting('security', e.target.checked)}
                />
                <span className="figma-toggle-track" />
              </label>
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div className="figma-settings-section">
          <span className="figma-settings-label">Security</span>
          <div className="figma-settings-card">
            <div className="figma-settings-row">
              <span className="figma-settings-row-text">2FA</span>
              <label className="figma-toggle">
                <input
                  type="checkbox"
                  checked={settings.security.twoFactor}
                  onChange={(e) => updateSecuritySetting('twoFactor', e.target.checked)}
                />
                <span className="figma-toggle-track" />
              </label>
            </div>
            <div className="figma-settings-divider" />
            <div className="figma-settings-row">
              <span className="figma-settings-row-text">Withdrawal confirmation</span>
              <label className="figma-toggle">
                <input
                  type="checkbox"
                  checked={settings.security.withdrawalConfirmation}
                  onChange={(e) => updateSecuritySetting('withdrawalConfirmation', e.target.checked)}
                />
                <span className="figma-toggle-track" />
              </label>
            </div>
          </div>
        </div>

        {/* Display Section */}
        <div className="figma-settings-section">
          <span className="figma-settings-label">Display</span>
          <div className="figma-settings-card">
            <div className="figma-settings-row">
              <span className="figma-settings-row-text">Show balances</span>
              <label className="figma-toggle">
                <input
                  type="checkbox"
                  checked={settings.display.showBalances}
                  onChange={(e) => updateDisplaySetting('showBalances', e.target.checked)}
                />
                <span className="figma-toggle-track" />
              </label>
            </div>
            <div className="figma-settings-divider" />
            <div className="figma-settings-row">
              <span className="figma-settings-row-text">Compact mode</span>
              <label className="figma-toggle">
                <input
                  type="checkbox"
                  checked={settings.display.compactMode || false}
                  onChange={(e) => updateDisplaySetting('compactMode', e.target.checked)}
                />
                <span className="figma-toggle-track" />
              </label>
            </div>
          </div>
        </div>

        {/* Support Section */}
        <div className="figma-settings-section">
          <span className="figma-settings-label">Support</span>
          <div className="figma-settings-card">
            <div
              className="figma-settings-row figma-settings-row--link"
              onClick={() => window.open('https://fundscrow.io/guide', '_blank')}
            >
              <span className="figma-settings-row-text">Guide</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M9 18l6-6-6-6" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="figma-settings-divider" />
            <div
              className="figma-settings-row figma-settings-row--link"
              onClick={() => window.open('https://t.me/fundscrow_support', '_blank')}
            >
              <span className="figma-settings-row-text">Contact</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M9 18l6-6-6-6" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="figma-settings-divider" />
            <div
              className="figma-settings-row figma-settings-row--link"
              onClick={() => window.open('https://fundscrow.io/report', '_blank')}
            >
              <span className="figma-settings-row-text">Report issue</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M9 18l6-6-6-6" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>

        {/* Legal Section */}
        <div className="figma-settings-section">
          <span className="figma-settings-label">Legal</span>
          <div className="figma-settings-card">
            <div
              className="figma-settings-row figma-settings-row--link"
              onClick={() => window.open('https://fundscrow.io/terms', '_blank')}
            >
              <span className="figma-settings-row-text">Service Terms</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M9 18l6-6-6-6" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="figma-settings-divider" />
            <div
              className="figma-settings-row figma-settings-row--link"
              onClick={() => window.open('https://fundscrow.io/privacy', '_blank')}
            >
              <span className="figma-settings-row-text">Privacy Policy</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M9 18l6-6-6-6" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom spacing for nav */}
      {/* <div style={{ height: 100 }} /> */}
    </div>
  );
}
