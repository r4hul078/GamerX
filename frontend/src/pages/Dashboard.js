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
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const user = isAuthenticated ? JSON.parse(localStorage.getItem('user') || '{}') : null;

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

  useEffect(() => {
    fetchCategories();
    fetchProducts('All categories');
  }, []);

  // If user is admin, show admin dashboard instead
  if (user && user.role === 'admin') {
    return <AdminDashboard onLogout={onLogout} />;
  }

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
          <input
            type="text"
            placeholder="Search products by name or description"
            className="search-bar"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') e.preventDefault();
            }}
          />
          <button
            className="search-btn"
            onClick={(e) => e.preventDefault()}
            title="Search"
            aria-label="Search products"
          >
            🔍
          </button>
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
                // Apply client-side search (name or description)
                products
                  .filter((p) => {
                    if (!searchTerm || searchTerm.trim() === '') return true;
                    const q = searchTerm.trim().toLowerCase();
                    const name = (p.name || '').toString().toLowerCase();
                    const desc = (p.description || '').toString().toLowerCase();
                    return name.includes(q) || desc.includes(q);
                  })
                  .map((product) => (
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
                    <p className="deal-category">{isNaN(Number(product.price)) ? '-' : `Rs ${Number(product.price).toFixed(2)}`}</p>
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
