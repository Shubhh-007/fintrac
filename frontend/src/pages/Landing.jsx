import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Users, ArrowRight, Activity, PiggyBank, BarChart3, ChevronRight } from 'lucide-react';

export default function Landing() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      color: '#0f172a',
      overflowX: 'hidden',
      position: 'relative'
    }}>
      {/* Dynamic Background Effects */}
      <div style={{ position: 'fixed', top: '-10%', left: '-10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, rgba(248,250,252,0) 70%)', borderRadius: '50%', zIndex: 0, pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '-20%', right: '-10%', width: '60vw', height: '60vw', background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, rgba(248,250,252,0) 70%)', borderRadius: '50%', zIndex: 0, pointerEvents: 'none' }} />

      {/* Navigation */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        padding: '16px 32px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: scrolled ? 'rgba(255, 255, 255, 0.85)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(15,23,42,0.05)' : '1px solid transparent',
        transition: 'all 0.3s ease',
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #10b981, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(16,185,129,0.2)' }}>
            <PiggyBank size={24} color="white" />
          </div>
          <span style={{ fontSize: '22px', fontWeight: '800', letterSpacing: '-0.5px', color: '#0f172a' }}>
            Fintrac
          </span>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <Link to="/auth" style={{ color: '#475569', textDecoration: 'none', fontWeight: '600', fontSize: '15px', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#0f172a'} onMouseLeave={(e) => e.target.style.color = '#475569'}>
            Sign In
          </Link>
          <Link to="/signup?role=user" style={{ padding: '10px 24px', borderRadius: '999px', background: '#ffffff', border: '1px solid #e2e8f0', color: '#0f172a', textDecoration: 'none', fontWeight: '600', fontSize: '15px', transition: 'all 0.2s', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }} onMouseEnter={(e) => { e.target.style.background = '#f1f5f9'; e.target.style.borderColor = '#cbd5e1'; }} onMouseLeave={(e) => { e.target.style.background = '#ffffff'; e.target.style.borderColor = '#e2e8f0'; }}>
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ position: 'relative', zIndex: 10, paddingTop: '160px', paddingBottom: '100px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', paddingLeft: '24px', paddingRight: '24px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '999px', background: '#ecfdf5', border: '1px solid #d1fae5', color: '#047857', fontSize: '13px', fontWeight: '700', marginBottom: '24px', letterSpacing: '0.5px' }}>
          <Activity size={14} /> NEW: Shared Family Dashboards
        </div>
        <h1 style={{ fontSize: 'clamp(40px, 6vw, 72px)', fontWeight: '800', lineHeight: '1.1', letterSpacing: '-2px', marginBottom: '24px', maxWidth: '900px', color: '#0f172a' }}>
          Master Your Family's <br />
          <span style={{ position: 'relative' }}>
            <span style={{ position: 'relative', zIndex: 1, background: 'linear-gradient(135deg, #10b981, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Financial Future</span>
            <svg style={{ position: 'absolute', bottom: '-8px', left: 0, width: '100%', height: '12px', zIndex: 0 }} viewBox="0 0 200 9" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 7.00002C40.6667 3.16668 126.8 -2.59998 198 6.20002" stroke="rgba(16,185,129,0.3)" strokeWidth="4" strokeLinecap="round"/></svg>
          </span>
        </h1>
        <p style={{ fontSize: '18px', color: '#64748b', lineHeight: '1.6', maxWidth: '600px', marginBottom: '40px' }}>
          Experience complete transparency and control over your household expenses. Built with military-grade security and separate dashboards for seamless family collaboration.
        </p>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link to="/signup?role=user" style={{ padding: '16px 36px', borderRadius: '999px', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', textDecoration: 'none', fontWeight: '700', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 10px 25px rgba(16,185,129,0.3)', transition: 'transform 0.2s, box-shadow 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 15px 30px rgba(16,185,129,0.4)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 10px 25px rgba(16,185,129,0.3)'; }}>
            Start Tracking Free <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section style={{ position: 'relative', zIndex: 10, padding: '80px 24px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '16px', letterSpacing: '-1px', color: '#0f172a' }}>Everything you need, nothing you don't.</h2>
          <p style={{ color: '#64748b', fontSize: '16px', maxWidth: '500px', margin: '0 auto' }}>A powerful suite of tools designed to bring clarity to your family's financial ecosystem.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {/* Card 1 */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '24px', padding: '32px', boxShadow: '0 4px 20px rgba(15,23,42,0.03)', transition: 'transform 0.3s, box-shadow 0.3s' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 15px 35px rgba(15,23,42,0.06)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(15,23,42,0.03)'; }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <ShieldCheck color="#10b981" size={24} />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '12px', color: '#0f172a' }}>Military-Grade Security</h3>
            <p style={{ color: '#64748b', lineHeight: '1.6', fontSize: '15px' }}>Your financial data is protected with state-of-the-art JWT encryption. Complete peace of mind for your family's sensitive information.</p>
          </div>

          {/* Card 2 */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '24px', padding: '32px', boxShadow: '0 4px 20px rgba(15,23,42,0.03)', transition: 'transform 0.3s, box-shadow 0.3s' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 15px 35px rgba(15,23,42,0.06)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(15,23,42,0.03)'; }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <Users color="#3b82f6" size={24} />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '12px', color: '#0f172a' }}>Role-Based Access</h3>
            <p style={{ color: '#64748b', lineHeight: '1.6', fontSize: '15px' }}>Separate dashboards for Admins and standard Users. Collaborate on expenses while maintaining appropriate privacy boundaries.</p>
          </div>

          {/* Card 3 */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '24px', padding: '32px', boxShadow: '0 4px 20px rgba(15,23,42,0.03)', transition: 'transform 0.3s, box-shadow 0.3s' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 15px 35px rgba(15,23,42,0.06)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(15,23,42,0.03)'; }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <BarChart3 color="#f59e0b" size={24} />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '12px', color: '#0f172a' }}>Intelligent Analytics</h3>
            <p style={{ color: '#64748b', lineHeight: '1.6', fontSize: '15px' }}>Visualize your spending patterns with beautiful, interactive charts. Spot trends and make informed decisions effortlessly.</p>
          </div>
        </div>
      </section>

      {/* Trust & Stats Section */}
      <section style={{ position: 'relative', zIndex: 10, padding: '100px 24px', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', background: '#ffffff' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '40px', color: '#0f172a', letterSpacing: '-0.5px' }}>Trusted by Modern Families</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', width: '100%' }}>
            <div>
              <div style={{ fontSize: '48px', fontWeight: '800', color: '#0f172a', marginBottom: '8px', letterSpacing: '-1px' }}>100%</div>
              <div style={{ color: '#64748b', fontSize: '15px', fontWeight: '600' }}>Data Encryption</div>
            </div>
            <div>
              <div style={{ fontSize: '48px', fontWeight: '800', color: '#0f172a', marginBottom: '8px', letterSpacing: '-1px' }}>24/7</div>
              <div style={{ color: '#64748b', fontSize: '15px', fontWeight: '600' }}>Uptime & Access</div>
            </div>
            <div>
              <div style={{ fontSize: '48px', fontWeight: '800', background: 'linear-gradient(to right, #10b981, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '8px', letterSpacing: '-1px' }}><span style={{ fontSize: '32px', verticalAlign: 'top' }}>$</span>0</div>
              <div style={{ color: '#64748b', fontSize: '15px', fontWeight: '600' }}>To Get Started</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '120px 24px', textAlign: 'center', position: 'relative', zIndex: 10 }}>
        <div style={{ background: 'linear-gradient(135deg, #10b981, #3b82f6)', borderRadius: '32px', padding: '60px 24px', maxWidth: '800px', margin: '0 auto', boxShadow: '0 20px 40px rgba(16,185,129,0.2)' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '16px', color: '#fff', letterSpacing: '-1px' }}>Take Control of Your Finances Today</h2>
          <p style={{ color: '#f1f5f9', fontSize: '18px', marginBottom: '32px', maxWidth: '500px', margin: '0 auto 32px' }}>
            Join the families who have already revolutionized how they manage their shared expenses.
          </p>
          <Link to="/signup?role=user" style={{ padding: '16px 40px', borderRadius: '999px', background: '#fff', color: '#0f172a', textDecoration: 'none', fontWeight: '700', fontSize: '16px', display: 'inline-flex', alignItems: 'center', gap: '8px', transition: 'transform 0.2s, box-shadow 0.2s', boxShadow: '0 4px 14px rgba(0,0,0,0.1)' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.15)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.1)'; }}>
            Create Free Account <ChevronRight size={18} strokeWidth={3} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '40px 32px', textAlign: 'center', position: 'relative', zIndex: 10, background: '#ffffff', borderTop: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}>
          <PiggyBank size={20} color="#10b981" />
          <span style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' }}>Fintrac</span>
        </div>
        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '8px', fontWeight: '500' }}>
          &copy; {new Date().getFullYear()} Fintrac Inc. All rights reserved.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '16px' }}>
          <span style={{ color: '#94a3b8', fontSize: '13px', cursor: 'pointer', fontWeight: '500' }} onMouseEnter={(e) => e.target.style.color = '#0f172a'} onMouseLeave={(e) => e.target.style.color = '#94a3b8'}>Privacy Policy</span>
          <span style={{ color: '#94a3b8', fontSize: '13px', cursor: 'pointer', fontWeight: '500' }} onMouseEnter={(e) => e.target.style.color = '#0f172a'} onMouseLeave={(e) => e.target.style.color = '#94a3b8'}>Terms of Service</span>
        </div>
      </footer>
    </div>
  );
}
