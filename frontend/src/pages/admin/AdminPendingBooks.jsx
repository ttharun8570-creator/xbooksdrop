import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Trash2,
  User,
  MapPin,
  Mail,
  AlertTriangle,
  BookOpen,
  Calendar,
} from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import { useToast } from '../../context/ToastContext';
import ImageWithFallback from '../../components/common/ImageWithFallback';
import ConditionBadge from '../../components/common/ConditionBadge';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatPrice, formatDate } from '../../utils/formatters';

const AdminPendingBooks = () => {
  const { showSuccess, showError } = useToast();

  const [pendingBooks, setPendingBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [rejectingBook, setRejectingBook] = useState(null);
  const [rejectionNote, setRejectionNote] = useState('');
  const [deletingBook, setDeletingBook] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchPending = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminApi.getPendingBooks();
      setPendingBooks(data || []);
    } catch (err) {
      console.error('Failed to load pending books:', err);
      showError(err.message || 'Failed to load pending books');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  const handleApprove = async (id) => {
    try {
      setActionLoading(true);
      await adminApi.approveBook(id);
      showSuccess('Listing approved and published to marketplace!');
      fetchPending();
    } catch (err) {
      showError(err.message || 'Failed to approve listing');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    if (!rejectingBook) return;

    try {
      setActionLoading(true);
      await adminApi.rejectBook(rejectingBook.book_id, rejectionNote.trim());
      showSuccess('Listing rejected and feedback logged for the seller.');
      setRejectingBook(null);
      setRejectionNote('');
      fetchPending();
    } catch (err) {
      showError(err.message || 'Failed to reject listing');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingBook) return;

    try {
      setActionLoading(true);
      await adminApi.deleteBook(deletingBook.book_id);
      showSuccess('Listing deleted from platform by admin');
      setDeletingBook(null);
      fetchPending();
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
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Pending Approvals Queue
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
              {pendingBooks.length}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Review textbook listings submitted by students before they appear on the public marketplace.
          </p>
        </div>
      </div>

      {/* Review List */}
      {loading ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12">
          <LoadingSpinner text="Fetching pending approval queue..." />
        </div>
      ) : pendingBooks.length > 0 ? (
        <div className="space-y-4">
          {pendingBooks.map((book) => (
            <div
              key={book.book_id}
              className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs hover:border-amber-300 transition-all flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between"
            >
              {/* Image & Main Info */}
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <div className="w-24 sm:w-28 aspect-[3/4] rounded-2xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                  <ImageWithFallback
                    src={book.image_url}
                    alt={book.title}
                    aspectRatio="aspect-[3/4]"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                      <Clock className="w-3 h-3 text-amber-600" />
                      Pending Approval
                    </span>
                    <ConditionBadge condition={book.condition} size="sm" />
                    {book.category_name && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700">
                        {book.category_name}
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      {book.title}
                    </h3>
                    {book.author && (
                      <p className="text-xs text-slate-500">
                        by <span className="font-semibold text-slate-700">{book.author}</span>
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span className="font-black text-indigo-600 text-base">
                      {formatPrice(book.price)}
                    </span>
                    {book.edition && <span>Edition: <strong>{book.edition}</strong></span>}
                    {book.publication_year && <span>Year: <strong>{book.publication_year}</strong></span>}
                    <span className="text-slate-400">Submitted: {formatDate(book.created_at)}</span>
                  </div>

                  {/* Seller Info Box */}
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                    <span className="flex items-center gap-1 font-semibold text-slate-800">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      {book.seller_name}
                    </span>
                    {book.seller_college && (
                      <span className="flex items-center gap-1 text-slate-600">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {book.seller_college}
                      </span>
                    )}
                    {book.seller_email && (
                      <span className="flex items-center gap-1 text-slate-500 truncate">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        {book.seller_email}
                      </span>
                    )}
                  </div>

                  {book.description && (
                    <p className="text-xs text-slate-600 italic bg-amber-50/50 p-2 rounded-lg border border-amber-100">
                      "{book.description}"
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap lg:flex-col items-stretch gap-2 shrink-0 w-full lg:w-48 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleApprove(book.book_id)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve Listing</span>
                </button>

                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => {
                    setRejectingBook(book);
                    setRejectionNote('');
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-all"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject with Note</span>
                </button>

                <div className="flex items-center gap-2 w-full">
                  <Link
                    to={`/books/${book.book_id}`}
                    className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Inspect</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => setDeletingBook(book)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete permanently"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-16 text-center space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">Review Queue Clear</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Great job! There are no pending book listings waiting for administrator approval.
          </p>
        </div>
      )}

      {/* Reject Modal */}
      <Modal
        isOpen={Boolean(rejectingBook)}
        onClose={() => setRejectingBook(null)}
        title={`Reject Listing: "${rejectingBook?.title}"`}
      >
        <form onSubmit={handleReject} className="space-y-4">
          <p className="text-xs text-slate-500">
            Please explain why this listing does not meet marketplace standards (e.g. price too high, missing images, incorrect category). The student will see this note.
          </p>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Rejection Reason / Admin Note <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={rejectionNote}
              onChange={(e) => setRejectionNote(e.target.value)}
              placeholder="e.g. Please upload a clear photo of the book cover so buyers can verify the condition."
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setRejectingBook(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs"
            >
              {actionLoading ? 'Rejecting...' : 'Reject Listing'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deletingBook)}
        onClose={() => setDeletingBook(null)}
        title="Admin Delete Book"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Are you sure you want to permanently remove <strong>"{deletingBook?.title}"</strong> from the platform?
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
              {actionLoading ? 'Deleting...' : 'Delete Permanently'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminPendingBooks;
