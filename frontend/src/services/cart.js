// frontend/src/services/cart.js
import api from './api';

export const cartAPI = {
  getCart: () => api.get('/cart'),
  updateCart: (items) => api.put('/cart', { items }),
  clearCart: () => api.delete('/cart'),
};