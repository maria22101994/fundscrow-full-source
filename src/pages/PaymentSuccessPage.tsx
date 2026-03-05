import { useNavigate } from 'react-router-dom';

export function PaymentSuccessPage() {
  const navigate = useNavigate();

  return (
    <div className="figma-payment-success">
      {/* Animated gradient glow effect */}
      <div className="figma-payment-success-glow" />
      <div className="figma-settings-header figma-pay-top">
        <button className="figma-settings-back" onClick={() => navigate(-1)}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M9.66135 4.72419C10.054 4.40396 10.6331 4.42683 10.9992 4.79254C11.3653 5.15864 11.3879 5.73766 11.0676 6.13044L10.9992 6.20661L6.20529 11.0006H20.0022C20.5545 11.0006 21.0022 11.4483 21.0022 12.0006C21.002 12.5527 20.5543 13.0006 20.0022 13.0006H6.20725L10.9992 17.7925C11.3898 18.1831 11.3897 18.8161 10.9992 19.2066C10.6087 19.5971 9.9757 19.5971 9.58518 19.2066L3.43869 13.0601L3.33615 12.9459C2.88807 12.396 2.88782 11.603 3.33615 11.0533L3.43869 10.939L9.58518 4.79254L9.66135 4.72419Z" fill="white" />
          </svg>
        </button>
        <h1 className="figma-settings-title">Payment Received</h1>
        <div style={{ width: 24 }} />
      </div>
      {/* Main content */}
      <div className="figma-payment-success-content">
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
        <img src="./images/payment_rec.png" alt="Onboarding Phase" className="figma-nokyc-main-img" />
      </div>
    </div>

        {/* Title */}
        <h1 className="figma-payment-success-title">We’re processing your request</h1>
        <p className='figma-pay-detail-subtitle'>This usually takes a short time. You’ll be notified once the process is complete</p>
      <div className='figma-seller-stage-dot waiting'>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path d="M12 17.4072C12.5834 17.4072 13.0564 17.8796 13.0566 18.4629V21.9434C13.0566 22.5268 12.5835 23 12 23C11.4165 23 10.9434 22.5268 10.9434 21.9434V18.4629C10.9436 17.8796 11.4166 17.4072 12 17.4072Z" fill="white"/>
  <path d="M6.68262 15.8232C7.09517 15.4107 7.76416 15.4108 8.17676 15.8232C8.58934 16.2358 8.58933 16.9048 8.17676 17.3174L5.71582 19.7783C5.30323 20.1909 4.63426 20.1909 4.22168 19.7783C3.80922 19.3657 3.80917 18.6967 4.22168 18.2842L6.68262 15.8232Z" fill="white"/>
  <path d="M15.8232 15.8232C16.2358 15.4107 16.9048 15.4107 17.3174 15.8232L19.7783 18.2842C20.1908 18.6968 20.1908 19.3658 19.7783 19.7783C19.3658 20.1909 18.6968 20.1908 18.2842 19.7783L15.8232 17.3174C15.4107 16.9048 15.4107 16.2358 15.8232 15.8232Z" fill="white"/>
  <path d="M5.53711 10.9434C6.12041 10.9436 6.59276 11.4167 6.59277 12C6.59277 12.5834 6.12042 13.0564 5.53711 13.0566H2.05664C1.47315 13.0566 1 12.5835 1 12C1.00001 11.4165 1.47316 10.9434 2.05664 10.9434H5.53711Z" fill="white"/>
  <path d="M21.9434 10.9434C22.5268 10.9434 23 11.4165 23 12C23 12.5835 22.5268 13.0566 21.9434 13.0566H18.4629C17.8796 13.0564 17.4072 12.5834 17.4072 12C17.4072 11.4167 17.8796 10.9436 18.4629 10.9434H21.9434Z" fill="white"/>
  <path d="M4.22168 4.22168C4.63426 3.8091 5.30323 3.80913 5.71582 4.22168L8.17676 6.68262C8.58933 7.09521 8.58934 7.76417 8.17676 8.17676C7.76417 8.58925 7.09517 8.5893 6.68262 8.17676L4.22168 5.71582C3.80916 5.30326 3.8092 4.63426 4.22168 4.22168Z" fill="white"/>
  <path d="M18.2842 4.22168C18.6968 3.80923 19.3658 3.80914 19.7783 4.22168C20.1909 4.63422 20.1908 5.30322 19.7783 5.71582L17.3174 8.17676C16.9048 8.58935 16.2358 8.58935 15.8232 8.17676C15.4107 7.76417 15.4107 7.0952 15.8232 6.68262L18.2842 4.22168Z" fill="white"/>
  <path d="M12 1C12.5835 1 13.0566 1.47315 13.0566 2.05664V5.53711C13.0564 6.12042 12.5834 6.59277 12 6.59277C11.4166 6.59277 10.9436 6.12042 10.9434 5.53711V2.05664C10.9434 1.47315 11.4165 1 12 1Z" fill="white"/>
</svg>
      </div>
      </div>

      {/* Bottom action */}
       <div className="figma-deposit-home-indicator">
          <div className="figma-deposit-home-indicator-bar" />
        </div>
    </div>
  );
}
