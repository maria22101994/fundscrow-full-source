import { useState } from 'react';

interface WithdrawMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMethod: (method: 'nokyc' | 'bank' | 'onchain') => void;
  onLearnMore: () => void;
  isCardUnlocked: boolean; // Stage detector
}

// Icons
const CardIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 10V17C22 17.5 21.8 18 21.4 18.4C21 18.8 20.5 19 20 19H4C3.5 19 3 18.8 2.6 18.4C2.2 18 2 17.5 2 17V7C2 6.5 2.2 6 2.6 5.6C3 5.2 3.5 5 4 5H20C20.5 5 21 5.2 21.4 5.6C21.8 6 22 6.5 22 7V10ZM22 10H2M6 15H10" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const BankIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20.25 18.4H3.75C3.2 18.4 2.75 18.8 2.75 19.4V20.4C2.75 20.9 3.2 21.4 3.75 21.4H20.25C20.8 21.4 21.25 20.9 21.25 20.4V19.4C21.25 18.8 20.8 18.4 20.25 18.4Z" /><path d="M5.25 9.9V18.4M18.75 9.9V18.4M14.5 9.9V18.4M9.5 9.9V18.4M11.04 3.15L3.27 7.4C3.1 7.5 3 7.6 2.9 7.8C2.8 7.9 2.75 8.1 2.75 8.3V9.3C2.75 9.4 2.8 9.6 2.9 9.7C3 9.8 3.2 9.9 3.35 9.9H20.65C20.8 9.9 21 9.8 21.1 9.7C21.2 9.6 21.25 9.4 21.25 9.3V8.3C21.25 8.1 21.2 7.9 21.1 7.8C21 7.6 20.9 7.5 20.73 7.4L12.96 3.15C12.7 3 12.3 2.9 12 2.9C11.7 2.9 11.3 3 11.04 3.15Z" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const BlockchainIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M5.5 10C5.6 10 5.7 9.9 6 9.8L7.8 8.9C8.6 8.5 9 8.3 9 8V4M5.5 10C5.4 10 5.3 9.9 5 9.8L3.2 8.9C2.4 8.5 2 8.3 2 8V4M5.5 10V6M9 4C9 3.7 8.6 3.5 7.8 3.1L6 2.2C5.7 2.1 5.6 2 5.5 2C5.4 2 5.3 2.1 5 2.2L3.2 3.1C2.4 3.5 2 3.7 2 4M9 4C9 4.3 8.6 4.5 7.8 4.9L6 5.8C5.7 5.9 5.6 6 5.5 6M2 4C2 4.3 2.4 4.5 3.2 4.9L5 5.8C5.3 5.9 5.4 6 5.5 6M18.5 10C18.6 10 18.7 9.9 19 9.8L20.8 8.9C21.6 8.5 22 8.3 22 8V4M18.5 10C18.4 10 18.3 9.9 18 9.8L16.2 8.9C15.4 8.5 15 8.3 15 8V4M18.5 10V6M22 4C22 3.7 21.6 3.5 20.8 3.1L19 2.2C18.7 2.1 18.6 2 18.5 2C18.4 2 18.3 2.1 18 2.2L16.2 3.1C15.4 3.5 15 3.7 15 4M22 4C22 4.3 21.6 4.5 20.8 4.9L19 5.8C18.7 5.9 18.6 6 18.5 6M15 4C15 4.3 15.4 4.5 16.2 4.9L18 5.8C18.3 5.9 18.4 6 18.5 6" strokeLinejoin="round" /><path d="M11.5 6H12.5M2 12V15.5C2 16.9 2 17.6 2.3 18.1C2.5 18.3 2.7 18.5 2.9 18.7C3.4 19 4.1 19 5.5 19M22 12V15.5C22 16.9 22 17.6 21.7 18.1C21.5 18.3 21.3 18.5 21.1 18.7C20.6 19 19.9 19 18.5 19" strokeLinecap="round" /><path d="M12 22C12.1 22 12.2 21.9 12.5 21.8L14.3 20.9C15.1 20.5 15.5 20.3 15.5 20V16M12 22C11.9 22 11.8 21.9 11.5 21.8L9.7 20.9C8.9 20.5 8.5 20.3 8.5 20V16M12 22V18M15.5 16C15.5 15.7 15.1 15.5 14.3 15.1L12.5 14.2C12.2 14.1 12.1 14 12 14C11.9 14 11.8 14.1 11.5 14.2L9.7 15.1C8.9 15.5 8.5 15.7 8.5 16M15.5 16C15.5 16.3 15.1 16.5 14.3 16.9L12.5 17.8C12.2 17.9 12.1 18 12 18M8.5 16C8.5 16.3 8.9 16.5 9.7 16.9L11.5 17.8C11.8 17.9 11.9 18 12 18" strokeLinejoin="round" /></svg>
);
const LockedIcon = () => (
  <div className='figma-radio-dot checked'></div>
);
const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="11" height="13" viewBox="0 0 11 13" fill="none">
    <path d="M9.4 5.5H1.6C1 5.5 0.5 6 0.5 6.6V10.5C0.5 11.1 1 11.6 1.6 11.6H9.4C10 11.6 10.5 11.1 10.5 10.5V6.6C10.5 6 10 5.5 9.4 5.5Z" fill="#252432" stroke="#252432" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M2.7 5.5V3.3C2.7 2.5 3 1.8 3.5 1.3C4.1 0.8 4.8 0.5 5.5 0.5C6.2 0.5 6.9 0.8 7.5 1.3C8 1.8 8.3 2.5 8.3 3.3V5.5" stroke="#252432" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const ArrowRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10.9 3.8C10.6 3.6 10.2 3.6 10 3.9C9.8 4.1 9.7 4.5 10 4.8L12.5 7.3H2C1.6 7.3 1.3 7.6 1.3 8C1.3 8.4 1.6 8.7 2 8.7H12.5L10 11.2C9.7 11.5 9.7 11.9 10 12.1C10.3 12.4 10.7 12.4 10.9 12.1L14.4 8.7L14.4 8.6C14.7 8.3 14.7 7.7 14.4 7.4L14.4 7.3L10.9 3.8Z" fill="#0E0D1F" /></svg>
);

