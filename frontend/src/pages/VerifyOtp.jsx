import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function VerifyOtp() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const { verifyOtp, resendOtp } = useContext(AuthContext);

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  
  // Resend Cooldown (60 seconds)
  const [cooldown, setCooldown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (!email) {
      navigate('/select');
      return;
    }
    
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [cooldown, email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      await verifyOtp(email, otp);
      // Success redirects automatically through AuthContext -> App.jsx routing
    } catch (err) {
      setError(err.response?.data?.message || 'OTP verification failed. Please try again.');
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setError('');
    setMessage('');
    setResendLoading(true);

    try {
      const res = await resendOtp(email);
      setMessage(res.message || 'A new OTP has been sent successfully.');
      setCooldown(60);
      setCanResend(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-logo" style={{ cursor: 'pointer' }} onClick={() => navigate('/select')}>
          <div className="brand-icon">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span>Fintrac</span>
        </div>
        <div className="auth-title">Verify Email</div>
        <div className="auth-sub">Enter the 6-digit OTP code sent to <strong>{email}</strong></div>

        {error && <div className="auth-error">{error}</div>}
        {message && <div style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '10px 12px', borderRadius: '12px', fontSize: '13px', marginBottom: '12px' }}>{message}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Verification Code</label>
            <input
              type="text"
              required
              maxLength="6"
              className="form-input"
              placeholder="••••••"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              style={{ letterSpacing: '8px', textAlign: 'center', fontSize: '20px', fontWeight: 'bold' }}
            />
          </div>
          <button type="submit" className="auth-btn" disabled={loading} style={{ background: 'linear-gradient(135deg, #10b981, #3b82f6)' }}>
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>

        <div className="auth-switch" style={{ marginTop: '24px' }}>
          Didn't receive a code?{' '}
          {canResend ? (
            <span className="auth-link" onClick={handleResend} style={{ pointerEvents: resendLoading ? 'none' : 'auto' }}>
              {resendLoading ? 'Sending...' : 'Resend OTP'}
            </span>
          ) : (
            <span style={{ color: '#94a3b8' }}>Resend in {cooldown}s</span>
          )}
        </div>
        
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <span className="auth-link" style={{ fontSize: '13px' }} onClick={() => navigate('/login')}>← Back to Login</span>
        </div>
      </div>
    </div>
  );
}

export default VerifyOtp;
