import React from 'react';
import { Link } from 'react-router-dom';

function Landing() {
  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Navbar */}
      <nav style={{ background: 'white', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b' }}>💰 Fintrac</div>
        <Link to="/auth" style={{ padding: '8px 20px', borderRadius: '6px', textDecoration: 'none', color: '#0f172a', fontWeight: '500', fontSize: '14px' }}>Login</Link>
      </nav>

      {/* Hero Section */}
      <section style={{ padding: '80px 32px', maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', alignItems: 'center', gap: '60px' }}>
        <div>
          <h1 style={{ fontSize: '42px', fontWeight: '800', color: '#0f172a', lineHeight: '1.2', marginBottom: '20px' }}>
            Family Expense Tracker
          </h1>
          <p style={{ fontSize: '16px', color: '#64748b', lineHeight: '1.6', marginBottom: '12px' }}>
            Manage your family's expenses securely with Role-Based Access Control.
          </p>
          <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: '1.6', marginBottom: '32px' }}>
            Track personal expenses, monitor family spending, and maintain financial transparency through secure authentication and separate dashboards for Admins and Users.
          </p>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <Link 
              to="/signup?role=user" 
              style={{ 
                padding: '12px 28px', 
                background: '#10b981', 
                color: 'white', 
                borderRadius: '8px', 
                textDecoration: 'none', 
                fontWeight: '600', 
                fontSize: '14px',
                border: 'none',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.background = '#059669'}
              onMouseLeave={(e) => e.target.style.background = '#10b981'}
            >
              Get Started
            </Link>
            <Link 
              to="/auth"
              style={{ 
                padding: '12px 28px', 
                background: 'white', 
                color: '#0f172a', 
                borderRadius: '8px', 
                textDecoration: 'none', 
                fontWeight: '600', 
                fontSize: '14px',
                border: '1px solid #e2e8f0',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => { e.target.style.background = '#f1f5f9'; e.target.style.borderColor = '#cbd5e1'; }}
              onMouseLeave={(e) => { e.target.style.background = 'white'; e.target.style.borderColor = '#e2e8f0'; }}
            >
              Login
            </Link>
          </div>
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '120px', lineHeight: '1' }}>📊💳👨‍👩‍👧‍👦</div>
          <p style={{ fontSize: '14px', color: '#94a3b8', marginTop: '20px' }}>Secure financial management for families</p>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ background: 'white', padding: '80px 32px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '800', color: '#0f172a', marginBottom: '12px', textAlign: 'center' }}>Features</h2>
          <p style={{ fontSize: '16px', color: '#64748b', textAlign: 'center', marginBottom: '60px' }}>Everything you need to manage family finances</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
            {[
              { icon: '🔒', title: 'Secure Authentication', desc: 'ShieldCheck, 100% Secure, JWT-based login' },
              { icon: '💰', title: 'Expense Management', desc: 'Create, edit, delete expenses with ease' },
              { icon: '👥', title: 'Role-Based Access', desc: 'Users & Admin: Separate dashboards' },
              { icon: '📱', title: 'Responsive Design', desc: 'Tablet, Mobile - Works on all devices' }
            ].map((feature, i) => (
              <div key={i} style={{ padding: '32px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center', transition: 'all 0.3s' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#f0fdf4'; e.currentTarget.style.borderColor = '#10b981'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.transform = 'none'; }}
              >
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>{feature.icon}</div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>{feature.title}</h3>
                <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.6' }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section style={{ padding: '80px 32px', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '36px', fontWeight: '800', color: '#0f172a', marginBottom: '60px', textAlign: 'center' }}>Statistics</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px' }}>
          {[
            { value: '100%', label: 'Secure', icon: '🔐' },
            { value: '24/7', label: 'Available', icon: '⏰' },
            { value: 'Fast', label: 'Performance', icon: '⚡' }
          ].map((stat, i) => (
            <div key={i} style={{ background: '#f8fafc', padding: '40px', borderRadius: '12px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '36px', marginBottom: '16px' }}>{stat.icon}</div>
              <h3 style={{ fontSize: '32px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>{stat.value}</h3>
              <p style={{ fontSize: '14px', color: '#64748b' }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', padding: '60px 32px', textAlign: 'center', color: 'white' }}>
        <h2 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '20px' }}>Ready to get started?</h2>
        <p style={{ fontSize: '16px', marginBottom: '32px', opacity: 0.9 }}>Join thousands of families managing their finances securely</p>
        <Link 
          to="/signup?role=user"
          style={{ 
            padding: '14px 32px', 
            background: 'white', 
            color: '#10b981', 
            borderRadius: '8px', 
            textDecoration: 'none', 
            fontWeight: '700', 
            fontSize: '16px',
            display: 'inline-block',
            transition: 'transform 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
        >
          Create Free Account
        </Link>
      </section>

      {/* Footer */}
      <footer style={{ background: '#0f172a', color: '#94a3b8', padding: '40px 32px', textAlign: 'center', fontSize: '14px' }}>
        <p>&copy; 2025 Family Expense Tracker. All rights reserved.</p>
        <p style={{ marginTop: '12px', fontSize: '12px' }}>Built with React, Node.js, and MongoDB</p>
      </footer>
    </div>
  );
}

export default Landing;
