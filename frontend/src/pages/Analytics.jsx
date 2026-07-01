import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Analytics() {
  const [data, setData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const res = await axios.get('/expenses');
      const tx = res.data;
      setData(tx);

      // process category data for expenses
      const exp = tx.filter(t => t.type === 'expense');
      const cats = {};
      let totalExp = 0;
      exp.forEach(t => {
        cats[t.category] = (cats[t.category] || 0) + t.amount;
        totalExp += t.amount;
      });
      
      const arr = Object.keys(cats).map(cat => ({
        name: cat,
        amount: cats[cat],
        pct: totalExp ? Math.round((cats[cat] / totalExp) * 100) : 0
      })).sort((a,b) => b.amount - a.amount);
      
      setCategoryData(arr);
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (cat) => {
    const icons = { 'Food': '🍔', 'Travel': '✈️', 'Bills': '⚡', 'Shopping': '🛒', 'Health': '💊', 'Entertainment': '🎮' };
    return icons[cat] || '💰';
  };

  const getColor = (index) => {
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
    return colors[index % colors.length];
  };

  return (
    <div className="screen">
      <div className="topbar">
        <div><div className="page-title">Analytics</div><div className="page-sub">Monthly insights</div></div>
      </div>
      <div className="card">
        <div className="card-title">Category split</div>
        <div className="card-sub">Expenses breakdown</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
          {categoryData.length === 0 && <div style={{ fontSize: '13.5px', color: 'var(--muted)' }}>No expense data available.</div>}
          {categoryData.map((c, i) => (
            <div key={c.name}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '4px' }}>
                <span style={{color: '#000'}}>{getIcon(c.name)} {c.name}</span>
                <span style={{ fontWeight: '500', color: '#000' }}>₹{c.amount.toLocaleString('en-IN')} · {c.pct}%</span>
              </div>
              <div style={{ height: '7px', background: 'var(--bg)', borderRadius: '4px' }}>
                <div style={{ height: '100%', width: `${c.pct}%`, background: getColor(i), borderRadius: '4px' }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Analytics;
