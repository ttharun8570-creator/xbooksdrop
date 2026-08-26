// Student Book Marketplace Frontend Application Logic

// Global Application State
const state = {
  token: localStorage.getItem('token') || null,
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  categories: [],
  books: [],
  currentPage: 1,
  totalPages: 1,
  totalBooks: 0,
  currentBook: null,
  activeAdminTab: 'pending',
  rejectingBookId: null,
  selectedImageFile: null
};

// API Client Wrapper
const API_BASE = '/api';

const api = {
  get: async (endpoint, requireAuth = false) => {
    const headers = {};
    if (state.token) headers['Authorization'] = `Bearer ${state.token}`;
    const res = await fetch(`${API_BASE}${endpoint}`, { headers });
    return handleResponse(res);
  },

  post: async (endpoint, body, requireAuth = false) => {
    const headers = { 'Content-Type': 'application/json' };
    if (state.token) headers['Authorization'] = `Bearer ${state.token}`;
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });
    return handleResponse(res);
  },

  put: async (endpoint, body = {}, requireAuth = true) => {
    const headers = { 'Content-Type': 'application/json' };
    if (state.token) headers['Authorization'] = `Bearer ${state.token}`;
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body)
    });
    return handleResponse(res);
  },

  delete: async (endpoint, requireAuth = true) => {
    const headers = {};
    if (state.token) headers['Authorization'] = `Bearer ${state.token}`;
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'DELETE',
      headers
    });
    return handleResponse(res);
  },

  upload: async (endpoint, formData) => {
    const headers = {};
    if (state.token) headers['Authorization'] = `Bearer ${state.token}`;
    // DO NOT set Content-Type; browser will attach multipart boundary
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData
    });
    return handleResponse(res);
  }
};

async function handleResponse(res) {
  let data;
  try {
    data = await res.json();
  } catch (e) {
    data = { message: res.statusText };
  }

  if (res.status === 401) {
    // If token invalid or expired, log out gracefully
    if (state.token) {
      showToast('Session expired. Please log in again.', 'error');
      handleLogout();
    }
  }

  if (res.status === 403) {
    showToast(data.message || 'Access Denied: You do not have permission for this action.', 'error');
  }

  if (!res.ok) {
    const error = new Error(data.message || 'Request failed');
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}

// Toast Notifications
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Navigation / View Switcher
function navigateTo(viewName, param = null) {
  // Hide all views
  document.querySelectorAll('.view-section').forEach(sec => sec.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(btn => btn.classList.remove('active'));

  // Auth gate checks
  if ((viewName === 'create-book' || viewName === 'my-books' || viewName === 'profile') && !state.token) {
    showToast('Please log in to access this feature.', 'info');
    navigateTo('login');
    return;
  }

  if (viewName === 'admin' && (!state.user || state.user.role !== 'ADMIN')) {
    showToast('Admin privileges required.', 'error');
    navigateTo('marketplace');
    return;
  }

  // Show target view
  const target = document.getElementById(`view-${viewName}`);
  if (target) {
    target.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Load relevant data per view
  if (viewName === 'marketplace') {
    loadCategories();
    loadMarketplaceBooks();
  } else if (viewName === 'book-details') {
    if (param) loadBookDetails(param);
  } else if (viewName === 'create-book') {
    loadCategoriesForSelect();
  } else if (viewName === 'my-books') {
    loadMyBooks();
  } else if (viewName === 'profile') {
    loadUserProfile();
  } else if (viewName === 'admin') {
    loadAdminData();
  }
}

// UI Auth State Update
function updateAuthUI() {
  const isAuth = !!state.token;
  const isAdmin = state.user && state.user.role === 'ADMIN';

  document.querySelectorAll('.auth-only').forEach(el => el.classList.toggle('hidden', !isAuth));
  document.querySelectorAll('.unauth-only').forEach(el => el.classList.toggle('hidden', isAuth));
  document.querySelectorAll('.auth-required').forEach(el => el.classList.toggle('hidden', !isAuth));
  document.querySelectorAll('.admin-only').forEach(el => el.classList.toggle('hidden', !isAdmin));

  if (isAuth && state.user) {
    const name = state.user.name || 'Student';
    const email = state.user.email || '';
    const role = state.user.role || 'USER';

    const displayName = document.getElementById('user-display-name');
    if (displayName) displayName.textContent = name.split(' ')[0];

    const avatar = document.getElementById('user-avatar-initials');
    if (avatar) avatar.textContent = name.charAt(0).toUpperCase();

    const ddName = document.getElementById('dropdown-user-name');
    if (ddName) ddName.textContent = name;

    const ddEmail = document.getElementById('dropdown-user-email');
    if (ddEmail) ddEmail.textContent = email;

    const ddRole = document.getElementById('dropdown-user-role');
    if (ddRole) {
      ddRole.textContent = role;
      ddRole.className = role === 'ADMIN' ? 'badge badge-warning' : 'badge badge-info';
    }
  }
}

// User Menu Dropdown Toggle
document.addEventListener('DOMContentLoaded', () => {
  const menuBtn = document.getElementById('user-menu-btn');
  const dropdown = document.getElementById('user-dropdown-menu');

  if (menuBtn && dropdown) {
    menuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('show');
    });

    document.addEventListener('click', () => {
      dropdown.classList.remove('show');
    });
  }

  // Global search enter key
  const searchInput = document.getElementById('global-search-input');
  const searchBtn = document.getElementById('global-search-btn');

  if (searchInput && searchBtn) {
    const triggerSearch = () => {
      navigateTo('marketplace');
      loadMarketplaceBooks(1);
    };

    searchBtn.addEventListener('click', triggerSearch);
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') triggerSearch();
    });
  }

  // Initialize
  updateAuthUI();
  navigateTo('marketplace');
});

