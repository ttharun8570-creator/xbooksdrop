import React from 'react';
import { Link } from 'react-router-dom';
import { BookX, ArrowLeft, Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6 shadow-sm">
        <BookX className="w-8 h-8" />
      </div>
      <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
        404 - Page Not Found
      </h1>
      <p className="text-sm text-slate-500 max-w-md mt-2 mb-8 leading-relaxed">
        The page or textbook you're looking for doesn't seem to exist or may have been moved.
      </p>
      <div className="flex items-center gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-md hover:bg-indigo-700 transition-all"
        >
          <Home className="w-4 h-4" />
          <span>Go Home</span>
        </Link>
        <Link
          to="/books"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Browse Marketplace</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
