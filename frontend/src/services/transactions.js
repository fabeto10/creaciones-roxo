import api from './api';

export const transactionsAPI = {
  calculatePayment: (data) => api.post('/transactions/payments/calculate', data),
  createTransaction: (formData) => api.post('/transactions', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),
  getTransaction: (id) => api.get(`/transactions/${id}`),
  getTransactionById: (id) => api.get(`/transactions/${id}`), // ← ALIAS para claridad
  getUserTransactions: () => api.get('/transactions/my-transactions'),
  uploadScreenshot: (id, formData) => api.post(`/transactions/${id}/screenshot`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),
};