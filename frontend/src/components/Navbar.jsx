import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User as UserIcon, Store as StoreIcon, ShieldAlert } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
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

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <StoreIcon size={24} className="pulse" />
        <span>RateSphere</span>
      </Link>
      
      <div className="navbar-menu">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <UserIcon size={16} style={{ color: 'var(--text-secondary)' }} />
          <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{user.name}</span>
          {getRoleBadge(user.role)}
        </div>

        {user.role === 'NORMAL' && (
          <>
            <Link to="/" className="navbar-link">Stores</Link>
            <Link to="/update-password" className="navbar-link">Security</Link>
          </>
        )}

        {user.role === 'STORE_OWNER' && (
          <>
            <Link to="/" className="navbar-link">Dashboard</Link>
            <Link to="/update-password" className="navbar-link">Security</Link>
          </>
        )}

        <button className="btn btn-secondary" onClick={handleLogout} style={{ padding: '0.5rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <LogOut size={16} />
          <span style={{ fontSize: '0.85rem' }}>Logout</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
