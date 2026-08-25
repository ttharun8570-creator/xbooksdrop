import api from './client';

export const authApi = {
  /**
   * Register a new user
   * @param {Object} data - { name, email, password }
   */
  register: async (data) => {
    const response = await api.post('/api/auth/register', data);
    return response.data;
  },

  /**
   * Login user
   * @param {Object} credentials - { email, password }
   */
  login: async (credentials) => {
    const response = await api.post('/api/auth/login', credentials);
    return response.data;
  },
};
