import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Copy, Link2 } from 'lucide-react';
function Invitations() {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    inviteeEmail: '',
    inviteeName: '',
    relationship: 'child'
  });
  const [submitting, setSubmitting] = useState(false);
  const [newInviteCode, setNewInviteCode] = useState('');

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await axios.get('/users/invitations');
      setInvitations(res.data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch invitations');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    setNewInviteCode('');

    try {
      const res = await axios.post('/users/invite', formData);
      setSuccess('Invitation created successfully!');
      if (res.data?.invitation?.inviteCode) {
        setNewInviteCode(res.data.invitation.inviteCode);
      }
      setFormData({ inviteeEmail: '', inviteeName: '', relationship: 'child' });
      fetchInvitations();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to create invitation');
    } finally {
      setSubmitting(false);
    }
  };

  const getInviteLink = (code) => {
    return `${window.location.origin}/signup?code=${code}&role=user`;
  };

  const copyToClipboard = (text, type = 'link') => {
    navigator.clipboard.writeText(text);
    alert(`Copied ${type} to clipboard!`);
  };

  if (loading && invitations.length === 0) {
    return <div style={{ display: 'flex', height: '80vh', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>Loading invitations...</div>;
  }

  return (
    <div className="screen" style={{ padding: '22px' }}>
      <div className="topbar">
        <div>
          <div className="page-title">✉️ Family Invitations</div>
          <div className="page-sub">Invite your family members (Spouse or Children) to join your ecosystem.</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {/* Invite Form */}
        <div className="card" style={{ height: 'fit-content' }}>
          <div className="card-title" style={{ fontSize: '16px', marginBottom: '8px' }}>Send Invitation</div>
          <div className="card-sub">Generate a link to share with your family member.</div>

          {error && <div style={{ background: '#fee2e2', color: '#991b1b', padding: '10px 14px', borderRadius: '8px', marginBottom: '14px', fontSize: '13px' }}>{error}</div>}
          {success && <div style={{ background: '#d1fae5', color: '#065f46', padding: '10px 14px', borderRadius: '8px', marginBottom: '14px', fontSize: '13px' }}>{success}</div>}

          {newInviteCode && (
            <div style={{
              background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
              border: '1px solid #bfdbfe',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '12px', color: '#1e3a8a', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sharing Invite Code</div>
              <div style={{ fontSize: '24px', fontWeight: '800', color: '#1d4ed8', margin: '8px 0', letterSpacing: '0.1em' }}>{newInviteCode}</div>
              
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '12px' }}>
                <button 
                  onClick={() => copyToClipboard(newInviteCode, 'Invite Code')} 
                  className="btn" 
                  style={{ fontSize: '12px', padding: '6px 12px' }}
                >
                  <Copy size={14} style={{ marginRight: '6px' }} /> Copy Code
                </button>
                <button 
                  onClick={() => copyToClipboard(getInviteLink(newInviteCode), 'Invite Link')} 
                  className="btn btn-primary" 
                  style={{ fontSize: '12px', padding: '6px 12px', display: 'flex', alignItems: 'center' }}
                >
                  <Link2 size={14} style={{ marginRight: '6px' }} /> Copy Invite Link
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input 
                type="text" 
                name="inviteeName" 
                required 
                placeholder="e.g. Neha Kumar" 
                className="form-input" 
                value={formData.inviteeName} 
                onChange={handleInputChange} 
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input 
                type="email" 
                name="inviteeEmail" 
                required 
                placeholder="neha@example.com" 
                className="form-input" 
                value={formData.inviteeEmail} 
                onChange={handleInputChange} 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Relationship Type</label>
              <select 
                name="relationship" 
                className="form-select" 
                value={formData.relationship} 
                onChange={handleInputChange}
              >
                <option value="spouse">Spouse 👩</option>
                <option value="child">Child 👦/👧</option>
              </select>
            </div>

            <button 
              type="submit" 
              className="auth-btn" 
              disabled={submitting}
              style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', marginTop: '10px' }}
            >
              {submitting ? 'Generating Invite...' : 'Generate Invite Code'}
            </button>
          </form>
        </div>

        {/* Invitations List */}
        <div className="card" style={{ flex: 1.5 }}>
          <div className="card-title" style={{ fontSize: '16px', marginBottom: '4px' }}>Invitation History</div>
          <div className="card-sub">Track active codes and joined members.</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
            {invitations.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>✉️</div>
                <div>No invitations sent yet.</div>
                <div style={{ fontSize: '12px', marginTop: '4px' }}>Send one using the form on the left.</div>
              </div>
            ) : (
              invitations.map(invite => (
                <div 
                  key={invite._id} 
                  style={{
                    padding: '14px',
                    background: '#f8fafc',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  <div style={{ display: 'flex', justifycontent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>
                        {invite.inviteeName || 'Family Member'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                        {invite.inviteeEmail} • <span style={{ textTransform: 'capitalize' }}>{invite.relationship}</span>
                      </div>
                    </div>
                    <span className={`badge ${
                      invite.status === 'accepted' ? 'badge-green' : 
                      invite.status === 'expired' ? 'badge-red' : 'badge-amber'
                    }`} style={{ textTransform: 'capitalize' }}>
                      {invite.status}
                    </span>
                  </div>

                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    background: '#fff', 
                    padding: '8px 12px', 
                    borderRadius: '8px', 
                    border: '1px solid #f1f5f9',
                    fontSize: '13px'
                  }}>
                    <span style={{ fontFamily: 'monospace', fontWeight: '700', color: '#1d4ed8' }}>{invite.inviteCode}</span>
                    {invite.status === 'sent' && (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button 
                          onClick={() => copyToClipboard(invite.inviteCode, 'Code')} 
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: 'var(--text)' }}
                          title="Copy Code"
                        >
                          <Copy size={14} />
                        </button>
                        <button 
                          onClick={() => copyToClipboard(getInviteLink(invite.inviteCode), 'Link')} 
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: 'var(--text)' }}
                          title="Copy Share Link"
                        >
                          <Link2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'right' }}>
                    Sent on {new Date(invite.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Invitations;
