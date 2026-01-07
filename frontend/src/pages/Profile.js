import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Profile.css';

function Profile() {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Password reset will be added in a follow-up commit
  const handleReset = async (e) => {
    e.preventDefault();
    alert('Password reset feature coming soon');
  };

  return (
    <div className="profile-page">
      <div className="profile-hero">
        <div className="profile-card">
          <div className="profile-header">
            <h1>Profile</h1>
            <p className="profile-sub">Manage your account</p>
          </div>

          <div className="profile-info">
            <div className="info-row"><strong>Username:</strong> {user?.username || '-'}</div>
            <div className="info-row"><strong>Email:</strong> {user?.email || '-'}</div>
          </div>

          <hr />

          <form className="reset-form" onSubmit={handleReset}>
            {error && <div className="error-message">{error}</div>}
            {message && <div className="success-message">{message}</div>}

            <div className="input-group">
              <label>Current Password</label>
              <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
            </div>

            <div className="input-group">
              <label>New Password</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={8} />
            </div>

            <div className="input-group">
              <label>Confirm New Password</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={8} />
            </div>

            <div className="profile-actions">
              <button type="submit" className="gradient-btn" disabled={loading}>{loading ? 'Saving...' : 'Reset Password'}</button>
              <button type="button" className="continue-shopping-btn" onClick={() => navigate('/dashboard')}>Back to Shop</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Profile;
