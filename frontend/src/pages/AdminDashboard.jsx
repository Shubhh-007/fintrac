import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

/**
 * Admin Dashboard Component (Parent/Guardian View)
 * Family Management Dashboard showing:
 * - Family overview and statistics
 * - Family members management
 * - Expense tracking
 * - Recent activity
 * - Analytics
 */
function AdminDashboard() {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalMembers: 0,
    totalExpenses: 0,
    monthlySpending: 0,
    pendingInvitations: 0
  });
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [expRes, usersRes] = await Promise.all([
        axios.get('/expenses'),
        axios.get('/users')
      ]);

      const allExpenses = expRes.data || [];
      const familyMembers = usersRes.data || [];

      // Calculate stats
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlyExpenses = allExpenses.filter(e => {
        const date = new Date(e.date);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      }).reduce((sum, e) => sum + (e.type === 'expense' ? e.amount : 0), 0);

      setStats({
        totalMembers: familyMembers.length + 1, // +1 for admin
        totalExpenses: allExpenses.reduce((sum, e) => sum + (e.type === 'expense' ? e.amount : 0), 0),
        monthlySpending: monthlyExpenses,
        pendingInvitations: 2 // Mock value
      });

      setExpenses(allExpenses.slice(0, 10));
    } catch (err) {
      console.error(err);
      setError('Failed to load family data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val) => '₹' + val.toLocaleString('en-IN');

  const recentActivities = [
    { icon: '💰', text: 'Rahul added ₹500 for Food', time: '2 hours ago', color: '#3b82f6' },
    { icon: '👋', text: 'Priya joined the family', time: '1 day ago', color: '#10b981' },
    { icon: '✏️', text: 'Mom updated an expense', time: '2 days ago', color: '#f59e0b' },
    { icon: '✅', text: 'Invitation accepted by Neha', time: '3 days ago', color: '#8b5cf6' }
  ];

  const familyMembers = [
    { id: 1, name: 'You (Parent)', role: 'Parent', avatar: '👨', status: 'Active', joinDate: 'Owner' },
    { id: 2, name: 'Mom', role: 'Spouse', avatar: '👩', status: 'Active', joinDate: '3 months ago' },
    { id: 3, name: 'Rahul', role: 'Child', avatar: '👦', status: 'Active', joinDate: '2 months ago' },
    { id: 4, name: 'Neha', role: 'Child', avatar: '👧', status: 'Pending', joinDate: 'Invite sent' }
  ];

  if (loading) {
    return <div style={{ display: 'flex', height: '80vh', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>Loading family dashboard...</div>;
  }

  return (
    <div className="screen" style={{ padding: '22px' }}>
      {/* Welcome Header */}
      <div className="topbar">
        <div>
          <div className="page-title">Welcome back, {user?.firstName?.split(' ')[0] || 'Parent'} 👋</div>
          <div className="page-sub">Monitor your family's spending and manage members from one place.</div>
        </div>
        <Link to="/admin/invitations" className="btn btn-primary" style={{ textDecoration: 'none' }}>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M12 4v16m8-8H4"/></svg>
          Invite Member
        </Link>
      </div>

      {error && <div style={{ color: 'var(--danger)', fontSize: '13px', marginBottom: '16px' }}>{error}</div>}

      {/* Summary Cards */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div className="stat-label" style={{ color: 'rgba(255,255,255,0.9)' }}>Family Members</div>
            <div style={{ fontSize: '28px' }}>👨‍👩‍👧‍👦</div>
          </div>
          <div className="stat-value" style={{ color: 'white', marginTop: '12px' }}>{stats.totalMembers}</div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', marginTop: '8px' }}>Connected members</div>
        </div>

        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div className="stat-label" style={{ color: 'rgba(255,255,255,0.9)' }}>Total Expenses</div>
            <div style={{ fontSize: '28px' }}>💰</div>
          </div>
          <div className="stat-value" style={{ color: 'white', marginTop: '12px' }}>{formatCurrency(stats.totalExpenses)}</div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', marginTop: '8px' }}>All time total</div>
        </div>

        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div className="stat-label" style={{ color: 'rgba(255,255,255,0.9)' }}>Monthly Spending</div>
            <div style={{ fontSize: '28px' }}>📊</div>
          </div>
          <div className="stat-value" style={{ color: 'white', marginTop: '12px' }}>{formatCurrency(stats.monthlySpending)}</div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', marginTop: '8px' }}>This month</div>
        </div>

        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div className="stat-label" style={{ color: 'rgba(255,255,255,0.9)' }}>Pending Invites</div>
            <div style={{ fontSize: '28px' }}>📮</div>
          </div>
          <div className="stat-value" style={{ color: 'white', marginTop: '12px' }}>{stats.pendingInvitations}</div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', marginTop: '8px' }}>Awaiting response</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginTop: '24px' }}>
        {/* Family Members Card */}
        <div className="card" style={{ gridColumn: 'span 1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <div className="card-title">👨‍👩‍👧‍👦 Family Members</div>
              <div className="card-sub">{stats.totalMembers} connected</div>
            </div>
            <Link to="/admin/family" className="btn" style={{ fontSize: '12px', textDecoration: 'none', padding: '6px 12px' }}>View all</Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {familyMembers.slice(0, 4).map(member => (
              <div key={member.id} style={{
                padding: '12px',
                background: '#f8fafc',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ fontSize: '28px' }}>{member.avatar}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>{member.name}</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                    {member.role} • {member.joinDate}
                  </div>
                </div>
                <span style={{
                  fontSize: '11px',
                  fontWeight: '600',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  background: member.status === 'Active' ? '#d1fae5' : '#fef3c7',
                  color: member.status === 'Active' ? '#065f46' : '#92400e'
                }}>
                  {member.status}
                </span>
              </div>
            ))}
          </div>

          <Link 
            to="/admin/invitations"
            style={{
              display: 'block',
              marginTop: '16px',
              padding: '12px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              textAlign: 'center',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '13px',
              cursor: 'pointer',
              border: 'none',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.target.style.transform = 'none'}
          >
            + Invite New Member
          </Link>
        </div>

        {/* Recent Activity Card */}
        <div className="card" style={{ gridColumn: 'span 1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <div className="card-title">📝 Recent Activity</div>
              <div className="card-sub">Family updates</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentActivities.map((activity, i) => (
              <div key={i} style={{
                padding: '12px',
                background: '#f8fafc',
                borderRadius: '10px',
                borderLeft: `4px solid ${activity.color}`,
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start'
              }}>
                <div style={{ fontSize: '18px' }}>{activity.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', color: '#0f172a', fontWeight: '500' }}>{activity.text}</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>{activity.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Expenses Section */}
      <div className="card" style={{ marginTop: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <div className="card-title">💸 Recent Family Expenses</div>
            <div className="card-sub">Latest transactions</div>
          </div>
          <Link to="/transactions" className="btn" style={{ fontSize: '12px', textDecoration: 'none', padding: '6px 12px' }}>View all</Link>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ textAlign: 'left', padding: '12px', color: '#94a3b8', fontWeight: '600' }}>Owner</th>
                <th style={{ textAlign: 'left', padding: '12px', color: '#94a3b8', fontWeight: '600' }}>Expense</th>
                <th style={{ textAlign: 'left', padding: '12px', color: '#94a3b8', fontWeight: '600' }}>Category</th>
                <th style={{ textAlign: 'left', padding: '12px', color: '#94a3b8', fontWeight: '600' }}>Amount</th>
                <th style={{ textAlign: 'left', padding: '12px', color: '#94a3b8', fontWeight: '600' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>📭</div>
                    <div>No family expenses yet</div>
                    <div style={{ fontSize: '12px', marginTop: '8px' }}>Invite members or add the first expense</div>
                  </td>
                </tr>
              ) : (
                expenses.slice(0, 8).map((exp, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>
                          👤
                        </div>
                        <span style={{ fontWeight: '500', color: '#0f172a' }}>Family Member</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px', color: '#0f172a', fontWeight: '500' }}>{exp.title}</td>
                    <td style={{ padding: '12px', color: '#64748b' }}>
                      <span style={{ background: '#f0fdf4', color: '#15803d', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '500' }}>{exp.category}</span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ fontWeight: '600', color: exp.type === 'income' ? '#10b981' : '#ef4444' }}>
                        {exp.type === 'income' ? '+' : '-'} {formatCurrency(exp.amount)}
                      </span>
                    </td>
                    <td style={{ padding: '12px', color: '#64748b' }}>{new Date(exp.date).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats Footer */}
      <div style={{ marginTop: '24px', padding: '16px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
        <strong>💡 Tip:</strong> Invite family members to track expenses collaboratively and maintain financial transparency across your household.
      </div>
    </div>
  );
}

export default AdminDashboard;
