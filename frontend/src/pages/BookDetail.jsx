import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Calendar,
  Layers,
  MapPin,
  Mail,
  Phone,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Trash2,
  Edit,
  Upload,
  ArrowLeft,
  Share2,
  AlertTriangle,
  UserCheck,
} from 'lucide-react';
import { booksApi } from '../api/booksApi';
import { adminApi } from '../api/adminApi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ImageWithFallback from '../components/common/ImageWithFallback';
import ConditionBadge from '../components/common/ConditionBadge';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatPrice, formatDate } from '../utils/formatters';

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const { showSuccess, showError } = useToast();

  const [book, setBook] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isUploadImageModalOpen, setIsUploadImageModalOpen] = useState(false);
  const [rejectionNote, setRejectionNote] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadPreview, setUploadPreview] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchBook = useCallback(async () => {
    try {
      setLoading(true);
      const data = await booksApi.getById(id);
      setBook(data);
      setSelectedImageIndex(0);
    } catch (err) {
      console.error('Failed to load book details:', err);
      showError(err.message || 'Book not found');
    } finally {
      setLoading(false);
    }
  }, [id, showError]);

  useEffect(() => {
    fetchBook();
  }, [fetchBook]);

  // Handle owner delete
  const handleDeleteBook = async () => {
    try {
      setActionLoading(true);
      if (isAdmin && user?.user_id !== book?.seller_id) {
        await adminApi.deleteBook(id);
      } else {
        await booksApi.delete(id);
      }
      showSuccess('Listing removed successfully');
      setIsDeleteModalOpen(false);
      navigate(user?.user_id === book?.seller_id ? '/dashboard/my-books' : '/books');
    } catch (err) {
      showError(err.message || 'Failed to delete listing');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle admin approve
  const handleApproveBook = async () => {
    try {
      setActionLoading(true);
      await adminApi.approveBook(id);
      showSuccess('Listing approved! It is now visible on the marketplace.');
      fetchBook();
    } catch (err) {
      showError(err.message || 'Failed to approve listing');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle admin reject
  const handleRejectBook = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await adminApi.rejectBook(id, rejectionNote.trim());
      showSuccess('Listing rejected and feedback saved for the student seller.');
      setIsRejectModalOpen(false);
      fetchBook();
    } catch (err) {
      showError(err.message || 'Failed to reject listing');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle upload additional image
  const handleImageUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      showError('Please select an image first');
      return;
    }
    try {
      setActionLoading(true);
      await booksApi.uploadImage(id, uploadFile);
      showSuccess('Image uploaded successfully!');
      setIsUploadImageModalOpen(false);
      setUploadFile(null);
      setUploadPreview(null);
      fetchBook();
    } catch (err) {
      showError(err.message || 'Failed to upload image');
    } finally {
      setActionLoading(false);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showSuccess('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner text="Fetching textbook details..." />
      </div>
    );
  }

  if (!book) {
    return (
      <div className="max-w-xl mx-auto my-20 p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-4">
        <BookOpen className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Book Not Found</h2>
        <p className="text-sm text-slate-500">
          This listing might have been removed or is pending approval.
        </p>
        <Link
          to="/books"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-sm shadow-md"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Marketplace</span>
        </Link>
      </div>
    );
  }

  const isOwner = user?.user_id === book.seller_id;
  const images = book.images || [];
  const currentImage = images[selectedImageIndex]?.image_url || (images.length > 0 ? images[0].image_url : null);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to="/books"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Browse</span>
        </Link>
        <button
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Share</span>
        </button>
      </div>

      {/* Rejection Alert Banner (if rejected and owner/admin) */}
      {book.status === 'REJECTED' && (
        <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm">Listing Rejected by Admin</h4>
            <p className="text-xs text-rose-700 mt-1">
              <strong>Admin Note:</strong> {book.admin_note || 'Listing does not adhere to marketplace guidelines.'}
            </p>
            {isOwner && (
              <p className="text-xs text-rose-600 mt-2 font-medium">
                You can edit this book to fix the issues and automatically re-submit it for approval.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Pending Review Banner */}
      {book.status === 'PENDING' && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center gap-3">
          <Clock className="w-5 h-5 text-amber-600 shrink-0" />
          <p className="text-xs font-semibold">
            This listing is currently <strong>Pending Admin Review</strong>. Once verified, it will be visible on the public marketplace.
          </p>
        </div>
      )}

      {/* Owner & Admin Action Banners */}
      {isOwner && (
        <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-indigo-900 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-indigo-600" />
            <span>You are the seller of this textbook</span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to={`/dashboard/edit-book/${book.book_id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-indigo-700 border border-indigo-200 hover:bg-indigo-50 shadow-2xs"
            >
              <Edit className="w-3.5 h-3.5" />
              Edit Listing
            </Link>
            <button
              onClick={() => setIsUploadImageModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-2xs"
            >
              <Upload className="w-3.5 h-3.5" />
              Add Photo
            </button>
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 shadow-2xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Admin Action Bar */}
      {isAdmin && !isOwner && (
        <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Admin Review Tools</span>
          </div>
          <div className="flex items-center gap-2">
            {book.status === 'PENDING' && (
              <>
                <button
                  disabled={actionLoading}
                  onClick={handleApproveBook}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Approve Listing
                </button>
                <button
                  disabled={actionLoading}
                  onClick={() => setIsRejectModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-xs"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Reject Listing
                </button>
              </>
            )}
            <button
              disabled={actionLoading}
              onClick={() => setIsDeleteModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete (Admin)
            </button>
          </div>
        </div>
      )}

      {/* Main Grid: Images & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Column: Image Viewer (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-3 shadow-sm overflow-hidden">
            <ImageWithFallback
              src={currentImage}
              alt={book.title}
              aspectRatio="aspect-[3/4]"
              className="rounded-2xl shadow-inner w-full object-cover"
            />
          </div>

          {/* Thumbnails if multiple images */}
          {images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={img.image_id || idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-16 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                    selectedImageIndex === idx
                      ? 'border-indigo-600 shadow-md scale-105'
                      : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <ImageWithFallback
                    src={img.image_url}
                    alt={`Thumbnail ${idx + 1}`}
                    aspectRatio="aspect-square"
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Book Info & Seller (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Header Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <ConditionBadge condition={book.condition} size="lg" />
            {book.category_name && (
              <span className="px-3 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-700">
                {book.category_name}
              </span>
            )}
            <StatusBadge status={book.status} size="lg" />
          </div>

          {/* Title & Author */}
          <div>
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-snug">
              {book.title}
            </h1>
            {book.author && (
              <p className="text-base font-semibold text-slate-600 mt-1">
                by <span className="text-slate-900">{book.author}</span>
              </p>
            )}
          </div>

          {/* Price Box */}
          <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-indigo-900/60 uppercase tracking-wider block">
                Selling Price
              </span>
              <span className="text-3xl sm:text-4xl font-black text-indigo-600">
                {formatPrice(book.price)}
              </span>
            </div>
            <span className="text-xs font-semibold text-indigo-700 bg-indigo-100 px-3 py-1.5 rounded-xl">
              Pay Directly to Student
            </span>
          </div>

          {/* Specifications Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Edition</span>
              <span className="font-bold text-slate-800 text-sm mt-0.5 block">
                {book.edition || 'Standard'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Publication Year</span>
              <span className="font-bold text-slate-800 text-sm mt-0.5 block">
                {book.publication_year || 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Listed Date</span>
              <span className="font-bold text-slate-800 text-sm mt-0.5 block">
                {formatDate(book.created_at)}
              </span>
            </div>
          </div>

          {/* Description */}
          {book.description && (
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Seller's Note & Details
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed bg-white p-4 rounded-2xl border border-slate-200/70 whitespace-pre-line">
                {book.description}
              </p>
            </div>
          )}

          {/* Seller Profile Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-indigo-600" />
                <span>Seller Contact Details</span>
              </h3>
              {book.seller?.is_verified && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Verified Student
                </span>
              )}
            </div>

            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-100 border border-indigo-200 flex items-center justify-center overflow-hidden shrink-0">
                {book.seller?.profile_photo_url ? (
                  <ImageWithFallback
                    src={book.seller.profile_photo_url}
                    alt={book.seller.name}
                    aspectRatio="aspect-square"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-lg font-black text-indigo-700">
                    {book.seller?.name?.charAt(0) || 'S'}
                  </span>
                )}
              </div>

              <div className="flex-1 space-y-1">
                <h4 className="font-bold text-slate-900 text-base">{book.seller?.name}</h4>
                {book.seller?.college_name && (
                  <p className="text-xs text-slate-600 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span>{book.seller.college_name}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Direct Contact Actions */}
            {isAuthenticated ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {book.seller?.email && (
                  <a
                    href={`mailto:${book.seller.email}?subject=Interested in purchasing: ${encodeURIComponent(book.title)}`}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Email Seller ({book.seller.email})</span>
                  </a>
                )}
                {book.seller?.phone ? (
                  <a
                    href={`tel:${book.seller.phone}`}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md transition-all"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Call / SMS ({book.seller.phone})</span>
                  </a>
                ) : (
                  <div className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl bg-slate-100 text-slate-500 text-xs font-medium">
                    <span>Phone not provided</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-2">
                <p className="text-xs font-semibold text-slate-600">
                  Sign in to view full contact numbers and connect directly with the seller.
                </p>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-sm"
                >
                  <span>Log In to Contact Seller</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Book Listing"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Are you sure you want to permanently delete <strong>"{book.title}"</strong>? This action cannot be undone.
          </p>
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={actionLoading}
              onClick={handleDeleteBook}
              className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md"
            >
              {actionLoading ? 'Deleting...' : 'Yes, Delete Listing'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Reject Book Modal (Admin) */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title="Reject Book Listing"
      >
        <form onSubmit={handleRejectBook} className="space-y-4">
          <p className="text-xs text-slate-500">
            Provide a clear rejection note to help the student understand why their listing was not approved (e.g. unclear photo, incorrect price).
          </p>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Rejection Reason / Note
            </label>
            <textarea
              rows={3}
              required
              value={rejectionNote}
              onChange={(e) => setRejectionNote(e.target.value)}
              placeholder="e.g. Please provide a clear cover photo and double check the book edition."
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            />
          </div>
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsRejectModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md"
            >
              {actionLoading ? 'Rejecting...' : 'Reject Listing'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Upload Additional Image Modal */}
      <Modal
        isOpen={isUploadImageModalOpen}
        onClose={() => setIsUploadImageModalOpen(false)}
        title="Upload Book Photo"
      >
        <form onSubmit={handleImageUpload} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Select Photo (JPEG, PNG, WebP - Max 5MB)
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
              onClick={() => setIsUploadImageModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md"
            >
              {actionLoading ? 'Uploading...' : 'Upload Photo'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default BookDetail;
