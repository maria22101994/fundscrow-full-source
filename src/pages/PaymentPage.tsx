import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { useDealStore } from '@/store';
import { api } from '@/services/api';

export function PaymentPage() {
  const navigate = useNavigate();
  const { dealId } = useParams();
  const [searchParams] = useSearchParams();
  const { currentDeal, fetchDeal, isLoading, error } = useDealStore();
  
  // Use URL params as override, otherwise fall back to deal data
  const amount = searchParams.get('amount') || currentDeal?.totalAmount || '0.00';
  const currency = searchParams.get('currency') || 
    (currentDeal?.currency?.toLowerCase().includes('usdt') ? 'USDT' : currentDeal?.currency?.toUpperCase()) || 'USDT';
  const network = searchParams.get('network') || 
    (currentDeal?.currency === 'USDT_TRC20' ? 'TRC20' : currentDeal?.currency?.toUpperCase()) || 'TRC20';
  const address = searchParams.get('address') || currentDeal?.depositAddress || '';
  
  const [copied, setCopied] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Fetch deal data on mount
  useEffect(() => {
    if (dealId) {
      fetchDeal(dealId);
    }
  }, [dealId, fetchDeal]);

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleMarkAsPaid = () => {
    setShowConfirmModal(true);
  };

  const confirmPayment = async () => {
    setShowConfirmModal(false);
    if (dealId) {
      try {
        await api.fundDeal(dealId);
      } catch {
        // Fund endpoint may fail if deposit not yet detected — that's OK
      }
    }
    navigate(`/deal/${dealId}`);
  };

  // Loading state
  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="wallet-spinner" />
      </div>
    );
  }

  // Error state - no deal found or no address
  if (!dealId || (error && !address)) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '16px', textAlign: 'center', paddingTop: '100px' }}>
        <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>
          {error || 'Payment details not available'}
        </p>
        <button 
          onClick={() => navigate(-1)}
          style={{
            background: 'var(--accent-primary)',
            color: '#000',
            border: 'none',
            borderRadius: '10px',
            padding: '12px 24px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Header - 56px height */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '56px',
        padding: '0 16px',
        position: 'sticky',
        top: 0,
        background: 'var(--bg-primary)',
        zIndex: 10
      }}>
        <button 
          onClick={() => navigate(-1)} 
          style={{
            width: '24px',
            height: '24px',
            background: 'none',
            border: 'none',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M9.66135 4.72394C10.054 4.40371 10.6331 4.42659 10.9992 4.7923C11.3653 5.1584 11.3879 5.73742 11.0676 6.13019L10.9992 6.20636L6.20529 11.0003H20.0022C20.5545 11.0003 21.0022 11.448 21.0022 12.0003C21.002 12.5524 20.5543 13.0003 20.0022 13.0003H6.20725L10.9992 17.7923C11.3898 18.1828 11.3897 18.8158 10.9992 19.2064C10.6087 19.5969 9.9757 19.5969 9.58518 19.2064L3.43869 13.0599L3.33615 12.9456C2.88807 12.3958 2.88782 11.6028 3.33615 11.053L3.43869 10.9388L9.58518 4.7923L9.66135 4.72394Z" fill="white"/>
          </svg>
        </button>
        <h1 style={{
          fontSize: '18px',
          fontWeight: 600,
          color: 'var(--text-primary)',
          margin: 0
        }}>Deal #{dealId || '1001'}</h1>
        <div style={{ width: '24px' }} />
      </div>

      <div style={{ padding: '0 16px', paddingBottom: '100px' }}>
        {/* Amount Card */}
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: '16px',
          padding: '24px 16px',
          textAlign: 'center',
          marginBottom: '16px'
        }}>
          <p style={{
            fontSize: '12px',
            color: '#9CA3AF',
            margin: '0 0 4px 0'
          }}>Network: {network}</p>
          <p style={{
            fontSize: '32px',
            fontWeight: 700,
            color: 'var(--text-primary)',
            margin: 0
          }}>
            {amount} {currency}
          </p>
        </div>

        {/* QR Code Card */}
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: '16px',
          padding: '16px',
          marginBottom: '16px'
        }}>
          <p style={{
            fontSize: '14px',
            color: 'var(--text-secondary)',
            textAlign: 'center',
            margin: '0 0 16px 0'
          }}>
            Scan QR code with your wallet
          </p>
          
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '16px',
            display: 'flex',
            justifyContent: 'center',
            margin: '0 auto',
            width: 'fit-content'
          }}>
            <QRCodeSVG
              value={address}
              size={180}
              level="H"
              bgColor="#FFFFFF"
              fgColor="#0F0F1A"
            />
          </div>

          <p style={{
            fontSize: '12px',
            color: 'var(--text-muted)',
            textAlign: 'center',
            margin: '16px 0 0 0'
          }}>
            Send exactly <span style={{ color: 'white', fontWeight: 600 }}>{amount} {currency}</span> to this address
          </p>
        </div>

        {/* Address Card */}
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: '16px',
          padding: '16px',
          marginBottom: '16px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px'
          }}>
            <span style={{ fontSize: '14px', color: '#9CA3AF' }}>Wallet Address</span>
            <span style={{
              background: 'rgba(34, 197, 94, 0.15)',
              color: '#22C55E',
              fontSize: '11px',
              fontWeight: 600,
              padding: '4px 10px',
              borderRadius: '9999px',
              textTransform: 'uppercase'
            }}>{network}</span>
          </div>
          
          <div style={{
            background: 'var(--bg-primary)',
            borderRadius: '12px',
            padding: '14px',
            marginBottom: '12px'
          }}>
            <p style={{
              fontFamily: 'monospace',
              fontSize: '14px',
              color: 'var(--text-primary)',
              margin: 0,
              wordBreak: 'break-all',
              lineHeight: 1.5
            }}>{address}</p>
          </div>

          <button 
            onClick={copyAddress}
            style={{
              width: '100%',
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              background: copied ? 'rgba(34, 197, 94, 0.15)' : 'var(--bg-tertiary)',
              border: copied ? '1px solid #22C55E' : '1px solid var(--border-default)',
              borderRadius: '10px',
              color: copied ? '#22C55E' : 'var(--text-primary)',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {copied ? (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2"/>
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                </svg>
                Copy Address
              </>
            )}
          </button>
        </div>

        {/* Warning Box */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
          background: 'rgba(250, 204, 21, 0.1)',
          border: '1px solid #FACC15',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '16px'
        }}>
          <span style={{ fontSize: '20px', flexShrink: 0 }}>⚠️</span>
          <div>
            <p style={{
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--text-primary)',
              margin: '0 0 4px 0'
            }}>
              Send {currency} only via {network} network
            </p>
            <p style={{
              fontSize: '14px',
              color: 'var(--text-secondary)',
              margin: 0
            }}>
              Sending via another network may result in permanent loss of funds.
            </p>
          </div>
        </div>

        {/* Timer */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          marginBottom: '20px'
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 6v6l4 2"/>
          </svg>
          <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Pay within 72 hours</span>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button 
            onClick={handleMarkAsPaid} 
            style={{
              width: '100%',
              height: '48px',
              background: 'var(--accent-primary)',
              border: 'none',
              borderRadius: '10px',
              color: '#000',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(200, 255, 0, 0.25)'
            }}
          >
            Mark as paid
          </button>

          <button 
            onClick={() => navigate(-1)} 
            style={{
              width: '100%',
              height: '48px',
              background: 'transparent',
              border: '1px solid var(--border-default)',
              borderRadius: '10px',
              color: 'var(--text-primary)',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 200,
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: '16px',
            padding: '24px',
            width: '100%',
            maxWidth: '340px',
            textAlign: 'center'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              background: 'rgba(250, 204, 21, 0.2)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FACC15" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 8v4M12 16h.01"/>
              </svg>
            </div>
            
            <h3 style={{
              fontSize: '18px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              margin: '0 0 8px 0'
            }}>Confirm Payment Sent</h3>
            
            <p style={{
              fontSize: '14px',
              color: 'var(--text-secondary)',
              margin: '0 0 8px 0'
            }}>
              Have you sent exactly <span style={{ color: 'white', fontWeight: 600 }}>{amount} {currency}</span> to the wallet address shown?
            </p>
            
            <p style={{
              fontSize: '12px',
              color: 'var(--text-muted)',
              margin: '0 0 20px 0'
            }}>
              The system will verify your payment automatically. This usually takes 1-3 network confirmations.
            </p>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => setShowConfirmModal(false)}
                style={{
                  flex: 1,
                  height: '48px',
                  background: 'transparent',
                  border: '1px solid var(--border-default)',
                  borderRadius: '10px',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Not Yet
              </button>
              <button 
                onClick={confirmPayment}
                style={{
                  flex: 1,
                  height: '48px',
                  background: 'var(--accent-primary)',
                  border: 'none',
                  borderRadius: '10px',
                  color: '#000',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Yes, I've Sent It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
