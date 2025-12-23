const express = require('express');
const pool = require('../config/database');
const authenticateToken = require('../middleware/auth');
const { authorize } = require('../middleware/auth');

const router = express.Router();

// Get all products (public route - shows all products from all admins)
router.get('/list/all', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, c.name as category_name 
       FROM products p 
       LEFT JOIN categories c ON p.category_id = c.id 
       ORDER BY p.created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching all products:', error);
    res.status(500).json({ message: 'Error fetching products' });
  }
});

// Get products by category (public route)
router.get('/list/category/:categoryName', async (req, res) => {
  try {
    const categoryName = req.params.categoryName;
    const result = await pool.query(
      `SELECT p.*, c.name as category_name 
       FROM products p 
       LEFT JOIN categories c ON p.category_id = c.id 
       WHERE LOWER(c.name) = LOWER($1) 
       ORDER BY p.created_at DESC`,
      [categoryName]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching products by category:', error);
    res.status(500).json({ message: 'Error fetching products by category' });
  }
});

// Get all products for a specific admin
router.get('/', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, c.name as category_name 
       FROM products p 
       LEFT JOIN categories c ON p.category_id = c.id 
       WHERE p.admin_id = $1 
       ORDER BY p.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Error fetching products' });
  }
});

// Get featured products for homepage (public route)
router.get('/featured/list', async (req, res) => {
  try {
    const adminId = req.query.admin_id;
    let query = 'SELECT * FROM products WHERE is_featured = true';
    let params = [];

    if (adminId) {
      query += ' AND admin_id = $1';
      params.push(adminId);
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching featured products:', error);
    res.status(500).json({ message: 'Error fetching featured products' });
  }
});

// Get products by category
router.get('/category/:categoryId', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM products 
       WHERE category_id = $1 AND admin_id = $2 
       ORDER BY created_at DESC`,
      [req.params.categoryId, req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching products by category:', error);
    res.status(500).json({ message: 'Error fetching products by category' });
  }
});

// Get a single product by ID
router.get('/:id', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, c.name as category_name 
       FROM products p 
       LEFT JOIN categories c ON p.category_id = c.id 
       WHERE p.id = $1 AND p.admin_id = $2`,
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Get additional images
    const imagesResult = await pool.query(
      'SELECT * FROM product_images WHERE product_id = $1 ORDER BY is_primary DESC',
      [req.params.id]
    );

    const product = result.rows[0];
    product.images = imagesResult.rows;

    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Error fetching product' });
  }
});

// Get product details for public view
router.get('/details/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, c.name as category_name 
       FROM products p 
       LEFT JOIN categories c ON p.category_id = c.id 
       WHERE p.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Get additional images
    const imagesResult = await pool.query(
      'SELECT * FROM product_images WHERE product_id = $1 ORDER BY is_primary DESC',
      [req.params.id]
    );

    const product = result.rows[0];
    product.images = imagesResult.rows;

    res.json(product);
  } catch (error) {
    console.error('Error fetching product details:', error);
    res.status(500).json({ message: 'Error fetching product details' });
  }
});

