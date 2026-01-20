import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './AuthPages.css';

function Login({ setIsAuthenticated }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('/api/auth/login', {
        email,
        password,
      });

      // Save token and user data
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      setIsAuthenticated(true);
      
      // Redirect based on user role
      if (response.data.user.role === 'admin') {
        navigate('/admin-dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-left-panel">
        <div className="logo">GamerX</div>
        <h1>Welcome Back, Gamer!</h1>
        <p>Sign in to continue your journey</p>
        {/* Gaming image */}
        <div className="image-placeholder">
          <img src="https://sc01.alicdn.com/kf/Hd0048c3bd18e421e9c05607c0120ff7de.jpg" alt="Gaming" id="auth-image" />
        </div>
      </div>

      <div className="auth-right-panel">
        <h2>Sign In</h2>
        
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="gradient-btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Continue →'}
          </button>
        </form>

        <div className="toggle-text">
          Don't have an account? <Link to="/register"><span>Register</span></Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
