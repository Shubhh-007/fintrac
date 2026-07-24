import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { PiggyBank, ArrowLeft } from 'lucide-react';

function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const emailParam = searchParams.get('email') || '';
  const { resetPassword, forgotPassword } = useContext(AuthContext);

  const [email, setEmail] = useState(emailParam);
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  
  // Resend Cooldown (60 seconds)
  const [cooldown, setCooldown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [cooldown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);

    try {
      const res = await resetPassword(email, otp, password);
      setMessage(res.message || 'Password reset successful! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Password reset failed. Please try again.');
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setError('');
    setMessage('');
    setResendLoading(true);

    try {
      const res = await forgotPassword(email);
      setMessage(res.message || 'A new reset OTP has been sent successfully.');
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
            <PiggyBank size={20} color="white" />
          </div>
          <span>Fintrac</span>
        </div>
        <div className="auth-title">Reset Password</div>
        <div className="auth-sub">Enter the OTP sent to your email and choose a new password.</div>

        {error && <div className="auth-error">{error}</div>}
        {message && <div style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '10px 12px', borderRadius: '12px', fontSize: '13px', marginBottom: '12px' }}>{message}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email address</label>
            <input
              type="email"
              required
              className="form-input"
              placeholder="arjun@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={!!emailParam}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Verification Code (OTP)</label>
            <input
              type="text"
              required
              maxLength="6"
              className="form-input"
              placeholder="••••••"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              style={{ letterSpacing: '8px', textAlign: 'center', fontSize: '18px', fontWeight: 'bold' }}
            />
          </div>
          <div className="form-group">
            <label className="form-label">New Password</label>
            <input
              type="password"
              required
              className="form-input"
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Confirm New Password</label>
            <input
              type="password"
              required
              className="form-input"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="auth-btn" disabled={loading} style={{ background: 'linear-gradient(135deg, #10b981, #3b82f6)' }}>
            {loading ? 'Resetting...' : 'Reset Password'}
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
          <span className="auth-link" style={{ fontSize: '14px', display: 'inline-flex', alignItems: 'center', gap: '6px' }} onClick={() => navigate('/login')}><ArrowLeft size={14} /> Back to Login</span>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
