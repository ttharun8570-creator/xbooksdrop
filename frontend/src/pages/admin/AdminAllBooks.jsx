import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Search,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  Tag,
  User,
  Filter,
} from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import { useToast } from '../../context/ToastContext';
import ImageWithFallback from '../../components/common/ImageWithFallback';
import ConditionBadge from '../../components/common/ConditionBadge';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatPrice, formatDate } from '../../utils/formatters';

const AdminAllBooks = () => {
  const { showSuccess, showError } = useToast();

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingBook, setDeletingBook] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchBooks = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const data = await adminApi.getAllBooks(params);
      setBooks(data || []);
    } catch (err) {
      console.error('Failed to load books:', err);
      showError(err.message || 'Failed to load books');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchQuery, showError]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const handleDelete = async () => {
    if (!deletingBook) return;
    try {
      setActionLoading(true);
      await adminApi.deleteBook(deletingBook.book_id);
      showSuccess('Listing deleted from marketplace by admin');
      setDeletingBook(null);
      fetchBooks();
    } catch (err) {
      showError(err.message || 'Failed to delete listing');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            All Platform Books
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Search, inspect, and manage all books submitted across campus in any status.
          </p>
        </div>
        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl">
          {books.length} Total Records
        </span>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-4 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title or author name..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-48 px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
        >
          <option value="">All Statuses</option>
          <option value="APPROVED">Approved</option>
          <option value="PENDING">Pending</option>
          <option value="REJECTED">Rejected</option>
          <option value="SOLD">Sold</option>
        </select>
      </div>

      {/* Table / Grid */}
      {loading ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12">
          <LoadingSpinner text="Loading all platform books..." />
        </div>
      ) : books.length > 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-bold">
                  <th className="py-3.5 px-4">Book</th>
                  <th className="py-3.5 px-4">Category & Condition</th>
                  <th className="py-3.5 px-4">Seller</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {books.map((book) => (
                  <tr key={book.book_id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                          <ImageWithFallback
                            src={book.image_url}
                            alt=""
                            aspectRatio="aspect-[3/4]"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="max-w-xs truncate">
                          <Link
                            to={`/books/${book.book_id}`}
                            className="font-bold text-slate-900 hover:text-indigo-600 truncate block"
                          >
                            {book.title}
                          </Link>
                          <p className="text-[11px] text-slate-400 truncate">
                            {book.author ? `by ${book.author}` : 'No author specified'}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 space-y-1">
                      <p className="font-semibold text-slate-700">{book.category_name || 'N/A'}</p>
                      <ConditionBadge condition={book.condition} size="sm" />
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-800">{book.seller_name}</p>
                      <p className="text-[11px] text-slate-400">{book.seller_email}</p>
                    </td>

                    <td className="py-3.5 px-4 font-black text-indigo-600 text-sm">
                      {formatPrice(book.price)}
                    </td>

                    <td className="py-3.5 px-4">
                      <StatusBadge status={book.status} size="sm" />
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/books/${book.book_id}`}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setDeletingBook(book)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Admin Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-12 text-center space-y-2">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700">No books found</h3>
          <p className="text-xs text-slate-500">Try adjusting your search keyword or status filter.</p>
        </div>
      )}

      {/* Delete Modal */}
      <Modal
        isOpen={Boolean(deletingBook)}
        onClose={() => setDeletingBook(null)}
        title="Admin Delete Listing"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Are you sure you want to permanently delete <strong>"{deletingBook?.title}"</strong>?
          </p>
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setDeletingBook(null)}
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
    </div>
  );
};

export default AdminAllBooks;