// Authentication Handlers
async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  try {
    const res = await api.post('/auth/login', { email, password });
    state.token = res.token;
    state.user = res.user;

    localStorage.setItem('token', res.token);
    localStorage.setItem('user', JSON.stringify(res.user));

    showToast(`Welcome back, ${res.user.name}!`, 'success');
    updateAuthUI();
    document.getElementById('login-form').reset();
    navigateTo('marketplace');
  } catch (err) {
    showToast(err.message || 'Login failed', 'error');
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const name = document.getElementById('reg-name').value;
  const email = document.getElementById('reg-email').value;
  const password = document.getElementById('reg-password').value;

  try {
    await api.post('/auth/register', { name, email, password });
    showToast('Account created successfully! Please log in.', 'success');
    document.getElementById('register-form').reset();
    navigateTo('login');
  } catch (err) {
    showToast(err.message || 'Registration failed', 'error');
  }
}

function handleLogout() {
  state.token = null;
  state.user = null;
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  updateAuthUI();
  showToast('You have been logged out.', 'info');
  navigateTo('marketplace');
}

// Categories Management
async function loadCategories() {
  try {
    const res = await api.get('/categories');
    state.categories = res.categories || [];
    renderCategoryFilterOptions();
  } catch (err) {
    console.error('Failed to load categories:', err);
  }
}

function renderCategoryFilterOptions() {
  const select = document.getElementById('filter-category');
  if (!select) return;

  const currentVal = select.value;
  select.innerHTML = '<option value="">All Categories</option>';
  state.categories.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat.category_id;
    opt.textContent = cat.name;
    select.appendChild(opt);
  });
  select.value = currentVal;
}

function loadCategoriesForSelect() {
  const select = document.getElementById('book-category');
  if (!select) return;

  select.innerHTML = '<option value="">Select Category</option>';
  state.categories.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat.category_id;
    opt.textContent = cat.name;
    select.appendChild(opt);
  });
}

