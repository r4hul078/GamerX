const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const crypto = require('crypto');
const pool = require('../config/database');
const { authenticateToken: authenticate } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Register Route
router.post('/register', async (req, res) => {
  const client = await pool.connect();
  try {
    const { username, email, password, role, phoneNumber } = req.body;

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

    // No admin secret or store-name requirement: admins register like regular users

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

    // Auto-verify users (no email verification required)
    const isVerified = true;

    await client.query('BEGIN');

    // Create user
    const result = await client.query(
      'INSERT INTO users (username, email, password, role, is_verified) VALUES ($1, $2, $3, $4, $5) RETURNING id, username, email, role, is_verified',
      [username, email, hashedPassword, requestedRole, isVerified]
    );

    const user = result.rows[0];

    // If user is admin, seed initial categories
    if (user.role === 'admin') {
      const categoriesData = [
        { name: 'Keyboard', description: 'Gaming keyboards with mechanical switches and RGB lighting' },
        { name: 'Mouse', description: 'High-precision gaming mice with adjustable DPI' },
        { name: 'Headphones', description: 'Gaming headsets with surround sound and noise cancellation' },
        { name: 'MousePads', description: 'Large gaming mouse pads with precision surfaces' },
        { name: 'Monitors', description: 'High refresh rate gaming monitors with low response time' }
      ];

      for (const category of categoriesData) {
        await client.query(
          'INSERT INTO categories (admin_id, name, description) VALUES ($1, $2, $3) ON CONFLICT (admin_id, name) DO NOTHING',
          [user.id, category.name, category.description]
        );
      }
    }

    await client.query('COMMIT');

    // Create JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      message: 'User registered successfully',
      token,
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
  const client = await pool.connect();
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ message: 'Verification token required' });

    const result = await pool.query('SELECT * FROM users WHERE verification_token = $1', [token]);
    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid verification token' });
    }

    const user = result.rows[0];
    
    await client.query('BEGIN');
    
    // Verify the user
    await client.query('UPDATE users SET is_verified = true, verification_token = NULL WHERE id = $1', [user.id]);

    // If user is an admin, seed initial categories
    if (user.role === 'admin') {
      const categoriesData = [
        { name: 'Keyboard', description: 'Gaming keyboards with mechanical switches and RGB lighting' },
        { name: 'Mouse', description: 'High-precision gaming mice with adjustable DPI' },
        { name: 'Headphones', description: 'Gaming headsets with surround sound and noise cancellation' },
        { name: 'MousePads', description: 'Large gaming mouse pads with precision surfaces' },
        { name: 'Monitors', description: 'High refresh rate gaming monitors with low response time' }
      ];

      for (const category of categoriesData) {
        await client.query(
          'INSERT INTO categories (admin_id, name, description) VALUES ($1, $2, $3) ON CONFLICT (admin_id, name) DO NOTHING',
          [user.id, category.name, category.description]
        );
      }
    }

    await client.query('COMMIT');

    return res.json({ message: 'Email verified successfully' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Verification error:', err);
    res.status(500).json({ message: 'Verification failed' });
  } finally {
    client.release();
  }
});

// Get current user
router.get('/me', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query('SELECT id, username, email, role, is_verified, profile_picture FROM users WHERE id = $1', [userId]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json({ user: result.rows[0] });
  } catch (err) {
    console.error('Fetch user error:', err);
    res.status(500).json({ message: 'Failed to fetch user' });
  }
});

// Setup multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const fname = `profile_${req.user.id}_${Date.now()}${ext}`;
    cb(null, fname);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif/;
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.test(ext)) cb(null, true);
    else cb(new Error('Only images are allowed'));
  }
});

// Upload profile picture
router.post('/upload-profile', authenticate, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const relativePath = `/uploads/${req.file.filename}`;

    await pool.query('UPDATE users SET profile_picture = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [relativePath, req.user.id]);

    return res.json({ message: 'Profile image uploaded', profile_picture: relativePath });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ message: 'Failed to upload image' });
  }
});

module.exports = router;
