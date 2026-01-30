import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import api from '../services/api';
import { fetchReviews, addReview } from '../services/reviews';
import './ProductDetails.css';

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchProductDetails = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(`/products/details/${id}`);
      setProduct(response.data);
    } catch (error) {
      console.error('Error in fetching product details:', error);
      setError('Failed in loading product details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const loadReviews = useCallback(async () => {
    try {
      const data = await fetchReviews(id);
      setReviews(data);
    } catch (e) {
      setReviews([]);
    }
  }, [id]);

  useEffect(() => {
    fetchProductDetails();
    loadReviews();
  }, [fetchProductDetails, loadReviews]);

  const handleAddToCart = () => {
    const added = addToCart(product);
    if (added) {
      alert(`${product.name} added to cart!`);
    }
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    setReviewLoading(true);
    setReviewError(null);
    try {
      await addReview(id, { rating: reviewRating, comment: reviewText });
      setReviewText('');
      setReviewRating(5);
      loadReviews();
    } catch (err) {
      setReviewError('Failed to add review');
    } finally {
      setReviewLoading(false);
    }
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
    <div className="product-details-fullscreen">
      <div className="product-details-topbar">
        <h1>Product Details</h1>
        <button className="back-btn" onClick={() => navigate(-1)}>Continue shopping</button>
      </div>
      <div className="product-details-main">
        <div className="product-details-left">
          <div className="product-details-card">
            <div className="product-details-header">
              <div className="product-title-row">
                <h2>{product.name}</h2>
                <span className="sku">#{product.sku || product.id}</span>
              </div>
              <div className="product-meta-row">
                <span className="product-price">{isNaN(Number(product.price)) ? '-' : `Rs ${Number(product.price).toFixed(2)}`}</span>
                <span className={`product-stock ${product.stock > 0 ? 'available' : 'sold-out'}`}>{product.stock > 0 ? `${product.stock} in stock` : 'Sold Out'}</span>
              </div>
            </div>
            <div className="product-details-body">
              {product.image_url && (
                <img src={product.image_url} alt={product.name} className="main-image" />
              )}
              {product.description && (
                <div className="product-description">{product.description}</div>
              )}
              {product.category_name && (
                <div className="product-category">Category: {product.category_name}</div>
              )}
            </div>
            <div className="product-details-actions">
              <button className="add-to-cart-btn" onClick={handleAddToCart} disabled={product.stock === 0}>Add to Cart</button>
              <button className="buy-now-btn" disabled={product.stock === 0}>Buy Now</button>
            </div>
          </div>
          <div className="reviews-section">
            <h3>Reviews</h3>
            {reviews.length === 0 ? (
              <div className="no-reviews">No reviews yet.</div>
            ) : (
              <ul className="reviews-list">
                {reviews.map((r) => (
                  <li key={r.id} className="review-item">
                    <div className="review-header">
                      <span className="review-user">{r.username || 'User'}</span>
                      <span className="review-rating">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                      <span className="review-date">{new Date(r.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="review-comment">{r.comment}</div>
                  </li>
                ))}
              </ul>
            )}
            {user && user.id && (
              <form className="add-review-form" onSubmit={handleAddReview}>
                <label>Rating:
                  <select value={reviewRating} onChange={e => setReviewRating(Number(e.target.value))}>
                    {[5,4,3,2,1].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </label>
                <textarea
                  value={reviewText}
                  onChange={e => setReviewText(e.target.value)}
                  placeholder="Write your review..."
                  required
                  rows={3}
                />
                <button type="submit" disabled={reviewLoading}>Submit Review</button>
                {reviewError && <div className="review-error">{reviewError}</div>}
              </form>
            )}
          </div>
        </div>
        <aside className="product-details-right">
          <div className="summary-panel">
            <div className="summary-row">
              <span>Price</span>
              <span>{isNaN(Number(product.price)) ? '-' : `Rs ${Number(product.price).toFixed(2)}`}</span>
            </div>
            <div className="summary-row">
              <span>Stock</span>
              <span>{product.stock > 0 ? `${product.stock} available` : 'Sold Out'}</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span className="total-amount">{isNaN(Number(product.price)) ? '-' : `Rs ${Number(product.price).toFixed(2)}`}</span>
            </div>
            <div className="checkout-row">
              <button className="checkout-btn" disabled={product.stock === 0}>Checkout</button>
              <div className="checkout-price">{isNaN(Number(product.price)) ? '-' : `Rs ${Number(product.price).toFixed(2)}`}</div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default ProductDetails;