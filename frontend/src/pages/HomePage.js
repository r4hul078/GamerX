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

  // New filter states
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minStock, setMinStock] = useState('');
  const [maxStock, setMaxStock] = useState('');

  useEffect(() => {
    fetchCategories();
    fetchFeaturedProducts();
  }, []);

  const buildFeaturedQuery = () => {
    const params = {};
    if (selectedCategory) params.category = selectedCategory;
    if (minPrice !== '') params.min_price = minPrice;
    if (maxPrice !== '') params.max_price = maxPrice;
    if (minStock !== '') params.min_stock = minStock;
    if (maxStock !== '') params.max_stock = maxStock;
    return params;
  };

  const fetchFeaturedProducts = async () => {
    setLoading(true);
    try {
      const params = buildFeaturedQuery();
      const response = await api.get('/products/featured/list', { params });
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
      // fetch using featured endpoint with category and any active price/stock filters
      const response = await api.get('/products/featured/list', { params: { ...buildFeaturedQuery(), category: categoryName } });
      setFilteredProducts(response.data);
    } catch (error) {
      console.error('Error filtering products by category:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = async () => {
    setLoading(true);
    try {
      const response = await api.get('/products/featured/list', { params: buildFeaturedQuery() });
      setFilteredProducts(response.data);
    } catch (error) {
      console.error('Error applying filters:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = async () => {
    setMinPrice('');
    setMaxPrice('');
    setMinStock('');
    setMaxStock('');
    // Reload products without filters
    fetchFeaturedProducts();
  };

  const handleAuthClick = (authType) => {
    navigate(`/${authType}`);
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  const handleAddToCart = (e, product) => {
    e.stopPropagation(); // Prevent triggering the card click
    const added = addToCart(product);
    if (added) {
      alert(`${product.name} added to cart!`);
    }
  };

  return (
    <div className="home-page">

      <div className="home-hero">
        <div className="hero-image-wrapper">
          <img
            className="hero-image"
            src="https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80"
            alt="Gaming setup"
          />
          <div className="hero-overlay">
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

            {/* Price & Quantity filters */}
            <div className="filter-panel">
              <h3>Filter by Price & Quantity:</h3>
              <div className="filter-row">
                <div className="filter-group">
                  <label>Min Price</label>
                  <input type="number" min="0" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="Min Price" />
                </div>
                <div className="filter-group">
                  <label>Max Price</label>
                  <input type="number" min="0" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="Max Price" />
                </div>
                <div className="filter-group">
                  <label>Min Qty</label>
                  <input type="number" min="0" value={minStock} onChange={(e) => setMinStock(e.target.value)} placeholder="Min Stock" />
                </div>
                <div className="filter-group">
                  <label>Max Qty</label>
                  <input type="number" min="0" value={maxStock} onChange={(e) => setMaxStock(e.target.value)} placeholder="Max Stock" />
                </div>
                <div className="filter-actions">
                  <button className="btn btn-primary" onClick={applyFilters}>Apply</button>
                  <button className="btn btn-secondary" onClick={clearFilters}>Clear</button>
                </div>
              </div>
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
