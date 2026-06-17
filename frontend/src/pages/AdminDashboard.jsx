import React, { useState, useEffect } from 'react';
import { apiFetch } from '../utils/api';
import Table from '../components/Table';
import InteractiveStars from '../components/InteractiveStars';
import { Plus, Search, Users, Store, Star, X, Check, Eye } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ totalUsers: 0, totalStores: 0, totalRatings: 0 });
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [activeTab, setActiveTab] = useState('users'); // 'users' or 'stores'

  // Filtering & Sorting State
  const [filterText, setFilterText] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [userSortBy, setUserSortBy] = useState('id');
  const [userSortOrder, setUserSortOrder] = useState('desc');
  const [storeSortBy, setStoreSortBy] = useState('id');
  const [storeSortOrder, setStoreSortOrder] = useState('desc');

  // Modals State
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [storeModalOpen, setStoreModalOpen] = useState(false);
  const [userDetailsModalOpen, setUserDetailsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // New User Form State
  const [newUser, setNewUser] = useState({ name: '', email: '', address: '', password: '', role: 'NORMAL' });
  const [newUserErrors, setNewUserErrors] = useState({});

  // New Store Form State
  const [newStore, setNewStore] = useState({ name: '', email: '', address: '', password: '' });
  const [newStoreErrors, setNewStoreErrors] = useState({});

  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  // Password rules validation helpers
  const checkPassLength = (pw) => pw.length >= 8 && pw.length <= 16;
  const checkPassUpper = (pw) => /[A-Z]/.test(pw);
  const checkPassSpecial = (pw) => /[^A-Za-z0-9]/.test(pw);

  // Fetch functions
  const fetchStats = async () => {
    try {
      const data = await apiFetch('/admin/stats');
      setStats(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsers = async () => {
    try {
      // Build query string
      let query = `?sortBy=${userSortBy}&sortOrder=${userSortOrder}`;
      if (filterRole) query += `&role=${filterRole}`;
      // In-memory or backend partial searches: we send to backend
      if (filterText) {
        // Send as email/name/address search, our controller will apply filtering
        query += `&name=${filterText}&email=${filterText}&address=${filterText}`;
      }
      
      const data = await apiFetch(`/admin/users${query}`);
      setUsers(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStores = async () => {
    try {
      let query = `?sortBy=${storeSortBy}&sortOrder=${storeSortOrder}`;
      if (filterText) {
        query += `&name=${filterText}&email=${filterText}&address=${filterText}`;
      }
      const data = await apiFetch(`/admin/stores${query}`);
      setStores(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Fetch when sorting/filtering changes
  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else {
      fetchStores();
    }
  }, [activeTab, filterText, filterRole, userSortBy, userSortOrder, storeSortBy, storeSortOrder]);

  const handleUserSort = (key, order) => {
    setUserSortBy(key);
    setUserSortOrder(order);
  };

  const handleStoreSort = (key, order) => {
    setStoreSortBy(key);
    setStoreSortOrder(order);
  };

  // Add User Submission
  const handleAddUser = async (e) => {
    e.preventDefault();
    setNewUserErrors({});

    const errs = {};
    if (newUser.name.length < 20 || newUser.name.length > 60) {
      errs.name = "Name must be 20-60 characters.";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUser.email)) {
      errs.email = "Invalid email format.";
    }
    if (newUser.address.length > 400 || !newUser.address) {
      errs.address = "Address must be 1-400 characters.";
    }
    if (!checkPassLength(newUser.password) || !checkPassUpper(newUser.password) || !checkPassSpecial(newUser.password)) {
      errs.password = "Password does not meet rules.";
    }

    if (Object.keys(errs).length > 0) {
      setNewUserErrors(errs);
      return;
    }

    setFormLoading(true);
    try {
      await apiFetch('/admin/users', {
        method: 'POST',
        body: newUser
      });
      setUserModalOpen(false);
      setNewUser({ name: '', email: '', address: '', password: '', role: 'NORMAL' });
      fetchUsers();
      fetchStats();
    } catch (err) {
      if (err.errors) setNewUserErrors(err.errors);
      else setNewUserErrors({ global: err.message });
    } finally {
      setFormLoading(false);
    }
  };

  // Add Store Submission
  const handleAddStore = async (e) => {
    e.preventDefault();
    setNewStoreErrors({});

    const errs = {};
    if (newStore.name.length < 20 || newStore.name.length > 60) {
      errs.name = "Name must be 20-60 characters.";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newStore.email)) {
      errs.email = "Invalid email format.";
    }
    if (newStore.address.length > 400 || !newStore.address) {
      errs.address = "Address must be 1-400 characters.";
    }
    if (!checkPassLength(newStore.password) || !checkPassUpper(newStore.password) || !checkPassSpecial(newStore.password)) {
      errs.password = "Password does not meet rules.";
    }

    if (Object.keys(errs).length > 0) {
      setNewStoreErrors(errs);
      return;
    }

    setFormLoading(true);
    try {
      await apiFetch('/admin/stores', {
        method: 'POST',
        body: newStore
      });
      setStoreModalOpen(false);
      setNewStore({ name: '', email: '', address: '', password: '' });
      fetchStores();
      fetchStats();
    } catch (err) {
      if (err.errors) setNewStoreErrors(err.errors);
      else setNewStoreErrors({ global: err.message });
    } finally {
      setFormLoading(false);
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN':
        return <span className="badge badge-admin">Admin</span>;
      case 'STORE_OWNER':
        return <span className="badge badge-owner">Owner</span>;
      default:
        return <span className="badge badge-normal">User</span>;
    }
  };

  // Define Columns for Users Table
  const userColumns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'address', label: 'Address', sortable: true },
    { key: 'role', label: 'Role', sortable: true, render: (row) => getRoleBadge(row.role) },
    { 
      key: 'actions', 
      label: 'Actions', 
      sortable: false, 
      render: (row) => (
        <button
          className="btn btn-secondary"
          onClick={() => { setSelectedUser(row); setUserDetailsModalOpen(true); }}
          style={{ padding: '0.35rem 0.6rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
        >
          <Eye size={14} />
          <span style={{ fontSize: '0.8rem' }}>Details</span>
        </button>
      )
    }
  ];

  // Define Columns for Stores Table
  const storeColumns = [
    { key: 'name', label: 'Store Name', sortable: true },
    { key: 'email', label: 'Contact Email', sortable: true },
    { key: 'address', label: 'Address', sortable: true },
    { 
      key: 'rating', 
      label: 'Overall Rating', 
      sortable: true,
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <InteractiveStars rating={row.rating} readonly size={16} />
          <span className="rating-badge">{row.rating > 0 ? row.rating.toFixed(1) : 'Unrated'}</span>
        </div>
      )
    }
  ];

  return (
    <div className="container">
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1>System Control</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Manage system entities, review metrics and user directories.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-primary" onClick={() => setUserModalOpen(true)}>
            <Plus size={16} />
            <span>Add User</span>
          </button>
          <button className="btn btn-secondary" onClick={() => setStoreModalOpen(true)}>
            <Plus size={16} />
            <span>Add Store</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card glass-panel" style={{ borderLeft: '3px solid var(--secondary-color)' }}>
          <div className="stat-icon-container stat-icon-purple">
            <Users size={20} />
          </div>
          <div>
            <div className="stat-label">Total Registered Users</div>
            <div className="stat-value">{stats.totalUsers}</div>
          </div>
        </div>

        <div className="stat-card glass-panel" style={{ borderLeft: '3px solid var(--primary-color)' }}>
          <div className="stat-icon-container stat-icon-cyan">
            <Store size={20} />
          </div>
          <div>
            <div className="stat-label">Total Outlets / Stores</div>
            <div className="stat-value">{stats.totalStores}</div>
          </div>
        </div>

        <div className="stat-card glass-panel" style={{ borderLeft: '3px solid var(--warning)' }}>
          <div className="stat-icon-container stat-icon-amber">
            <Star size={20} />
          </div>
          <div>
            <div className="stat-label">Submitted Store Ratings</div>
            <div className="stat-value">{stats.totalRatings}</div>
          </div>
        </div>
      </div>

      {/* Dashboard Tabs & Filters */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.02)', padding: '0.25rem', borderRadius: '10px', border: '1px solid var(--card-border)' }}>
            <button
              onClick={() => { setActiveTab('users'); setFilterText(''); }}
              style={{
                background: activeTab === 'users' ? 'var(--bg-tertiary)' : 'transparent',
                border: 'none',
                color: '#ffffff',
                fontFamily: 'var(--font-sans)',
                fontWeight: 600,
                fontSize: '0.85rem',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'var(--transition-smooth)'
              }}
            >
              Users Directory
            </button>
            <button
              onClick={() => { setActiveTab('stores'); setFilterText(''); }}
              style={{
                background: activeTab === 'stores' ? 'var(--bg-tertiary)' : 'transparent',
                border: 'none',
                color: '#ffffff',
                fontFamily: 'var(--font-sans)',
                fontWeight: 600,
                fontSize: '0.85rem',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'var(--transition-smooth)'
              }}
            >
              Stores Registry
            </button>
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: '0.75rem', flexGrow: 1, justifyContent: 'flex-end', maxWidth: '600px' }}>
            <div style={{ position: 'relative', flexGrow: 1 }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="form-input"
                placeholder="Search by name, email, address..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                style={{ padding: '0.6rem 0.6rem 0.6rem 2.5rem', fontSize: '0.85rem' }}
              />
            </div>
            
            {activeTab === 'users' && (
              <select
                className="form-input"
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                style={{ width: '150px', padding: '0.6rem', fontSize: '0.85rem' }}
              >
                <option value="">All Roles</option>
                <option value="ADMIN">Admin</option>
                <option value="NORMAL">Normal User</option>
                <option value="STORE_OWNER">Store Owner</option>
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Tables Section */}
      {activeTab === 'users' ? (
        <Table
          columns={userColumns}
          data={users}
          sortBy={userSortBy}
          sortOrder={userSortOrder}
          onSort={handleUserSort}
        />
      ) : (
        <Table
          columns={storeColumns}
          data={stores}
          sortBy={storeSortBy}
          sortOrder={storeSortOrder}
          onSort={handleStoreSort}
        />
      )}

      {/* --- ADD USER DIALOG MODAL --- */}
      {userModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel">
            <div className="modal-header">
              <h3>Add New User Account</h3>
              <button onClick={() => setUserModalOpen(false)} style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddUser}>
              <div className="modal-body">
                {newUserErrors.global && (
                  <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5', padding: '0.5rem', borderRadius: '6px', fontSize: '0.8rem', marginBottom: '1rem', textAlign: 'center' }}>
                    {newUserErrors.global}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    required
                  />
                  <div className="validation-hint">
                    <span className={newUser.name.length >= 20 && newUser.name.length <= 60 ? 'status-indicator valid' : 'status-indicator invalid'}></span>
                    <span>{newUser.name.length} / 60 characters (min 20)</span>
                  </div>
                  {newUserErrors.name && <div className="validation-error">{newUserErrors.name}</div>}
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    required
                  />
                  {newUserErrors.email && <div className="validation-error">{newUserErrors.email}</div>}
                </div>

                <div className="form-group">
                  <label className="form-label">Role</label>
                  <select
                    className="form-input"
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  >
                    <option value="NORMAL">Normal User</option>
                    <option value="ADMIN">Administrator</option>
                    <option value="STORE_OWNER">Store Owner</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Address</label>
                  <textarea
                    className="form-input"
                    value={newUser.address}
                    onChange={(e) => setNewUser({ ...newUser, address: e.target.value })}
                    rows={2}
                    required
                  />
                  <div className="validation-hint">
                    <span className={newUser.address.length > 0 && newUser.address.length <= 400 ? 'status-indicator valid' : 'status-indicator invalid'}></span>
                    <span>{newUser.address.length} / 400 characters</span>
                  </div>
                  {newUserErrors.address && <div className="validation-error">{newUserErrors.address}</div>}
                </div>

                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-input"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    required
                  />
                  <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '6px', padding: '0.5rem', marginTop: '0.5rem', border: '1px solid var(--card-border)', fontSize: '0.7rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: checkPassLength(newUser.password) ? 'var(--success)' : 'var(--text-muted)' }}>
                      {checkPassLength(newUser.password) ? <Check size={12} /> : <X size={12} />}
                      <span>8 - 16 characters</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: checkPassUpper(newUser.password) ? 'var(--success)' : 'var(--text-muted)' }}>
                      {checkPassUpper(newUser.password) ? <Check size={12} /> : <X size={12} />}
                      <span>At least one uppercase letter</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: checkPassSpecial(newUser.password) ? 'var(--success)' : 'var(--text-muted)' }}>
                      {checkPassSpecial(newUser.password) ? <Check size={12} /> : <X size={12} />}
                      <span>At least one special character</span>
                    </div>
                  </div>
                  {newUserErrors.password && <div className="validation-error">{newUserErrors.password}</div>}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setUserModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={formLoading}>
                  {formLoading ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- ADD STORE DIALOG MODAL --- */}
      {storeModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel">
            <div className="modal-header">
              <h3>Register Store and Owner</h3>
              <button onClick={() => setStoreModalOpen(false)} style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddStore}>
              <div className="modal-body">
                {newStoreErrors.global && (
                  <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5', padding: '0.5rem', borderRadius: '6px', fontSize: '0.8rem', marginBottom: '1rem', textAlign: 'center' }}>
                    {newStoreErrors.global}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Store Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newStore.name}
                    onChange={(e) => setNewStore({ ...newStore, name: e.target.value })}
                    required
                  />
                  <div className="validation-hint">
                    <span className={newStore.name.length >= 20 && newStore.name.length <= 60 ? 'status-indicator valid' : 'status-indicator invalid'}></span>
                    <span>{newStore.name.length} / 60 characters (min 20)</span>
                  </div>
                  {newStoreErrors.name && <div className="validation-error">{newStoreErrors.name}</div>}
                </div>

                <div className="form-group">
                  <label className="form-label">Store Contact Email</label>
                  <input
                    type="email"
                    className="form-input"
                    value={newStore.email}
                    onChange={(e) => setNewStore({ ...newStore, email: e.target.value })}
                    required
                  />
                  {newStoreErrors.email && <div className="validation-error">{newStoreErrors.email}</div>}
                </div>

                <div className="form-group">
                  <label className="form-label">Store Address</label>
                  <textarea
                    className="form-input"
                    value={newStore.address}
                    onChange={(e) => setNewStore({ ...newStore, address: e.target.value })}
                    rows={2}
                    required
                  />
                  <div className="validation-hint">
                    <span className={newStore.address.length > 0 && newStore.address.length <= 400 ? 'status-indicator valid' : 'status-indicator invalid'}></span>
                    <span>{newStore.address.length} / 400 characters</span>
                  </div>
                  {newStoreErrors.address && <div className="validation-error">{newStoreErrors.address}</div>}
                </div>

                <div className="form-group">
                  <label className="form-label">Store Owner Password</label>
                  <input
                    type="password"
                    className="form-input"
                    value={newStore.password}
                    onChange={(e) => setNewStore({ ...newStore, password: e.target.value })}
                    required
                  />
                  <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '6px', padding: '0.5rem', marginTop: '0.5rem', border: '1px solid var(--card-border)', fontSize: '0.7rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: checkPassLength(newStore.password) ? 'var(--success)' : 'var(--text-muted)' }}>
                      {checkPassLength(newStore.password) ? <Check size={12} /> : <X size={12} />}
                      <span>8 - 16 characters</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: checkPassUpper(newStore.password) ? 'var(--success)' : 'var(--text-muted)' }}>
                      {checkPassUpper(newStore.password) ? <Check size={12} /> : <X size={12} />}
                      <span>At least one uppercase letter</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: checkPassSpecial(newStore.password) ? 'var(--success)' : 'var(--text-muted)' }}>
                      {checkPassSpecial(newStore.password) ? <Check size={12} /> : <X size={12} />}
                      <span>At least one special character</span>
                    </div>
                  </div>
                  {newStoreErrors.password && <div className="validation-error">{newStoreErrors.password}</div>}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setStoreModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={formLoading}>
                  {formLoading ? 'Creating...' : 'Register Store'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- USER DETAILS DIALOG MODAL --- */}
      {userDetailsModalOpen && selectedUser && (
        <div className="modal-overlay" onClick={() => setUserDetailsModalOpen(false)}>
          <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3>User Details</h3>
              <button onClick={() => setUserDetailsModalOpen(false)} style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Full Name</div>
                  <div style={{ fontSize: '1rem', fontWeight: 600 }}>{selectedUser.name}</div>
                </div>
                
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Email Address</div>
                  <div style={{ fontSize: '1rem', fontWeight: 500 }}>{selectedUser.email}</div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>System Role</div>
                  <div style={{ marginTop: '0.25rem' }}>{getRoleBadge(selectedUser.role)}</div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Postal Address</div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>{selectedUser.address}</div>
                </div>

                {selectedUser.role === 'STORE_OWNER' && (
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Store Average Rating</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <InteractiveStars rating={selectedUser.rating} readonly size={16} />
                      <span className="rating-badge">{selectedUser.rating > 0 ? selectedUser.rating.toFixed(2) : 'Unrated'}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setUserDetailsModalOpen(false)} style={{ width: '100%' }}>
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
