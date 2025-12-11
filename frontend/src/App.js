import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminRegister from './pages/AdminRegister';
import Verify from './pages/Verify';
import Dashboard from './pages/Dashboard';
import Cart from './pages/Cart';
import ProductDetails from './pages/ProductDetails';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

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
    <Router>
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
          element={isAuthenticated ? <Dashboard onLogout={handleLogout} isAuthenticated={isAuthenticated} /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/product/:id" 
          element={<ProductDetails />} 
        />
        <Route 
          path="/cart" 
          element={<Cart onLogout={handleLogout} isAuthenticated={isAuthenticated} />} 
        />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
}

export default App;
