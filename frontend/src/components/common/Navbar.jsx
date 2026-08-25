import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  PlusCircle,
  User,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  ChevronDown,
  BookMarked,
  LayoutDashboard,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import ImageWithFallback from './ImageWithFallback';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { showSuccess } = useToast();
  const navigate = useNavigate();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsProfileDropdownOpen(false);
    setIsMobileMenuOpen(false);
    showSuccess('You have been logged out safely.');
    navigate('/');
  };

  const navLinkClass = ({ isActive }) =>
    `text-sm font-semibold transition-colors duration-200 ${
      isActive
        ? 'text-indigo-600 font-bold'
        : 'text-slate-600 hover:text-indigo-600'
    }`;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-1.5">
                Book<span className="text-indigo-600">Nest</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block -mt-1">
                Student Marketplace
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            <NavLink to="/" className={navLinkClass} end>
              Home
            </NavLink>
            <NavLink to="/books" className={navLinkClass}>
              Browse Books
            </NavLink>
            {isAuthenticated && (
              <NavLink to="/dashboard/my-books" className={navLinkClass}>
                My Listings
              </NavLink>
            )}
            {isAdmin && (
              <NavLink
                to="/admin"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                Admin Panel
              </NavLink>
            )}
          </nav>

          {/* Desktop Right Action Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {/* Post/Sell a Book Button */}
            <Link
              to={isAuthenticated ? "/dashboard/create-book" : "/login"}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 shadow-sm shadow-indigo-500/25 transition-all hover:shadow-md hover:-translate-y-0.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Sell a Book</span>
            </Link>

            {isAuthenticated ? (
              /* User Profile Dropdown */
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsProfileDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-2.5 p-1.5 pl-2 pr-3 rounded-full border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 transition-all focus:outline-none"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-indigo-100 border border-indigo-200 flex items-center justify-center">
                    {user?.profile_photo_url ? (
                      <ImageWithFallback
                        src={user.profile_photo_url}
                        alt={user.name}
                        aspectRatio="aspect-square"
                        className="w-full h-full"
                        fallbackIconSize="w-4 h-4"
                      />
                    ) : (
                      <span className="text-xs font-black text-indigo-700 uppercase">
                        {user?.name?.charAt(0) || 'U'}
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-bold text-slate-800 max-w-[100px] truncate">
                    {user?.name?.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-slate-100 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                      <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                      {user?.college_name && (
                        <p className="text-[10px] text-indigo-600 font-semibold truncate mt-0.5">
                          {user.college_name}
                        </p>
                      )}
                      <div className="mt-2 flex items-center gap-1.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                          isAdmin
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-indigo-100 text-indigo-800'
                        }`}>
                          {isAdmin ? 'ADMINISTRATOR' : 'STUDENT SELLER'}
                        </span>
                      </div>
                    </div>

                    <div className="p-1 space-y-0.5">
                      <Link
                        to="/dashboard"
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-slate-500" />
                        Student Dashboard
                      </Link>

                      <Link
                        to="/dashboard/my-books"
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
                      >
                        <BookMarked className="w-4 h-4 text-slate-500" />
                        My Book Listings
                      </Link>

                      <Link
                        to="/dashboard/profile"
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
                      >
                        <User className="w-4 h-4 text-slate-500" />
                        Profile Settings
                      </Link>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-amber-800 bg-amber-50/70 rounded-xl hover:bg-amber-100 transition-colors"
                        >
                          <ShieldCheck className="w-4 h-4 text-amber-600" />
                          Admin Console
                        </Link>
                      )}
                    </div>

                    <div className="pt-1 mt-1 border-t border-slate-100 p-1">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 rounded-xl hover:bg-rose-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-sm font-bold text-slate-700 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl text-sm font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              to={isAuthenticated ? "/dashboard/create-book" : "/login"}
              className="p-2 rounded-xl text-indigo-600 bg-indigo-50"
              aria-label="Sell a Book"
            >
              <PlusCircle className="w-5 h-5" />
            </Link>
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-4 animate-in slide-in-from-top-2">
          {isAuthenticated && (
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="w-10 h-10 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center overflow-hidden">
                {user?.profile_photo_url ? (
                  <ImageWithFallback
                    src={user.profile_photo_url}
                    alt={user.name}
                    aspectRatio="aspect-square"
                    className="w-full h-full"
                  />
                ) : (
                  <span className="font-bold text-indigo-600">
                    {user?.name?.charAt(0) || 'U'}
                  </span>
                )}
              </div>
              <div className="flex-1 truncate">
                <p className="text-sm font-bold text-slate-900 truncate">{user?.name}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </div>
            </div>
          )}

          <nav className="flex flex-col space-y-1">
            <Link
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-xl"
            >
              Home
            </Link>
            <Link
              to="/books"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-xl"
            >
              Browse Marketplace
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-xl flex items-center justify-between"
                >
                  <span>Student Dashboard</span>
                </Link>
                <Link
                  to="/dashboard/my-books"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-xl"
                >
                  My Book Listings
                </Link>
                <Link
                  to="/dashboard/create-book"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-2 text-sm font-bold text-indigo-600 bg-indigo-50 rounded-xl flex items-center gap-2"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Post a Book for Sale</span>
                </Link>
                <Link
                  to="/dashboard/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-xl"
                >
                  Profile & Settings
                </Link>
              </>
            )}
            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-bold text-amber-800 bg-amber-50 rounded-xl flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                Admin Console
              </Link>
            )}
          </nav>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            {isAuthenticated ? (
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
