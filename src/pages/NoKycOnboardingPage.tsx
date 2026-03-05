import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const OnboardingIllustration = ({ imageSrc }: { imageSrc: string }) => {
  return (
    <div className="figma-nokyc-illustration-image-container">
      <div className="figma-deals-container">
        {/* Decorative Glow Background */}
        <svg
          className="glow-svg"
          viewBox="0 0 393 611"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g filter="url(#filter0_f_2_18389)">
            <ellipse
              cx="205.155"
              cy="325.415"
              rx="115.733"
              ry="67.0966"
              transform="rotate(-15 205.155 325.415)"
              fill="#3A18DC"
              fillOpacity="0.3"
            />
          </g>
          <defs>
            <filter id="filter0_f_2_18389" x="-141.99" y="0" width="694.291" height="610.83" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
              <feGaussianBlur stdDeviation="117" result="effect1_foregroundBlur_2_18389" />
            </filter>
          </defs>
        </svg>

        {/* Dynamic Image based on Step */}
        <img src={imageSrc} alt="Onboarding Phase" className="figma-nokyc-main-img" />
      </div>
    </div>
  );
};

// Step icons for "How it works" screen - Figma exact icons
const MoneyBagIcon = () => (
  <div className="figma-nokyc-step-icon-wrapper">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M16 6C16 4.114 16 3.172 15.414 2.586C14.828 2 13.886 2 12 2C10.114 2 9.172 2 8.586 2.586C8 3.172 8 4.114 8 6M2 14C2 10.229 2 8.343 3.172 7.172C4.344 6.001 6.229 6 10 6H14C17.771 6 19.657 6 20.828 7.172C21.999 8.344 22 10.229 22 14C22 17.771 22 19.657 20.828 20.828C19.656 21.999 17.771 22 14 22H10C6.229 22 4.343 22 3.172 20.828C2.001 19.656 2 17.771 2 14Z" stroke="#C2FF0A" strokeWidth="1.5" />
      <path d="M12 17.333C13.105 17.333 14 16.587 14 15.667C14 14.747 13.105 14 12 14C10.895 14 10 13.254 10 12.333C10 11.413 10.895 10.667 12 10.667M12 17.333C10.895 17.333 10 16.587 10 15.667M12 17.333V18M12 10.667V10M12 10.667C13.105 10.667 14 11.413 14 12.333" stroke="#C2FF0A" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  </div>
);

const RefreshIcon = () => (
  <div className="figma-nokyc-step-icon-wrapper">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M17.6509 7.65C16.8053 6.55151 15.6579 5.72331 14.349 5.26672C13.04 4.81014 11.6264 4.74497 10.281 5.0792C8.93566 5.41342 7.71687 6.13254 6.77378 7.14857C5.83069 8.1646 5.2042 9.43349 4.97095 10.8M18.0009 4V8H14.0009M6.34895 16.35C7.19432 17.4489 8.34176 18.2775 9.65079 18.7344C10.9598 19.1912 12.3737 19.2565 13.7192 18.9223C15.0648 18.588 16.2837 17.8687 17.2268 16.8523C18.1698 15.836 18.7961 14.5668 19.0289 13.2M5.99995 20V16H9.99995" stroke="#C2FF0A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </div>
);

const TrustIcon = () => (
  <div className="figma-nokyc-step-icon-wrapper">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M20.1 4.5C17.3445 4.5 14.871 4.0005 12.639 1.764C12.4702 1.59546 12.2415 1.50079 12.003 1.50079C11.7645 1.50079 11.5357 1.59546 11.367 1.764C9.12896 4.0005 6.65396 4.5 3.90147 4.5C3.66277 4.5 3.43385 4.59482 3.26507 4.76361C3.09629 4.93239 3.00146 5.16131 3.00146 5.4V10.803C3.00146 16.596 5.95646 20.5335 11.7165 22.455C11.9014 22.5168 12.1015 22.5168 12.2865 22.455C18.048 20.535 21.0015 16.596 21.0015 10.803V5.4C21.0015 4.9035 20.5965 4.5 20.1 4.5ZM19.5 10.8015C19.5 15.8955 17.046 19.2225 12 20.9655C6.95396 19.2225 4.49996 15.8955 4.49996 10.8015V5.9925C6.86846 5.934 9.52797 5.469 12.0015 3.228C14.4705 5.4675 17.1315 5.9325 19.5 5.9925V10.8015ZM11.2485 13.1895L15.2175 9.2205C15.2872 9.15077 15.37 9.09546 15.4611 9.05772C15.5522 9.01998 15.6498 9.00055 15.7485 9.00055C15.8471 9.00055 15.9447 9.01998 16.0358 9.05772C16.1269 9.09546 16.2097 9.15077 16.2795 9.2205C16.3492 9.29023 16.4045 9.37302 16.4423 9.46413C16.48 9.55524 16.4994 9.65289 16.4994 9.7515C16.4994 9.85012 16.48 9.94777 16.4423 10.0389C16.4045 10.13 16.3492 10.2128 16.2795 10.2825L11.7795 14.7825C11.7098 14.8523 11.627 14.9078 11.5359 14.9456C11.4448 14.9834 11.3471 15.0028 11.2485 15.0028C11.1498 15.0028 11.0521 14.9834 10.961 14.9456C10.8699 14.9078 10.7871 14.8523 10.7175 14.7825L8.46746 12.5325C8.32663 12.3917 8.24752 12.2007 8.24752 12.0015C8.24752 11.8023 8.32663 11.6113 8.46746 11.4705C8.60829 11.3297 8.7993 11.2506 8.99847 11.2506C9.19763 11.2506 9.38864 11.3297 9.52947 11.4705L11.2485 13.1895Z" fill="#C2FF0A" />
    </svg>
  </div>
);