// Marketplace Books Listing
async function loadMarketplaceBooks(page = 1) {
  state.currentPage = page;
  const grid = document.getElementById('books-grid');
  const empty = document.getElementById('no-books-empty');
  const pagination = document.getElementById('pagination-controls');

  if (!grid) return;
  grid.innerHTML = '<div class="text-muted p-4">Loading books...</div>';

  const params = new URLSearchParams();
  params.set('page', page);
  params.set('limit', 12);

  const searchVal = document.getElementById('global-search-input')?.value.trim();
  if (searchVal) params.set('search', searchVal);

  const catVal = document.getElementById('filter-category')?.value;
  if (catVal) params.set('category_id', catVal);

  const condVal = document.getElementById('filter-condition')?.value;
  if (condVal) params.set('condition', condVal);

  const minPrice = document.getElementById('filter-min-price')?.value;
  if (minPrice) params.set('min_price', minPrice);

  const maxPrice = document.getElementById('filter-max-price')?.value;
  if (maxPrice) params.set('max_price', maxPrice);

  const sortVal = document.getElementById('sort-books')?.value;
  if (sortVal) params.set('sort', sortVal);

  try {
    const res = await api.get(`/books?${params.toString()}`);
    state.books = res.books || [];
    state.totalBooks = res.pagination?.totalBooks || 0;
    state.totalPages = res.pagination?.totalPages || 1;

    document.getElementById('total-books-count').textContent = state.totalBooks;

    if (state.books.length === 0) {
      grid.innerHTML = '';
      empty?.classList.remove('hidden');
      pagination?.classList.add('hidden');
      return;
    }

    empty?.classList.add('hidden');
    renderBookCards(state.books);
    updatePaginationControls();
  } catch (err) {
    grid.innerHTML = `<div class="text-danger p-4">Failed to load books: ${err.message}</div>`;
  }
}

