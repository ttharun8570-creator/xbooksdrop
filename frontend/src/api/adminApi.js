import api from './client';

export const adminApi = {
  /**
   * Get overview statistics
   */
  getStats: async () => {
    const response = await api.get('/api/admin/stats');
    return response.data.stats;
  },

  /**
   * Get all pending books awaiting approval
   */
  getPendingBooks: async () => {
    const response = await api.get('/api/admin/books/pending');
    return response.data.books || [];
  },

  /**
   * Approve a pending book
   * @param {string|number} id - Book ID
   */
  approveBook: async (id) => {
    const response = await api.put(`/api/admin/books/${id}/approve`);
    return response.data;
  },

  /**
   * Reject a pending book with an admin note
   * @param {string|number} id - Book ID
   * @param {string} adminNote - Rejection reason
   */
  rejectBook: async (id, adminNote) => {
    const response = await api.put(`/api/admin/books/${id}/reject`, {
      admin_note: adminNote,
    });
    return response.data;
  },

  /**
   * Get all books for admin overview with search & status filters
   * @param {Object} params - { status, search }
   */
  getAllBooks: async (params = {}) => {
    const response = await api.get('/api/admin/books', { params });
    return response.data.books || [];
  },

  /**
   * Delete any book as Admin
   * @param {string|number} id - Book ID
   */
  deleteBook: async (id) => {
    const response = await api.delete(`/api/admin/books/${id}`);
    return response.data;
  },

  /**
   * Get all users for admin management
   */
  getAllUsers: async () => {
    const response = await api.get('/api/admin/users');
    return response.data.users || [];
  },

  /**
   * Block a user
   * @param {string|number} id - User ID
   */
  blockUser: async (id) => {
    const response = await api.put(`/api/admin/users/${id}/block`);
    return response.data;
  },

  /**
   * Unblock a user
   * @param {string|number} id - User ID
   */
  unblockUser: async (id) => {
    const response = await api.put(`/api/admin/users/${id}/unblock`);
    return response.data;
  },
};
