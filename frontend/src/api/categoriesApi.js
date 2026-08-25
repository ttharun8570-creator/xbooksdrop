import api from './client';

export const categoriesApi = {
  /**
   * Get all active categories
   */
  getAll: async () => {
    const response = await api.get('/api/categories');
    return response.data.categories || [];
  },

  /**
   * Create a category (Admin only)
   * @param {Object} data - { name, description }
   */
  create: async (data) => {
    const response = await api.post('/api/categories', data);
    return response.data;
  },
};
