import api from './client';

export const booksApi = {
  /**
   * Get all approved books with search, filters, pagination, and sorting
   * @param {Object} params - { search, category_id, condition, min_price, max_price, sort, page, limit }
   */
  getAll: async (params = {}) => {
    const response = await api.get('/api/books', { params });
    return response.data;
  },

  /**
   * Get single book by ID with seller details & all images
   * @param {string|number} id - Book ID
   */
  getById: async (id) => {
    const response = await api.get(`/api/books/${id}`);
    return response.data.book;
  },

  /**
   * Create a new book listing
   * @param {Object} data - { category_id, title, author, description, condition, price, edition, publication_year }
   */
  create: async (data) => {
    const response = await api.post('/api/books', data);
    return response.data;
  },

  /**
   * Update own book listing (resets to PENDING status)
   * @param {string|number} id
   * @param {Object} data
   */
  update: async (id, data) => {
    const response = await api.put(`/api/books/${id}`, data);
    return response.data;
  },

  /**
   * Delete own book listing
   * @param {string|number} id
   */
  delete: async (id) => {
    const response = await api.delete(`/api/books/${id}`);
    return response.data;
  },

  /**
   * Get all books owned by the logged-in student
   */
  getMyBooks: async () => {
    const response = await api.get('/api/books/my-books');
    return response.data.books || [];
  },

  /**
   * Upload image for a book listing
   * @param {string|number} id - Book ID
   * @param {File} imageFile - Image File
   */
  uploadImage: async (id, imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await api.post(`/api/books/${id}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
