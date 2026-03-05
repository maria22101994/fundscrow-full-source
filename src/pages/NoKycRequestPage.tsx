import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const COUNTRIES = [
  { code: 'US', dialCode: '+1', flag: '🇺🇸', name: 'United States' },
  { code: 'GB', dialCode: '+44', flag: '🇬🇧', name: 'United Kingdom' },
  { code: 'DE', dialCode: '+49', flag: '🇩🇪', name: 'Germany' },
  { code: 'FR', dialCode: '+33', flag: '🇫🇷', name: 'France' },
  { code: 'ES', dialCode: '+34', flag: '🇪🇸', name: 'Spain' },
  { code: 'IT', dialCode: '+39', flag: '🇮🇹', name: 'Italy' },
  { code: 'NL', dialCode: '+31', flag: '🇳🇱', name: 'Netherlands' },
  { code: 'BE', dialCode: '+32', flag: '🇧🇪', name: 'Belgium' },
  { code: 'CH', dialCode: '+41', flag: '🇨🇭', name: 'Switzerland' },
  { code: 'AT', dialCode: '+43', flag: '🇦🇹', name: 'Austria' },
  { code: 'PL', dialCode: '+48', flag: '🇵🇱', name: 'Poland' },
  { code: 'SE', dialCode: '+46', flag: '🇸🇪', name: 'Sweden' },
  { code: 'NO', dialCode: '+47', flag: '🇳🇴', name: 'Norway' },
  { code: 'DK', dialCode: '+45', flag: '🇩🇰', name: 'Denmark' },
  { code: 'FI', dialCode: '+358', flag: '🇫🇮', name: 'Finland' },
  { code: 'IE', dialCode: '+353', flag: '🇮🇪', name: 'Ireland' },
  { code: 'PT', dialCode: '+351', flag: '🇵🇹', name: 'Portugal' },
  { code: 'GR', dialCode: '+30', flag: '🇬🇷', name: 'Greece' },
  { code: 'RU', dialCode: '+7', flag: '🇷🇺', name: 'Russia' },
  { code: 'UA', dialCode: '+380', flag: '🇺🇦', name: 'Ukraine' },
  { code: 'TR', dialCode: '+90', flag: '🇹🇷', name: 'Turkey' },
  { code: 'AE', dialCode: '+971', flag: '🇦🇪', name: 'UAE' },
  { code: 'SA', dialCode: '+966', flag: '🇸🇦', name: 'Saudi Arabia' },
  { code: 'IN', dialCode: '+91', flag: '🇮🇳', name: 'India' },
  { code: 'CN', dialCode: '+86', flag: '🇨🇳', name: 'China' },
  { code: 'JP', dialCode: '+81', flag: '🇯🇵', name: 'Japan' },
  { code: 'KR', dialCode: '+82', flag: '🇰🇷', name: 'South Korea' },
  { code: 'AU', dialCode: '+61', flag: '🇦🇺', name: 'Australia' },
  { code: 'NZ', dialCode: '+64', flag: '🇳🇿', name: 'New Zealand' },
  { code: 'BR', dialCode: '+55', flag: '🇧🇷', name: 'Brazil' },
  { code: 'MX', dialCode: '+52', flag: '🇲🇽', name: 'Mexico' },
  { code: 'CA', dialCode: '+1', flag: '🇨🇦', name: 'Canada' },
];
const ChevronDownIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M5 7.5L10 12.5L15 7.5" stroke="rgba(255,255,255,0.48)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const AlertIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path fillRule="evenodd" clipRule="evenodd" d="M6.60432 2.19419C7.24509 1.03988 8.90444 1.04811 9.53401 2.20852L15.1278 11.8563C15.7333 12.973 14.9268 14.3327 13.659 14.3329H2.34065C1.06583 14.3325 0.259828 12.9589 0.879716 11.842L6.60432 2.19419ZM7.99039 10.1017C7.59817 10.1019 7.28013 10.4207 7.28011 10.814V10.9813C7.28021 11.3745 7.59822 11.694 7.99039 11.6942C8.3827 11.6942 8.70057 11.3746 8.70068 10.9813V10.814C8.70066 10.4206 8.38275 10.1018 7.99039 10.1017ZM7.99039 5.57701C7.62265 5.57717 7.32035 5.85724 7.28401 6.21633L7.28011 6.28925V8.30031L7.28401 8.37258C7.3204 8.73162 7.62269 9.01239 7.99039 9.01255C8.38264 9.01254 8.70048 8.6935 8.70068 8.30031V6.28925L8.69677 6.21633C8.66043 5.85714 8.35827 5.57702 7.99039 5.57701Z" fill="#C2FF0A"/>
  </svg>
);
// Checkmark icon for info note
// const CheckCircleIcon = () => (
//   <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
//     <path d="M10 18.3333C14.6024 18.3333 18.3334 14.6024 18.3334 10C18.3334 5.39763 14.6024 1.66667 10 1.66667C5.39765 1.66667 1.66669 5.39763 1.66669 10C1.66669 14.6024 5.39765 18.3333 10 18.3333Z" stroke="#BFED33" strokeWidth="1.5"/>
//     <path d="M6.66669 10L8.88891 12.2222L13.3334 7.77778" stroke="#BFED33" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
//   </svg>
// );
export function NoKycRequestPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // This checks that both fields have at least one non-space character
const isFormValid = email.trim().length > 0 && phoneNumber.trim().length > 0;

