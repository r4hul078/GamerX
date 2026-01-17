import api from './api';

export const fetchReviews = (productId) =>
  api.get(`/reviews/product/${productId}`).then(res => res.data);

export const addReview = (productId, review) =>
  api.post(`/reviews/product/${productId}`, review).then(res => res.data);

export const deleteReview = (reviewId) =>
  api.delete(`/reviews/${reviewId}`).then(res => res.data);
