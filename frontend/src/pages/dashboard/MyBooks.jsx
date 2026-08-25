import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  PlusCircle,
  Trash2,
  Edit,
  Upload,
  Eye,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Tag,
  Search,
} from 'lucide-react';
import { booksApi } from '../../api/booksApi';
import { useToast } from '../../context/ToastContext';
import ImageWithFallback from '../../components/common/ImageWithFallback';
import ConditionBadge from '../../components/common/ConditionBadge';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatPrice, formatDate } from '../../utils/formatters';

const MyBooks = () => {
  const { showSuccess, showError } = useToast();

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [selectedBookForDelete, setSelectedBookForDelete] = useState(null);
  const [selectedBookForImage, setSelectedBookForImage] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadPreview, setUploadPreview] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchMyBooks = useCallback(async () => {
    try {
      setLoading(true);
      const data = await booksApi.getMyBooks();
      setBooks(data || []);
    } catch (err) {
      console.error('Failed to load my books:', err);
      showError(err.message || 'Failed to fetch your books');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchMyBooks();
  }, [fetchMyBooks]);

  const handleDelete = async () => {
    if (!selectedBookForDelete) return;
    try {
      setActionLoading(true);
      await booksApi.delete(selectedBookForDelete.book_id);
      showSuccess('Book listing deleted successfully');
      setSelectedBookForDelete(null);
      fetchMyBooks();
    } catch (err) {
      showError(err.message || 'Failed to delete listing');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUploadImage = async (e) => {
    e.preventDefault();
    if (!uploadFile || !selectedBookForImage) {
      showError('Please choose an image file first');
      return;
    }
    try {
      setActionLoading(true);
      await booksApi.uploadImage(selectedBookForImage.book_id, uploadFile);
      showSuccess('Book photo uploaded successfully!');
      setSelectedBookForImage(null);
      setUploadFile(null);
      setUploadPreview(null);
      fetchMyBooks();
    } catch (err) {
      showError(err.message || 'Failed to upload photo');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredBooks = books.filter((b) => {
    const matchesStatus =
      statusFilter === 'ALL' || b.status === statusFilter;
    const matchesSearch =
      !searchQuery ||
      b.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.author?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const counts = {
    ALL: books.length,
    APPROVED: books.filter((b) => b.status === 'APPROVED').length,
    PENDING: books.filter((b) => b.status === 'PENDING').length,
    REJECTED: books.filter((b) => b.status === 'REJECTED').length,
    SOLD: books.filter((b) => b.status === 'SOLD').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            My Book Listings
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track approval statuses, manage your prices, and upload photos.
          </p>
        </div>

        <Link
          to="/dashboard/create-book"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post New Book</span>
        </Link>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-4 shadow-xs space-y-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { key: 'ALL', label: 'All Listings' },
            { key: 'APPROVED', label: 'Approved (Live)' },
            { key: 'PENDING', label: 'Pending Review' },
            { key: 'REJECTED', label: 'Needs Attention' },
            { key: 'SOLD', label: 'Sold' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setStatusFilter(tab.key)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                statusFilter === tab.key
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.5 rounded-md text-[10px] ${
                  statusFilter === tab.key
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-200/80 text-slate-700'
                }`}
              >
                {counts[tab.key] || 0}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your listings by title or author..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Books List */}
      {loading ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12">
          <LoadingSpinner text="Fetching your book listings..." />
        </div>
      ) : filteredBooks.length > 0 ? (
        <div className="space-y-4">
          {filteredBooks.map((book) => (
            <div
              key={book.book_id}
              className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs hover:border-indigo-200 transition-all flex flex-col md:flex-row gap-5 items-start md:items-center justify-between"
            >
              {/* Left Details */}
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <div className="w-20 sm:w-24 aspect-[3/4] rounded-2xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                  <ImageWithFallback
                    src={book.image_url}
                    alt={book.title}
                    aspectRatio="aspect-[3/4]"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={book.status} size="sm" />
                    <ConditionBadge condition={book.condition} size="sm" />
                    {book.category_name && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700">
                        {book.category_name}
                      </span>
                    )}
                  </div>

                  <Link to={`/books/${book.book_id}`}>
                    <h3 className="text-base font-bold text-slate-900 truncate hover:text-indigo-600 transition-colors">
                      {book.title}
                    </h3>
                  </Link>

                  {book.author && (
                    <p className="text-xs text-slate-500 truncate">
                      by <span className="font-semibold text-slate-700">{book.author}</span>
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-xs pt-1">
                    <span className="font-black text-indigo-600 text-base">
                      {formatPrice(book.price)}
                    </span>
                    <span className="text-slate-400">
                      Listed: {formatDate(book.created_at)}
                    </span>
                  </div>

                  {/* Rejection Note Alert */}
                  {book.status === 'REJECTED' && (
                    <div className="mt-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-1">
                      <p className="font-bold flex items-center gap-1.5 text-rose-700">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Admin Feedback
                      </p>
                      <p className="text-rose-800">
                        {book.admin_note || 'Listing does not adhere to guidelines.'}
                      </p>
                      <p className="text-[11px] text-rose-600 font-medium">
                        Click "Edit Listing" to fix and re-submit for review.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap md:flex-col lg:flex-row items-center gap-2 shrink-0 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                <Link
                  to={`/books/${book.book_id}`}
                  className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View</span>
                </Link>

                <Link
                  to={`/dashboard/edit-book/${book.book_id}`}
                  className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedBookForImage(book);
                    setUploadFile(null);
                    setUploadPreview(null);
                  }}
                  className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Photo</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedBookForDelete(book)}
                  className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-12 text-center space-y-3">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No books found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {statusFilter !== 'ALL'
              ? `You don't have any books with status "${statusFilter}".`
              : "You haven't listed any textbooks for sale yet."}
          </p>
          <Link
            to="/dashboard/create-book"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-xs mt-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post a Textbook</span>
          </Link>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(selectedBookForDelete)}
        onClose={() => setSelectedBookForDelete(null)}
        title="Delete Book Listing"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Are you sure you want to delete <strong>"{selectedBookForDelete?.title}"</strong>? This will permanently remove your listing.
          </p>
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setSelectedBookForDelete(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={actionLoading}
              onClick={handleDelete}
              className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs"
            >
              {actionLoading ? 'Deleting...' : 'Delete Listing'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Upload Image Modal */}
      <Modal
        isOpen={Boolean(selectedBookForImage)}
        onClose={() => setSelectedBookForImage(null)}
        title={`Upload Photo for "${selectedBookForImage?.title}"`}
      >
        <form onSubmit={handleUploadImage} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Choose Photo File (JPEG, PNG, WebP)
            </label>
            <input
              type="file"
              accept="image/*"
              required
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  setUploadFile(file);
                  setUploadPreview(URL.createObjectURL(file));
                }
              }}
              className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
          </div>

          {uploadPreview && (
            <div className="w-32 h-40 rounded-xl overflow-hidden border border-slate-200 mx-auto">
              <img src={uploadPreview} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setSelectedBookForImage(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
            >
              {actionLoading ? 'Uploading...' : 'Upload Photo'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MyBooks;
