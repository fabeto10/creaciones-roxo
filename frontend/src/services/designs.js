import api from './api';

export const designsAPI = {
  getDesigns: () => api.get('/designs'),
  createDesign: (designData) => api.post('/designs', designData),
  getUserDesigns: (userId) => api.get(`/designs/user/${userId}`),
};