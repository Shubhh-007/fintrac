import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LogOut, Save, Shield, User as UserIcon, Settings, Trash2 } from 'lucide-react';
import axios from 'axios';

function Profile() {
  const { user, logout, fetchUser } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('personal');

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    gender: user?.gender || 'Prefer not to say',
    preferences: {
      theme: user?.preferences?.theme || 'light',
      currency: user?.preferences?.currency || 'INR',
      language: user?.preferences?.language || 'en',
      emailNotifications: user?.preferences?.emailNotifications ?? true,
      inAppNotifications: user?.preferences?.inAppNotifications ?? true
    }
  });

  const [passData, setPassData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) {
      // eslint-disable-next-line
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        gender: user.gender || 'Prefer not to say',
        preferences: {
          theme: user.preferences?.theme || 'light',
          currency: user.preferences?.currency || 'INR',
          language: user.preferences?.language || 'en',
          emailNotifications: user.preferences?.emailNotifications ?? true,
          inAppNotifications: user.preferences?.inAppNotifications ?? true
        }
      });
    }
  }, [user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      await axios.put('/users/profile', formData);
      await fetchUser(); // refresh auth context
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile' });
    }
    setLoading(false);
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passData.newPassword !== passData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      await axios.put('/users/password', {
        currentPassword: passData.currentPassword,
        newPassword: passData.newPassword
      });
      setMessage({ type: 'success', text: 'Password updated successfully!' });
      setPassData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to change password' });
    }
    setLoading(false);
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("Are you ABSOLUTELY sure you want to delete your account? This will erase all your data and cannot be undone.")) {
      try {
        await axios.delete('/users/account');
        logout(); // force logout after deletion
      } catch (err) {
        setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to delete account' });
      }
    }
  };

  return (
    <div className="screen" style={{ padding: '22px' }}>
      <div className="topbar">
        <div>
          <div className="page-title">Profile Settings</div>
          <div className="page-sub">Manage your account preferences and security.</div>
        </div>
        <button className="btn" onClick={logout} style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}>
          <LogOut size={16} /> Sign Out
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '30px', alignItems: 'start' }}>
        {/* Sidebar Tabs */}
        <div style={{ background: 'var(--surface)', borderRadius: '16px', padding: '16px', border: '1px solid var(--border)' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ 
              width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary) 0%, #3b82f6 100%)', 
              color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 'bold', 
              margin: '0 auto 12px auto' 
            }}>
              {user?.name?.charAt(0)}
            </div>
            <div style={{ fontWeight: '600', color: 'var(--text)' }}>{user?.name}</div>
            <div style={{ fontSize: '12px', color: 'var(--muted)', textTransform: 'capitalize' }}>{user?.role}</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button 
              className={`btn ${activeTab === 'personal' ? 'btn-primary' : ''}`}
              onClick={() => setActiveTab('personal')}
              style={{ justifyContent: 'flex-start', width: '100%', border: 'none', background: activeTab === 'personal' ? 'var(--primary)' : 'transparent', color: activeTab === 'personal' ? 'white' : 'var(--text)' }}
            >
              <UserIcon size={16} /> Personal Info
            </button>
            <button 
              className={`btn ${activeTab === 'security' ? 'btn-primary' : ''}`}
              onClick={() => setActiveTab('security')}
              style={{ justifyContent: 'flex-start', width: '100%', border: 'none', background: activeTab === 'security' ? 'var(--primary)' : 'transparent', color: activeTab === 'security' ? 'white' : 'var(--text)' }}
            >
              <Shield size={16} /> Security
            </button>
            <button 
              className={`btn ${activeTab === 'preferences' ? 'btn-primary' : ''}`}
              onClick={() => setActiveTab('preferences')}
              style={{ justifyContent: 'flex-start', width: '100%', border: 'none', background: activeTab === 'preferences' ? 'var(--primary)' : 'transparent', color: activeTab === 'preferences' ? 'white' : 'var(--text)' }}
            >
              <Settings size={16} /> Preferences
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="card" style={{ padding: '32px' }}>
          {message.text && (
            <div style={{ 
              padding: '12px 16px', borderRadius: '8px', marginBottom: '24px', fontSize: '14px',
              background: message.type === 'success' ? '#dcfce7' : '#fee2e2',
              color: message.type === 'success' ? '#166534' : '#991b1b'
            }}>
              {message.text}
            </div>
          )}

          {activeTab === 'personal' && (
            <form onSubmit={handleProfileUpdate}>
              <h3 style={{ marginBottom: '24px', fontSize: '18px', fontWeight: '600' }}>Personal Information</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input type="text" className="form-input" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address (Read-only)</label>
                  <input type="email" className="form-input" disabled value={user?.email} style={{ background: '#f8fafc', color: 'var(--muted)' }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input type="tel" className="form-input" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select className="form-select" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                <Save size={16} /> {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          )}

          {activeTab === 'security' && (
            <div>
              <form onSubmit={handlePasswordUpdate} style={{ marginBottom: '40px' }}>
                <h3 style={{ marginBottom: '24px', fontSize: '18px', fontWeight: '600' }}>Change Password</h3>
                <div className="form-group" style={{ maxWidth: '400px' }}>
                  <label className="form-label">Current Password</label>
                  <input type="password" required className="form-input" value={passData.currentPassword} onChange={e => setPassData({...passData, currentPassword: e.target.value})} />
                </div>
                <div className="form-group" style={{ maxWidth: '400px' }}>
                  <label className="form-label">New Password</label>
                  <input type="password" required className="form-input" minLength="6" value={passData.newPassword} onChange={e => setPassData({...passData, newPassword: e.target.value})} />
                </div>
                <div className="form-group" style={{ maxWidth: '400px' }}>
                  <label className="form-label">Confirm New Password</label>
                  <input type="password" required className="form-input" minLength="6" value={passData.confirmPassword} onChange={e => setPassData({...passData, confirmPassword: e.target.value})} />
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  <Shield size={16} /> {loading ? 'Updating...' : 'Update Password'}
                </button>
              </form>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '32px' }}>
                <h3 style={{ marginBottom: '12px', fontSize: '18px', fontWeight: '600', color: 'var(--danger)' }}>Danger Zone</h3>
                <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '16px' }}>Once you delete your account, there is no going back. Please be certain.</p>
                <button onClick={handleDeleteAccount} className="btn" style={{ background: '#fef2f2', color: 'var(--danger)', borderColor: '#fecaca' }}>
                  <Trash2 size={16} /> Delete Account
                </button>
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <form onSubmit={handleProfileUpdate}>
              <h3 style={{ marginBottom: '24px', fontSize: '18px', fontWeight: '600' }}>App Preferences</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                <div className="form-group">
                  <label className="form-label">Theme</label>
                  <select className="form-select" value={formData.preferences.theme} onChange={e => setFormData({...formData, preferences: {...formData.preferences, theme: e.target.value}})}>
                    <option value="light">Light (Default)</option>
                    <option value="dark">Dark</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Currency</label>
                  <select className="form-select" value={formData.preferences.currency} onChange={e => setFormData({...formData, preferences: {...formData.preferences, currency: e.target.value}})}>
                    <option value="INR">₹ INR (Indian Rupee)</option>
                    <option value="USD">$ USD (US Dollar)</option>
                    <option value="EUR">€ EUR (Euro)</option>
                    <option value="GBP">£ GBP (British Pound)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Language</label>
                  <select className="form-select" value={formData.preferences.language} onChange={e => setFormData({...formData, preferences: {...formData.preferences, language: e.target.value}})}>
                    <option value="en">English</option>
                    <option value="hi">Hindi</option>
                    <option value="es">Spanish</option>
                  </select>
                </div>
              </div>

              <h4 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '16px' }}>Notification Settings</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={formData.preferences.emailNotifications} onChange={e => setFormData({...formData, preferences: {...formData.preferences, emailNotifications: e.target.checked}})} style={{ width: '18px', height: '18px' }} />
                  Receive Email Notifications for important events
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={formData.preferences.inAppNotifications} onChange={e => setFormData({...formData, preferences: {...formData.preferences, inAppNotifications: e.target.checked}})} style={{ width: '18px', height: '18px' }} />
                  Receive In-App Notifications
                </label>
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading}>
                <Save size={16} /> {loading ? 'Saving...' : 'Save Preferences'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
