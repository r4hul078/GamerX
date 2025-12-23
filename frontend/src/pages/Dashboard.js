import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import api from '../services/api';
import AdminDashboard from './AdminDashboard';
import './Dashboard.css';

function Dashboard({ onLogout, isAuthenticated }) {
  const navigate = useNavigate();
  const { addToCart, getTotalItems } = useCart();
  const [activeCategory, setActiveCategory] = useState('All categories');
  const [categories, setCategories] = useState(['All categories']);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = isAuthenticated ? JSON.parse(localStorage.getItem('user') || '{}') : null;

  // If user is admin, show admin dashboard instead
  if (user && user.role === 'admin') {
    return <AdminDashboard onLogout={onLogout} isAuthenticated={isAuthenticated} />;
  }

  useEffect(() => {
    fetchCategories();
    fetchProducts('All categories');
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories/list/all');
      const categoryNames = response.data.map(cat => cat.name);
      setCategories(['All categories', ...categoryNames]);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories(['All categories']);
    }
  };

  const fetchProducts = async (category) => {
    setLoading(true);
    try {
      let response;
      if (category === 'All categories') {
        response = await api.get('/products/list/all');
      } else {
        response = await api.get(`/products/list/category/${category}`);
      }
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (category) => {
    setActiveCategory(category);
    fetchProducts(category);
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    addToCart(product);
    alert(`${product.name} added to cart!`);
  };

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const handleMyAccount = () => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  };

  const handleCartClick = () => {
    navigate('/cart');
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
          <button className="nav-icon-btn" onClick={handleCartClick}>
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
                className={`category-btn ${activeCategory === category ? 'active' : ''}`}
                onClick={() => handleCategoryClick(category)}
              >
                -{category}
              </button>
            ))}
          </aside>

          {/* Main Content Area */}
          <div className="main-area">
            {/* Banner */}
            <div className="banner">
              <div className="banner-content">
                <p className="banner-subtitle">A remarkable variety of</p>
                <h1 className="banner-title">{activeCategory}</h1>
              </div>
              <div className="banner-image">
                {/* Image would go here */}
              </div>
            </div>

            {/* Products Grid */}
            <div className="deals-grid">
              {loading ? (
                <p className="loading">Loading products...</p>
              ) : products.length === 0 ? (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>
                  <p style={{ fontSize: '18px', color: '#666' }}>
                    There are no products here
                  </p>
                </div>
              ) : (
                products.map((product) => (
                  <div
                    key={product.id}
                    className="product-card deal-card"
                    onClick={() => handleProductClick(product.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="product-image-img"
                        style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                      />
                    ) : (
                      <div className="deal-image-placeholder"></div>
                    )}
                    <h3>{product.name}</h3>
                    <p className="deal-category">₹{product.price.toFixed(2)}</p>
                    <p style={{ fontSize: '12px', color: '#999' }}>
                      Stock: {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
                    </p>
                    <button
                      className="buy-btn"
                      onClick={(e) => handleAddToCart(e, product)}
                      disabled={product.stock === 0}
                    >
                      {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Logout Button */}
      <button onClick={handleLogout} className="logout-btn-float">
        Logout
      </button>
    </div>
  );
}

export default Dashboard;
