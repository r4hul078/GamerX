const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const verifyToken = require('../middleware/auth');

// Create an order from cart
router.post('/create', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { cartItems, totalAmount, paymentMethod } = req.body;

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Start transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Create order
      const orderResult = await client.query(
        'INSERT INTO orders (user_id, total_amount, status, payment_method) VALUES ($1, $2, $3, $4) RETURNING id, created_at',
        [userId, totalAmount, 'pending', paymentMethod]
      );
      const orderId = orderResult.rows[0].id;

      // Add order items
      for (const item of cartItems) {
        await client.query(
          'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)',
          [orderId, item.id, item.quantity, item.price]
        );
      }

      // Create payment record
      const confirmationToken = require('crypto').randomBytes(32).toString('hex');
      const paymentResult = await client.query(
        'INSERT INTO payments (order_id, user_id, amount, status, payment_method, confirmation_token) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
        [orderId, userId, totalAmount, 'pending', paymentMethod, confirmationToken]
      );

      await client.query('COMMIT');
      
      res.json({
        success: true,
        orderId,
        paymentId: paymentResult.rows[0].id,
        confirmationToken,
        message: 'Order created successfully'
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Error creating order' });
  }
});

// Confirm payment
router.post('/confirm-payment/:orderId', verifyToken, async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.userId;
    const { confirmationToken } = req.body;

    // Verify the payment record exists and token matches
    const paymentResult = await pool.query(
      'SELECT * FROM payments WHERE order_id = $1 AND user_id = $2',
      [orderId, userId]
    );

    if (paymentResult.rows.length === 0) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    const payment = paymentResult.rows[0];

    // Verify token matches
    if (payment.confirmation_token !== confirmationToken) {
      return res.status(400).json({ message: 'Invalid confirmation token' });
    }

    // Update payment status to success
    await pool.query(
      'UPDATE payments SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE order_id = $2',
      ['success', orderId]
    );

    // Update order status to confirmed
    await pool.query(
      'UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      ['confirmed', orderId]
    );

    res.json({
      success: true,
      message: 'Payment confirmed successfully'
    });
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({ message: 'Error confirming payment' });
  }
});

// Get user's order history
router.get('/history', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;

    const result = await pool.query(
      `SELECT 
        o.id, 
        o.total_amount, 
        o.status, 
        o.payment_method, 
        o.created_at,
        (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
      FROM orders o 
      WHERE o.user_id = $1 
      ORDER BY o.created_at DESC`,
      [userId]
    );

    res.json({
      success: true,
      orders: result.rows
    });
  } catch (error) {
    console.error('Error fetching order history:', error);
    res.status(500).json({ message: 'Error fetching order history' });
  }
});

// Get specific order details
router.get('/:orderId', verifyToken, async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.userId;

    const orderResult = await pool.query(
      'SELECT * FROM orders WHERE id = $1 AND user_id = $2',
      [orderId, userId]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const order = orderResult.rows[0];

    const itemsResult = await pool.query(
      `SELECT oi.*, p.name, p.image 
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = $1`,
      [orderId]
    );

    const paymentResult = await pool.query(
      'SELECT * FROM payments WHERE order_id = $1',
      [orderId]
    );

    res.json({
      success: true,
      order: {
        ...order,
        items: itemsResult.rows,
        payment: paymentResult.rows[0]
      }
    });
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({ message: 'Error fetching order details' });
  }
});

module.exports = router;
