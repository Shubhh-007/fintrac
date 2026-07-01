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
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal/Drawer state for viewing member expenses
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberExpenses, setMemberExpenses] = useState([]);
  const [memberStats, setMemberStats] = useState({ totalExpenses: 0, totalIncome: 0, count: 0 });
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  // Editing state inside the modal
  const [editingExpense, setEditingExpense] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    amount: '',
    category: 'Food',
    type: 'expense',
    date: '',
    description: ''
  });
  const [editError, setEditError] = useState('');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [expRes, familyRes, invitesRes] = await Promise.all([
        axios.get('/expenses'),
        axios.get('/users/family'),
        axios.get('/users/invitations')
      ]);

      const allExpenses = expRes.data || [];
      const familyMembers = familyRes.data || [];
      const pendingInvitesCount = (invitesRes.data || []).filter(i => i.status === 'sent').length;

      // Calculate stats
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlyExpenses = allExpenses.filter(e => {
        const date = new Date(e.date);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      }).reduce((sum, e) => sum + (e.type === 'expense' ? e.amount : 0), 0);

      setStats({
        totalMembers: familyMembers.length,
        totalExpenses: allExpenses.reduce((sum, e) => sum + (e.type === 'expense' ? e.amount : 0), 0),
        monthlySpending: monthlyExpenses,
        pendingInvitations: pendingInvitesCount
      });

      setMembers(familyMembers);
      setExpenses(allExpenses.slice(0, 10));
    } catch (err) {
      console.error(err);
      setError('Failed to load family data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenMemberDetails = async (member) => {
    setSelectedMember(member);
    setModalLoading(true);
    setModalError('');
    setEditingExpense(null);
    try {
      const res = await axios.get(`/users/family/${member._id}/expenses`);
      setMemberExpenses(res.data.expenses || []);
      setMemberStats(res.data.stats || { totalExpenses: 0, totalIncome: 0, count: 0 });
    } catch (err) {
      console.error(err);
      setModalError('Failed to fetch member expenses');
    } finally {
      setModalLoading(false);
    }
  };

  const handleCloseModal = () => {
    setSelectedMember(null);
    setMemberExpenses([]);
    setEditingExpense(null);
  };

  const handleEditClick = (exp) => {
    setEditingExpense(exp._id);
    setEditFormData({
      title: exp.title,
      amount: exp.amount,
      category: exp.category,
      type: exp.type || 'expense',
      date: exp.date ? exp.date.split('T')[0] : '',
      description: exp.description || ''
    });
    setEditError('');
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditError('');
    try {
      await axios.put(`/expenses/${editingExpense}`, editFormData);
      if (selectedMember) {
        handleOpenMemberDetails(selectedMember);
      }
      setEditingExpense(null);
      fetchAdminData(); // Refresh main dashboard numbers
    } catch (err) {
      console.error(err);
      setEditError(err.response?.data?.message || 'Failed to update expense');
    }
  };

  const handleDeleteExpense = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    try {
      await axios.delete(`/expenses/${id}`);
      if (selectedMember) {
        handleOpenMemberDetails(selectedMember);
      }
      fetchAdminData();
    } catch (err) {
      console.error(err);
      alert('Failed to delete expense');
    }
  };

  const getInsights = () => {
    const cats = {};
    let monthSpending = 0;
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    memberExpenses.forEach(exp => {
      if (exp.type === 'expense') {
        cats[exp.category] = (cats[exp.category] || 0) + exp.amount;
        const date = new Date(exp.date);
        if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
          monthSpending += exp.amount;
        }
      }
    });

    let highestCat = 'N/A';
    let maxAmt = 0;
    Object.keys(cats).forEach(cat => {
      if (cats[cat] > maxAmt) {
        maxAmt = cats[cat];
        highestCat = cat;
      }
    });

    return { highestCat, monthlySpending: monthSpending };
  };

  const { highestCat, monthlySpending } = getInsights();

  const formatCurrency = (val) => '₹' + val.toLocaleString('en-IN');

  // Build live recent activity from real expenses + member joins
  const recentActivities = [
    // Expense events
    ...expenses.slice(0, 6).map(exp => ({
      icon: exp.type === 'income' ? '💼' : '💸',
      text: `${exp.user?.name || 'A member'} ${exp.type === 'income' ? 'received' : 'added'} ₹${exp.amount?.toLocaleString('en-IN')} for ${exp.category}`,
      time: new Date(exp.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      ts: new Date(exp.date).getTime(),
      color: exp.type === 'income' ? '#10b981' : '#3b82f6'
    })),
    // Member join events
    ...members.filter(m => m.relationship !== 'admin').map(m => ({
      icon: '👋',
      text: `${m.name} joined the family as ${m.relationship}`,
      time: new Date(m.familyJoinDate || m.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      ts: new Date(m.familyJoinDate || m.createdAt).getTime(),
      color: '#8b5cf6'
    }))
  ]
    .sort((a, b) => b.ts - a.ts)
    .slice(0, 5);

  if (loading) {
    return <div style={{ display: 'flex', height: '80vh', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>Loading family dashboard...</div>;
  }

  return (
    <div className="screen" style={{ padding: '22px' }}>
      {/* Welcome Header */}
      <div className="topbar">
        <div>
          <div className="page-title">Welcome back, {user?.name?.split(' ')[0] || 'Admin'} 👋</div>
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
            {members.slice(0, 4).map(member => (
              <div 
                key={member._id} 
                onClick={() => handleOpenMemberDetails(member)}
                style={{
                  padding: '12px',
                  background: '#f8fafc',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  border: '1px solid #e2e8f0',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
              >
                <div style={{ fontSize: '28px' }}>
                  {member.relationship === 'admin' ? '👨' : member.relationship === 'spouse' ? '👩' : '👦'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>
                    {member.name} {member._id === user._id && '(You)'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'capitalize' }}>
                    {member.relationship} • {member.expenseStats?.count || 0} expenses
                  </div>
                </div>
                <span style={{
                  fontSize: '11px',
                  fontWeight: '600',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  background: member.status === 'active' ? '#d1fae5' : '#fef3c7',
                  color: member.status === 'active' ? '#065f46' : '#92400e',
                  textTransform: 'capitalize'
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
            {recentActivities.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: '#94a3b8' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>🕐</div>
                <div style={{ fontSize: '13px' }}>No activity yet.</div>
                <div style={{ fontSize: '12px', marginTop: '4px' }}>Invite members and add expenses to see updates here.</div>
              </div>
            ) : (
              recentActivities.map((activity, i) => (
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
              ))
            )}
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
                        <span style={{ fontWeight: '500', color: '#0f172a' }}>{exp.user?.name || 'You'}</span>
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

      {/* Member Details Drawer/Modal */}
      {selectedMember && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ 
            background: 'var(--surface)', 
            width: 'min(100vw, 680px)', 
            height: '100vh', 
            padding: '28px', 
            boxShadow: '-10px 0 30px rgba(0,0,0,0.1)', 
            display: 'flex', 
            flexDirection: 'column',
            overflowY: 'auto'
          }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '32px' }}>{selectedMember.relationship === 'admin' ? '👨' : selectedMember.relationship === 'spouse' ? '👩' : '👦'}</span>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>{selectedMember.name}'s Expenses</h3>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px', textTransform: 'capitalize' }}>
                    {selectedMember.relationship} • {selectedMember.email}
                  </div>
                </div>
              </div>
              <button 
                onClick={handleCloseModal} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '24px', color: 'var(--muted)' }}
              >
                &times;
              </button>
            </div>

            {modalLoading ? (
              <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>Loading records...</div>
            ) : modalError ? (
              <div style={{ color: 'var(--danger)', padding: '20px', textAlign: 'center' }}>{modalError}</div>
            ) : (
              <>
                {/* Insights Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
                  <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '11px', color: 'var(--muted)' }}>Total Expenses</div>
                    <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text)', marginTop: '4px' }}>{formatCurrency(memberStats.totalExpenses)}</div>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '11px', color: 'var(--muted)' }}>Highest Category</div>
                    <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--amber)', marginTop: '4px', textTransform: 'capitalize' }}>{highestCat}</div>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '11px', color: 'var(--muted)' }}>This Month</div>
                    <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--danger)', marginTop: '4px' }}>{formatCurrency(monthlySpending)}</div>
                  </div>
                </div>

                {/* Edit Form (if active) */}
                {editingExpense && (
                  <div style={{ background: '#f8fafc', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px', alignItems: 'center' }}>
                      <span style={{ fontWeight: '600', fontSize: '14px' }}>✏️ Edit Expense Entry</span>
                      <button onClick={() => setEditingExpense(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: 'var(--muted)' }}>Cancel</button>
                    </div>
                    {editError && <div style={{ color: 'var(--danger)', fontSize: '12px', marginBottom: '10px' }}>{editError}</div>}
                    <form onSubmit={handleEditSubmit} style={{ display: 'grid', gap: '12px' }}>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <div style={{ flex: 2 }}>
                          <label className="form-label">Title</label>
                          <input type="text" required className="form-input" value={editFormData.title} onChange={e => setEditFormData({ ...editFormData, title: e.target.value })} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <label className="form-label">Amount (₹)</label>
                          <input type="number" step="any" required className="form-input" value={editFormData.amount} onChange={e => setEditFormData({ ...editFormData, amount: e.target.value })} />
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <div style={{ flex: 1 }}>
                          <label className="form-label">Category</label>
                          <select className="form-select" value={editFormData.category} onChange={e => setEditFormData({ ...editFormData, category: e.target.value })}>
                            <option value="Food">Food</option>
                            <option value="Travel">Travel</option>
                            <option value="Bills">Bills</option>
                            <option value="Shopping">Shopping</option>
                            <option value="Education">Education</option>
                            <option value="Health">Health</option>
                            <option value="Entertainment">Entertainment</option>
                            <option value="Income">Income</option>
                          </select>
                        </div>
                        <div style={{ flex: 1 }}>
                          <label className="form-label">Date</label>
                          <input type="date" required className="form-input" value={editFormData.date} onChange={e => setEditFormData({ ...editFormData, date: e.target.value })} />
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                        <div style={{ flex: 1 }}>
                          <label className="form-label">Description (Optional)</label>
                          <input type="text" className="form-input" value={editFormData.description} onChange={e => setEditFormData({ ...editFormData, description: e.target.value })} />
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ height: '38px', padding: '0 20px', borderRadius: '10px' }}>Save Changes</button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Expenses List */}
                <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>Expenses Log</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {memberExpenses.length === 0 ? (
                    <div style={{ padding: '24px', textAlign: 'center', color: 'var(--muted)', fontSize: '13px' }}>No expenses logged for this member.</div>
                  ) : (
                    memberExpenses.map(exp => (
                      <div 
                        key={exp._id} 
                        style={{
                          padding: '12px 16px',
                          background: '#ffffff',
                          borderRadius: '12px',
                          border: '1px solid #f1f5f9',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                        }}
                      >
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                          <div style={{ fontSize: '20px' }}>
                            {exp.category === 'Food' ? '🍔' : exp.category === 'Travel' ? '✈️' : exp.category === 'Bills' ? '⚡' : exp.category === 'Shopping' ? '🛒' : exp.category === 'Income' ? '💼' : exp.category === 'Health' ? '💊' : exp.category === 'Entertainment' ? '🎮' : '💰'}
                          </div>
                          <div>
                            <div style={{ fontSize: '13.5px', fontWeight: '600', color: '#0f172a' }}>{exp.title}</div>
                            {exp.description && <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>{exp.description}</div>}
                            <div style={{ fontSize: '10.5px', color: '#94a3b8', marginTop: '2px' }}>
                              {new Date(exp.date).toLocaleDateString()} • <span style={{ textTransform: 'capitalize', color: 'var(--primary)', fontWeight: '500' }}>{exp.category}</span>
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <span style={{ 
                            fontSize: '14px', 
                            fontWeight: '700', 
                            color: exp.type === 'income' ? 'var(--success)' : 'var(--danger)' 
                          }}>
                            {exp.type === 'income' ? '+' : '-'} {formatCurrency(exp.amount)}
                          </span>
                          
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button 
                              onClick={() => handleEditClick(exp)} 
                              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px' }}
                              title="Edit Expense"
                            >
                              ✏️
                            </button>
                            <button 
                              onClick={() => handleDeleteExpense(exp._id)} 
                              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px' }}
                              title="Delete Expense"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
