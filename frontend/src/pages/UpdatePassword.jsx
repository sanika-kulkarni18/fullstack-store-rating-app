import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Check, X, Lock } from 'lucide-react';

const UpdatePassword = () => {
  const { updatePassword } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const checkPassLength = (pw) => pw.length >= 8 && pw.length <= 16;
  const checkPassUpper = (pw) => /[A-Z]/.test(pw);
  const checkPassSpecial = (pw) => /[^A-Za-z0-9]/.test(pw);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!checkPassLength(password) || !checkPassUpper(password) || !checkPassSpecial(password)) {
      setError("Password does not meet the requirements.");
      return;
    }

    setLoading(true);
    try {
      await updatePassword(password);
      setSuccess("Password updated successfully!");
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.message || "Failed to update password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem 1.5rem' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '450px', padding: '2rem' }}>
        <h2 style={{ marginBottom: '0.5rem', textAlign: 'center' }}>Update Password</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', textAlign: 'center', marginBottom: '1.5rem' }}>
          Choose a secure, strong password for your account.
        </p>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#fca5a5',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            fontSize: '0.85rem',
            marginBottom: '1.25rem',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#a7f3d0',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            fontSize: '0.85rem',
            marginBottom: '1.25rem',
            textAlign: 'center'
          }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">New Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
              <input
                type="password"
                className="form-input"
                placeholder="Enter new password"
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
          </div>

          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label className="form-label">Confirm New Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
              <input
                type="password"
                className="form-input"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdatePassword;
