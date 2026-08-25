import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import {
  ShieldCheck,
  LayoutDashboard,
  Clock,
  BookOpen,
  Users,
  Layers,
  ArrowLeft,
} from 'lucide-react';
import { adminApi } from '../../api/adminApi';

const AdminLayout = () => {
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const fetchPendingCount = async () => {
      try {
        const stats = await adminApi.getStats();
        if (stats?.pending_books !== undefined) {
          setPendingCount(stats.pending_books);
        }
      } catch (err) {
        console.warn('Failed to load pending stats count:', err);
      }
    };
    fetchPendingCount();
  }, []);

  const navItemClass = ({ isActive }) =>
    `flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-200 ${
      isActive
        ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Admin Sidebar (3 cols) */}
        <aside className="lg:col-span-3 space-y-6">
          {/* Admin Header Card */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-md">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base font-black tracking-tight">Admin Console</h2>
                <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400">
                  Campus Marketplace
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Review student book submissions, monitor listings, manage users, and configure categories.
            </p>
          </div>

          {/* Navigation */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-3 shadow-xs space-y-1">
            <NavLink to="/admin" end className={navItemClass}>
              <div className="flex items-center gap-3">
                <LayoutDashboard className="w-4 h-4" />
                <span>Admin Dashboard</span>
              </div>
            </NavLink>

            <NavLink to="/admin/pending" className={navItemClass}>
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4" />
                <span>Pending Approvals</span>
              </div>
              {pendingCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950">
                  {pendingCount}
                </span>
              )}
            </NavLink>

            <NavLink to="/admin/books" className={navItemClass}>
              <div className="flex items-center gap-3">
                <BookOpen className="w-4 h-4" />
                <span>All Platform Books</span>
              </div>
            </NavLink>

            <NavLink to="/admin/users" className={navItemClass}>
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4" />
                <span>Manage Users</span>
              </div>
            </NavLink>

            <NavLink to="/admin/categories" className={navItemClass}>
              <div className="flex items-center gap-3">
                <Layers className="w-4 h-4" />
                <span>Book Categories</span>
              </div>
            </NavLink>

            <div className="pt-2 mt-2 border-t border-slate-100">
              <Link
                to="/dashboard"
                className="flex items-center gap-2.5 px-4 py-3 rounded-2xl text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 text-slate-400" />
                <span>Switch to Student View</span>
              </Link>
            </div>
          </div>
        </aside>

        {/* Admin Content Outlet (9 cols) */}
        <main className="lg:col-span-9">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
