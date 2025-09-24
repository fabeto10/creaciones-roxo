import api from './api'; // AÑADE ESTA LÍNEA

export const charmsAPI = {
  getCharms: () => api.get('/charms'),
  getCharmById: (id) => api.get(`/charms/${id}`),
  createCharm: (charmData) => api.post('/charms', charmData),
  updateCharm: (id, charmData) => api.put(`/charms/${id}`, charmData),
};