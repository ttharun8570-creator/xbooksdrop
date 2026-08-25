import React from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  BookMarked,
  PlusCircle,
  User,
  ShieldCheck,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ImageWithFallback from '../../components/common/ImageWithFallback';

const DashboardLayout = () => {
  const { user, isAdmin } = useAuth();

  const navItemClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-200 ${
      isActive
        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sidebar (3 cols) */}
        <aside className="lg:col-span-3 space-y-6">
          {/* User Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs text-center space-y-3">
            <div className="w-20 h-20 rounded-full mx-auto bg-indigo-100 border-2 border-indigo-200 overflow-hidden flex items-center justify-center">
              {user?.profile_photo_url ? (
                <ImageWithFallback
                  src={user.profile_photo_url}
                  alt={user.name}
                  aspectRatio="aspect-square"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl font-black text-indigo-700 uppercase">
                  {user?.name?.charAt(0) || 'U'}
                </span>
              )}
            </div>

            <div>
              <h3 className="font-bold text-slate-900 text-base">{user?.name}</h3>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              {user?.college_name && (
                <p className="text-xs font-semibold text-indigo-600 mt-1 truncate">
                  {user.college_name}
                </p>
              )}
            </div>

            <div className="pt-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold ${
                isAdmin
                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                  : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
              }`}>
                {isAdmin ? 'ADMINISTRATOR' : 'STUDENT SELLER'}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-3 shadow-xs space-y-1">
            <NavLink to="/dashboard" end className={navItemClass}>
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard Overview</span>
            </NavLink>

            <NavLink to="/dashboard/my-books" className={navItemClass}>
              <BookMarked className="w-4 h-4" />
              <span>My Book Listings</span>
            </NavLink>

            <NavLink to="/dashboard/create-book" className={navItemClass}>
              <PlusCircle className="w-4 h-4" />
              <span>Post a Book for Sale</span>
            </NavLink>

            <NavLink to="/dashboard/profile" className={navItemClass}>
              <User className="w-4 h-4" />
              <span>Profile & Settings</span>
            </NavLink>

            {isAdmin && (
              <div className="pt-2 mt-2 border-t border-slate-100">
                <Link
                  to="/admin"
                  className="flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold text-amber-900 bg-amber-50/80 hover:bg-amber-100 border border-amber-200 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    <span>Admin Console</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-amber-500" />
                </Link>
              </div>
            )}
          </div>
        </aside>

        {/* Content Outlet (9 cols) */}
        <main className="lg:col-span-9">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
