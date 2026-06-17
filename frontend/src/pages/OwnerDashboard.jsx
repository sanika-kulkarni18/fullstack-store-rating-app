import React, { useState, useEffect } from 'react';
import { apiFetch } from '../utils/api';
import Table from '../components/Table';
import InteractiveStars from '../components/InteractiveStars';
import { Star, Users, MapPin, Mail, RefreshCw } from 'lucide-react';

const OwnerDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      const query = `?sortBy=${sortBy}&sortOrder=${sortOrder}`;
      const data = await apiFetch(`/owner/dashboard${query}`);
      setDashboardData(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [sortBy, sortOrder]);

  const handleSort = (key, order) => {
    setSortBy(key);
    setSortOrder(order);
  };

  const tableColumns = [
    { key: 'userName', label: 'User Name', sortable: true },
    { key: 'userEmail', label: 'Email', sortable: true },
    { key: 'userAddress', label: 'Address', sortable: true },
    { 
      key: 'rating', 
      label: 'Rating Value', 
      sortable: true,
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <InteractiveStars rating={row.rating} readonly size={14} />
          <span className="rating-badge" style={{ padding: '0.1rem 0.35rem', fontSize: '0.75rem' }}>{row.rating}</span>
        </div>
      )
    },
    {
      key: 'createdAt',
      label: 'Date Submitted',
      sortable: true,
      render: (row) => new Date(row.createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }
  ];

  if (loading && !dashboardData) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 0' }}>
        <div className="pulse" style={{ color: 'var(--text-secondary)' }}>Loading your dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ display: 'flex', justifyContent: 'center', padding: '4rem 1.5rem' }}>
        <div className="glass-panel" style={{ padding: '3rem 2rem', textAlign: 'center', maxWidth: '500px' }}>
          <h3 style={{ color: 'var(--danger)', marginBottom: '1rem' }}>Access Error</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>{error}</p>
          <button className="btn btn-primary" onClick={fetchDashboard} style={{ marginTop: '1.5rem' }}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--primary-color)', fontWeight: 700, letterSpacing: '0.05em' }}>
            Store Owner Console
          </span>
          <h1 style={{ marginTop: '0.25rem' }}>{dashboardData.storeName}</h1>
          
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Mail size={14} style={{ color: 'var(--primary-color)' }} />
              {dashboardData.storeEmail}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <MapPin size={14} style={{ color: 'var(--primary-color)' }} />
              {dashboardData.storeAddress}
            </span>
          </div>
        </div>

        <button className="btn btn-secondary" onClick={fetchDashboard} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <RefreshCw size={14} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Overview Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2.5rem'
      }}>
        
        {/* Rating Value Card */}
        <div className="glass-panel" style={{
          padding: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(135deg, rgba(19, 26, 44, 0.55), rgba(6, 182, 212, 0.05))',
          borderLeft: '4px solid var(--primary-color)'
        }}>
          <div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Store Rating Average</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', margin: '0.5rem 0' }}>
              <span style={{ fontSize: '3rem', fontWeight: 800, color: '#ffffff', lineHeight: 1 }}>
                {dashboardData.averageRating > 0 ? dashboardData.averageRating.toFixed(2) : '0.00'}
              </span>
              <span style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>/ 5</span>
            </div>
            <InteractiveStars rating={dashboardData.averageRating} readonly size={18} />
          </div>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: 'rgba(6, 182, 212, 0.1)',
            border: '1px solid rgba(6, 182, 212, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--primary-color)'
          }}>
            <Star size={32} style={{ fill: 'rgba(6, 182, 212, 0.15)' }} />
          </div>
        </div>

        {/* Total Ratings Card */}
        <div className="glass-panel" style={{
          padding: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(135deg, rgba(19, 26, 44, 0.55), rgba(168, 85, 247, 0.05))',
          borderLeft: '4px solid var(--secondary-color)'
        }}>
          <div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Total Feedbacks</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', margin: '0.5rem 0' }}>
              <span style={{ fontSize: '3rem', fontWeight: 800, color: '#ffffff', lineHeight: 1 }}>
                {dashboardData.totalRatings}
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Individual user ratings submitted
            </div>
          </div>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: 'rgba(168, 85, 247, 0.1)',
            border: '1px solid rgba(168, 85, 247, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--secondary-color)'
          }}>
            <Users size={32} />
          </div>
        </div>

      </div>

      {/* Ratings Log Table */}
      <div>
        <div style={{ marginBottom: '1rem' }}>
          <h2>Rating Submissions</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Detailed breakdown of all user feedback received by your store.</p>
        </div>

        <Table
          columns={tableColumns}
          data={dashboardData.usersWhoRated}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
        />
      </div>
    </div>
  );
};

export default OwnerDashboard;
