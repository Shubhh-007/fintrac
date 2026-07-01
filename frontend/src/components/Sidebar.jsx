import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import FamilyCard from './FamilyCard';

function Sidebar() {
  const { user } = useContext(AuthContext);
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
          <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> Dashboard
        </NavLink>
        {isAdmin && (
          <>
            <NavLink to="/admin/family" className={navItemClass}>
              <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M12 4.354a4 4 0 110 8.646 4 4 0 010-8.646zM9 9a3 3 0 106 0 3 3 0 00-6 0z"/><path d="M5 20c0-1.657.895-3 2-3h10c1.105 0 2 1.343 2 3"/></svg> Family Members
            </NavLink>
            <NavLink to="/admin/invitations" className={navItemClass}>
              <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg> Invitations
            </NavLink>
          </>
        )}
        <NavLink to="/transactions" className={navItemClass}>
          <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg> Expenses
        </NavLink>
        <NavLink to="/analytics" className={navItemClass}>
          <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg> Analytics
        </NavLink>
        {isAdmin && (
          <>
            <NavLink to="/admin/settings" className={navItemClass}>
              <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg> Settings
            </NavLink>
          </>
        )}
        <div className="nav-section">Account</div>
        <NavLink to="/profile" className={navItemClass}>
          <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg> Profile
        </NavLink>
      </div>
      <div className="sidebar-bottom">
        <NavLink to="/profile" style={{textDecoration:'none'}}>
          <div className="user-pill">
            <div className="avatar">{user?.firstName ? user.firstName.charAt(0) : 'U'}{user?.lastName ? user.lastName.charAt(0) : ''}</div>
            <div className="user-info">
              <div className="user-name">{user?.firstName || 'User'} {user?.lastName || ''}</div>
              <div className="user-role">{user?.role === 'admin' ? 'Admin (Parent)' : 'User (Family)'}</div>
            </div>
          </div>
        </NavLink>
      </div>
    </div>
  );
}

export default Sidebar;
