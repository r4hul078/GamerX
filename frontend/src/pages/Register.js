import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './AuthPages.css';

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('/api/auth/register', {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: 'user',
      });

      // If admin registered, log in directly
      if (response.data.user.role === 'admin' && response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        navigate('/dashboard');
        return;
      }

      // Regular users go to login page
      if (response.data.user.role === 'user') {
        navigate('/login');
        return;
      }

      // If not verified yet, redirect to verification page with token
      if (response.data.verificationToken) {
        navigate(`/verify?token=${response.data.verificationToken}`);
        return;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-left-panel">
        <div className="logo">GamerX</div>
        <h1>Join the Game!</h1>
        <p>Create your account and start playing</p>
        {/* Gaming image */}
        <div className="image-placeholder">
          <img src="https://sc01.alicdn.com/kf/Hd0048c3bd18e421e9c05607c0120ff7de.jpg" alt="Gaming" id="auth-image" />
        </div>
      </div>

      <div className="auth-right-panel">
        <h2>Create your account</h2>
        <p className="subtitle">Join the Game and level up your shopping experience</p>
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleRegister}>
          <div className="input-group">
            <label>Username</label>
            <input
              type="text"
              name="username"
              placeholder="Choose a username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="gradient-btn" disabled={loading} aria-label="Create GamerX account">
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <div className="toggle-text">
          Already have an account? <Link to="/login"><span>Login</span></Link>
        </div>
        
        <div className="admin-link">
          <Link to="/admin-register"><span>Register as Admin →</span></Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
