import React, { useState, useEffect } from 'react';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export default function AdminDashboard({ token }) {
  const [pickups, setPickups] = useState([]);
  const [consults, setConsults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadRequests();
  }, [token]);

  const loadRequests = async () => {
    setError('');
    try {
      const [pickupRes, consultRes] = await Promise.all([
        fetch(`${API}/pickups`, { headers: { Authorization: `Bearer ${token}` }}),
        fetch(`${API}/consults`, { headers: { Authorization: `Bearer ${token}` }})
      ]);
      
      if (pickupRes.ok) setPickups(await pickupRes.json());
      if (consultRes.ok) setConsults(await consultRes.json());
    } catch (error) {
      setError('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (type, id, newStatus) => {
    setError('');
    try {
      const currentItem = type === 'pickups' 
        ? pickups.find(p => p._id === id)
        : consults.find(c => c._id === id);

      if (!currentItem) {
        throw new Error('Item not found');
      }

      // Updated status transition logic
      const allowedTransitions = {
        pending: ['approved'],
        approved: ['completed', 'cancelled']
      };

      if (!allowedTransitions[currentItem.status]?.includes(newStatus)) {
        throw new Error(`Cannot change status from ${currentItem.status} to ${newStatus}`);
      }

      const res = await fetch(`${API}/${type}/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ 
          status: newStatus,
          currentStatus: currentItem.status // Send current status for verification
        })
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update status');
      }

      // Only remove from dashboard if completed or cancelled
      if (newStatus === 'completed' || newStatus === 'cancelled') {
        if (type === 'pickups') {
          setPickups(prev => prev.filter(p => p._id !== id));
        } else {
          setConsults(prev => prev.filter(c => c._id !== id));
        }
      } else {
        // Update status for pending->approved
        if (type === 'pickups') {
          setPickups(prev => prev.map(p => 
            p._id === id ? { ...p, status: newStatus } : p
          ));
        } else {
          setConsults(prev => prev.map(c => 
            c._id === id ? { ...c, status: newStatus } : c
          ));
        }
      }
    } catch (error) {
      setError(error.message);
    }
  };

  // Update available statuses based on current status
  const getAvailableStatuses = (currentStatus) => {
    switch (currentStatus) {
      case 'pending':
        return ['pending', 'approved'];
      case 'approved':
        return ['approved', 'completed', 'cancelled'];
      default:
        return [currentStatus];
    }
  };

  // Filter out completed and cancelled items from display
  const activePickups = pickups.filter(p => 
    p.status === 'pending' || p.status === 'approved'
  );
  const activeConsults = consults.filter(c => 
    c.status === 'pending' || c.status === 'approved'
  );

  if (loading) return <div className="loading">Loading...</div>;

  const renderStatusBadge = (status) => (
    <span className={`status-badge ${status}`}>{status}</span>
  );

  return (
    <div className="admin-dashboard">
      {error && <div className="error-message">{error}</div>}
      
      <section className="admin-section">
        <h2>Active Pickup Requests</h2>
        <div className="request-grid">
          {activePickups.map(pickup => (
            <div key={pickup._id} className="request-card">
              <h3>Pickup Request from {pickup.name}</h3>
              <p>Items: {pickup.items}</p>
              <p>Address: {pickup.address}</p>
              <p>Status: {renderStatusBadge(pickup.status)}</p>
              <select
                value={pickup.status}
                onChange={e => updateStatus('pickups', pickup._id, e.target.value)}
                className={`status-select ${pickup.status}`}
              >
                {getAvailableStatuses(pickup.status).map(status => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          ))}
          {activePickups.length === 0 && (
            <div className="no-requests">No active pickup requests</div>
          )}
        </div>
      </section>

      <section className="admin-section">
        <h2>Active Consultation Requests</h2>
        <div className="request-grid">
          {activeConsults.map(consult => (
            <div key={consult._id} className="request-card">
              <h3>Consultation Request from {consult.name}</h3>
              <p>Category: {consult.category}</p>
              <p>Description: {consult.description}</p>
              <p>Status: {renderStatusBadge(consult.status)}</p>
              <select
                value={consult.status}
                onChange={e => updateStatus('consults', consult._id, e.target.value)}
                className={`status-select ${consult.status}`}
              >
                {getAvailableStatuses(consult.status).map(status => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          ))}
          {activeConsults.length === 0 && (
            <div className="no-requests">No active consultation requests</div>
          )}
        </div>
      </section>
    </div>
  );
}
