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
      console.log('[Change Password] Sending request...');
      
      const resp = await axios.post('/api/auth/change-password', {
        currentPassword,
        newPassword,
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log('[Change Password] Success:', resp.data);
      setMessage(resp.data?.message || 'Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error('[Change Password] Error:', err);
      console.error('[Change Password] Response:', err.response?.data);
      const errorMsg = err.response?.data?.detail || err.response?.data?.message || err.message || 'Failed to update password';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch current user data from backend to get latest profile picture
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const resp = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (resp.ok) {
          const data = await resp.json();
          if (data.user && data.user.profile_picture) {
            setAvatarPreview(data.user.profile_picture);
            // Update localStorage with latest user data
            const stored = JSON.parse(localStorage.getItem('user') || '{}');
            stored.profile_picture = data.user.profile_picture;
            localStorage.setItem('user', JSON.stringify(stored));
          }
        }
      } catch (err) {
        console.error('Error fetching current user:', err);
      }
    };

    fetchCurrentUser();
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
      
      console.log('Fetching order details:', { orderId, url, isAdmin, token: !!token });
      
      const resp = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Order details response status:', resp.status);
      
      if (!resp.ok) {
        let errMessage = `HTTP ${resp.status}`;
        try {
          const errBody = await resp.json();
          errMessage = errBody.detail || errBody.message || errMessage;
          console.log('Error response body:', errBody);
        } catch (e) {
          const text = await resp.text();
          console.log('Error response text:', text);
        }
        throw new Error(errMessage);
      }
      
      const data = await resp.json();
      console.log('Order details data:', data);
      
      if (!data.order) {
        throw new Error('Invalid order data received from server');
      }
      
      setSelectedOrder(data.order);
      setOrdersError(null);
    } catch (err) {
      console.error('Order details error:', err);
      setOrdersError(err.message || 'Failed to fetch order details');
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
          ) : (
            <div className="orders-list">
              {ordersError && <div className="error-message">{ordersError}</div>}
              {orders.length === 0 && !ordersError ? (
                <div className="empty-orders">
                  <p>No orders found.</p>
                </div>
              ) : (
                <>
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
                      <button className="back-btn" onClick={() => { setSelectedOrder(null); setOrdersError(null); }}>← Back to Orders</button>
                      <div className="receipt-container">
                    <div className="receipt-header">
                      <h2>🎮 GamerX Receipt</h2>
                      <p className="receipt-order-id">Order #{selectedOrder.id}</p>
                    </div>

                    <div className="receipt-section">
                      <h4>Order Information</h4>
                      <div className="receipt-info">
                        <div className="info-row">
                          <span className="label">Order Date:</span>
                          <span className="value">{new Date(selectedOrder.created_at).toLocaleString()}</span>
                        </div>
                        <div className="info-row">
                          <span className="label">Status:</span>
                          <span className="value status">{selectedOrder.status}</span>
                        </div>
                        <div className="info-row">
                          <span className="label">Payment Status:</span>
                          <span className="value">{selectedOrder.payment_status || 'Pending'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="receipt-section">
                      <h4>Items Ordered</h4>
                      <div className="receipt-items">
                        <div className="items-header">
                          <div className="col-name">Product</div>
                          <div className="col-qty">Qty</div>
                          <div className="col-price">Price</div>
                          <div className="col-total">Total</div>
                        </div>
                        {selectedOrder.items && selectedOrder.items.map((item, idx) => (
                          <div key={idx} className="items-row">
                            <div className="col-name">{item.name}</div>
                            <div className="col-qty">{item.quantity}</div>
                            <div className="col-price">Rs {Number(item.price).toFixed(2)}</div>
                            <div className="col-total">Rs {(Number(item.price) * Number(item.quantity)).toFixed(2)}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="receipt-summary">
                      <div className="summary-row">
                        <span>Subtotal:</span>
                        <span>Rs {Number(selectedOrder.total_amount).toFixed(2)}</span>
                      </div>
                      <div className="summary-row total">
                        <span>Total Amount:</span>
                        <span>Rs {Number(selectedOrder.total_amount).toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="receipt-footer">
                      <p>Thank you for your purchase!</p>
                    </div>
                  </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
