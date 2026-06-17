import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Check, X, Mail, Lock, User, MapPin } from 'lucide-react';

const LoginRegister = () => {
  const [activeTab, setActiveTab] = useState('login'); // 'login' or 'register'
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  // Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');

  // UI Error State
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Real-time password check helpers
  const checkPassLength = (pw) => pw.length >= 8 && pw.length <= 16;
  const checkPassUpper = (pw) => /[A-Z]/.test(pw);
  const checkPassSpecial = (pw) => /[^A-Za-z0-9]/.test(pw);

  // Validate fields helper
  const validateRegister = () => {
    const errs = {};
    if (name.length < 20 || name.length > 60) {
      errs.name = "Name must be between 20 and 60 characters.";
    }
    if (!email) {
      errs.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = "Email must be a valid email address.";
    }
    if (address.length > 400) {
      errs.address = "Address must not exceed 400 characters.";
    } else if (!address) {
      errs.address = "Address is required.";
    }
    
    if (!checkPassLength(password)) {
      errs.password = "Password must be 8-16 characters.";
    } else if (!checkPassUpper(password)) {
      errs.password = "Password must contain an uppercase letter.";
    } else if (!checkPassSpecial(password)) {
      errs.password = "Password must contain a special character.";
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(loginEmail, loginPassword);
      setLoading(false);
      // Route accordingly based on role
      if (user.role === 'ADMIN' || user.role === 'STORE_OWNER') {
        navigate('/');
      } else {
        navigate('/');
      }
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Login failed. Please check your credentials.');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    if (!validateRegister()) {
      return;
    }

    setLoading(true);
    try {
      await signup(name, email, address, password);
      setLoading(false);
      navigate('/');
    } catch (err) {
      setLoading(false);
      if (err.errors) {
        setFieldErrors(err.errors);
      } else {
        setError(err.message || 'Registration failed.');
      }
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card glass-panel">
        <div className="auth-tabs">
          <button
            className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => { setActiveTab('login'); setError(''); setFieldErrors({}); }}
          >
            Login
          </button>
          <button
            className={`auth-tab ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => { setActiveTab('register'); setError(''); setFieldErrors({}); }}
          >
            Register
          </button>
        </div>

        <div className="auth-body">
          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#fca5a5',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              marginBottom: '1.5rem',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          {activeTab === 'login' ? (
            <form onSubmit={handleLoginSubmit}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
                  <input
                    type="email"
                    className="form-input"
                    placeholder="name@example.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    style={{ paddingLeft: '2.5rem' }}
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '2rem' }}>
                <label className="form-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
                  <input
                    type="password"
                    className="form-input"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    style={{ paddingLeft: '2.5rem' }}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.75rem' }}
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Sign In'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Min 20, Max 60 characters"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ paddingLeft: '2.5rem' }}
                    required
                  />
                </div>
                <div className="validation-hint">
                  <span className={name.length >= 20 && name.length <= 60 ? 'status-indicator valid' : 'status-indicator invalid'}></span>
                  <span style={{ color: (name.length < 20 || name.length > 60) && name.length > 0 ? 'var(--danger)' : 'var(--text-muted)' }}>
                    {name.length} / 60 characters (min 20)
                  </span>
                </div>
                {fieldErrors.name && <div className="validation-error">{fieldErrors.name}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
                  <input
                    type="email"
                    className="form-input"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ paddingLeft: '2.5rem' }}
                    required
                  />
                </div>
                {fieldErrors.email && <div className="validation-error">{fieldErrors.email}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">Address</label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
                  <textarea
                    className="form-input"
                    placeholder="Max 400 characters address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows={3}
                    style={{ paddingLeft: '2.5rem', resize: 'vertical' }}
                    required
                  />
                </div>
                <div className="validation-hint">
                  <span className={address.length > 0 && address.length <= 400 ? 'status-indicator valid' : 'status-indicator invalid'}></span>
                  <span style={{ color: address.length > 400 ? 'var(--danger)' : 'var(--text-muted)' }}>
                    {address.length} / 400 characters
                  </span>
                </div>
                {fieldErrors.address && <div className="validation-error">{fieldErrors.address}</div>}
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Choose a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ paddingLeft: '2.5rem' }}
                    required
                  />
                </div>
                
                {/* Real-time Checklist */}
                <div style={{
                  background: 'rgba(255,255,255,0.02)',
                  borderRadius: '8px',
                  padding: '0.75rem',
                  marginTop: '0.75rem',
                  border: '1px solid var(--card-border)',
                  fontSize: '0.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.35rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: checkPassLength(password) ? 'var(--success)' : 'var(--text-muted)' }}>
                    {checkPassLength(password) ? <Check size={14} /> : <X size={14} style={{ color: password.length > 0 ? 'var(--danger)' : 'var(--text-muted)' }} />}
                    <span>8 - 16 characters ({password.length})</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: checkPassUpper(password) ? 'var(--success)' : 'var(--text-muted)' }}>
                    {checkPassUpper(password) ? <Check size={14} /> : <X size={14} style={{ color: password.length > 0 ? 'var(--danger)' : 'var(--text-muted)' }} />}
                    <span>At least one uppercase letter</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: checkPassSpecial(password) ? 'var(--success)' : 'var(--text-muted)' }}>
                    {checkPassSpecial(password) ? <Check size={14} /> : <X size={14} style={{ color: password.length > 0 ? 'var(--danger)' : 'var(--text-muted)' }} />}
                    <span>At least one special character</span>
                  </div>
                </div>
                {fieldErrors.password && <div className="validation-error">{fieldErrors.password}</div>}
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.75rem' }}
                disabled={loading}
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginRegister;