function renderBookCards(books) {
  const grid = document.getElementById('books-grid');
  if (!grid) return;

  grid.innerHTML = books.map(book => {
    const imgUrl = book.image_url ? book.image_url : '/uploads/placeholder-book.jpg';
    return `
      <div class="book-card" onclick="navigateTo('book-details', '${book.book_id}')">
        <div class="book-card-image">
          <img src="${imgUrl}" alt="${escapeHtml(book.title)}" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'200\\' height=\\'200\\' viewBox=\\'0 0 200 200\\'><rect fill=\\'%23f1f5f9\\' width=\\'200\\' height=\\'200\\'/><text fill=\\'%2394a3b8\\' font-family=\\'sans-serif\\' font-size=\\'14\\' font-weight=\\'bold\\' x=\\'50%\\' y=\\'50%\\' text-anchor=\\'middle\\'>📚 No Cover Image</text></svg>'">
        </div>
        <div class="book-card-body">
          <div class="book-card-category">${escapeHtml(book.category_name || 'Academic')}</div>
          <h3 class="book-card-title">${escapeHtml(book.title)}</h3>
          <div class="book-card-author">${escapeHtml(book.author ? `by ${book.author}` : 'Author not specified')}</div>
          <div class="book-card-footer">
            <span class="book-card-price">₹${Number(book.price).toFixed(0)}</span>
            <span class="badge badge-condition">${escapeHtml(book.condition || 'GOOD')}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function updatePaginationControls() {
  const wrapper = document.getElementById('pagination-controls');
  const info = document.getElementById('pagination-info');
  const prevBtn = document.getElementById('btn-prev-page');
  const nextBtn = document.getElementById('btn-next-page');

  if (!wrapper) return;

  if (state.totalPages <= 1) {
    wrapper.classList.add('hidden');
    return;
  }

  wrapper.classList.remove('hidden');
  info.textContent = `Page ${state.currentPage} of ${state.totalPages}`;
  prevBtn.disabled = state.currentPage <= 1;
  nextBtn.disabled = state.currentPage >= state.totalPages;
}

function changePage(delta) {
  const newPage = state.currentPage + delta;
  if (newPage >= 1 && newPage <= state.totalPages) {
    loadMarketplaceBooks(newPage);
  }
}

function applyFilters() {
  loadMarketplaceBooks(1);
}

function resetFilters() {
  const search = document.getElementById('global-search-input');
  if (search) search.value = '';

  const cat = document.getElementById('filter-category');
  if (cat) cat.value = '';

  const cond = document.getElementById('filter-condition');
  if (cond) cond.value = '';

  const minP = document.getElementById('filter-min-price');
  if (minP) minP.value = '';

  const maxP = document.getElementById('filter-max-price');
  if (maxP) maxP.value = '';

  const sort = document.getElementById('sort-books');
  if (sort) sort.value = 'newest';

  loadMarketplaceBooks(1);
}

// Book Details Page
async function loadBookDetails(bookId) {
  try {
    const res = await api.get(`/books/${bookId}`);
    const book = res.book;
    state.currentBook = book;

    document.getElementById('detail-title').textContent = book.title;
    document.getElementById('detail-author').textContent = book.author || 'Not specified';
    document.getElementById('detail-price').textContent = Number(book.price).toFixed(0);
    document.getElementById('detail-category').textContent = book.category_name || 'Academic';
    document.getElementById('detail-condition').textContent = book.condition;
    document.getElementById('detail-edition').textContent = book.edition || '-';
    document.getElementById('detail-year').textContent = book.publication_year || '-';
    document.getElementById('detail-date').textContent = new Date(book.created_at).toLocaleDateString();
    document.getElementById('detail-description').textContent = book.description || 'No additional description provided.';

    const statusBadge = document.getElementById('detail-status');
    statusBadge.textContent = book.status;
    statusBadge.className = `badge ${book.status === 'APPROVED' ? 'badge-success' : (book.status === 'PENDING' ? 'badge-warning' : 'badge-danger')}`;

    // Images
    const primaryImg = document.getElementById('detail-primary-image');
    const thumbnails = document.getElementById('detail-thumbnails');
    thumbnails.innerHTML = '';

    if (book.images && book.images.length > 0) {
      primaryImg.src = book.images[0].image_url;
      book.images.forEach((img, idx) => {
        const thumb = document.createElement('div');
        thumb.className = `thumbnail-item ${idx === 0 ? 'active' : ''}`;
        thumb.innerHTML = `<img src="${img.image_url}" style="width:100%;height:100%;object-fit:cover;">`;
        thumb.onclick = () => {
          primaryImg.src = img.image_url;
          document.querySelectorAll('.thumbnail-item').forEach(t => t.classList.remove('active'));
          thumb.classList.add('active');
        };
        thumbnails.appendChild(thumb);
      });
    } else {
      primaryImg.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect fill="%23f8fafc" width="400" height="400"/><text fill="%2394a3b8" font-family="sans-serif" font-size="18" font-weight="bold" x="50%" y="50%" text-anchor="middle">📚 No Photo Uploaded</text></svg>';
    }

    // Seller Information
    const seller = book.seller || {};
    document.getElementById('detail-seller-name').textContent = seller.name || 'Anonymous Student';
    document.getElementById('detail-seller-college').textContent = seller.college_name || 'Campus Marketplace';
    document.getElementById('detail-seller-avatar').textContent = (seller.name || 'S').charAt(0).toUpperCase();

    const emailBtn = document.getElementById('btn-seller-email');
    const emailSpan = document.getElementById('detail-seller-email');
    if (seller.email) {
      emailSpan.textContent = seller.email;
      emailBtn.href = `mailto:${seller.email}?subject=${encodeURIComponent(`Interested in your book: ${book.title}`)}`;
      emailBtn.classList.remove('hidden');
    } else {
      emailBtn.classList.add('hidden');
    }

    const whatsappBtn = document.getElementById('btn-seller-whatsapp');
    const whatsappSpan = document.getElementById('detail-seller-whatsapp-phone');
    const phoneBtn = document.getElementById('btn-seller-phone');
    const phoneSpan = document.getElementById('detail-seller-phone');
    if (seller.phone) {
      let rawDigits = seller.phone.replace(/[^0-9]/g, '');
      let waPhone = rawDigits.length === 10 ? `91${rawDigits}` : rawDigits;
      let msg = encodeURIComponent(`Hi ${seller.name || 'there'}, I found your book "${book.title}" on BookNest (₹${book.price}) and would like to buy it!`);
      
      if (whatsappBtn && whatsappSpan) {
        whatsappSpan.textContent = seller.phone;
        whatsappBtn.href = `https://wa.me/${waPhone}?text=${msg}`;
        whatsappBtn.classList.remove('hidden');
      }

      phoneSpan.textContent = seller.phone;
      phoneBtn.href = `tel:${seller.phone}`;
      phoneBtn.classList.remove('hidden');
    } else {
      if (whatsappBtn) whatsappBtn.classList.add('hidden');
      phoneBtn.classList.add('hidden');
    }

  } catch (err) {
    showToast(err.message || 'Failed to load book details', 'error');
    navigateTo('marketplace');
  }
}

