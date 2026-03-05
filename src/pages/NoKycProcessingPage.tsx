import { useNavigate } from 'react-router-dom';

// Processing/spinner icon
const ProcessingIcon = () => (
  <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
    <circle cx="40" cy="40" r="36" stroke="rgba(191, 237, 51, 0.2)" strokeWidth="4"/>
    <path d="M40 4C59.882 4 76 20.118 76 40" stroke="#BFED33" strokeWidth="4" strokeLinecap="round">
      <animateTransform
        attributeName="transform"
        type="rotate"
        from="0 40 40"
        to="360 40 40"
        dur="1s"
        repeatCount="indefinite"
      />
    </path>
    <circle cx="40" cy="40" r="24" fill="rgba(191, 237, 51, 0.1)"/>
    <path d="M34 40L38 44L46 36" stroke="#BFED33" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export function NoKycProcessingPage() {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="figma-nokyc-processing">
      <div className="figma-nokyc-processing-icon">
        <ProcessingIcon />
      </div>

      <h1 className="figma-nokyc-processing-title">We're processing your request</h1>

      <p className="figma-nokyc-processing-desc">
        Our team will review your application and contact you via your selected messenger within 24-48 hours.
      </p>

      <button className="figma-nokyc-processing-btn" onClick={handleGoHome}>
        Back to Home
      </button>
    </div>
  );
}
