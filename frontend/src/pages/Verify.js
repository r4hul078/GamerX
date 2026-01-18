import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import './AuthPages.css';

function Verify() {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Verify token function
  const verifyTokenFn = useCallback(async (verificationToken) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.get('/api/auth/verify', {
        params: { token: verificationToken }
      });

      setSuccess(response.data.message);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // Check if token is in URL parameters
  useEffect(() => {
    const urlToken = searchParams.get('token');
    if (urlToken) {
      setToken(urlToken);
      verifyTokenFn(urlToken);
    }
  }, [searchParams, verifyTokenFn]);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!token.trim()) {
      setError('Please enter a verification token');
      return;
    }
    await verifyTokenFn(token);
  };

  return (
    <div className="auth-container">
      <div className="auth-left-panel">
        <div className="logo">GamerX</div>
        <h1>Verify Your Email</h1>
        <p>Complete your registration</p>
        <div className="image-placeholder">
          <img src="" alt="Verification" id="auth-image" />
        </div>
      </div>

      <div className="auth-right-panel">
        <h2>Email Verification</h2>

        {success && (
          <div className="success-message">
            <p>✅ {success}</p>
            <p>Redirecting to login...</p>
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        {!success && (
          <form onSubmit={handleVerify}>
            <p className="verification-info">
              Enter the verification token you received when registering.
            </p>

            <div className="input-group">
              <label>Verification Token</label>
              <input
                type="text"
                placeholder="Paste your verification token here"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>
          </form>
        )}

        <div className="auth-footer">
          <p>
            Already verified? <Link to="/login">Login here</Link>
          </p>
          <p>
            Need to register? <Link to="/register">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Verify;
