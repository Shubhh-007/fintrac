import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

function Transactions() {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ title: '', amount: '', category: 'Food', type: 'expense', date: '', description: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const res = await axios.get('/expenses');
      setData(res.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load expenses');
    }
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({ title: '', amount: '', category: 'Food', type: 'expense', date: new Date().toISOString().split('T')[0], description: '' });
    setModalOpen(true);
    setError('');
  };

  const handleOpenEdit = (t) => {
    setEditingId(t._id);
    setFormData({
      title: t.title,
      amount: t.amount,
      category: t.category,
      type: t.type || 'expense',
      date: t.date ? t.date.split('T')[0] : '',
      description: t.description || ''
    });
    setModalOpen(true);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      if (editingId) {
        await axios.put(`/expenses/${editingId}`, formData);
        setSuccess('Expense updated successfully');
      } else {
        await axios.post('/expenses', formData);
        setSuccess('Expense added successfully');
      }
      setModalOpen(false);
      fetchExpenses();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Action failed');
    }
  };

  const deleteTx = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    setError('');
    setSuccess('');
    try {
      await axios.delete(`/expenses/${id}`);
      setSuccess('Expense deleted successfully');
      fetchExpenses();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to delete expense');
    }
  };

  const getIcon = (cat) => {
    const icons = { 'Food': '🍔', 'Travel': '✈️', 'Bills': '⚡', 'Shopping': '🛒', 'Income': '💼', 'Health': '💊', 'Entertainment': '🎮' };
    return icons[cat] || '💰';
  };

  return (
    <div className="screen">
      <div className="topbar">
        <div><div className="page-title">Expenses</div><div className="page-sub">All family records</div></div>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus size={16} />
          Add new
        </button>
      </div>

      {success && <div style={{ background: '#d1fae5', color: '#065f46', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '13.5px' }}>{success}</div>}
      {error && <div style={{ background: '#fee2e2', color: '#991b1b', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '13.5px' }}>{error}</div>}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 1fr 1fr 1fr auto', padding: '11px 18px', borderBottom: '0.5px solid var(--border)', fontSize: '12px', color: 'var(--muted)', fontWeight: '500' }}>
          <span>Expense</span><span>Category</span><span>Date</span><span>Owner</span><span style={{ textAlign: 'right' }}>Amount</span><span>Actions</span>
        </div>
        <div>
          {data.length === 0 && <div style={{ padding: '20px', textAlign: 'center', color: 'var(--muted)', fontSize: '14px' }}>No expenses found.</div>}
          {data.map(t => (
            <div key={t._id} style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 1fr 1fr 1fr auto', padding: '12px 18px', borderBottom: '0.5px solid var(--border)', alignItems: 'center', transition: 'background 0.12s' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '20px' }}>{getIcon(t.category)}</span>
                <div>
                  <div style={{ fontSize: '13.5px', fontWeight: '500', color: '#000' }}>{t.title}</div>
                  {t.description && <div style={{ fontSize: '11.5px', color: 'var(--muted)' }}>{t.description}</div>}
                </div>
              </span>
              <span><span className={`badge ${t.type === 'income' ? 'badge-green' : 'badge-amber'}`}>{t.category}</span></span>
              <span style={{ fontSize: '13px', color: 'var(--muted)' }}>{new Date(t.date).toLocaleDateString()}</span>
              <span style={{ fontSize: '13px', color: 'var(--muted)' }}>{t.user?.name || (t.user === user._id ? 'You' : 'Family Member')}</span>
              <span style={{ textAlign: 'right', fontSize: '14px', fontWeight: '500', color: t.type === 'income' ? 'var(--success)' : 'var(--danger)' }}>
                {t.type === 'income' ? '+' : '-'} ₹{t.amount.toLocaleString('en-IN')}
              </span>
              <span style={{ display: 'flex', gap: '8px', marginLeft: '10px' }}>
                {(user.role === 'admin' || t.user === user._id || (t.user && t.user._id === user._id)) && (
                  <>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)', padding: '4px' }} onClick={() => handleOpenEdit(t)}><Edit2 size={16} /></button>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', padding: '4px' }} onClick={() => deleteTx(t._id)}><Trash2 size={16} /></button>
                  </>
                )}
              </span>
            </div>
          ))}
        </div>
      </div>

      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--surface)', borderRadius: '18px', padding: '28px', width: '420px', maxWidth: '95vw' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ fontSize: '16px', fontWeight: '500' }}>{editingId ? 'Edit Expense' : 'Add Expense'}</div>
              <button onClick={() => setModalOpen(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--muted)' }}><X size={20} /></button>
            </div>
            
            {error && <div style={{ color: 'var(--danger)', fontSize: '13px', marginBottom: '14px' }}>{error}</div>}

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', gap: 0, border: '0.5px solid var(--border)', borderRadius: '10px', overflow: 'hidden', marginBottom: '18px' }}>
                <button type="button" onClick={() => setFormData({ ...formData, type: 'expense' })} style={{ flex: 1, padding: '9px', border: 'none', background: formData.type === 'expense' ? 'var(--danger)' : 'transparent', color: formData.type === 'expense' ? '#fff' : 'var(--muted)', fontSize: '13.5px', cursor: 'pointer' }}>Expense</button>
                <button type="button" onClick={() => setFormData({ ...formData, type: 'income' })} style={{ flex: 1, padding: '9px', border: 'none', background: formData.type === 'income' ? 'var(--success)' : 'transparent', color: formData.type === 'income' ? '#fff' : 'var(--muted)', fontSize: '13.5px', cursor: 'pointer' }}>Income</button>
              </div>
              
              <div className="form-group">
                <label className="form-label">Title</label>
                <input type="text" required className="form-input" placeholder="e.g. Grocery shopping" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
              </div>

              <div className="form-group">
                <label className="form-label">Amount (₹)</label>
                <input type="number" step="any" required className="form-input" placeholder="0.00" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} />
              </div>

              <div className="form-group">
                <label className="form-label">Description (Optional)</label>
                <input type="text" className="form-input" placeholder="Additional details" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-select" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
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
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input type="date" required className="form-input" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
                </div>
              </div>
              <button type="submit" className="auth-btn" style={{ marginTop: '8px' }}>{editingId ? 'Save changes' : 'Save expense'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Transactions;