// Create Book Flow
function handleImageFileSelected(input) {
  if (!input.files || !input.files[0]) return;
  const file = input.files[0];
  state.selectedImageFile = file;

  const reader = new FileReader();
  reader.onload = (e) => {
    const preview = document.getElementById('image-preview');
    preview.src = e.target.result;
    document.getElementById('image-filename').textContent = `${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
    document.getElementById('image-preview-wrapper').classList.remove('hidden');
    document.getElementById('image-placeholder').classList.add('hidden');
  };
  reader.readAsDataURL(file);
}

function clearImageSelection() {
  state.selectedImageFile = null;
  document.getElementById('book-image-file').value = '';
  document.getElementById('image-preview-wrapper').classList.add('hidden');
  document.getElementById('image-placeholder').classList.remove('hidden');
}

async function handleCreateBook(e) {
  e.preventDefault();
  const btn = document.getElementById('btn-submit-book');
  btn.disabled = true;
  btn.textContent = 'Listing Book...';

  try {
    const payload = {
      category_id: parseInt(document.getElementById('book-category').value),
      title: document.getElementById('book-title').value.trim(),
      author: document.getElementById('book-author').value.trim(),
      condition: document.getElementById('book-condition').value,
      price: parseFloat(document.getElementById('book-price').value),
      edition: document.getElementById('book-edition').value.trim() || null,
      publication_year: parseInt(document.getElementById('book-year').value) || null,
      description: document.getElementById('book-description').value.trim() || null
    };

    // 1. Create Book listing (POST /api/books)
    const bookRes = await api.post('/books', payload, true);
    const newBookId = bookRes.book.book_id;

    // 2. Upload image if selected (POST /api/books/:id/images)
    if (state.selectedImageFile) {
      btn.textContent = 'Uploading Cover Image...';
      const formData = new FormData();
      formData.append('image', state.selectedImageFile);
      await api.upload(`/books/${newBookId}/images`, formData);
    }

    showToast('Book listing created successfully! Submitted for moderator review.', 'success');
    document.getElementById('create-book-form').reset();
    clearImageSelection();
    navigateTo('my-books');
  } catch (err) {
    showToast(err.message || 'Failed to create book listing', 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Submit Book for Approval';
  }
}

// My Books Listing (Seller view)
async function loadMyBooks() {
  const tbody = document.getElementById('my-books-tbody');
  const empty = document.getElementById('my-books-empty');
  tbody.innerHTML = '<tr><td colspan="7" class="text-muted p-4">Loading your listings...</td></tr>';

  try {
    const res = await api.get('/books/my-books', true);
    const books = res.books || [];

    if (books.length === 0) {
      tbody.innerHTML = '';
      empty?.classList.remove('hidden');
      return;
    }

    empty?.classList.add('hidden');
    tbody.innerHTML = books.map(book => {
      const statusBadge = book.status === 'APPROVED' ? 'badge-success' : (book.status === 'PENDING' ? 'badge-warning' : 'badge-danger');
      const noteHtml = book.admin_note ? `<div class="text-danger mt-1" style="font-size:0.75rem;">Note: ${escapeHtml(book.admin_note)}</div>` : '';
      return `
        <tr>
          <td>
            <img src="${book.image_url || '/uploads/placeholder-book.jpg'}" class="table-thumb" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'44\\' height=\\'56\\' viewBox=\\'0 0 44 56\\'><rect fill=\\'%23cbd5e1\\' width=\\'44\\' height=\\'56\\'/></svg>'">
          </td>
          <td>
            <strong>${escapeHtml(book.title)}</strong>
            <div class="text-muted" style="font-size:0.8rem;">${escapeHtml(book.author || 'No author')}</div>
            ${noteHtml}
          </td>
          <td>${escapeHtml(book.category_name || '-')}</td>
          <td><span class="badge badge-condition">${escapeHtml(book.condition)}</span></td>
          <td><strong>₹${Number(book.price).toFixed(0)}</strong></td>
          <td><span class="badge ${statusBadge}">${book.status}</span></td>
          <td>
            <button class="btn btn-outline btn-sm" onclick="navigateTo('book-details', '${book.book_id}')">View</button>
            <button class="btn btn-danger btn-sm" onclick="handleDeleteMyBook('${book.book_id}')">Delete</button>
          </td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-danger p-4">Error loading books: ${err.message}</td></tr>`;
  }
}

