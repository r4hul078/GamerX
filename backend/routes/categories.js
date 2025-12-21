const express = require('express');
const pool = require('../config/database');
const authenticateToken = require('../middleware/auth');
const { authorize } = require('../middleware/auth');

const router = express.Router();

// Get all categories (public route)
router.get('/list/all', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT DISTINCT name FROM categories ORDER BY name ASC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Error fetching categories' });
  }
});

// Get all categories for a specific admin
router.get('/', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM categories WHERE admin_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Error fetching categories' });
  }
});

// Create a new category
router.post('/', authenticateToken, authorize(['admin']), async (req, res) => {
  const { name, description } = req.body;

  try {
    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const result = await pool.query(
      'INSERT INTO categories (admin_id, name, description) VALUES ($1, $2, $3) RETURNING *',
      [req.user.id, name, description]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating category:', error);
    if (error.code === '23505') {
      // Unique constraint violation
      res.status(400).json({ message: 'Category with this name already exists' });
    } else {
      res.status(500).json({ message: 'Error creating category' });
    }
  }
});

// Update a category
router.put('/:id', authenticateToken, authorize(['admin']), async (req, res) => {
  const { name, description } = req.body;
  const categoryId = req.params.id;

  try {
    // Check if category belongs to the admin
    const checkResult = await pool.query(
      'SELECT * FROM categories WHERE id = $1 AND admin_id = $2',
      [categoryId, req.user.id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const result = await pool.query(
      'UPDATE categories SET name = COALESCE($1, name), description = COALESCE($2, description), updated_at = CURRENT_TIMESTAMP WHERE id = $3 AND admin_id = $4 RETURNING *',
      [name, description, categoryId, req.user.id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating category:', error);
    if (error.code === '23505') {
      res.status(400).json({ message: 'Category with this name already exists' });
    } else {
      res.status(500).json({ message: 'Error updating category' });
    }
  }
});

// Delete a category
router.delete('/:id', authenticateToken, authorize(['admin']), async (req, res) => {
  const categoryId = req.params.id;

  try {
    // Check if category belongs to the admin
    const checkResult = await pool.query(
      'SELECT * FROM categories WHERE id = $1 AND admin_id = $2',
      [categoryId, req.user.id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await pool.query(
      'DELETE FROM categories WHERE id = $1 AND admin_id = $2',
      [categoryId, req.user.id]
    );

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ message: 'Error deleting category' });
  }
});

module.exports = router;