// Create a new product
router.post('/', authenticateToken, authorize(['admin']), async (req, res) => {
  const { name, description, price, stock, category_id, image_url, is_featured } = req.body;

  try {
    if (!name || !price || !category_id) {
      return res.status(400).json({ message: 'Name, price, and category are required' });
    }

    if (price <= 0) {
      return res.status(400).json({ message: 'Price must be greater than 0' });
    }

    if (stock < 0) {
      return res.status(400).json({ message: 'Stock cannot be negative' });
    }

    // Check if category belongs to this admin
    const categoryCheck = await pool.query(
      'SELECT * FROM categories WHERE id = $1 AND admin_id = $2',
      [category_id, req.user.id]
    );

    if (categoryCheck.rows.length === 0) {
      return res.status(403).json({ message: 'Category not found or unauthorized' });
    }

    const result = await pool.query(
      `INSERT INTO products (admin_id, category_id, name, description, price, stock, image_url, is_featured) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [req.user.id, category_id, name, description, price, stock || 0, image_url, is_featured || false]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Error creating product' });
  }
});

// Update a product
router.put('/:id', authenticateToken, authorize(['admin']), async (req, res) => {
  const { name, description, price, stock, category_id, image_url, is_featured } = req.body;
  const productId = req.params.id;

  try {
    // Check if product belongs to this admin
    const checkResult = await pool.query(
      'SELECT * FROM products WHERE id = $1 AND admin_id = $2',
      [productId, req.user.id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(403).json({ message: 'Product not found or unauthorized' });
    }

    // If category_id is provided, verify it belongs to this admin
    if (category_id) {
      const categoryCheck = await pool.query(
        'SELECT * FROM categories WHERE id = $1 AND admin_id = $2',
        [category_id, req.user.id]
      );

      if (categoryCheck.rows.length === 0) {
        return res.status(403).json({ message: 'Category not found or unauthorized' });
      }
    }

    const result = await pool.query(
      `UPDATE products 
       SET name = COALESCE($1, name), 
           description = COALESCE($2, description), 
           price = COALESCE($3, price), 
           stock = COALESCE($4, stock), 
           category_id = COALESCE($5, category_id), 
           image_url = COALESCE($6, image_url), 
           is_featured = COALESCE($7, is_featured),
           updated_at = CURRENT_TIMESTAMP 
       WHERE id = $8 AND admin_id = $9 
       RETURNING *`,
      [name, description, price, stock, category_id, image_url, is_featured, productId, req.user.id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Error updating product' });
  }
});

// Update product stock
router.patch('/:id/stock', authenticateToken, authorize(['admin']), async (req, res) => {
  const { stock } = req.body;
  const productId = req.params.id;

  try {
    if (stock === undefined || stock < 0) {
      return res.status(400).json({ message: 'Valid stock value is required' });
    }

    const checkResult = await pool.query(
      'SELECT * FROM products WHERE id = $1 AND admin_id = $2',
      [productId, req.user.id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(403).json({ message: 'Product not found or unauthorized' });
    }

    const result = await pool.query(
      `UPDATE products 
       SET stock = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 AND admin_id = $3 
       RETURNING *`,
      [stock, productId, req.user.id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating stock:', error);
    res.status(500).json({ message: 'Error updating stock' });
  }
});

// Toggle featured status
router.patch('/:id/feature', authenticateToken, authorize(['admin']), async (req, res) => {
  const { is_featured } = req.body;
  const productId = req.params.id;

  try {
    if (is_featured === undefined) {
      return res.status(400).json({ message: 'is_featured value is required' });
    }

    const checkResult = await pool.query(
      'SELECT * FROM products WHERE id = $1 AND admin_id = $2',
      [productId, req.user.id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(403).json({ message: 'Product not found or unauthorized' });
    }

    const result = await pool.query(
      `UPDATE products 
       SET is_featured = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 AND admin_id = $3 
       RETURNING *`,
      [is_featured, productId, req.user.id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error toggling featured status:', error);
    res.status(500).json({ message: 'Error toggling featured status' });
  }
});

// Delete a product
router.delete('/:id', authenticateToken, authorize(['admin']), async (req, res) => {
  const productId = req.params.id;

  try {
    const checkResult = await pool.query(
      'SELECT * FROM products WHERE id = $1 AND admin_id = $2',
      [productId, req.user.id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(403).json({ message: 'Product not found or unauthorized' });
    }

    await pool.query(
      'DELETE FROM products WHERE id = $1 AND admin_id = $2',
      [productId, req.user.id]
    );

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Error deleting product' });
  }
});

// Process purchase and decrease stock (public route)
router.post('/purchase/process', async (req, res) => {
  const { items, totalAmount, paymentMethod } = req.body;

  try {
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No items in order' });
    }

    // Process each item - decrease stock
    for (const item of items) {
      const productId = item.id;
      const quantityToDeduct = item.quantity;

      // Get current stock
      const productResult = await pool.query(
        'SELECT stock FROM products WHERE id = $1',
        [productId]
      );

      if (productResult.rows.length === 0) {
        return res.status(404).json({ message: `Product ${productId} not found` });
      }

      const currentStock = productResult.rows[0].stock;

      // Check if sufficient stock
      if (currentStock < quantityToDeduct) {
        return res.status(400).json({
          message: `Insufficient stock for product ${item.name}. Available: ${currentStock}, Requested: ${quantityToDeduct}`
        });
      }

      // Decrease stock
      await pool.query(
        'UPDATE products SET stock = stock - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [quantityToDeduct, productId]
      );
    }

    // Return success response
    res.status(200).json({
      message: 'Order processed successfully',
      orderId: 'ORD-' + Date.now(),
      totalAmount: totalAmount,
      paymentMethod: paymentMethod,
      timestamp: new Date(),
      itemsProcessed: items.length
    });
  } catch (error) {
    console.error('Error processing purchase:', error);
    res.status(500).json({ message: 'Error processing purchase' });
  }
});

module.exports = router;
