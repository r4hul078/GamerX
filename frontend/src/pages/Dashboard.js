import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

function Dashboard({ onLogout }) {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState(null);

  const handleLogout = () => {
    onLogout();
    navigate('/login');
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

  const deals = [
    {
      title: 'Great Deals on Laptop',
      category: 'Laptops'
    },
    {
      title: 'Great Deals on PC Build',
      category: 'PC Build'
    },
    {
      title: 'Great Deals on Earbuds',
      category: 'Earbuds'
    }
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
          <button className="nav-icon-btn">
            <span>🛒</span>
            <span>My Cart</span>
          </button>
          <button className="nav-icon-btn" onClick={() => navigate('/profile')}>
            <span>👤</span>
            <span>My Account</span>
          </button>
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
                onClick={() => setActiveCategory(category)}
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
                <h1 className="banner-title">PC BUILD</h1>
              </div>
              <div className="banner-image">
                {/* Image would go here */}
              </div>
            </div>

            {/* Deals Grid */}
            <div className="deals-grid">
              {deals.map((deal, index) => (
                <div key={index} className="deal-card">
                  <div className="deal-image-placeholder"></div>
                  <h3>{deal.title}</h3>
                  <p className="deal-category">{deal.category}</p>
                  <button className="buy-btn">Buy Now</button>
                </div>
              ))}
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
