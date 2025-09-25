import api from './api';

export const productsAPI = {
  getProducts: () => api.get('/products'),
  getProductById: (id) => api.get(`/products/${id}`),
  createProduct: (formData) => api.post('/products', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),
  updateProduct: (id, formData) => api.put(`/products/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),
  deleteProduct: (id) => api.delete(`/products/${id}`) // Asegúrate de que esta ruta existe
};