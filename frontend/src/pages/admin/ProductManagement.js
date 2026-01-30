import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { deleteReview } from '../../services/reviews';
import './ProductManagement.css';

function ProductManagement({ onUpdate }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filterCategory, setFilterCategory] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category_id: '',
    image_url: '',
    is_featured: false,
  });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [showReviews, setShowReviews] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await api.get('/products');
      setProducts(response.data);
      setError('');
    } catch (error) {
      setError('Failed to load products');
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name.trim() || !formData.price || !formData.category_id) {
      setError('Name, price, and category are required');
      return;
    }

    if (parseFloat(formData.price) <= 0) {
      setError('Price must be greater than 0');
      return;
    }

    if (parseInt(formData.stock) < 0) {
      setError('Stock cannot be negative');
      return;
    }

    try {
      const submitData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock) || 0,
        category_id: parseInt(formData.category_id),
        image_url: formData.image_url,
        is_featured: formData.is_featured,
      };

      if (editingId) {
        await api.put(`/products/${editingId}`, submitData);
        setSuccess('Product is updated successfully');
      } else {
        await api.post('/products', submitData);
        setSuccess('Product is created successfully');
      }

      resetForm();
      fetchProducts();
      onUpdate();
    } catch (error) {
      setError(error.response?.data?.message || 'Error in saving product');
    }
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      stock: product.stock.toString(),
      category_id: product.category_id.toString(),
      image_url: product.image_url || '',
      is_featured: product.is_featured,
    });
    setShowForm(true);
    window.scrollTo(0, 0);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/products/${id}`);
        setSuccess('Product deleted successfully');
        fetchProducts();
        onUpdate();
      } catch (error) {
        setError(error.response?.data?.message || 'Error deleting product');
      }
    }
  };

  const handleToggleFeatured = async (id, currentStatus) => {
    try {
      await api.patch(`/products/${id}/feature`, {
        is_featured: !currentStatus,
      });
      setSuccess(`Product ${!currentStatus ? 'featured' : 'unfeatured'}`);
      fetchProducts();
      onUpdate();
    } catch (error) {
      setError('Error updating featured status');
    }
  };

  const handleUpdateStock = async (id) => {
    const newStock = prompt('Enter new stock quantity:');
    if (newStock !== null && newStock !== '') {
      if (parseInt(newStock) < 0) {
        setError('Stock cannot be negative');
        return;
      }
      try {
        await api.patch(`/products/${id}/stock`, {
          stock: parseInt(newStock),
        });
        setSuccess('Stock updated successfully');
        fetchProducts();
        onUpdate();
      } catch (error) {
        setError('Error updating stock');
      }
    }
  };

  const handleShowReviews = async (product) => {
    setSelectedProduct(product);
    setShowReviews(true);
    const res = await fetch(`/api/reviews/product/${product.id}`);
    const data = await res.json();
    setReviews(data);
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Delete this review?')) return;
    await deleteReview(reviewId);
    setReviews(reviews.filter((r) => r.id !== reviewId));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      stock: '',
      category_id: '',
      image_url: '',
      is_featured: false,
    });
    setEditingId(null);
    setShowForm(false);
    setError('');
  };

  const filteredProducts =
    filterCategory === ''
      ? products
      : products.filter((p) => p.category_id === parseInt(filterCategory));

  return (
    <div className="product-management">
      <div className="product-header">
        <h2>📦 Manage Products</h2>
        {!showForm && (
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            ➕ Add Product
          </button>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {showForm && (
        <div className="product-form">
          <h3>{editingId ? 'Edit Product' : 'Create New Product'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Product Name *</label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Gaming Mouse"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="category_id">Category *</label>
                <select
                  id="category_id"
                  value={formData.category_id}
                  onChange={(e) =>
                    setFormData({ ...formData, category_id: e.target.value })
                  }
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Detailed product description"
                rows="4"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="price">Price *</label>
                <input
                  type="number"
                  id="price"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  placeholder="999.99"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="stock">Initial Stock *</label>
                <input
                  type="number"
                  id="stock"
                  min="0"
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData({ ...formData, stock: e.target.value })
                  }
                  placeholder="0"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="image_url">Image URL</label>
              <input
                type="url"
                id="image_url"
                value={formData.image_url}
                onChange={(e) =>
                  setFormData({ ...formData, image_url: e.target.value })
                }
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="form-group checkbox">
              <input
                type="checkbox"
                id="is_featured"
                checked={formData.is_featured}
                onChange={(e) =>
                  setFormData({ ...formData, is_featured: e.target.checked })
                }
              />
              <label htmlFor="is_featured">⭐ Feature this product on homepage</label>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Saving...' : editingId ? 'Update Product' : 'Create Product'}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={resetForm}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="products-filter">
        <label>Filter by Category (filters product list below):</label>
        <select
          aria-label="Filter products by category"
          title="Select a category to filter the products shown below"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div className="products-list">
        {loading ? (
          <p className="loading-text">Loading products...</p>
        ) : filteredProducts.length === 0 ? (
          <p className="empty-text">
            {products.length === 0
              ? 'No products yet. Create one to get started!'
              : 'No products in this category.'}
          </p>
        ) : (
          <div className="products-table-wrapper">
            <table className="products-table">
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Featured</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} className={product.is_featured ? 'featured-row' : ''}>
                    <td className="product-name">
                      <div className="product-info">
                        {product.image_url && (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="product-thumb"
                          />
                        )}
                        <div>
                          <h4>{product.name}</h4>
                          {product.description && (
                            <p className="product-desc">
                              {product.description.substring(0, 50)}...
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>{product.category_name}</td>
                    <td className="price">{isNaN(Number(product.price)) ? '-' : `Rs ${Number(product.price).toFixed(2)}`}</td>
                    <td>
                      <span
                        className={`stock-badge ${
                          product.stock < 10 ? 'low-stock' : ''
                        }`}
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td>
                      <button
                        className={`btn-featured ${
                          product.is_featured ? 'active' : ''
                        }`}
                        onClick={() =>
                          handleToggleFeatured(product.id, product.is_featured)
                        }
                      >
                        {product.is_featured ? '⭐ Featured' : '☆ Not Featured'}
                      </button>
                    </td>
                    <td className="actions-cell">
                      <button
                        className="btn-action btn-stock"
                        onClick={() => handleUpdateStock(product.id)}
                        title="Update Stock"
                      >
                        📦
                      </button>
                      <button
                        className="btn-action btn-edit"
                        onClick={() => handleEdit(product)}
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn-action btn-delete"
                        onClick={() => handleDelete(product.id)}
                        title="Delete"
                      >
                        🗑️
                      </button>
                      <button
                        className="btn-action btn-reviews"
                        onClick={() => handleShowReviews(product)}
                        title="View Reviews"
                      >
                        ⭐
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showReviews && selectedProduct && (
        <div className="admin-reviews-modal">
          <h3>Reviews for {selectedProduct.name}</h3>
          <ul className="reviews-list">
            {reviews.map((r) => (
              <li key={r.id} className="review-item">
                <div className="review-header">
                  <span className="review-user">{r.username || 'User'}</span>
                  <span className="review-rating">
                    {'★'.repeat(r.rating)}
                    {'☆'.repeat(5 - r.rating)}
                  </span>
                  <span className="review-date">
                    {new Date(r.created_at).toLocaleDateString()}
                  </span>
                  <button
                    className="delete-review-btn"
                    onClick={() => handleDeleteReview(r.id)}
                  >
                    Delete
                  </button>
                </div>
                <div className="review-comment">{r.comment}</div>
              </li>
            ))}
          </ul>
          <button onClick={() => setShowReviews(false)}>Close</button>
        </div>
      )}
    </div>
  );
}

export default ProductManagement;
