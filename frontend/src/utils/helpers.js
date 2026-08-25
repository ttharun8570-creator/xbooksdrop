export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

/**
 * Resolves full URL for an image hosted on backend or external source.
 * @param {string} path - Image path or URL
 * @param {string} [fallback] - Fallback placeholder
 * @returns {string} Complete image URL
 */
export const getImageUrl = (path, fallback = '/placeholder-book.svg') => {
  if (!path) return fallback;
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
};

/**
 * Capitalize first letter of each word
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}...`;
};
