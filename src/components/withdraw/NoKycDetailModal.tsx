import { useNavigate } from 'react-router-dom';
interface NoKycDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGetStarted: () => void;
  onLearnMore?: () => void;
}

export function NoKycDetailModal({ isOpen, onClose, onGetStarted }: NoKycDetailModalProps) {
  if (!isOpen) return null;
const navigate = useNavigate();
const handleContinue = () => {
    onClose(); // Close the modal before navigating
    navigate('/pre-order-form');
  };
  const benefits = [
    'One-time fee: 4,000 USDT',
    'No documents required',
    'Approval process applies',
    'Withdraw via partner-managed card',
    'Any fiat',
  ];

  return (
    <div className="figma-nokyc-detail-overlay" onClick={onClose}>
      <div className="figma-nokyc-detail-modal" onClick={(e) => e.stopPropagation()}>
        {/* Handle */}
        {/* <div className="figma-nokyc-detail-handle" /> */}
        {/* Content */}
        <div className="figma-nokyc-detail-content">
          {/* Illustration */}
          <img src="./images/EmptyVisa.png" />

          {/* Title */}
          <div className="figma-nokyc-detail-header">
            <h2 className="figma-nokyc-detail-title">
              Visa debit card <span className="figma-nokyc-detail-highlight">no KYC</span>
            </h2>
            <p className="figma-nokyc-detail-subtitle">
              This option requires a one-time setup fee and partner approval
            </p>
          </div>

          {/* Benefits list */}
          <div className="figma-nokyc-detail-benefits">
            {benefits.map((benefit, index) => (
              <div key={index}> {/* Use a div with a key if you don't want to import React */}
                <div className="figma-nokyc-detail-benefit">
                  <div className="figma-nokyc-detail-benefit-icon">
                    <img src="./images/Iocn.svg" alt="icon" />
                  </div>
                  <span className="figma-nokyc-detail-benefit-text">{benefit}</span>
                </div>
                <div className="figma-deal-card-divider" />
              </div>
            ))}
          </div>

          {/* Footer text */}
          <p className="figma-nokyc-detail-footer-text">
            After one-time set up, endless withdrawal
          </p>
        </div>

        {/* Buttons */}
        <div className="figma-nokyc-detail-buttons">
          <button className="figma-addressbook-add-btn" onClick={onGetStarted}>
            Learn more
          </button>
         <button 
            className="figma-nokyc-detail-btn figma-nokyc-detail-btn--primary"
            onClick={handleContinue}
          >
            <span>Continue</span>
          </button>
          <button className="figma-seller-btn-text" onClick={onClose}>
            Cancel
          </button>
           <div className="figma-nokyc-home-indicator figma-nokyc-detail-indicator">
          <div className="figma-nokyc-home-indicator-bar" />
        </div>
        </div>
        
      </div>
      
    </div>
  );
}
