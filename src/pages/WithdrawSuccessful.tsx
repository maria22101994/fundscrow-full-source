import { useNavigate } from 'react-router-dom';

export function WithdrawSuccess() {
  const navigate = useNavigate();

  // In a real app, these would come from your state or navigation props
  const txDetails = {
    to: 'TX8X..A21B',
    network: 'TRC-20',
    date: '25 Dec 2025 13:42',
    transactionId: 'WD-483920',
    total: '250 USDT'
  };

  return (
    <div className="withdraw-success-container">
      <div className="withdraw-success-content">
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
        <img src="./images/withdrawsuccess.png" alt="Onboarding Phase" className="figma-nokyc-main-img" />
      </div>
    </div>

        <h1 className="success-title">Withdraw success!</h1>
        <p className="success-subtitle">You will receive funds in few minutes</p>

        {/* Transaction Details Card */}
        <div className="details-card">
          <div className="details-row">
            <span className="details-label">To</span>
            <span className="details-value">{txDetails.to}</span>
          </div>
          <div className="details-row">
            <span className="details-label">Network</span>
            <span className="details-value">{txDetails.network}</span>
          </div>
          <div className="details-row">
            <span className="details-label">Date</span>
            <span className="details-value">{txDetails.date}</span>
          </div>
          <div className="details-row">
            <span className="details-label">Transaction ID</span>
            <span className="details-value">{txDetails.transactionId}</span>
          </div>
          
          <div className="details-divider"></div>
          
          <div className="details-row total-row">
            <span className="details-label">Total</span>
            <span className="details-value total-amount">{txDetails.total}</span>
          </div>
        </div>
      </div>
        <div className="figma-deposit-footer">
        <button className="figma-deposit-share-btn" onClick={() => navigate('/')}>
          Done
        </button>
        <div className="figma-deposit-home-indicator">
          <div className="figma-deposit-home-indicator-bar" />
        </div>
      </div>
    </div>
  );
}