const handleSubmit = async () => {
  // 1. Check validation again just in case
  if (!isFormValid || isSubmitting) return;

  setIsSubmitting(true);

  try {
    // 2. Simulate an API call or logic (e.g., saving contact info)
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 3. NAVIGATE: This must match the 'path' in your App.tsx Route exactly
    // In your App.tsx, you have: <Route path="/nokyc-payment" element={<NoKYCPayment />} />
    navigate('/nokyc-payment'); 
    
  } catch (error) {
    console.error("Submission failed", error);
  } finally {
    setIsSubmitting(false);
  }
};
  return (
    <div className="figma-addressbook">
      {/* Header */}
      <div className="figma-addressbook-header">
        <button className="figma-addressbook-back" onClick={() => navigate(-1)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M9.66135 4.72394C10.054 4.40371 10.6331 4.42659 10.9992 4.7923C11.3653 5.1584 11.3879 5.73742 11.0676 6.13019L10.9992 6.20636L6.20529 11.0003H20.0022C20.5545 11.0003 21.0022 11.448 21.0022 12.0003C21.002 12.5524 20.5543 13.0003 20.0022 13.0003H6.20725L10.9992 17.7923C11.3898 18.1828 11.3897 18.8158 10.9992 19.2064C10.6087 19.5969 9.9757 19.5969 9.58518 19.2064L3.43869 13.0599L3.33615 12.9456C2.88807 12.3958 2.88782 11.6028 3.33615 11.053L3.43869 10.9388L9.58518 4.7923L9.66135 4.72394Z" fill="white" />
          </svg>
        </button>
        <h1 className="figma-addressbook-title">Confirm contact details</h1>
        <div style={{ width: 24 }} />
      </div>

      <div className="figma-addressbook-tabs-container">
        {/* Email Field */}
        <div className="figma-wallet-details-field">
          <label className="figma-wallet-details-label">Email</label>
          <div className="figma-wallet-details-input-wrap">
            <input
              type="email"
              className="figma-wallet-details-input"
              placeholder="Enter Your Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        {/* Mobile Number Field */}
        <div className="figma-wallet-details-field ">
          <label className="figma-wallet-details-label">Mobile Number</label>
          <div className="figma-nokyc-contact-phone-container figma-wallet-details-input-wrap">
            <button
              className="figma-nokyc-contact-country-btn"
              onClick={() => setShowCountryPicker(true)}
            >
              <span className="figma-nokyc-contact-flag">{selectedCountry.flag}</span>
              <ChevronDownIcon />
            </button>

            <input
              type="tel"
              className="figma-nokyc-phone-input"
              placeholder={selectedCountry.dialCode}
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>
        </div>

        {/* Info Note */}
         <div className="figma-deposit-contact">
          <div className="figma-deposit-warning-icon">
            <AlertIcon />
          </div>
          <div className="figma-deposit-warning-content">
            <p className="figma-deposit-warning-title">
              No documents required
            </p>
            <p className="figma-deposit-warning-text">
              We only need your email and phone number to proceed. Your contact details are used only for notifications and secure communication.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Button */}
      <div className="figma-nokyc-contact-bottom-button">
        <button
          className={`figma-deposit-share-btn ${!isFormValid ? 'figma-nokyc-contact-btn--disabled' : ''}`}
          onClick={handleSubmit}
          disabled={!isFormValid || isSubmitting}
        >
          {isSubmitting ? 'Processing...' : 'Continue'}
        </button>
      </div>

      {/* Country Picker Modal - Grid Layout */}
      {showCountryPicker && (
        <div className="figma-nokyc-modal-overlay" onClick={() => setShowCountryPicker(false)}>
          <div className="figma-nokyc-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="figma-nokyc-modal-handle" />
            <h3 className="figma-nokyc-modal-title">Select country</h3>
            <div className="figma-nokyc-modal-grid">
              {COUNTRIES.map((country) => (
                <button
                  key={country.code}
                  className={`figma-nokyc-grid-item ${selectedCountry.code === country.code ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedCountry(country);
                    setShowCountryPicker(false);
                  }}
                >
                  <span className="flag">{country.flag}</span>
                  <span className="name">{country.name}</span>
                  <span className="dial">{country.dialCode}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}