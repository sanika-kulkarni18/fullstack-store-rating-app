import React, { useState, useEffect } from 'react';
import { apiFetch } from '../utils/api';
import InteractiveStars from '../components/InteractiveStars';
import { Search, MapPin, Store, RotateCcw, ArrowUpDown } from 'lucide-react';

const UserDashboard = () => {
  const [stores, setStores] = useState([]);
  const [searchName, setSearchName] = useState('');
  const [searchAddress, setSearchAddress] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [loading, setLoading] = useState(false);
  const [submittingId, setSubmittingId] = useState(null);

  const fetchStores = async () => {
    setLoading(true);
    try {
      let query = `?sortBy=${sortBy}&sortOrder=${sortOrder}`;
      if (searchName) query += `&name=${encodeURIComponent(searchName)}`;
      if (searchAddress) query += `&address=${encodeURIComponent(searchAddress)}`;

      const data = await apiFetch(`/users/stores${query}`);
      setStores(data);
    } catch (err) {
      console.error("Fetch stores error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch stores on load and when sort/search changes
    const delayDebounceFn = setTimeout(() => {
      fetchStores();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchName, searchAddress, sortBy, sortOrder]);

  const handleRateStore = async (storeId, ratingValue) => {
    setSubmittingId(storeId);
    try {
      await apiFetch(`/users/stores/${storeId}/rate`, {
        method: 'POST',
        body: { rating: ratingValue }
      });
      // Refresh the store list to update overall rating and user rating
      await fetchStores();
    } catch (err) {
      alert(err.message || "Failed to submit rating.");
    } finally {
      setSubmittingId(null);
    }
  };

  const handleResetFilters = () => {
    setSearchName('');
    setSearchAddress('');
    setSortBy('name');
    setSortOrder('asc');
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  return (
    <div className="container">
      {/* Page Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1>Explore & Rate Stores</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Discover local registered outlets, see community ratings, and share your personal experience.
        </p>
      </div>

      {/* Search and Filters Section */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
          
          {/* Search by Name */}
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search by store name..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              style={{ paddingLeft: '2.5rem', fontSize: '0.85rem', padding: '0.625rem 0.625rem 0.625rem 2.5rem' }}
            />
          </div>

          {/* Search by Address */}
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <MapPin size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search by location / address..."
              value={searchAddress}
              onChange={(e) => setSearchAddress(e.target.value)}
              style={{ paddingLeft: '2.5rem', fontSize: '0.85rem', padding: '0.625rem 0.625rem 0.625rem 2.5rem' }}
            />
          </div>

          {/* Sort Selection */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <select
              className="form-input"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ width: '130px', padding: '0.625rem', fontSize: '0.85rem' }}
            >
              <option value="name">Store Name</option>
              <option value="address">Address</option>
              <option value="overallRating">Overall Rating</option>
            </select>

            <button
              className="btn btn-secondary"
              onClick={toggleSortOrder}
              style={{ padding: '0.625rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              title="Toggle Sort Direction"
            >
              <ArrowUpDown size={16} />
            </button>
          </div>

          {/* Reset Filters */}
          {(searchName || searchAddress || sortBy !== 'name' || sortOrder !== 'asc') && (
            <button
              className="btn btn-secondary"
              onClick={handleResetFilters}
              style={{ padding: '0.625rem 1rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
            >
              <RotateCcw size={14} />
              <span style={{ fontSize: '0.85rem' }}>Reset</span>
            </button>
          )}

        </div>
      </div>

      {/* Stores Grid Layout */}
      {loading && stores.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <div className="pulse" style={{ color: 'var(--text-secondary)' }}>Loading verified stores...</div>
        </div>
      ) : stores.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-secondary)' }}>
          <Store size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem', opacity: 0.6 }} />
          <h3>No Stores Match Your Search Criteria</h3>
          <p style={{ fontSize: '0.85rem', marginTop: '0.5rem', color: 'var(--text-muted)' }}>
            Try adjusting your search terms or filters above.
          </p>
        </div>
      ) : (
        <div className="grid-cards">
          {stores.map((store) => (
            <div key={store.id} className="store-card glass-panel" style={{ position: 'relative' }}>
              
              {/* Card Header */}
              <div className="store-header">
                <div>
                  <h3 className="store-title">{store.name}</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{store.email}</span>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <InteractiveStars rating={store.overallRating} readonly size={14} />
                    <span className="rating-badge" style={{ fontSize: '0.8rem', padding: '0.15rem 0.35rem' }}>
                      {store.overallRating > 0 ? store.overallRating.toFixed(1) : '0.0'}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                    ({store.totalRatings} ratings)
                  </span>
                </div>
              </div>

              {/* Card Address */}
              <div className="store-address">
                <p style={{ display: 'flex', alignItems: 'flex-start', gap: '0.35rem', marginTop: '0.5rem' }}>
                  <MapPin size={14} style={{ color: 'var(--primary-color)', flexShrink: 0, marginTop: '0.15rem' }} />
                  <span>{store.address}</span>
                </p>
              </div>

              {/* Submit / Modify Rating Section */}
              <div style={{
                marginTop: 'auto',
                borderTop: '1px solid var(--card-border)',
                paddingTop: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    {store.userRating ? "Your Rating" : "Submit Rating"}
                  </span>
                  
                  {store.userRating ? (
                    <span style={{
                      fontSize: '0.7rem',
                      background: 'rgba(16, 185, 129, 0.12)',
                      color: 'var(--success)',
                      border: '1px solid rgba(16, 185, 129, 0.2)',
                      padding: '0.15rem 0.4rem',
                      borderRadius: '4px',
                      fontWeight: 600
                    }}>
                      Rated {store.userRating} ★
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Not rated yet</span>
                  )}
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'rgba(255,255,255,0.015)',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '10px',
                  border: '1px solid var(--card-border)'
                }}>
                  <InteractiveStars
                    rating={store.userRating || 0}
                    onChange={(val) => handleRateStore(store.id, val)}
                    size={22}
                  />
                  
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {submittingId === store.id ? 'Saving...' : (store.userRating ? 'Change' : 'Click to Rate')}
                  </span>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
