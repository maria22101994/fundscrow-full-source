import React, { useState } from 'react';
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
    <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export function PreOrderForm() {
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[1]); // Default to GB
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    contactMethod: 'WhatsApp',
    messengerDetail: ''
  });
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Combine dial code with phone number for the final submission
    const finalData = {
        ...formData,
        fullPhone: `${selectedCountry.dialCode}${formData.phone}`
    };
    console.log('Form Submitted:', finalData);
  };

  return (
    <div className="bee-form-container">
      <div className="bee-form-card">
        <header className="bee-form-header">
             <button className="figma-addressbook-back" onClick={() => navigate(-1)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M9.66135 4.72394C10.054 4.40371 10.6331 4.42659 10.9992 4.7923C11.3653 5.1584 11.3879 5.73742 11.0676 6.13019L10.9992 6.20636L6.20529 11.0003H20.0022C20.5545 11.0003 21.0022 11.448 21.0022 12.0003C21.002 12.5524 20.5543 13.0003 20.0022 13.0003H6.20725L10.9992 17.7923C11.3898 18.1828 11.3897 18.8158 10.9992 19.2064C10.6087 19.5969 9.9757 19.5969 9.58518 19.2064L3.43869 13.0599L3.33615 12.9456C2.88807 12.3958 2.88782 11.6028 3.33615 11.053L3.43869 10.9388L9.58518 4.7923L9.66135 4.72394Z" fill="white" />
          </svg>
        </button>
          <h1>Pre-order Primcard</h1>
          <p>Share your contact details and preferred messenger. If approved, we'll email you the next steps.</p>
        </header>

        <form onSubmit={handleSubmit} className="bee-prim-form">
          {/* Email */}
          <div className="bee-input-group">
            <label>Email <span>*</span></label>
            <input 
              className="bee-input-field"
              type="email" 
              placeholder="Enter your email" 
              required 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
 <div className="bee-input-group">
          <label className="figma-wallet-details-label">Phone Number</label>
          <div className="figma-nokyc-contact-phone-container figma-wallet-details-input-wrap-pre-order">
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
              value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
          </div>
        </div>

          {/* Contact Method */}
          <div className="bee-input-group">
            <label>Contact method <span>*</span></label>
            <div className="bee-select-wrapper">
              <select 
                className="bee-input-field bee-select"
                value={formData.contactMethod}
                onChange={(e) => setFormData({...formData, contactMethod: e.target.value})}
              >
                <option value="WhatsApp">WhatsApp</option>
                <option value="Telegram">Telegram</option>
                <option value="Signal">Signal</option>
              </select>
            </div>
          </div>

          {/* Messenger Detail */}
          <div className="bee-input-group">
            <label>Your contact in selected messenger <span>*</span></label>
            <input 
              className="bee-input-field"
              type="text" 
              placeholder="Enter your username, link, or phone number" 
              required 
              value={formData.messengerDetail}
              onChange={(e) => setFormData({...formData, messengerDetail: e.target.value})}
            />
          </div>

          <button type="submit" className="bee-submit-btn">
            Submit request
          </button>
        </form>
      </div>

      {/* Country Picker Modal */}
      {showCountryPicker && (
        <div className="figma-nokyc-modal-overlay" onClick={() => setShowCountryPicker(false)}>
          <div className="figma-nokyc-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="figma-nokyc-modal-handle" />
            <h3 className="figma-nokyc-modal-title">Select country</h3>
            <div className="figma-nokyc-modal-grid">
              {COUNTRIES.map((country) => (
                <button
                  type="button"
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

export default PreOrderForm;