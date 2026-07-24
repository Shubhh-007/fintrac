import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';
import FamilyCard from './FamilyCard';
import { LayoutDashboard, Users, UserPlus, CreditCard, PieChart, Settings, User, Bell } from 'lucide-react';

function Sidebar() {
  const { user } = useContext(AuthContext);
  const { unreadCount } = useContext(NotificationContext);
  const isAdmin = user?.role === 'admin';

  const navItemClass = ({ isActive }) => isActive ? "nav-item active" : "nav-item";

  return (
    <div className="sidebar" style={{minHeight:'100vh'}}>
      <div className="brand">
        <div className="brand-icon">
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <span className="brand-name">Fintrac</span>
      </div>
      <div className="nav">
        {isAdmin && (
          <>
            <FamilyCard />
          </>
        )}
        <div className="nav-section">Main</div>
        <NavLink to="/" className={navItemClass} end>
          <LayoutDashboard className="nav-icon" size={20} /> Dashboard
        </NavLink>
        {isAdmin && (
          <>
            <NavLink to="/admin/family" className={navItemClass}>
              <Users className="nav-icon" size={20} /> Family Members
            </NavLink>
            <NavLink to="/admin/invitations" className={navItemClass}>
              <UserPlus className="nav-icon" size={20} /> Invitations
            </NavLink>
          </>
        )}
        <NavLink to="/transactions" className={navItemClass}>
          <CreditCard className="nav-icon" size={20} /> Expenses
        </NavLink>
        <NavLink to="/analytics" className={navItemClass}>
          <PieChart className="nav-icon" size={20} /> Analytics
        </NavLink>
        {isAdmin && (
          <>
            <NavLink to="/admin/settings" className={navItemClass}>
              <Settings className="nav-icon" size={20} /> Settings
            </NavLink>
          </>
        )}
        <div className="nav-section">Account</div>
        <NavLink to="/notifications" className={navItemClass} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Bell className="nav-icon" size={20} /> Notifications
          </div>
          {unreadCount > 0 && (
            <span style={{ background: 'var(--danger)', color: 'white', fontSize: '11px', padding: '2px 6px', borderRadius: '10px', fontWeight: 'bold' }}>
              {unreadCount}
            </span>
          )}
        </NavLink>
        <NavLink to="/profile" className={navItemClass}>
          <User className="nav-icon" size={20} /> Profile
        </NavLink>
      </div>
      <div className="sidebar-bottom">
        <NavLink to="/profile" style={{textDecoration:'none'}}>
          <div className="user-pill">
            <div className="avatar">
              {user?.name ? user.name.split(' ').map(w => w[0]).slice(0,2).join('').toUpperCase() : 'U'}
            </div>
            <div className="user-info">
              <div className="user-name">{user?.name || 'User'}</div>
              <div className="user-role">{user?.role === 'admin' ? 'Admin (Parent)' : 'User (Family)'}</div>
            </div>
          </div>
        </NavLink>
      </div>
    </div>
  );
}

export default Sidebar;