type WithdrawMethod = 'nokyc' | 'bank' | 'onchain';

export function WithdrawMethodModal({ isOpen, onClose, onSelectMethod, isCardUnlocked }: WithdrawMethodModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<WithdrawMethod>('nokyc');

  if (!isOpen) return null;

  const methods = [
    {
      id: 'nokyc' as WithdrawMethod,
      icon: <CardIcon />,
      title: 'Visa debit card no KYC',
      tag: 'No KYC',
      tagType: 'nokyc' as const,
      description: 'Use our unique prepaid card to withdraw money from any ATM around the world.',
    },
    {
      id: 'bank' as WithdrawMethod,
      icon: <BankIcon />,
      title: 'Bank account',
      tag: 'KYC required',
      tagType: 'kyc' as const,
      description: 'Withdraw money to any bank account in most of the countries.',
    },
    {
      id: 'onchain' as WithdrawMethod,
      icon: <BlockchainIcon />,
      title: 'On chain',
      tag: null,
      tagType: null,
      description: 'Withdraw money to your own crypto wallet address.',
    },
  ];

  return (
    <div className="figma-withdraw-method-overlay" onClick={onClose}>
      <div className="figma-withdraw-method-modal" onClick={(e) => e.stopPropagation()}>
        <div className="figma-withdraw-method-handle" />
        <h2 className="figma-withdraw-method-title">Withdraw money</h2>

        <div className="figma-withdraw-method-options">
          {methods.map((method) => (
            <div
              key={method.id}
              className={`figma-withdraw-method-option ${selectedMethod === method.id ? 'figma-withdraw-method-option--selected' : ''}`}
              onClick={() => setSelectedMethod(method.id)}
            >
              <div className={selectedMethod === method.id ? 'figma-withdraw-method-check' : 'figma-withdraw-method-uncheck'}>
                {selectedMethod === method.id && (
                  method.id === 'nokyc'
                    ? (!isCardUnlocked ? <CheckIcon /> : <LockedIcon />) // If NOT unlocked (locked), show CheckIcon (Lock SVG)
                    : <LockedIcon />
                )}
              </div>

              <div className="figma-withdraw-method-icon">{method.icon}</div>

              <div className="figma-withdraw-method-content">
                <div className="figma-withdraw-method-header">
                  <span className="figma-withdraw-method-name">{method.title}</span>
                  {method.tag && (
                    <span className={`figma-withdraw-method-tag figma-withdraw-method-tag--${method.tagType}`}>
                      {method.tag}
                    </span>
                  )}
                </div>
                <p className="figma-withdraw-method-desc">{method.description}</p>
              </div>
            </div>
          ))}
        </div>

        <button className="figma-withdraw-method-btn" onClick={() => onSelectMethod(selectedMethod)}>
          <span>Continue</span>
          <ArrowRightIcon />
        </button>
      </div>
    </div>
  );
}