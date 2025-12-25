import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import api from '../services/api';
import './ProductDetails.css';

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProductDetails = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(`/products/details/${id}`);
      setProduct(response.data);
    } catch (error) {
      console.error('Error fetching product details:', error);
      setError('Failed to load product details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProductDetails();
  }, [fetchProductDetails]);

  const handleAddToCart = () => {
    addToCart(product);
    alert(`${product.name} added to cart!`);
  };

  if (loading) {
    return (
      <div className="product-details-page">
        <div className="loading">Loading product details...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-details-page">
        <div className="error">{error || 'Product not found'}</div>
        <button onClick={() => navigate(-1)} className="back-btn">Go Back</button>
      </div>
    );
  }

  return (
    <div className="product-details-page">
      <div className="product-details-container">
        <button onClick={() => navigate(-1)} className="back-btn">← Back to Products</button>

        <div className="product-details">
          <div className="product-images">
            {product.image_url && (
              <img src={product.image_url} alt={product.name} className="main-image" />
            )}
            {product.images && product.images.length > 0 && (
              <div className="additional-images">
                {product.images.map((image, index) => (
                  <img key={index} src={image.image_url} alt={`${product.name} ${index + 1}`} />
                ))}
              </div>
            )}
          </div>

          <div className="product-info">
            <div className="header-row">
              <div>
                <h1>{product.name}</h1>
              </div>
              <div className="price-stock">
                <div className="price">{isNaN(Number(product.price)) ? '-' : `Rs ${Number(product.price).toFixed(2)}`}</div>
                <div className={`stock ${product.stock > 0 ? 'available' : 'sold-out'}`}>
                  {product.stock > 0 ? `${product.stock} in stock` : 'Sold Out'}
                </div>
              </div>
            </div>

            {product.description && (
              <div className="description">
                <h3>Description</h3>
                <p>{product.description}</p>
              </div>
            )}

            {product.category_name && (
              <div className="category">
                <span>Category: {product.category_name}</span>
              </div>
            )}

            <div className="actions">
              <button
                className="add-to-cart-btn"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
              >
                {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
              </button>
              <button className="buy-now-btn" disabled={product.stock === 0}>
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;