async function handleDeleteMyBook(bookId) {
  if (!confirm('Are you sure you want to delete this book listing?')) return;

  try {
    await api.delete(`/books/${bookId}`, true);
    showToast('Book listing deleted successfully.', 'success');
    loadMyBooks();
  } catch (err) {
    showToast(err.message || 'Failed to delete book', 'error');
  }
}

// User Profile
async function loadUserProfile() {
  try {
    const res = await api.get('/users/profile', true);
    const u = res.user;

    document.getElementById('profile-name').value = u.name || '';
    document.getElementById('profile-email').value = u.email || '';
    document.getElementById('profile-college').value = u.college_name || '';
    document.getElementById('profile-college-id').value = u.college_id || '';
    document.getElementById('profile-phone').value = u.phone || '';
  } catch (err) {
    showToast(err.message || 'Failed to load profile', 'error');
  }
}

async function handleUpdateProfile(e) {
  e.preventDefault();
  try {
    const payload = {
      name: document.getElementById('profile-name').value.trim(),
      college_name: document.getElementById('profile-college').value.trim(),
      college_id: document.getElementById('profile-college-id').value.trim(),
      phone: document.getElementById('profile-phone').value.trim()
    };

    const res = await api.put('/users/profile', payload, true);
    state.user = { ...state.user, ...res.user };
    localStorage.setItem('user', JSON.stringify(state.user));
    updateAuthUI();
    showToast('Profile details updated successfully!', 'success');
  } catch (err) {
    showToast(err.message || 'Failed to update profile', 'error');
  }
}

async function handleChangePassword(e) {
  e.preventDefault();
  try {
    const currentPassword = document.getElementById('pwd-current').value;
    const newPassword = document.getElementById('pwd-new').value;

    await api.put('/users/change-password', { currentPassword, newPassword }, true);
    showToast('Password changed successfully!', 'success');
    document.getElementById('password-form').reset();
  } catch (err) {
    showToast(err.message || 'Failed to change password', 'error');
  }
}

// Admin Dashboard & Workflows
async function loadAdminData() {
  if (!state.user || state.user.role !== 'ADMIN') return;

  try {
    // 1. Stats
    const statsRes = await api.get('/admin/stats', true);
    const s = statsRes.stats;
    document.getElementById('stat-total-users').textContent = s.total_users;
    document.getElementById('stat-total-books').textContent = s.total_books;
    document.getElementById('stat-pending-books').textContent = s.pending_books;
    document.getElementById('stat-approved-books').textContent = s.approved_books;
    document.getElementById('tab-pending-count').textContent = s.pending_books;

    // Load active tab
    switchAdminTab(state.activeAdminTab);
  } catch (err) {
    showToast('Failed to load admin stats: ' + err.message, 'error');
  }
}

function switchAdminTab(tabName) {
  state.activeAdminTab = tabName;
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.remove('active'));

  const tabBtn = Array.from(document.querySelectorAll('.tab-btn')).find(b => b.textContent.toLowerCase().includes(tabName.toLowerCase()));
  if (tabBtn) tabBtn.classList.add('active');

  const content = document.getElementById(`admin-tab-${tabName}`);
  if (content) content.classList.add('active');

  if (tabName === 'pending') loadAdminPendingBooks();
  else if (tabName === 'all-books') loadAdminAllBooks();
  else if (tabName === 'users') loadAdminUsers();
  else if (tabName === 'categories') loadAdminCategories();
}

