import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Clock,
  CheckCircle2,
  XCircle,
  PlusCircle,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { booksApi } from '../../api/booksApi';
import { useAuth } from '../../context/AuthContext';
import BookCard from '../../components/books/BookCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const UserOverview = () => {
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyBooks = async () => {
      try {
        setLoading(true);
        const data = await booksApi.getMyBooks();
        setBooks(data || []);
      } catch (err) {
        console.error('Failed to load my books:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyBooks();
  }, []);

  const totalBooks = books.length;
  const approvedBooks = books.filter((b) => b.status === 'APPROVED').length;
  const pendingBooks = books.filter((b) => b.status === 'PENDING').length;
  const rejectedBooks = books.filter((b) => b.status === 'REJECTED').length;

  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200/80 p-8">
        <LoadingSpinner text="Loading dashboard overview..." />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Student Seller Hub</span>
          </span>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Welcome back, {user?.name}!
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            Manage your textbook listings, check real-time approval status from campus admins, and list new books in seconds.
          </p>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Total Listed */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Listed</span>
            <BookOpen className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">{totalBooks}</p>
          <span className="text-[11px] text-slate-500">All submissions</span>
        </div>

        {/* Approved */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Live & Active</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">{approvedBooks}</p>
          <span className="text-[11px] text-emerald-600 font-medium">Visible to students</span>
        </div>

        {/* Pending */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">In Review</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">{pendingBooks}</p>
          <span className="text-[11px] text-amber-600 font-medium">Awaiting admin</span>
        </div>

        {/* Rejected */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">Needs Fix</span>
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">{rejectedBooks}</p>
          <span className="text-[11px] text-rose-600 font-medium">Check admin note</span>
        </div>
      </div>

      {/* Rejected Books Notice (if any) */}
      {rejectedBooks > 0 && (
        <div className="p-5 rounded-3xl bg-rose-50 border border-rose-200 flex items-start gap-4 text-rose-900">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1 space-y-1">
            <h4 className="text-sm font-bold">You have {rejectedBooks} listing(s) requiring attention</h4>
            <p className="text-xs text-rose-700">
              One or more of your book submissions were not approved. Check your listings to read the admin feedback and resubmit.
            </p>
          </div>
          <Link
            to="/dashboard/my-books"
            className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold shrink-0 hover:bg-rose-700 shadow-xs"
          >
            Review Now
          </Link>
        </div>
      )}

      {/* Quick Action Bar */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link
            to="/dashboard/create-book"
            className="p-4 rounded-2xl bg-indigo-50/70 hover:bg-indigo-50 border border-indigo-100 flex items-center gap-3 transition-colors group"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-indigo-950 group-hover:text-indigo-600 transition-colors">
                Post New Textbook
              </p>
              <p className="text-[11px] text-slate-500">Sell in 2 minutes</p>
            </div>
          </Link>

          <Link
            to="/dashboard/my-books"
            className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 flex items-center gap-3 transition-colors group"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                Manage Listings
              </p>
              <p className="text-[11px] text-slate-500">Edit, status & photos</p>
            </div>
          </Link>

          <Link
            to="/books"
            className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 flex items-center gap-3 transition-colors group"
          >
            <div className="w-10 h-10 rounded-xl bg-violet-600 text-white flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                Browse Campus Market
              </p>
              <p className="text-[11px] text-slate-500">Find books to buy</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Submissions */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">Recent Listings</h3>
          <Link
            to="/dashboard/my-books"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            <span>View all ({totalBooks})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {books.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {books.slice(0, 3).map((book) => (
              <BookCard key={book.book_id} book={book} showStatus={true} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">No books listed yet</p>
            <p className="text-xs text-slate-500 mt-0.5 mb-4">Post your unused textbooks to start earning.</p>
            <Link
              to="/dashboard/create-book"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post Your First Book</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserOverview;
