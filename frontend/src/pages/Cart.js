import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import './Cart.css';

function Cart({ onLogout, isAuthenticated }) {
  const navigate = useNavigate();
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    getTotalItems,
    getTotalPrice,
    clearCart
  } = useCart();

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [confirmationToken, setConfirmationToken] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('card');

  const user = isAuthenticated ? JSON.parse(localStorage.getItem('user') || '{}') : null;

  const handlePayment = async () => {
    if (!isAuthenticated) {
      alert('Please login to proceed with payment');
      navigate('/login');
      return;
    }

    if (cartItems.length === 0) {
      alert('Your cart is empty');
      return;
    }

    setPaymentLoading(true);
    try {
      // Create order
      const token = localStorage.getItem('token');
      const createOrderResponse = await fetch('http://localhost:5000/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          cartItems,
          totalAmount: getTotalPrice(),
          paymentMethod
        })
      });

      if (!createOrderResponse.ok) {
        throw new Error('Failed to create order');
      }

      const orderData = await createOrderResponse.json();
      setOrderId(orderData.orderId);
      setConfirmationToken(orderData.confirmationToken);
      
      // Show success message
      setPaymentSuccess(true);
      setTimeout(() => {
        setPaymentSuccess(false);
        handleConfirmPayment(orderData.orderId, orderData.confirmationToken);
      }, 2000);
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed: ' + error.message);
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleConfirmPayment = async (oId, token) => {
    try {
      const authToken = localStorage.getItem('token');
      const confirmResponse = await fetch(`http://localhost:5000/api/orders/confirm-payment/${oId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          confirmationToken: token
        })
      });

      if (!confirmResponse.ok) {
        throw new Error('Failed to confirm payment');
      }

      alert('✅ Payment Successful! Your order has been confirmed.');
      clearCart();
      setShowPaymentModal(false);
      navigate('/orders');
    } catch (error) {
      console.error('Confirmation error:', error);
      alert('Error confirming payment: ' + error.message);
    }
  };

  const handleMyAccount = () => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      navigate('/profile');
    }
  };

  const handleViewCart = () => {
    // Already on cart page
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
      {/* Top Header */}
      <div className="top-header">
        <div className="top-header-left">
          <a href="#about">About Us</a>
          <span className="divider">|</span>
          <a href="#privacy">Privacy Policy</a>
        </div>
        <div className="top-header-right">
          <a href="#warranty">Warranty</a>
          <span className="divider">|</span>
          <span className="customer-service">Customer's Service: +977-9800000000000</span>
        </div>
      </div>

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
          <button className="nav-icon-btn active" onClick={handleViewCart}>
            <span>🛒</span>
            <span>My Cart ({getTotalItems()})</span>
          </button>
          <button className="nav-icon-btn" onClick={handleMyAccount}>
            <span>👤</span>
            <span>{isAuthenticated && user?.username ? user.username : 'My Account'}</span>
          </button>
          {isAuthenticated && (
            <button className="logout-btn-nav" onClick={onLogout}>
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
                onClick={() => navigate('/dashboard')} // Navigate back to dashboard
              >
                {category}
              </button>
            ))}
          </aside>

          {/* Main Content Area */}
          <div className="main-area">
            {/* Cart Header */}
            <div className="cart-header">
              <h1>Shopping Cart</h1>
              <p>{getTotalItems()} item(s) in your cart</p>
            </div>

            {/* Cart Items */}
            {cartItems.length === 0 ? (
              <div className="empty-cart">
                <div className="empty-cart-icon">🛒</div>
                <h2>Your cart is empty</h2>
                <p>Add some products to get started!</p>
                <button className="continue-shopping-btn" onClick={() => navigate('/dashboard')}>
                  Continue Shopping
                </button>
              </div>
            ) : (
              <>
                <div className="cart-items">
                  {cartItems.map((item) => (
                    <div key={item.id} className="cart-item">
                      <div className="cart-item-image">
                        <img
                          src={item.image || item.image_url || item.imageUrl || '/images/placeholder.jpg'}
                          alt={item.name}
                          onError={(e) => { e.target.src = '/images/placeholder.jpg'; }}
                        />
                      </div>
                      <div className="cart-item-details">
                        <h3>{item.name}</h3>
                        <p className="cart-item-category">{item.category}</p>
                        <div className="cart-item-price">{isNaN(Number(item.price)) ? '-' : `Rs ${Number(item.price).toFixed(2)}`}</div>
                      </div>
                      <div className="cart-item-quantity">
                        <button
                          className="quantity-btn"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          -
                        </button>
                        <span className="quantity-value">{item.quantity}</span>
                        <button
                          className="quantity-btn"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                      <div className="cart-item-total">
                        {isNaN(Number(item.price)) ? '-' : `Rs ${Number(item.price * item.quantity).toFixed(2)}`}
                      </div>
                      <button
                        className="remove-btn"
                        onClick={() => removeFromCart(item.id)}
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>

                {/* Cart Summary */}
                <div className="cart-summary">
                  <div className="cart-summary-content">
                    <div className="summary-row">
                      <span>Subtotal ({getTotalItems()} items):</span>
                      <span>{isNaN(Number(getTotalPrice())) ? '-' : `Rs ${Number(getTotalPrice()).toFixed(2)}`}</span>
                    </div>
                    <div className="summary-row">
                      <span>Shipping:</span>
                      <span>Free</span>
                    </div>
                    <div className="summary-row total">
                      <span>Total:</span>
                      <span>{isNaN(Number(getTotalPrice())) ? '-' : `Rs ${Number(getTotalPrice()).toFixed(2)}`}</span>
                    </div>
                    <div className="cart-actions">
                      <button className="continue-shopping-btn" onClick={() => navigate('/dashboard')}>
                        Continue Shopping
                      </button>
                      <button className="payment-btn" onClick={() => setShowPaymentModal(true)}>
                        💳 Pay Now
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>



      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="payment-modal-overlay">
          <div className="payment-modal">
            {paymentSuccess ? (
              <div className="payment-success">
                <div className="success-icon">✓</div>
                <h2>Payment Successful!</h2>
                <p>Your order has been confirmed</p>
                <p className="order-id">Order ID: {orderId}</p>
              </div>
            ) : (
              <>
                <div className="modal-header">
                  <h2>Complete Your Payment</h2>
                  <button className="modal-close" onClick={() => setShowPaymentModal(false)}>✕</button>
                </div>

                <div className="modal-body">
                  <div className="payment-summary">
                    <h3>Order Summary</h3>
                    <div className="summary-item">
                      <span>Items:</span>
                      <span>{getTotalItems()}</span>
                    </div>
                    <div className="summary-item">
                      <span>Subtotal:</span>
                      <span>Rs {Number(getTotalPrice()).toFixed(2)}</span>
                    </div>
                    <div className="summary-item">
                      <span>Shipping:</span>
                      <span>Free</span>
                    </div>
                    <div className="summary-item total">
                      <span>Total Amount:</span>
                      <span>Rs {Number(getTotalPrice()).toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="payment-method">
                    <h3>Payment Method</h3>
                    <div className="method-options">
                      <label className="method-option">
                        <input 
                          type="radio" 
                          value="card" 
                          checked={paymentMethod === 'card'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                        />
                        <span>Credit/Debit Card</span>
                      </label>
                      <label className="method-option">
                        <input 
                          type="radio" 
                          value="wallet" 
                          checked={paymentMethod === 'wallet'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                        />
                        <span>Digital Wallet</span>
                      </label>
                    </div>
                  </div>

                  <div className="payment-info">
                    <p className="info-text">
                      ℹ️ Payment will be automatically confirmed. No additional fees will be charged.
                    </p>
                  </div>
                </div>

                <div className="modal-footer">
                  <button 
                    className="btn-cancel" 
                    onClick={() => setShowPaymentModal(false)}
                    disabled={paymentLoading}
                  >
                    Cancel
                  </button>
                  <button 
                    className="btn-pay" 
                    onClick={handlePayment}
                    disabled={paymentLoading}
                  >
                    {paymentLoading ? 'Processing...' : `Pay Rs ${Number(getTotalPrice()).toFixed(2)}`}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    {/* Logout Button */}
    {isAuthenticated && (
      <button onClick={() => {
        onLogout();
        navigate('/login');
      }} className="logout-btn-float">
        Logout
      </button>
    )}

    </div>
  );
}

export default Cart;