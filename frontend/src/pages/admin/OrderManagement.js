import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './OrderManagement.css';

function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchAllOrders();
  }, []);

  const fetchAllOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/orders/admin/all-orders');
      setOrders(response.data.orders);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch orders');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderDetails = async (orderId) => {
    try {
      const response = await api.get(`/orders/admin/order-details/${orderId}`);
      setSelectedOrder(response.data.order);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch order details');
      console.error('Error fetching order details:', err);
    }
  };

  const getFilteredOrders = () => {
    if (filter === 'all') return orders;
    return orders.filter(order => order.status === filter);
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      pending: { bg: '#ff9800', text: 'Pending' },
      confirmed: { bg: '#4caf50', text: 'Confirmed' },
      shipped: { bg: '#2196f3', text: 'Shipped' },
      delivered: { bg: '#4caf50', text: 'Delivered' },
      cancelled: { bg: '#f44336', text: 'Cancelled' }
    };
    const style = statusStyles[status] || statusStyles.pending;
    return style;
  };

  const handleCloseDetails = () => {
    setSelectedOrder(null);
  };

  const filteredOrders = getFilteredOrders();

  return (
    <div className="order-management">
      <div className="order-header">
        <h2>📋 Order Management</h2>
        <button className="btn-refresh" onClick={fetchAllOrders}>
          🔄 Refresh
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="order-filters">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({orders.length})
        </button>
        <button
          className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pending ({orders.filter(o => o.status === 'pending').length})
        </button>
        <button
          className={`filter-btn ${filter === 'confirmed' ? 'active' : ''}`}
          onClick={() => setFilter('confirmed')}
        >
          Confirmed ({orders.filter(o => o.status === 'confirmed').length})
        </button>
        <button
          className={`filter-btn ${filter === 'shipped' ? 'active' : ''}`}
          onClick={() => setFilter('shipped')}
        >
          Shipped ({orders.filter(o => o.status === 'shipped').length})
        </button>
      </div>

      <div className="order-container">
        {loading ? (
          <div className="loading">Loading orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="no-orders">No orders found</div>
        ) : (
          <div className="orders-list">
            <div className="orders-table">
              <div className="table-header">
                <div className="table-cell">Order ID</div>
                <div className="table-cell">Customer</div>
                <div className="table-cell">Amount</div>
                <div className="table-cell">Items</div>
                <div className="table-cell">Status</div>
                <div className="table-cell">Payment</div>
                <div className="table-cell">Date</div>
                <div className="table-cell">Action</div>
              </div>

              {filteredOrders.map(order => (
                <div key={order.id} className="table-row">
                  <div className="table-cell">#{order.id}</div>
                  <div className="table-cell">
                    <div className="customer-info">
                      <strong>{order.username}</strong>
                      <small>{order.email}</small>
                    </div>
                  </div>
                  <div className="table-cell">
                    <strong>${order.total_amount.toFixed(2)}</strong>
                  </div>
                  <div className="table-cell">
                    <span className="item-count">{order.item_count} items</span>
                  </div>
                  <div className="table-cell">
                    <span
                      className="status-badge"
                      style={{ backgroundColor: getStatusBadge(order.status).bg }}
                    >
                      {getStatusBadge(order.status).text}
                    </span>
                  </div>
                  <div className="table-cell">
                    <span
                      className="payment-badge"
                      style={{
                        backgroundColor:
                          order.payment_status === 'success' ? '#4caf50' : '#ff9800'
                      }}
                    >
                      {order.payment_status || 'Pending'}
                    </span>
                  </div>
                  <div className="table-cell">
                    <small>{new Date(order.created_at).toLocaleDateString()}</small>
                  </div>
                  <div className="table-cell">
                    <button
                      className="btn-view"
                      onClick={() => fetchOrderDetails(order.id)}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {selectedOrder && (
        <div className="order-details-modal">
          <div className="modal-overlay" onClick={handleCloseDetails} />
          <div className="modal-content">
            <div className="modal-header">
              <h3>Order Details - #{selectedOrder.id}</h3>
              <button className="btn-close" onClick={handleCloseDetails}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="order-info-section">
                <h4>Customer Information</h4>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Username:</label>
                    <span>{selectedOrder.username}</span>
                  </div>
                  <div className="info-item">
                    <label>Email:</label>
                    <span>{selectedOrder.email}</span>
                  </div>
                  <div className="info-item">
                    <label>Order Date:</label>
                    <span>{new Date(selectedOrder.created_at).toLocaleString()}</span>
                  </div>
                  <div className="info-item">
                    <label>Order Status:</label>
                    <span
                      className="status-badge"
                      style={{ backgroundColor: getStatusBadge(selectedOrder.status).bg }}
                    >
                      {getStatusBadge(selectedOrder.status).text}
                    </span>
                  </div>
                </div>
              </div>

              <div className="order-info-section">
                <h4>Payment Information</h4>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Payment Method:</label>
                    <span>{selectedOrder.payment_method || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <label>Total Amount:</label>
                    <span className="amount">${selectedOrder.total_amount.toFixed(2)}</span>
                  </div>
                  {selectedOrder.payment && (
                    <>
                      <div className="info-item">
                        <label>Payment Status:</label>
                        <span
                          className="payment-badge"
                          style={{
                            backgroundColor:
                              selectedOrder.payment.status === 'success'
                                ? '#4caf50'
                                : '#ff9800'
                          }}
                        >
                          {selectedOrder.payment.status}
                        </span>
                      </div>
                      <div className="info-item">
                        <label>Transaction ID:</label>
                        <span>{selectedOrder.payment.transaction_id || 'N/A'}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="order-info-section">
                <h4>Order Items</h4>
                <div className="items-table">
                  <div className="items-header">
                    <div>Product</div>
                    <div>Quantity</div>
                    <div>Price</div>
                    <div>Total</div>
                  </div>
                  {selectedOrder.items && selectedOrder.items.map(item => (
                    <div key={item.id} className="items-row">
                      <div className="item-product">
                        {item.image && (
                          <img src={item.image} alt={item.name} className="item-image" />
                        )}
                        <span>{item.name}</span>
                      </div>
                      <div>{item.quantity}</div>
                      <div>${item.price.toFixed(2)}</div>
                      <div className="item-total">
                        ${(item.quantity * item.price).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-close-modal" onClick={handleCloseDetails}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderManagement;
