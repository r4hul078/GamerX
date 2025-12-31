import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import CategoryManagement from './admin/CategoryManagement';
import ProductManagement from './admin/ProductManagement';
import './AdminDashboard.css';

function AdminDashboard({ onLogout }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCategories: 0,
    featuredProducts: 0,
    lowStockProducts: 0,
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        api.get('/products'),
        api.get('/categories'),
      ]);

      const products = productsRes.data;
      const categories = categoriesRes.data;

      setStats({
        totalProducts: products.length,
        totalCategories: categories.length,
        featuredProducts: products.filter((p) => p.is_featured).length,
        lowStockProducts: products.filter((p) => p.stock < 10).length,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    onLogout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div style={{ textAlign: 'center', padding: '50px', color: 'white', fontSize: '18px' }}>
          Loading admin dashboard...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="admin-dashboard">
        <div style={{ textAlign: 'center', padding: '50px', color: 'white', fontSize: '18px' }}>
          Error: User not found
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <div className="admin-header-content">
          <h1>🎮 GamerX Admin Dashboard</h1>
          <div className="admin-header-right">
            <span className="admin-name">Welcome, {user?.username}</span>
            <button className="btn-logout" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="admin-container">
        <div className="admin-sidebar">
          <nav className="admin-nav">
            <button
              className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              📊 Overview
            </button>
            <button
              className={`nav-item ${activeTab === 'categories' ? 'active' : ''}`}
              onClick={() => setActiveTab('categories')}
            >
              📁 Categories
            </button>
            <button
              className={`nav-item ${activeTab === 'products' ? 'active' : ''}`}
              onClick={() => setActiveTab('products')}
            >
              📦 Products
            </button>
          </nav>
        </div>

        <div className="admin-content">
          {activeTab === 'overview' && (
            <div className="overview-section">
              <h2>Dashboard Overview</h2>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">📦</div>
                  <div className="stat-info">
                    <h3>Total Products</h3>
                    <p className="stat-number">{stats.totalProducts}</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">📁</div>
                  <div className="stat-info">
                    <h3>Total Categories</h3>
                    <p className="stat-number">{stats.totalCategories}</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">⭐</div>
                  <div className="stat-info">
                    <h3>Featured Products</h3>
                    <p className="stat-number">{stats.featuredProducts}</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">⚠️</div>
                  <div className="stat-info">
                    <h3>Low Stock Items</h3>
                    <p className="stat-number">{stats.lowStockProducts}</p>
                  </div>
                </div>
              </div>

              <div className="quick-actions">
                <h3>Quick Actions</h3>
                <div className="actions-grid">
                  <button
                    className="action-btn"
                    onClick={() => setActiveTab('categories')}
                  >
                    ➕ Add Category
                  </button>
                  <button
                    className="action-btn"
                    onClick={() => setActiveTab('products')}
                  >
                    ➕ Add Product
                  </button>
                  <button
                    className="action-btn"
                    onClick={() => setActiveTab('products')}
                  >
                    📝 Manage Products
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'categories' && <CategoryManagement onUpdate={fetchStats} />}

          {activeTab === 'products' && <ProductManagement onUpdate={fetchStats} />}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
