import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import api from '../services/api';
import './HomePage.css';

function HomePage() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryLoading, setCategoryLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    setLoading(true);
    try {
      const response = await api.get('/products/featured/list');
      setFeaturedProducts(response.data);
      setFilteredProducts(response.data);
    } catch (error) {
      console.error('Error fetching featured products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    setCategoryLoading(true);
    try {
      const response = await api.get('/categories/list/all');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setCategoryLoading(false);
    }
  };

  const handleCategoryFilter = async (categoryName) => {
    setSelectedCategory(categoryName);
    setLoading(true);
    try {
      if (!categoryName) {
        // Show all featured products
        setFilteredProducts(featuredProducts);
      } else {
        // Fetch products from the selected category
        const response = await api.get(`/products/list/category/${categoryName}`);
        // Filter to show only featured products from the category
        const featured = response.data.filter(p => p.is_featured === true);
        setFilteredProducts(featured);
      }
    } catch (error) {
      console.error('Error filtering products by category:', error);
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
        
        {!categoryLoading && categories.length > 0 && (
          <div className="category-filter">
            <h3>Filter by Category:</h3>
            <div className="category-buttons">
              <button
                className={`category-btn ${selectedCategory === '' ? 'active' : ''}`}
                onClick={() => handleCategoryFilter('')}
              >
                All Categories
              </button>
              {categories.map((category) => (
                <button
                  key={category.name}
                  className={`category-btn ${selectedCategory === category.name ? 'active' : ''}`}
                  onClick={() => handleCategoryFilter(category.name)}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {loading ? (
          <p className="loading">Loading featured products...</p>
        ) : filteredProducts.length === 0 ? (
          <p className="no-products">No featured products yet</p>
        ) : (
          <div className="products-grid">
            {filteredProducts.map((product) => (
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
                      <span className="price">{isNaN(Number(product.price)) ? '-' : `Rs ${Number(product.price).toFixed(2)}`}</span>
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
