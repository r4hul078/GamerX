import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Cart.css';

function Cart({ onLogout, isAuthenticated }) {
  const navigate = useNavigate();
  const user = isAuthenticated ? JSON.parse(localStorage.getItem('user') || '{}') : null;

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const handleMyAccount = () => {
    if (!isAuthenticated) {
      navigate('/login');
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

  // Mock cart items - in a real app, this would come from state/context
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: 'Gaming Mouse RGB',
      price: 45.99,
      quantity: 2,
      image: '/images/mouse.jpg',
      category: 'PC Accessories'
    },
    {
      id: 2,
      name: 'Mechanical Keyboard',
      price: 89.99,
      quantity: 1,
      image: '/images/keyboard.jpg',
      category: 'PC Accessories'
    },
    {
      id: 3,
      name: 'Gaming Headset',
      price: 79.99,
      quantity: 1,
      image: '/images/headset.jpg',
      category: 'Audio'
    }
  ]);

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity <= 0) {
      removeItem(id);
      return;
    }
    setCartItems(cartItems.map(item =>
      item.id === id ? { ...item, quantity: newQuantity } : item
    ));
  };

  const removeItem = (id) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

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
                        <img src={item.image} alt={item.name} onError={(e) => {
                          e.target.src = '/images/placeholder.jpg';
                        }} />
                      </div>
                      <div className="cart-item-details">
                        <h3>{item.name}</h3>
                        <p className="cart-item-category">{item.category}</p>
                        <div className="cart-item-price">₹{item.price.toFixed(2)}</div>
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
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </div>
                      <button
                        className="remove-btn"
                        onClick={() => removeItem(item.id)}
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
                      <span>₹{getTotalPrice().toFixed(2)}</span>
                    </div>
                    <div className="summary-row">
                      <span>Shipping:</span>
                      <span>Free</span>
                    </div>
                    <div className="summary-row total">
                      <span>Total:</span>
                      <span>₹{getTotalPrice().toFixed(2)}</span>
                    </div>
                    <div className="cart-actions">
                      <button className="continue-shopping-btn" onClick={() => navigate('/dashboard')}>
                        Continue Shopping
                      </button>
                      <button className="checkout-btn">
                        Proceed to Checkout
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Logout Button */}
      {isAuthenticated && (
        <button onClick={handleLogout} className="logout-btn-float">
          Logout
        </button>
      )}
    </div>
  );
}

export default Cart;