import React, { useContext } from 'react';
import { NotificationContext } from '../context/NotificationContext';
import { Trash2, CheckCircle, BellOff } from 'lucide-react';

function Notifications() {
  const { notifications, markAsRead, markAllAsRead, deleteNotification } = useContext(NotificationContext);

  const getIcon = (type) => {
    switch(type) {
      case 'GROUP_JOIN': return '👋';
      case 'GROUP_REMOVE': return '🚪';
      case 'PROFILE_UPDATE': return '👤';
      case 'SECURITY_ALERT': return '🔒';
      default: return '🔔';
    }
  };

  return (
    <div className="screen" style={{ padding: '22px' }}>
      <div className="topbar">
        <div>
          <div className="page-title">Notifications</div>
          <div className="page-sub">Stay updated with your group and account activities.</div>
        </div>
        <button className="btn" onClick={markAllAsRead} disabled={notifications.every(n => n.isRead)}>
          <CheckCircle size={16} /> Mark all read
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--muted)' }}>
            <BellOff size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
            <div>You're all caught up!</div>
            <div style={{ fontSize: '13px', marginTop: '4px' }}>No new notifications.</div>
          </div>
        ) : (
          notifications.map(notif => (
            <div 
              key={notif._id} 
              style={{
                display: 'flex', 
                alignItems: 'flex-start',
                gap: '16px',
                padding: '20px',
                background: notif.isRead ? 'var(--surface)' : '#f0f9ff',
                borderRadius: '16px',
                border: '1px solid',
                borderColor: notif.isRead ? 'var(--border)' : '#bae6fd',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div style={{ fontSize: '24px', background: 'white', padding: '10px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                {getIcon(notif.type)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: '700', color: 'var(--text)', fontSize: '15px' }}>{notif.title}</div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                    {new Date(notif.createdAt).toLocaleDateString()} {new Date(notif.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>
                </div>
                <div style={{ color: 'var(--text)', fontSize: '14px', marginTop: '6px', lineHeight: '1.5' }}>
                  {notif.message}
                </div>
                
                <div style={{ display: 'flex', gap: '12px', marginTop: '14px' }}>
                  {!notif.isRead && (
                    <button 
                      onClick={() => markAsRead(notif._id)}
                      style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: '600', fontSize: '13px', cursor: 'pointer', padding: 0 }}
                    >
                      Mark as Read
                    </button>
                  )}
                  <button 
                    onClick={() => deleteNotification(notif._id)}
                    style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: '13px', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Notifications;
