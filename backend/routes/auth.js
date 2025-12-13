const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const crypto = require('crypto');
const pool = require('../config/database');
const authenticate = require('../middleware/auth');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Register Route
router.post('/register', async (req, res) => {
  const client = await pool.connect();
  try {
    const { username, email, password, role, adminSecret, storeName, phoneNumber } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const requestedRole = role === 'admin' ? 'admin' : 'user';

    if (requestedRole === 'admin') {
      const ADMIN_SECRET = process.env.ADMIN_SECRET || 'change_me_admin_secret';
      if (!adminSecret || adminSecret !== ADMIN_SECRET) {
        return res.status(403).json({ message: 'Invalid admin secret' });
      }
      if (!storeName || !phoneNumber) {
        return res.status(400).json({ message: 'Store name and phone number are required for admin registration' });
      }
    }

    // Check if user already exists
    const userExists = await client.query(
      'SELECT * FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );

    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists with this email or username' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Prepare verification
    let isVerified = false;
    let verificationToken = null;
    if (requestedRole === 'admin') {
      // Auto-verify admins when created with correct secret
      isVerified = true;
    } else {
      verificationToken = crypto.randomBytes(24).toString('hex');
    }

    await client.query('BEGIN');

    // Create user
    const result = await client.query(
      'INSERT INTO users (username, email, password, role, is_verified, verification_token) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, username, email, role, is_verified',
      [username, email, hashedPassword, requestedRole, isVerified, verificationToken]
    );

    const user = result.rows[0];

    // If admin, create store entry
    if (requestedRole === 'admin') {
      await client.query(
        'INSERT INTO admin_stores (admin_id, store_name, phone_number) VALUES ($1, $2, $3)',
        [user.id, storeName, phoneNumber]
      );
    }

    await client.query('COMMIT');

    // If user is verified (admins), create JWT token and return it
    if (user.is_verified) {
      const token = jwt.sign(
        { id: user.id, email: user.email, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.status(201).json({
        message: 'User registered and verified',
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          is_verified: user.is_verified,
        },
      });
    }

    // For non-verified users, return verification token (in production send email instead)
    res.status(201).json({
      message: 'Registration successful. Please verify your email using the provided token.',
      verificationToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        is_verified: user.is_verified,
      },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed' });
  } finally {
    client.release();
  }
});

// Login Route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = result.rows[0];

    // Compare password
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.is_verified) {
      return res.status(403).json({ message: 'Please verify your email before logging in' });
    }

    // Create JWT token including role
    const token = jwt.sign(
      { id: user.id, email: user.email, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

// Email verification endpoint
router.get('/verify', async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ message: 'Verification token required' });

    const result = await pool.query('SELECT * FROM users WHERE verification_token = $1', [token]);
    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid verification token' });
    }

    const user = result.rows[0];
    await pool.query('UPDATE users SET is_verified = true, verification_token = NULL WHERE id = $1', [user.id]);

    return res.json({ message: 'Email verified successfully' });
  } catch (err) {
    console.error('Verification error:', err);
    res.status(500).json({ message: 'Verification failed' });
  }
});

// Get current user
router.get('/me', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query('SELECT id, username, email, role, is_verified FROM users WHERE id = $1', [userId]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json({ user: result.rows[0] });
  } catch (err) {
    console.error('Fetch user error:', err);
    res.status(500).json({ message: 'Failed to fetch user' });
  }
});

module.exports = router;