async function loadAdminPendingBooks() {
  const tbody = document.getElementById('admin-pending-tbody');
  const empty = document.getElementById('admin-pending-empty');
  tbody.innerHTML = '<tr><td colspan="6" class="text-muted p-4">Loading pending submissions...</td></tr>';

  try {
    const res = await api.get('/admin/books/pending', true);
    const books = res.books || [];

    if (books.length === 0) {
      tbody.innerHTML = '';
      empty?.classList.remove('hidden');
      return;
    }

    empty?.classList.add('hidden');
    tbody.innerHTML = books.map(book => `
      <tr>
        <td>
          <img src="${book.image_url || '/uploads/placeholder-book.jpg'}" class="table-thumb" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'44\\' height=\\'56\\' viewBox=\\'0 0 44 56\\'><rect fill=\\'%23cbd5e1\\' width=\\'44\\' height=\\'56\\'/></svg>'">
        </td>
        <td>
          <strong>${escapeHtml(book.title)}</strong>
          <div class="text-muted">${escapeHtml(book.author || 'No author')} • ${escapeHtml(book.category_name || 'Academic')}</div>
        </td>
        <td>
          <div>${escapeHtml(book.seller_name || 'Student')}</div>
          <div class="text-muted" style="font-size:0.75rem;">${escapeHtml(book.seller_email || '')}</div>
        </td>
        <td>
          <strong>₹${Number(book.price).toFixed(0)}</strong>
          <div><span class="badge badge-condition">${escapeHtml(book.condition)}</span></div>
        </td>
        <td>${new Date(book.created_at).toLocaleDateString()}</td>
        <td>
          <button class="btn btn-success btn-sm" onclick="handleApproveBook('${book.book_id}')">Approve</button>
          <button class="btn btn-danger btn-sm" onclick="openRejectModal('${book.book_id}')">Reject</button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-danger p-4">Failed to load pending books: ${err.message}</td></tr>`;
  }
}

async function handleApproveBook(bookId) {
  try {
    await api.put(`/admin/books/${bookId}/approve`, {}, true);
    showToast('Book approved successfully!', 'success');
    loadAdminData();
  } catch (err) {
    showToast('Approval failed: ' + err.message, 'error');
  }
}

function openRejectModal(bookId) {
  state.rejectingBookId = bookId;
  document.getElementById('reject-note-input').value = '';
  document.getElementById('reject-modal').classList.remove('hidden');
}

function closeRejectModal() {
  state.rejectingBookId = null;
  document.getElementById('reject-modal').classList.add('hidden');
}

async function confirmRejectBook() {
  if (!state.rejectingBookId) return;
  const admin_note = document.getElementById('reject-note-input').value.trim();

  try {
    await api.put(`/admin/books/${state.rejectingBookId}/reject`, { admin_note }, true);
    showToast('Book rejected with notification note.', 'info');
    closeRejectModal();
    loadAdminData();
  } catch (err) {
    showToast('Rejection failed: ' + err.message, 'error');
  }
}

async function loadAdminAllBooks() {
  const tbody = document.getElementById('admin-all-books-tbody');
  tbody.innerHTML = '<tr><td colspan="6" class="text-muted p-4">Loading catalog...</td></tr>';

  try {
    const res = await api.get('/admin/books', true);
    const books = res.books || [];

    tbody.innerHTML = books.map(book => {
      const statusBadge = book.status === 'APPROVED' ? 'badge-success' : (book.status === 'PENDING' ? 'badge-warning' : 'badge-danger');
      return `
        <tr>
          <td><img src="${book.image_url || '/uploads/placeholder-book.jpg'}" class="table-thumb"></td>
          <td>
            <strong>${escapeHtml(book.title)}</strong>
            <div class="text-muted">${escapeHtml(book.author || 'No author')} • ${escapeHtml(book.category_name || '')}</div>
          </td>
          <td>${escapeHtml(book.seller_name || 'Student')}</td>
          <td><strong>₹${Number(book.price).toFixed(0)}</strong></td>
          <td><span class="badge ${statusBadge}">${book.status}</span></td>
          <td>
            <button class="btn btn-outline btn-sm" onclick="navigateTo('book-details', '${book.book_id}')">View</button>
            <button class="btn btn-danger btn-sm" onclick="handleAdminDeleteBook('${book.book_id}')">Delete</button>
          </td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-danger p-4">Failed to load catalog: ${err.message}</td></tr>`;
  }
}

async function handleAdminDeleteBook(bookId) {
  if (!confirm('Are you sure you want to permanently delete this book?')) return;
  try {
    await api.delete(`/admin/books/${bookId}`, true);
    showToast('Book deleted permanently.', 'success');
    loadAdminData();
  } catch (err) {
    showToast('Delete failed: ' + err.message, 'error');
  }
}

async function loadAdminUsers() {
  const tbody = document.getElementById('admin-users-tbody');
  tbody.innerHTML = '<tr><td colspan="6" class="text-muted p-4">Loading users...</td></tr>';

  try {
    const res = await api.get('/admin/users', true);
    const users = res.users || [];

    tbody.innerHTML = users.map(u => `
      <tr>
        <td>#${u.user_id}</td>
        <td>
          <strong>${escapeHtml(u.name)}</strong>
          <div class="text-muted" style="font-size:0.8rem;">${escapeHtml(u.email)}</div>
        </td>
        <td><span class="badge ${u.role === 'ADMIN' ? 'badge-warning' : 'badge-info'}">${u.role}</span></td>
        <td>${u.total_books || 0} books</td>
        <td><span class="badge ${u.is_blocked ? 'badge-danger' : 'badge-success'}">${u.is_blocked ? 'BLOCKED' : 'ACTIVE'}</span></td>
        <td>
          ${u.role === 'ADMIN' ? '<span class="text-muted">-</span>' : (
            u.is_blocked ?
              `<button class="btn btn-success btn-sm" onclick="handleToggleBlockUser('${u.user_id}', false)">Unblock</button>` :
              `<button class="btn btn-danger btn-sm" onclick="handleToggleBlockUser('${u.user_id}', true)">Block</button>`
          )}
        </td>
      </tr>
    `).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-danger p-4">Failed to load users: ${err.message}</td></tr>`;
  }
}

async function handleToggleBlockUser(userId, block) {
  const action = block ? 'block' : 'unblock';
  if (!confirm(`Are you sure you want to ${action} this user?`)) return;

  try {
    await api.put(`/admin/users/${userId}/${action}`, {}, true);
    showToast(`User ${action}ed successfully.`, 'success');
    loadAdminUsers();
  } catch (err) {
    showToast(`Failed to ${action} user: ` + err.message, 'error');
  }
}

async function loadAdminCategories() {
  const list = document.getElementById('admin-categories-list');
  if (!list) return;

  try {
    const res = await api.get('/categories');
    const categories = res.categories || [];
    list.innerHTML = categories.map(c => `
      <li>
        <div>
          <strong>${escapeHtml(c.name)}</strong>
          <div class="text-muted" style="font-size:0.8rem;">${escapeHtml(c.description || 'No description')}</div>
        </div>
        <span class="badge badge-info">ID: ${c.category_id}</span>
      </li>
    `).join('');
  } catch (err) {
    list.innerHTML = `<li class="text-danger">Failed to load categories: ${err.message}</li>`;
  }
}

async function handleCreateCategory(e) {
  e.preventDefault();
  const name = document.getElementById('new-cat-name').value.trim();
  const description = document.getElementById('new-cat-desc').value.trim();

  try {
    await api.post('/categories', { name, description }, true);
    showToast('Category created successfully!', 'success');
    document.getElementById('add-category-form').reset();
    loadCategories();
    loadAdminCategories();
  } catch (err) {
    showToast(err.message || 'Failed to create category', 'error');
  }
}

// Utility: Escape HTML to prevent XSS
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
