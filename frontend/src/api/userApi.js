import api from './client';

export const userApi = {
  /**
   * Get logged-in student profile
   */
  getProfile: async () => {
    const response = await api.get('/api/users/profile');
    return response.data.user;
  },

  /**
   * Update student profile
   * @param {Object} data - { name, college_name, college_id, phone }
   */
  updateProfile: async (data) => {
    const response = await api.put('/api/users/profile', data);
    return response.data.user;
  },

  /**
   * Upload student profile photo
   * @param {File} photoFile - Photo file
   */
  uploadPhoto: async (photoFile) => {
    const formData = new FormData();
    formData.append('photo', photoFile);

    const response = await api.post('/api/users/profile/photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.user;
  },

  /**
   * Change account password
   * @param {Object} data - { currentPassword, newPassword }
   */
  changePassword: async (data) => {
    const response = await api.put('/api/users/change-password', data);
    return response.data;
  },
};
