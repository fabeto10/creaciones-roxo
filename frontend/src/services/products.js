import api from './api'; // AÑADE ESTA LÍNEA

export const productsAPI = {
  getProducts: () => api.get('/products'),
  getProductById: (id) => api.get(`/products/${id}`),
  createProduct: (productData) => api.post('/products', productData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),
  updateProduct: (id, productData) => api.put(`/products/${id}`, productData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),
  deleteProduct: (id) => api.delete(`/products/${id}`),
};