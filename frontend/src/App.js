import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminRegister from './pages/AdminRegister';
import Verify from './pages/Verify';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Cart from './pages/Cart';
import ProductDetails from './pages/ProductDetails';
import OrderHistory from './pages/OrderHistory';
import { CartProvider } from './contexts/CartContext';
import { useTheme } from './contexts/ThemeContext';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <CartProvider>
      <Router>
        <div className="theme-toggle">
          <button onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
          </button>
        </div>
        <Routes>
          <Route 
            path="/login" 
            element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login setIsAuthenticated={setIsAuthenticated} />} 
          />
          <Route 
            path="/register" 
            element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />} 
          />
          <Route 
            path="/admin-register" 
            element={isAuthenticated ? <Navigate to="/admin-dashboard" /> : <AdminRegister />} 
          />
          <Route 
            path="/verify" 
            element={<Verify />} 
          />
          <Route 
            path="/dashboard" 
            element={<Dashboard onLogout={handleLogout} isAuthenticated={isAuthenticated} />} 
          />
          <Route 
            path="/admin-dashboard" 
            element={isAuthenticated ? <AdminDashboard onLogout={handleLogout} isAuthenticated={isAuthenticated} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/product/:id" 
            element={<ProductDetails />} 
          />
          <Route 
            path="/cart" 
            element={<Cart onLogout={handleLogout} isAuthenticated={isAuthenticated} />} 
          />
          <Route 
            path="/orders" 
            element={isAuthenticated ? <OrderHistory onLogout={handleLogout} isAuthenticated={isAuthenticated} /> : <Navigate to="/login" />} 
          />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;
