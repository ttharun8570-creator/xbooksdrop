import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Heart, Shield, Sparkles, GraduationCap } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="mt-auto bg-slate-900 text-slate-400 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Col 1: Brand & Slogan */}
          <div className="md:col-span-1 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <BookOpen className="w-4 h-4" />
              </div>
              <span className="text-lg font-black tracking-tight text-white">
                Book<span className="text-indigo-400">Nest</span>
              </span>
            </Link>
            <p className="text-xs leading-relaxed text-slate-400">
              The peer-to-peer textbook marketplace built exclusively for college students. Save money, recycle books, and connect across campus.
            </p>
            <div className="flex items-center gap-2 text-xs text-indigo-400 font-semibold">
              <GraduationCap className="w-4 h-4" />
              <span>Campus Verified Community</span>
            </div>
          </div>

          {/* Col 2: Marketplace Links */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-4">
              Marketplace
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/books" className="hover:text-white transition-colors">
                  All Textbooks
                </Link>
              </li>
              <li>
                <Link to="/books?sort=price_asc" className="hover:text-white transition-colors">
                  Affordable Books Under $20
                </Link>
              </li>
              <li>
                <Link to="/dashboard/create-book" className="hover:text-white transition-colors">
                  Post a Book for Sale
                </Link>
              </li>
              <li>
                <Link to="/dashboard/my-books" className="hover:text-white transition-colors">
                  My Active Listings
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Student Safety & Guidelines */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-4">
              Student Safety
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-start gap-1.5">
                <Shield className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                <span>Admin review on all listings</span>
              </li>
              <li className="flex items-start gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                <span>Safe campus meetups only</span>
              </li>
              <li className="flex items-start gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                <span>Verified student accounts</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Account & Support */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-4">
              Account
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Student Sign In
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-white transition-colors">
                  Create Free Account
                </Link>
              </li>
              <li>
                <Link to="/dashboard/profile" className="hover:text-white transition-colors">
                  Profile & College Info
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} BookNest Marketplace. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built for college students everywhere <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
