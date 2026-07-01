import React, { useState } from 'react';
import { Link } from 'react-router-dom';

/**
 * FamilyCard Component
 * Displays family members and quick invite button in sidebar
 * Shows family ecosystem at a glance
 */
function FamilyCard() {
  const [isExpanded, setIsExpanded] = useState(true);

  // Mock data - replace with real data from context/API
  const familyMembers = [
    { id: 1, name: 'You', role: 'Parent', status: 'Active', avatar: '👨' },
    { id: 2, name: 'Mom', role: 'Spouse', status: 'Active', avatar: '👩' },
    { id: 3, name: 'Rahul', role: 'Child', status: 'Active', avatar: '👦' },
    { id: 4, name: 'Neha', role: 'Child', status: 'Active', avatar: '👧' }
  ];

  const totalMembers = familyMembers.length;

  return (
    <div style={{
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '24px',
      color: 'white',
      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', fontWeight: '700' }}>
          🏠 My Family
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            color: 'white',
            width: '24px',
            height: '24px',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px'
          }}
        >
          {isExpanded ? '−' : '+'}
        </button>
      </div>

      {isExpanded && (
        <>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.9)', marginBottom: '12px' }}>
            Members
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
            {familyMembers.map(member => (
              <div key={member.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '13px',
                background: 'rgba(255,255,255,0.15)',
                padding: '8px 12px',
                borderRadius: '8px'
              }}>
                <span style={{ fontSize: '18px' }}>{member.avatar}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '500' }}>{member.name}</div>
                  <div style={{ fontSize: '11px', opacity: 0.8 }}>{member.role}</div>
                </div>
                <span style={{
                  fontSize: '10px',
                  background: 'rgba(255,255,255,0.3)',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontWeight: '500'
                }}>
                  {member.status}
                </span>
              </div>
            ))}
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px',
            marginBottom: '12px'
          }}>
            <div style={{
              background: 'rgba(255,255,255,0.2)',
              padding: '10px',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '20px', fontWeight: '800' }}>{totalMembers}</div>
              <div style={{ fontSize: '11px', opacity: 0.9 }}>Members</div>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.2)',
              padding: '10px',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '20px', fontWeight: '800' }}>2</div>
              <div style={{ fontSize: '11px', opacity: 0.9 }}>Pending</div>
            </div>
          </div>

          <Link
            to="/admin/invitations"
            style={{
              display: 'block',
              width: '100%',
              padding: '10px',
              background: 'white',
              color: '#10b981',
              textAlign: 'center',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '13px',
              border: 'none',
              cursor: 'pointer',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.target.style.transform = 'none'}
          >
            + Invite Member
          </Link>
        </>
      )}
    </div>
  );
}

export default FamilyCard;
