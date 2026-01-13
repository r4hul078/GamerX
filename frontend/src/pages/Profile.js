import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Profile.css';
import { useTheme } from '../contexts/ThemeContext';

function Profile() {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState(null);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const { theme } = useTheme();

  const handleReset = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const resp = await axios.post('/api/auth/change-password', {
        currentPassword,
        newPassword,
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setMessage(resp.data?.message || 'Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // load avatar preview from user if exists
    if (user && user.profile_picture) setAvatarPreview(user.profile_picture);
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      const token = localStorage.getItem('token');
      const resp = await fetch('/api/orders/history', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!resp.ok) throw new Error('Failed to fetch orders');
      const data = await resp.json();
      setOrders(data.orders || []);
    } catch (err) {
      setOrdersError(err.message || 'Failed to load orders');
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchOrderDetails = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      const isAdmin = user?.role === 'admin';
      const url = isAdmin ? `/api/orders/admin/order-details/${orderId}` : `/api/orders/${orderId}`;
      const resp = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!resp.ok) {
        const errBody = await resp.json().catch(() => ({}));
        throw new Error(errBody.message || 'Failed to fetch order details');
      }
      const data = await resp.json();
      setSelectedOrder(data.order);
    } catch (err) {
      console.error('Order details error:', err);
      alert(err.message || 'Failed to fetch details');
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleUploadAvatar = async () => {
    if (!avatarFile) return setError('Select an image first');
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const fd = new FormData();
      fd.append('avatar', avatarFile);
      const resp = await axios.post('/api/auth/upload-profile', fd, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      const newPath = resp.data.profile_picture;
      // update localStorage user object
      const stored = JSON.parse(localStorage.getItem('user') || '{}');
      stored.profile_picture = newPath;
      localStorage.setItem('user', JSON.stringify(stored));
      setMessage('Profile image updated');
      setAvatarFile(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`profile-page ${theme === 'dark' ? 'dark' : 'light'}`}>
      <div className="profile-hero">
        <div className="profile-card">
          <div className="profile-header">
            <h1>Profile</h1>
            <p className="profile-sub">Manage your account</p>
          </div>
          <div className="profile-layout">
            <div className="profile-left">
              <div className="profile-summary">
                <div className="avatar-ring">
                   <img className="avatar-img" src={avatarPreview || '/assets/default-avatar.svg'} alt="avatar" />
                </div>
                <h2 className="profile-name">{user?.username || 'User'}</h2>
                <div className="profile-role">{user?.role === 'admin' ? 'Administrator' : 'Premium User'}</div>

                <div className="avatar-upload">
                  <input type="file" accept="image/*" id="avatarInput" onChange={handleAvatarChange} />
                  <div className="avatar-actions">
                    <button className="small-btn" type="button" onClick={handleUploadAvatar}>Upload</button>
                    <button className="small-btn" type="button" onClick={() => { setAvatarPreview(user?.profile_picture || null); setAvatarFile(null); }}>Reset</button>
                  </div>
                </div>
              </div>
            </div>

            <div className="profile-right">
              <div className="profile-details">
                <h3>Bio & other details</h3>
                <div className="details-grid">
                  <div className="detail-item"><span className="label">My Role</span><span className="value">{user?.role || '-'}</span></div>
                  <div className="detail-item"><span className="label">Email</span><span className="value">{user?.email || '-'}</span></div>
                  <div className="detail-item"><span className="label">My Experience Level</span><span className="value">-</span></div>
                  <div className="detail-item"><span className="label">My Favorite Artists</span><span className="value">-</span></div>
                  <div className="detail-item"><span className="label">My City or Region</span><span className="value">-</span></div>
                  <div className="detail-item"><span className="label">Availability</span><span className="value available">Available for Collaboration</span></div>
                </div>
              </div>
            </div>
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
        {/* Orders Card */}
        <div className="orders-card">
          <div className="orders-header">
            <h2>Your Orders</h2>
            <p className="profile-sub">Recent purchases and their details</p>
          </div>

          {ordersLoading ? (
            <div className="loading">Loading orders...</div>
          ) : ordersError ? (
            <div className="error-message">{ordersError}</div>
          ) : orders.length === 0 ? (
            <div className="empty-orders">
              <p>No orders found.</p>
            </div>
          ) : (
            <div className="orders-list">
              {!selectedOrder ? (
                orders.map((order) => (
                  <div className="order-card" key={order.id}>
                    <div className="order-row">
                      <div>
                        <strong>Order #{order.id}</strong>
                        <div className="order-date">{new Date(order.created_at).toLocaleDateString()}</div>
                      </div>
                      <div className="order-actions">
                        <button className="small-btn" onClick={() => fetchOrderDetails(order.id)}>View</button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="order-details">
                  <button className="small-btn" onClick={() => setSelectedOrder(null)}>← Back to Orders</button>
                  <h3>Order #{selectedOrder.id}</h3>
                  <p>Total: Rs {Number(selectedOrder.total_amount).toFixed(2)}</p>
                  {selectedOrder.items && selectedOrder.items.map((it, idx) => (
                    <div key={idx} className="order-item">
                      <div>{it.name}</div>
                      <div>Qty: {it.quantity}</div>
                      <div>Rs {Number(it.price).toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
