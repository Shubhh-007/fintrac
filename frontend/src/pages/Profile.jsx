import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LogOut } from 'lucide-react';

function Profile() {
  const { user, logout } = useContext(AuthContext);

  return (
    <div className="screen">
      <div className="topbar">
        <div><div className="page-title">Profile</div><div className="page-sub">Manage your account</div></div>
        <button className="btn btn-primary" onClick={logout}><LogOut size={16} /> Sign Out</button>
      </div>
      <div className="profile-header">
        <div className="profile-avatar">{user.firstName.charAt(0)}{user.lastName.charAt(0)}</div>
        <div>
          <div className="profile-name">{user.firstName} {user.lastName}</div>
          <div className="profile-email">{user.email}</div>
          <div style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
            <span className="badge badge-green">Active</span>
            <span className="badge" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}>Personal plan</span>
          </div>
        </div>
      </div>
      <div className="settings-grid">
        <div className="card">
          <div className="card-title" style={{ marginBottom: '16px' }}>Personal details</div>
          <div className="form-group"><label className="form-label">Full name</label><input type="text" readOnly className="form-input" value={`${user.firstName} ${user.lastName}`} /></div>
          <div className="form-group"><label className="form-label">Email</label><input type="email" readOnly className="form-input" value={user.email} /></div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
