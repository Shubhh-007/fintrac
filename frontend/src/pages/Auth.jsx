import React, { useEffect, useState, useContext } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

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
  const [role, setRole] = useState(searchParams.get('role') === 'admin' ? 'admin' : 'user');
  const [error, setError] = useState('');
  const [isLogin, setIsLogin] = useState(location.pathname === '/login');

  useEffect(() => {
    const currentMode = location.pathname === '/login' ? 'login' : location.pathname === '/signup' ? 'signup' : 'landing';
    setIsLogin(currentMode === 'login');
    setRole(searchParams.get('role') === 'admin' ? 'admin' : 'user');
  }, [location.pathname, searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isLogin && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      if (isLogin) {
        await login(email, password, role);
      } else {
        await register(name, email, password, role, adminSecret);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed');
    }
  };

  const navigateToMode = (mode, selectedRole = role) => {
    const params = new URLSearchParams();
    if (selectedRole === 'admin') {
      params.set('role', 'admin');
    } else {
      params.set('role', 'user');
    }
    navigate(`/${mode}?${params.toString()}`);
  };

  if (location.pathname === '/auth') {
    return (
      <div className="landing-shell">
        <section className="hero-section">
          <div className="hero-copy">
            <div className="eyebrow">Secure family finance management</div>
            <h1>Family Expense Tracker</h1>
            <p>Manage your family's finances securely with role-based access. Parents can monitor overall spending, while family members manage their own expenses within one polished experience.</p>
            <div className="hero-actions">
              <button className="btn btn-primary" onClick={() => navigate('/select')}>Get Started</button>
              <button className="btn btn-secondary" onClick={() => navigate('/select')}>Login</button>
            </div>
            <div className="hero-pills">
              <span>JWT auth</span>
              <span>Protected routes</span>
              <span>Modern dashboard</span>
            </div>
          </div>
          <div className="hero-panel">
            <div className="panel-card">
              <div className="panel-title">Choose your access</div>
              <div className="panel-actions">
                <button className="access-card" onClick={() => navigate('/select')}>
                  <strong>User access</strong>
                  <span>Personal expense tracking</span>
                </button>
                <button className="access-card" onClick={() => navigate('/select')}>
                  <strong>Admin access</strong>
                  <span>Family-wide oversight</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="feature-grid">
          <article className="feature-card">
            <h3>Secure authentication</h3>
            <p>Protected sessions, encrypted password handling, and role-aware navigation.</p>
          </article>
          <article className="feature-card">
            <h3>Expense management</h3>
            <p>Create, edit, and review expenses with clear dashboards and summaries.</p>
          </article>
          <article className="feature-card">
            <h3>RBAC for families</h3>
            <p>Admins oversee the household while members manage only their own records.</p>
          </article>
        </section>

        <section className="why-section">
          <h2>Why this experience stands out</h2>
          <ul>
            <li>Secure and scalable architecture</li>
            <li>Fast and responsive interface</li>
            <li>Clean, modern UI for recruiters and users alike</li>
          </ul>
        </section>

        <footer className="landing-footer">Secure • Scalable • Family Friendly</footer>
      </div>
    );
  }

  if (location.pathname === '/select') {
    return (
      <div className="auth-wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f1f5f9' }}>
        <div className="selection-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem', maxWidth: '800px', width: '100%', margin: '0 auto', padding: '2rem' }}>
          <div className="auth-logo" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
            <div className="brand-icon">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
            <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b' }}>Fintrac</span>
          </div>
          <h2 style={{ fontSize: '1.8rem', color: '#0f172a', fontWeight: '800', textAlign: 'center', margin: 0 }}>Select Your Portal</h2>
          <p style={{ color: '#64748b', textAlign: 'center', maxWidth: '500px', margin: '-1rem 0 1rem 0' }}>Choose how you want to access the Fintrac Family Expense Tracker</p>
          
          <div className="selection-cards" style={{ display: 'flex', gap: '1.5rem', width: '100%', flexWrap: 'wrap', justifyContent: 'center' }}>
            {/* Card 1: Admin */}
            <div className="card" style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '2rem', flex: '1', minWidth: '280px', maxWidth: '360px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div style={{ background: '#eff6ff', padding: '10px', borderRadius: '10px', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                    🔑
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>Admin (Parent/Guardian)</h3>
                </div>
                <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: '1.5', marginBottom: '1.5rem', minHeight: '68px' }}>Monitor family expenses, manage users and oversee financial activities.</p>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto' }}>
                <button className="auth-btn" style={{ flex: 1, padding: '10px', background: '#2563eb' }} onClick={() => navigate('/login?role=admin')}>Login</button>
                <button className="auth-btn" style={{ flex: 1, padding: '10px', background: '#f1f5f9', color: '#1e293b', border: '1px solid #cbd5e1' }} onClick={() => navigate('/signup?role=admin')}>Signup</button>
              </div>
            </div>

            {/* Card 2: User */}
            <div className="card" style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '2rem', flex: '1', minWidth: '280px', maxWidth: '360px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div style={{ background: '#ecfdf5', padding: '10px', borderRadius: '10px', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                    👤
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>User (Child/Spouse)</h3>
                </div>
                <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: '1.5', marginBottom: '1.5rem', minHeight: '68px' }}>Manage your own expenses and track your spending.</p>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto' }}>
                <button className="auth-btn" style={{ flex: 1, padding: '10px', background: '#10b981' }} onClick={() => navigate('/login?role=user')}>Login</button>
                <button className="auth-btn" style={{ flex: 1, padding: '10px', background: '#f1f5f9', color: '#1e293b', border: '1px solid #cbd5e1' }} onClick={() => navigate('/signup?role=user')}>Signup</button>
              </div>
            </div>
          </div>
          <button style={{ marginTop: '1rem', background: 'none', border: 'none', color: '#64748b', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.9rem' }} onClick={() => navigate('/auth')}>Back to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="brand-icon">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          <span>Fintrac</span>
        </div>
        <div className="auth-title">{isLogin ? (role === 'admin' ? 'Admin Login' : 'User Login') : (role === 'admin' ? 'Admin Signup' : 'User Signup')}</div>
        <div className="auth-sub">{isLogin ? `Sign in to access your dashboard` : 'Create your account to start tracking'}</div>

        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <span className="auth-link" style={{ fontSize: '13px' }} onClick={() => navigate('/select')}>← Choose different portal</span>
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
            <label className="form-label">Password</label>
            <input type="password" required className="form-input" placeholder={isLogin ? '••••••••' : 'Min. 8 characters'} value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {!isLogin && (
            <>
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input type="password" required className="form-input" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              </div>
              {role === 'admin' && (
                <div className="form-group">
                  <label className="form-label">Admin Secret Key</label>
                  <input type="password" required className="form-input" placeholder="Enter Admin Secret" value={adminSecret} onChange={(e) => setAdminSecret(e.target.value)} />
                </div>
              )}
            </>
          )}
          <button type="submit" className="auth-btn" style={{ background: role === 'admin' ? '#2563eb' : '#10b981' }}>{isLogin ? 'Sign in' : 'Create account'}</button>
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
