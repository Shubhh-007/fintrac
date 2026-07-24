import React, { useEffect, useState, useContext } from 'react';
import { useLocation, useNavigate, useSearchParams, Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { PiggyBank, KeyRound, UserRound, ArrowLeft } from 'lucide-react';

function Auth() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, register } = useContext(AuthContext);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [adminSecret, setAdminSecret] = useState('');
  const [inviteCode, setInviteCode] = useState(searchParams.get('code') || '');
  const [invitationDetails, setInvitationDetails] = useState(null);
  const [role, setRole] = useState(searchParams.get('role') === 'admin' ? 'admin' : 'user');
  const [error, setError] = useState('');
  const [isLogin, setIsLogin] = useState(location.pathname === '/login');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const currentMode = location.pathname === '/login' ? 'login' : location.pathname === '/signup' ? 'signup' : 'landing';
    setIsLogin(currentMode === 'login');
    setRole(searchParams.get('role') === 'admin' ? 'admin' : 'user');
    
    const code = searchParams.get('code');
    if (code) {
      setInviteCode(code);
      verifyInviteCode(code);
    }
  }, [location.pathname, searchParams]);

  const verifyInviteCode = async (code) => {
    if (!code) return;
    try {
      const res = await axios.get(`/users/invitations/${code}`);
      setInvitationDetails(res.data);
      if (res.data.inviteeEmail) {
        setEmail(res.data.inviteeEmail);
      }
      if (res.data.inviteeName) {
        setName(res.data.inviteeName);
      }
    } catch (err) {
      console.error('Failed to verify invite code:', err);
      setInvitationDetails(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
 
    if (!isLogin && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
 
    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password, role);
      } else {
        const data = await register(name, email, password, role, adminSecret, inviteCode);
        navigate(`/verify-otp?email=${encodeURIComponent(email)}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed');
      setLoading(false);
    }
  };

  const navigateToMode = (mode, selectedRole = role) => {
    const params = new URLSearchParams();
    if (selectedRole === 'admin') {
      params.set('role', 'admin');
    } else {
      params.set('role', 'user');
    }
    if (inviteCode) {
      params.set('code', inviteCode);
    }
    navigate(`/${mode}?${params.toString()}`);
  };

  if (location.pathname === '/auth') {
    return <Navigate to="/select" replace />;
  }

  if (location.pathname === '/select') {
    return (
      <div className="auth-wrap">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem', maxWidth: '800px', width: '100%', margin: '0 auto', padding: '2rem', position: 'relative', zIndex: 10 }}>
          <div className="auth-logo">
            <div className="brand-icon">
              <PiggyBank size={20} color="white" />
            </div>
            <span>Fintrac</span>
          </div>
          <h2 style={{ fontSize: '28px', color: 'var(--text)', fontWeight: '800', textAlign: 'center', margin: 0, letterSpacing: '-0.5px' }}>Select Your Portal</h2>
          <p style={{ color: 'var(--muted)', textAlign: 'center', maxWidth: '500px', margin: '-1rem 0 1rem 0' }}>Choose how you want to access the Fintrac Family Expense Tracker</p>
          
          <div style={{ display: 'flex', gap: '1.5rem', width: '100%', flexWrap: 'wrap', justifyContent: 'center' }}>
            {/* Card 1: Admin */}
            <div style={{ background: '#ffffff', borderRadius: '24px', border: '1px solid var(--border)', padding: '32px', flex: '1', minWidth: '280px', maxWidth: '360px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: 'var(--shadow-md)', transition: 'transform 0.2s', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ background: '#eff6ff', padding: '12px', borderRadius: '14px', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <KeyRound size={24} />
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text)', margin: 0 }}>Admin</h3>
                </div>
                <p style={{ color: 'var(--muted)', fontSize: '14px', lineHeight: '1.6', marginBottom: '24px', minHeight: '68px' }}>Monitor family expenses, manage users and oversee financial activities.</p>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: 'auto' }}>
                <button className="btn" style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: '#fff', border: 'none' }} onClick={() => navigate('/login?role=admin')}>Login</button>
                <button className="btn" style={{ flex: 1, padding: '12px', background: '#f8fafc', color: 'var(--text)', border: '1px solid var(--border)' }} onClick={() => navigate('/signup?role=admin')}>Signup</button>
              </div>
            </div>

            {/* Card 2: User */}
            <div style={{ background: '#ffffff', borderRadius: '24px', border: '1px solid var(--border)', padding: '32px', flex: '1', minWidth: '280px', maxWidth: '360px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: 'var(--shadow-md)', transition: 'transform 0.2s', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ background: '#ecfdf5', padding: '12px', borderRadius: '14px', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <UserRound size={24} />
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text)', margin: 0 }}>User</h3>
                </div>
                <p style={{ color: 'var(--muted)', fontSize: '14px', lineHeight: '1.6', marginBottom: '24px', minHeight: '68px' }}>Manage your own expenses and track your personal spending.</p>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: 'auto' }}>
                <button className="btn" style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', border: 'none' }} onClick={() => navigate('/login?role=user')}>Login</button>
                <button className="btn" style={{ flex: 1, padding: '12px', background: '#f8fafc', color: 'var(--text)', border: '1px solid var(--border)' }} onClick={() => navigate('/signup?role=user')}>Signup</button>
              </div>
            </div>
          </div>
          <button style={{ marginTop: '24px', background: 'none', border: 'none', color: 'var(--muted)', textDecoration: 'none', cursor: 'pointer', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }} onClick={() => navigate('/')}><ArrowLeft size={16} /> Back to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="brand-icon">
             <PiggyBank size={20} color="white" />
          </div>
          <span>Fintrac</span>
        </div>
        <div className="auth-title">{isLogin ? (role === 'admin' ? 'Admin Login' : 'User Login') : (role === 'admin' ? 'Admin Signup' : 'User Signup')}</div>
        <div className="auth-sub">{isLogin ? `Sign in to access your dashboard` : 'Create your account to start tracking'}</div>

        {!isLogin && role === 'user' && invitationDetails && (
          <div style={{
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            borderRadius: '16px',
            padding: '16px',
            marginBottom: '24px',
            fontSize: '14px',
            color: '#065f46',
            lineHeight: '1.5',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{ background: '#d1fae5', padding: '8px', borderRadius: '10px' }}>🎉</div>
            <div>Joining <strong>{invitationDetails.adminName}</strong>'s family as a <strong>{invitationDetails.relationship}</strong>!</div>
          </div>
        )}

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <span className="auth-link" style={{ fontSize: '14px', display: 'inline-flex', alignItems: 'center', gap: '6px' }} onClick={() => navigate('/select')}><ArrowLeft size={14} /> Choose different portal</span>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label className="form-label">Name</label>
              <input type="text" required className="form-input" placeholder="Arjun Kumar" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Email address</label>
            <input type="email" required className="form-input" placeholder="arjun@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label className="form-label" style={{ marginBottom: 0 }}>Password</label>
              {isLogin && (
                <span className="auth-link" style={{ fontSize: '13px' }} onClick={() => navigate('/forgot-password')}>
                  Forgot password?
                </span>
              )}
            </div>
            <input type="password" required className="form-input" placeholder={isLogin ? '••••••••' : 'Min. 8 characters'} value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {!isLogin && (
            <>
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input type="password" required className="form-input" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              </div>
            </>
          )}
          <button type="submit" className="auth-btn" disabled={loading} style={{ background: role === 'admin' ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : 'linear-gradient(135deg, #10b981, #059669)' }}>
            {loading ? 'Processing...' : (isLogin ? 'Sign in' : 'Create account')}
          </button>
        </form>

        <div className="auth-switch">
          {isLogin ? 'Need an account? ' : 'Already have an account? '}
          <span className="auth-link" onClick={() => navigateToMode(isLogin ? 'signup' : 'login')}>{isLogin ? 'Create one' : 'Sign in'}</span>
        </div>
      </div>
    </div>
  );
}

export default Auth;
