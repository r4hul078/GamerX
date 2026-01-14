const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken, authorize } = require('../middleware/auth');

// Get all reviews for a product
router.get('/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const result = await pool.query(
      'SELECT r.*, u.username FROM reviews r LEFT JOIN users u ON r.user_id = u.id WHERE r.product_id = $1 ORDER BY r.created_at DESC',
      [productId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching reviews' });
  }
});

// Add a review (user must be logged in)
router.post('/product/:productId', authenticateToken, async (req, res) => {
  try {
    const { productId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;
    const username = req.user.username;
    if (!rating || rating < 1 || rating > 5) return res.status(400).json({ message: 'Invalid rating' });
    const result = await pool.query(
      'INSERT INTO reviews (product_id, user_id, username, rating, comment) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [productId, userId, username, rating, comment]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Error adding review' });
  }
});

// Admin: delete a review
router.delete('/:reviewId', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    const { reviewId } = req.params;
    await pool.query('DELETE FROM reviews WHERE id = $1', [reviewId]);
    res.json({ message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting review' });
  }
});

module.exports = router;
