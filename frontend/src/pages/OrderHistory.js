import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './OrderHistory.css';

function OrderHistory({ onLogout, isAuthenticated }) {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const user = isAuthenticated ? JSON.parse(localStorage.getItem('user') || '{}') : null;

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [isAuthenticated, navigate]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/orders/history', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      setOrders(data.orders || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderDetails = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch order details');
      }

      const data = await response.json();
      setSelectedOrder(data.order);
    } catch (err) {
      console.error('Error fetching order details:', err);
      alert('Error fetching order details: ' + err.message);
    }
  };

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const handleViewCart = () => {
    navigate('/cart');
  };

  const handleViewDashboard = () => {
    navigate('/dashboard');
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'confirmed':
        return '#28a745';
      case 'pending':
        return '#ffc107';
      case 'success':
        return '#28a745';
      case 'cancelled':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'confirmed': '✓ Confirmed',
      'pending': '⏳ Pending',
      'success': '✓ Success',
      'cancelled': '✕ Cancelled'
    };
    return badges[status] || status;
  };

  const categories = [
    'All categories',
    'Mobile phones',
    'Laptops',
    'Speakers',
    'Smart Watch',
    'RGB Lights',
    'Earbuds',
    'PC Build'
  ];

  return (
    <div className="dashboard-container">
      {/* Main Navbar */}
      <nav className="navbar">
        <div className="navbar-left">
          <div className="logo">🎮 GAMEGEARX</div>
        </div>

        <div className="search-container">
          <input type="text" placeholder="What are you looking for?" className="search-bar" />
          <button className="search-btn">🔍</button>
        </div>

        <div className="navbar-right">
          <button className="nav-icon-btn" onClick={handleViewCart}>
            <span>🛒</span>
            <span>My Cart</span>
          </button>
          <button className="nav-icon-btn active" onClick={() => {}}>
            <span>📦</span>
            <span>{isAuthenticated && user?.username ? user.username : 'My Account'}</span>
          </button>
          {isAuthenticated && (
            <button className="logout-btn-nav" onClick={handleLogout}>
              Logout
            </button>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <div className="dashboard-content">
        <div className="content-wrapper">
          {/* Sidebar Categories */}
          <aside className="sidebar">
            {categories.map((category) => (
              <button
                key={category}
                className="category-btn"
                onClick={handleViewDashboard}
              >
                {category}
              </button>
            ))}
          </aside>

          {/* Main Content Area */}
          <div className="main-area">
            {/* Header */}
            <div className="order-header">
              <h1>📦 My Orders</h1>
              <p>Track and manage your orders here</p>
            </div>

            {/* Content */}
            {loading ? (
              <div className="loading">
                <p>Loading your orders...</p>
              </div>
            ) : error ? (
              <div className="error-message">
                <p>Error: {error}</p>
                <button onClick={fetchOrders} className="retry-btn">Retry</button>
              </div>
            ) : orders.length === 0 ? (
              <div className="empty-orders">
                <div className="empty-icon">📦</div>
                <h2>No Orders Yet</h2>
                <p>You haven't placed any orders yet.</p>
                <button className="continue-shopping-btn" onClick={handleViewDashboard}>
                  Continue Shopping
                </button>
              </div>
            ) : (
              <div className="orders-container">
                {!selectedOrder ? (
                  <div className="orders-list">
                    {orders.map((order) => (
                      <div key={order.id} className="order-card">
                        <div className="order-card-header">
                          <div>
                            <h3>Order #{order.id}</h3>
                            <p className="order-date">
                              {new Date(order.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                          <div className="order-status" style={{ color: getStatusColor(order.status) }}>
                            {getStatusBadge(order.status)}
                          </div>
                        </div>
                        
                        <div className="order-card-body">
                          <div className="order-info">
                            <div className="info-item">
                              <span className="label">Items:</span>
                              <span className="value">{order.item_count}</span>
                            </div>
                            <div className="info-item">
                              <span className="label">Total:</span>
                              <span className="value total">Rs {Number(order.total_amount).toFixed(2)}</span>
                            </div>
                            <div className="info-item">
                              <span className="label">Payment:</span>
                              <span className="value">{order.payment_method || 'Card'}</span>
                            </div>
                          </div>
                        </div>

                        <div className="order-card-footer">
                          <button 
                            className="view-details-btn"
                            onClick={() => fetchOrderDetails(order.id)}
                          >
                            View Details →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="order-details">
                    <button 
                      className="back-btn"
                      onClick={() => setSelectedOrder(null)}
                    >
                      ← Back to Orders
                    </button>

                    <div className="detail-header">
                      <h2>Order #{selectedOrder.id} Details</h2>
                      <div className="detail-status" style={{ color: getStatusColor(selectedOrder.status) }}>
                        {getStatusBadge(selectedOrder.status)}
                      </div>
                    </div>

                    <div className="detail-grid">
                      <div className="detail-section">
                        <h3>Order Information</h3>
                        <div className="detail-row">
                          <span>Order Date:</span>
                          <span>{new Date(selectedOrder.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}</span>
                        </div>
                        <div className="detail-row">
                          <span>Total Amount:</span>
                          <span className="total">Rs {Number(selectedOrder.total_amount).toFixed(2)}</span>
                        </div>
                        <div className="detail-row">
                          <span>Payment Method:</span>
                          <span>{selectedOrder.payment_method || 'Card'}</span>
                        </div>
                      </div>

                      {selectedOrder.payment && (
                        <div className="detail-section">
                          <h3>Payment Status</h3>
                          <div className="detail-row">
                            <span>Status:</span>
                            <span style={{ color: getStatusColor(selectedOrder.payment.status) }}>
                              {getStatusBadge(selectedOrder.payment.status)}
                            </span>
                          </div>
                          {selectedOrder.payment.transaction_id && (
                            <div className="detail-row">
                              <span>Transaction ID:</span>
                              <span>{selectedOrder.payment.transaction_id}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {selectedOrder.items && selectedOrder.items.length > 0 && (
                      <div className="detail-items">
                        <h3>Items in this Order</h3>
                        <div className="items-list">
                          {selectedOrder.items.map((item, idx) => (
                            <div key={idx} className="detail-item">
                              {item.image && (
                                <img src={item.image} alt={item.name} className="item-image" />
                              )}
                              <div className="item-details">
                                <h4>{item.name}</h4>
                                <p>Quantity: {item.quantity}</p>
                                <p className="item-price">Rs {Number(item.price).toFixed(2)}</p>
                              </div>
                              <div className="item-total">
                                Rs {Number(item.price * item.quantity).toFixed(2)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>


    </div>
  );
}

export default OrderHistory;
