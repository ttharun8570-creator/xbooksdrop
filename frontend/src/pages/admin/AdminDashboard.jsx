import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  BookOpen,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ShieldCheck,
  Layers,
  Sparkles,
} from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [pendingBooks, setPendingBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsData, pendingData] = await Promise.all([
          adminApi.getStats(),
          adminApi.getPendingBooks(),
        ]);
        setStats(statsData);
        setPendingBooks(pendingData || []);
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200/80 p-12">
        <LoadingSpinner text="Fetching administrator overview..." />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-950 to-indigo-950 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-400/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Campus Administrator Hub</span>
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Marketplace Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Live health metrics, pending verification queue, and user operations across campus.
          </p>
        </div>

        {stats?.pending_books > 0 && (
          <Link
            to="/admin/pending"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/20 transition-all shrink-0"
          >
            <Clock className="w-4 h-4" />
            <span>Review {stats.pending_books} Pending Book(s)</span>
          </Link>
        )}
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Total Users */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Students</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">{stats?.total_users || 0}</p>
          <span className="text-[11px] text-slate-500">Registered accounts</span>
        </div>

        {/* Total Books */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Books</span>
            <BookOpen className="w-4 h-4 text-slate-700" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">{stats?.total_books || 0}</p>
          <span className="text-[11px] text-slate-500">All submissions</span>
        </div>

        {/* Pending Approvals */}
        <div className="bg-white p-5 rounded-3xl border border-amber-200 bg-amber-50/20 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Pending</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-700">{stats?.pending_books || 0}</p>
          <span className="text-[11px] text-amber-600 font-medium">Awaiting review</span>
        </div>

        {/* Approved Books */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Approved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">{stats?.approved_books || 0}</p>
          <span className="text-[11px] text-emerald-600 font-medium">Live on marketplace</span>
        </div>

        {/* Rejected Books */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">Rejected</span>
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">{stats?.rejected_books || 0}</p>
          <span className="text-[11px] text-rose-600 font-medium">With admin note</span>
        </div>
      </div>

      {/* Quick Access Shortcuts */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900">Admin Action Center</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link
            to="/admin/pending"
            className="p-4 rounded-2xl bg-amber-50 hover:bg-amber-100/80 border border-amber-200 flex items-center justify-between transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-amber-950 group-hover:text-amber-800">
                  Pending Approvals
                </p>
                <p className="text-[11px] text-amber-700">{stats?.pending_books || 0} books waiting</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-amber-600 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            to="/admin/users"
            className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 flex items-center justify-between transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-600">
                  User Management
                </p>
                <p className="text-[11px] text-slate-500">Block, unblock & stats</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            to="/admin/categories"
            className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 flex items-center justify-between transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-600 text-white flex items-center justify-center font-bold">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-600">
                  Book Categories
                </p>
                <p className="text-[11px] text-slate-500">Create & manage categories</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Pending Items Fast-Review Queue */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Pending Review Queue</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Review and approve or reject submissions with feedback.
            </p>
          </div>
          <Link
            to="/admin/pending"
            className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
          >
            <span>Open Review Center</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {pendingBooks.length > 0 ? (
          <div className="space-y-3">
            {pendingBooks.slice(0, 4).map((book) => (
              <div
                key={book.book_id}
                className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-slate-100/70 border border-slate-200/60 transition-colors"
              >
                <div className="flex items-center gap-3 truncate">
                  <div className="w-10 h-12 rounded-lg bg-slate-200 overflow-hidden shrink-0">
                    <img
                      src={book.image_url ? (book.image_url.startsWith('http') ? book.image_url : `http://localhost:5000${book.image_url}`) : '/placeholder-book.svg'}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </div>
                  <div className="truncate">
                    <h4 className="text-xs font-bold text-slate-900 truncate">{book.title}</h4>
                    <p className="text-[11px] text-slate-500 truncate">
                      Seller: <span className="font-semibold text-slate-700">{book.seller_name}</span> ({book.seller_college || 'Campus'})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-black text-indigo-600">${book.price}</span>
                  <Link
                    to={`/books/${book.book_id}`}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-2xs"
                  >
                    Inspect
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">All caught up!</p>
            <p className="text-xs text-slate-500 mt-0.5">
              There are currently no book listings awaiting administrator approval.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
