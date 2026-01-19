import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import api from '../services/api';
import './HomePage.css';

function HomePage() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    setLoading(true);
    try {
      const response = await api.get('/products/featured/list');
      setFeaturedProducts(response.data);
    } catch (error) {
      console.error('Error fetching featured products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthClick = (authType) => {
    navigate(`/${authType}`);
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  const handleAddToCart = (e, product) => {
    e.stopPropagation(); // Prevent triggering the card click
    addToCart(product);
    alert(`${product.name} added to cart!`);
  };

  return (
    <div className="home-page">
      <div className="home-hero">
        <div className="hero-content">
          <h1>🎮 Welcome to GamerX</h1>
          <p>Your ultimate gaming gear destination</p>
          <div className="hero-buttons">
            <button
              className="btn btn-primary"
              onClick={() => handleAuthClick('login')}
            >
              Login
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => handleAuthClick('register')}
            >
              Sign Up
            </button>
            <button
              className="btn btn-admin"
              onClick={() => handleAuthClick('admin-register')}
            >
              Admin Register
            </button>
          </div>
        </div>
      </div>

      <section className="featured-section">
        <h2>⭐ Featured Products</h2>
        {loading ? (
          <p className="loading">Loading featured products...</p>
        ) : featuredProducts.length === 0 ? (
          <p className="no-products">No featured products yet</p>
        ) : (
          <div className="products-grid">
            {featuredProducts.map((product) => (
              <div key={product.id} className="product-card" onClick={() => handleProductClick(product.id)}>
                {product.image_url && (
                  <div className="product-image">
                    <img src={product.image_url} alt={product.name} />
                  </div>
                )}
                <div className="product-content">
                  <h3>{product.name}</h3>
                  {product.description && (
                    <p className="description">
                      {product.description.substring(0, 100)}...
                    </p>
                  )}
                  <div className="product-footer">
                    <div className="product-footer-top">
                      <span className="price">₹{product.price.toFixed(2)}</span>
                      <span className={`stock ${product.stock > 0 ? 'available' : 'sold-out'}`}>
                        {product.stock > 0 ? `${product.stock} in stock` : 'Sold Out'}
                      </span>
                    </div>
                    <button
                      className="add-to-cart-btn"
                      onClick={(e) => handleAddToCart(e, product)}
                      disabled={product.stock === 0}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default HomePage;
