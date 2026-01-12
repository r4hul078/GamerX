-- Add reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  username VARCHAR(100),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast lookup
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);