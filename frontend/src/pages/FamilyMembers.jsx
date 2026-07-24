import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { X, Edit2, Trash2 } from 'lucide-react';

function FamilyMembers() {
  const { user: currentUser } = useContext(AuthContext);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal state for viewing a specific member's expenses
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
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await axios.get('/users/family');
      setMembers(res.data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch family members');
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
      // Reload expenses and stats
      if (selectedMember) {
        handleOpenMemberDetails(selectedMember);
      }
      setEditingExpense(null);
      fetchMembers(); // Update family dashboard overview stats
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
      fetchMembers();
    } catch (err) {
      console.error(err);
      alert('Failed to delete expense');
    }
  };

  const formatCurrency = (val) => '₹' + val.toLocaleString('en-IN');

  const getAvatar = (rel) => {
    const avatars = { admin: '👨', spouse: '👩', child: '👦' };
    return avatars[rel] || '👤';
  };

  // Calculate highest category and monthly spending for details card
  const getInsights = () => {
    const cats = {};
    let monthlySpending = 0;
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    memberExpenses.forEach(exp => {
      if (exp.type === 'expense') {
        cats[exp.category] = (cats[exp.category] || 0) + exp.amount;
        const date = new Date(exp.date);
        if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
          monthlySpending += exp.amount;
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

    return { highestCat, monthlySpending };
  };

  const { highestCat, monthlySpending } = getInsights();

  if (loading && members.length === 0) {
    return <div style={{ display: 'flex', height: '80vh', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>Loading family ecosystem...</div>;
  }

  return (
    <div className="screen" style={{ padding: '22px' }}>
      <div className="topbar">
        <div>
          <div className="page-title">👨‍👩‍👧‍👦 Family Ecosystem</div>
          <div className="page-sub">Monitor all connected users, check active statuses, and manage member expenses.</div>
        </div>
      </div>

      {error && <div style={{ color: 'var(--danger)', marginBottom: '16px' }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        {members.map(member => (
          <div 
            key={member._id} 
            onClick={() => handleOpenMemberDetails(member)}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              padding: '20px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
              position: 'relative'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 10px 20px -5px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.05)';
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div style={{ fontSize: '36px' }}>{getAvatar(member.relationship)}</div>
                <span className={`badge ${member.status === 'active' ? 'badge-green' : 'badge-amber'}`} style={{ textTransform: 'capitalize' }}>
                  {member.status}
                </span>
              </div>

              <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text)' }}>
                {member.name} {member._id === currentUser._id && <span style={{ fontWeight: 'normal', color: 'var(--muted)', fontSize: '12px' }}>(You)</span>}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px', textTransform: 'capitalize' }}>
                {member.relationship} • {member.email}
              </div>
            </div>

            <div style={{ marginTop: '20px', borderTop: '0.5px solid var(--border)', paddingTop: '14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--muted)' }}>Expenses Count</div>
                <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text)', marginTop: '2px' }}>{member.expenseStats?.count || 0}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--muted)' }}>Total Spending</div>
                <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--danger)', marginTop: '2px' }}>{formatCurrency(member.expenseStats?.totalExpenses || 0)}</div>
              </div>
            </div>

            <div style={{ display: 'block', textAlign: 'right', marginTop: '14px', fontSize: '12px', color: 'var(--primary)', fontWeight: '600' }}>
              View Expenses &rarr;
            </div>
          </div>
        ))}
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
                <span style={{ fontSize: '32px' }}>{getAvatar(selectedMember.relationship)}</span>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>{selectedMember.name}'s Expenses</h3>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px', textTransform: 'capitalize' }}>
                    {selectedMember.relationship} • {selectedMember.email}
                  </div>
                </div>
              </div>
              <button 
                onClick={handleCloseModal} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}
              >
                <X size={24} />
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
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)', padding: '4px' }}
                              title="Edit Expense"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              onClick={() => handleDeleteExpense(exp._id)} 
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', padding: '4px' }}
                              title="Delete Expense"
                            >
                              <Trash2 size={16} />
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

export default FamilyMembers;
