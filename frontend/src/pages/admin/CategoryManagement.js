import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './CategoryManagement.css';

function CategoryManagement({ onUpdate }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
      setError('');
    } catch (error) {
      setError('Failed to load categories');
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name.trim()) {
      setError('Category name is required');
      return;
    }

    try {
      if (editingId) {
        // Update category
        await api.put(`/categories/${editingId}`, formData);
        setSuccess('Category is updated successfully');
      } else {
        // Create category
        await api.post('/categories', formData);
        setSuccess('Category is created successfully');
      }

      setFormData({ name: '', description: '' });
      setEditingId(null);
      setShowForm(false);
      fetchCategories();
      onUpdate();
    } catch (error) {
      setError(error.response?.data?.message || 'Error in saving category');
    }
  };

  const handleEdit = (category) => {
    setEditingId(category.id);
    setFormData({
      name: category.name,
      description: category.description || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await api.delete(`/categories/${id}`);
        setSuccess('Category deleted successfully');
        fetchCategories();
        onUpdate();
      } catch (error) {
        setError(error.response?.data?.message || 'Error deleting category');
      }
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', description: '' });
    setEditingId(null);
    setShowForm(false);
    setError('');
  };

  return (
    <div className="category-management">
      <div className="category-header">
        <h2>📁 Manage Categories</h2>
        {!showForm && (
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            ➕ Add Category
          </button>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {showForm && (
        <div className="category-form">
          <h3>{editingId ? 'Edit Category' : 'Create New Category'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Category Name *</label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Gaming Laptops"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Optional category description"
                rows="3"
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Saving...' : editingId ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="categories-list">
        {loading ? (
          <p className="loading-text">Loading categories...</p>
        ) : categories.length === 0 ? (
          <p className="empty-text">
            No categories yet. Create one to get started!
          </p>
        ) : (
          <div className="categories-grid">
            {categories.map((category) => (
              <div key={category.id} className="category-card">
                <div className="category-card-header">
                  <h3>{category.name}</h3>
                  <span className="category-id">ID: {category.id}</span>
                </div>
                {category.description && (
                  <p className="category-description">{category.description}</p>
                )}
                <div className="category-meta">
                  <small>
                    Created: {new Date(category.created_at).toLocaleDateString()}
                  </small>
                </div>
                <div className="category-actions">
                  <button
                    className="btn-edit"
                    onClick={() => handleEdit(category)}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(category.id)}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CategoryManagement;