// Green checkmark icon - Figma exact
const CheckIcon = () => (
  <img src="./images/Iocn.svg" alt="icon" />
);

// Bullet point (lime dot)
const BulletDot = () => (
  <img src='./images/bullet.png' />
);

// Pagination dots
const PaginationDots = ({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) => (
  <div className="figma-nokyc-dots">
    {Array.from({ length: totalSteps }).map((_, i) => (
      <div
        key={i}
        className={`figma-nokyc-dot ${i === currentStep ? 'figma-nokyc-dot--active' : ''}`}
      />
    ))}
  </div>
);

const STEPS = [
  {
    image: './images/visa.png', // Image for Phase 1
    title: 'Withdraw crypto without KYC',
    subtitle: 'This withdrawal option allows you to convert your crypto into cash without completing full KYC verification',
    type: 'intro',
    items: [],
  },
  {
    image: './images/emptygear.png', // Image for Phase 2
    title: 'How it works',
    type: 'steps',
    items: [
      { icon: 'money', text: 'You pay a one-time access fee of 4,000 USDT' },
      { icon: 'refresh', text: 'After approval, you can withdraw funds using this method multiple times' },
      { icon: 'trust', text: 'Funds are transferred via a trusted partner and credited to a card' },
    ],
  },
  {
    image: './images/trustempty.png', // Image for Phase 3
    title: 'Why choose this option',
    type: 'benefits',
    items: [
      'No identity documents required',
      'Privacy-first process',
      'Suitable for frequent withdrawals',
      'One-time setup, no recurring fees',
    ],
  },
  {
    image: './images/empty.png', // Image for Phase 4
    title: 'Important to know',
    type: 'points',
    items: [
      'This is not an instant automated withdrawal',
      'Approval is required before access is granted',
      'Communication continues via a private chat',
    ],
  },
];

export function NoKycOnboardingPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  const step = STEPS[currentStep];
  const isLastStep = currentStep === STEPS.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      navigate('/nokyc-request'); // Now routes to the request page
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleSkip = () => {
    // This takes the user back to where they came from (the main screen)
    navigate(-1);
  };

  return (
    <div className="figma-nokyc">
      <div className="figma-nokyc-bg" />

      <div className="figma-nokyc-content">
        {/* Pass the image path from the current step data */}
        <OnboardingIllustration imageSrc={step.image} />

        <div className="figma-nokyc-text">
          <h1 className="figma-nokyc-title">{step.title}</h1>

          {step.type === 'intro' && step.subtitle && (
            <p className="figma-nokyc-subtitle">{step.subtitle}</p>
          )}

          {step.type === 'steps' && (
            <div className="figma-nokyc-steps">
              {(step.items as { icon: string; text: string }[])?.map((item, i) => (
                <div key={i} className="figma-nokyc-step-item">
                  <div className="figma-nokyc-step-icon">
                    {item.icon === 'money' && <MoneyBagIcon />}
                    {item.icon === 'refresh' && <RefreshIcon />}
                    {item.icon === 'trust' && <TrustIcon />}
                  </div>
                  <p className="figma-nokyc-step-text">{item.text}</p>
                </div>
              ))}
            </div>
          )}

          {step.type === 'benefits' && (
            <div className="figma-nokyc-benefits">
              {(step.items as string[])?.map((item, i) => (
                <div key={i} className="figma-nokyc-benefit-item">
                  <div className="figma-nokyc-check-icon">
                    <CheckIcon />
                  </div>
                  <p className="figma-nokyc-benefit-text">{item}</p>
                </div>
              ))}
            </div>
          )}

          {step.type === 'points' && (
            <div className="figma-nokyc-points">
              {(step.items as string[])?.map((item, i) => (
                <div key={i} className="figma-nokyc-point-item">
                  <BulletDot />
                  <p className="figma-nokyc-point-text">{item}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="figma-nokyc-bottom">
        <PaginationDots currentStep={currentStep} totalSteps={STEPS.length} />

        <div className="figma-nokyc-buttons">
          {/* Primary Action: Cycles through 'Next' until the end, then 'Unlock Access' */}
          <button className="figma-nokyc-btn-primary" onClick={handleNext}>
            {isLastStep ? 'Unlock access' : 'Next'}
          </button>

          {/* Secondary Action: Exits the onboarding flow */}
          <button className="figma-seller-btn-text" onClick={handleSkip}>
            {isLastStep ? 'Not now' : 'Skip'}
          </button>
        </div>

        <div className="figma-nokyc-home-indicator">
          <div className="figma-nokyc-home-indicator-bar" />
        </div>
      </div>
    </div>
  );
}
