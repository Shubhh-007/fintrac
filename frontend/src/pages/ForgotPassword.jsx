import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { PiggyBank, ArrowLeft } from 'lucide-react';

function ForgotPassword() {
  const navigate = useNavigate();
  const { forgotPassword } = useContext(AuthContext);

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await forgotPassword(email);
      navigate(`/reset-password?email=${encodeURIComponent(email)}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
      setLoading(false);
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
        <div className="auth-title">Forgot Password</div>
        <div className="auth-sub">Enter your email and we will send you a 6-digit OTP to reset your password.</div>

        {error && <div className="auth-error">{error}</div>}

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
            />
          </div>
          <button type="submit" className="auth-btn" disabled={loading} style={{ background: 'linear-gradient(135deg, #10b981, #3b82f6)' }}>
            {loading ? 'Sending OTP...' : 'Send OTP'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <span className="auth-link" style={{ fontSize: '14px', display: 'inline-flex', alignItems: 'center', gap: '6px' }} onClick={() => navigate('/login')}><ArrowLeft size={14} /> Back to Login</span>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
