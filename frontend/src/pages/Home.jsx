import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Zap,
  Users,
  DollarSign,
  CheckCircle2,
  Sparkles,
  PlusCircle,
  Tag,
  TrendingUp,
} from 'lucide-react';
import { booksApi } from '../api/booksApi';
import { categoriesApi } from '../api/categoriesApi';
import BookCard from '../components/books/BookCard';
import { BookCardSkeleton } from '../components/common/LoadingSpinner';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setLoading(true);
        const [booksRes, catsRes] = await Promise.allSettled([
          booksApi.getAll({ limit: 8, sort: 'newest' }),
          categoriesApi.getAll(),
        ]);

        if (booksRes.status === 'fulfilled') {
          setFeaturedBooks(booksRes.value.books || []);
        }
        if (catsRes.status === 'fulfilled') {
          setCategories(catsRes.value || []);
        }
      } catch (err) {
        console.error('Home data load error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/books?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/books');
    }
  };

  return (
    <div className="space-y-16 lg:space-y-24 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-950 text-white pt-16 pb-24 lg:pt-24 lg:pb-32 px-4 sm:px-6 lg:px-8">
        {/* Background glow effects */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-indigo-500/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/2 -right-24 w-[400px] h-[300px] bg-violet-600/15 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>The #1 Peer-to-Peer College Textbook Hub</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
            Buy & Sell Textbooks <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-indigo-300 via-violet-200 to-pink-300 bg-clip-text text-transparent">
              Directly With Fellow Students
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300 font-normal leading-relaxed">
            Stop paying outrageous campus bookstore markups. Connect with classmates, buy second-hand academic books at up to 80% off, and cash in on your old semester textbooks.
          </p>

          {/* Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="max-w-2xl mx-auto bg-white/10 p-2 sm:p-2.5 rounded-2xl sm:rounded-full border border-white/20 backdrop-blur-xl shadow-2xl flex flex-col sm:flex-row items-center gap-2"
          >
            <div className="flex items-center gap-3 w-full px-4 py-2 sm:py-0">
              <Search className="w-5 h-5 text-indigo-300 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, author, course code..."
                className="w-full bg-transparent text-white placeholder-slate-400 text-sm font-medium focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl sm:rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 shrink-0"
            >
              <span>Search Books</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Popular Category Chips */}
          {categories.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <span className="text-xs font-semibold text-slate-400 mr-1">Popular:</span>
              {categories.slice(0, 5).map((cat) => (
                <Link
                  key={cat.category_id}
                  to={`/books?category_id=${cat.category_id}`}
                  className="px-3 py-1 rounded-full text-xs font-medium bg-white/5 hover:bg-white/15 border border-white/10 text-slate-200 transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Metrics Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 sm:-mt-16 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 sm:p-8 bg-white rounded-3xl border border-slate-200/80 shadow-xl">
          <div className="text-center p-2">
            <p className="text-2xl sm:text-3xl font-black text-indigo-600">80%</p>
            <p className="text-xs font-semibold text-slate-500 mt-1">Average Student Savings</p>
          </div>
          <div className="text-center p-2 border-l border-slate-100">
            <p className="text-2xl sm:text-3xl font-black text-slate-900">100%</p>
            <p className="text-xs font-semibold text-slate-500 mt-1">Peer Verified Listings</p>
          </div>
          <div className="text-center p-2 border-l border-slate-100">
            <p className="text-2xl sm:text-3xl font-black text-indigo-600">$0</p>
            <p className="text-xs font-semibold text-slate-500 mt-1">Zero Middleman Fees</p>
          </div>
          <div className="text-center p-2 border-l border-slate-100">
            <p className="text-2xl sm:text-3xl font-black text-slate-900">Instant</p>
            <p className="text-xs font-semibold text-slate-500 mt-1">Campus Meetup Exchange</p>
          </div>
        </div>
      </div>

      {/* Featured / Fresh Approved Books */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
              <TrendingUp className="w-4 h-4" />
              <span>Campus Listings</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Recently Listed Textbooks
            </h2>
          </div>
          <Link
            to="/books"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-indigo-600 hover:text-indigo-700 group"
          >
            <span>View All Textbooks</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 8 }).map((_, idx) => (
              <BookCardSkeleton key={idx} />
            ))}
          </div>
        ) : featuredBooks.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {featuredBooks.map((book) => (
              <BookCard key={book.book_id} book={book} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 px-4 bg-white rounded-3xl border border-dashed border-slate-200">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800">No books listed yet</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-6">
              Be the first student to post a textbook and start earning today!
            </p>
            <Link
              to={isAuthenticated ? "/dashboard/create-book" : "/login"}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post Your First Book</span>
            </Link>
          </div>
        )}
      </section>

      {/* How It Works */}
      <section className="bg-slate-100/70 border-y border-slate-200/70 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Simple 3-Step Process
            </h2>
            <p className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              How BookNest Works
            </p>
            <p className="text-sm sm:text-base text-slate-600">
              A hassle-free platform designed exclusively for college students to buy and sell textbooks on campus.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs flex flex-col items-start relative">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 font-black text-xl flex items-center justify-center mb-6">
                1
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                List Your Textbook
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Take a quick photo of your book, choose condition, set your price, and submit for instant review.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs flex flex-col items-start relative">
              <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 font-black text-xl flex items-center justify-center mb-6">
                2
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Verified Peer Approval
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Our campus admins inspect listings for fair pricing and guidelines before going live to fellow students.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs flex flex-col items-start relative">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 font-black text-xl flex items-center justify-center mb-6">
                3
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Campus Meetup & Cash
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Connect directly with the buyer, hand over the book between classes, and collect cash immediately with 0% fees.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Benefits */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-tr from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-8 sm:p-14 border border-indigo-800/40 relative overflow-hidden shadow-2xl">
          <div className="max-w-2xl relative z-10 space-y-6">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Built By Students, For Students
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
              Ready to clear out your shelf and make extra cash?
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Don’t let your previous semester books collect dust. Post them in seconds and help a junior student save money.
            </p>
            <div className="pt-2 flex flex-wrap gap-4">
              <Link
                to={isAuthenticated ? "/dashboard/create-book" : "/register"}
                className="px-6 py-3.5 rounded-2xl text-sm font-bold text-slate-900 bg-white hover:bg-slate-100 shadow-xl transition-all"
              >
                Start Selling Now
              </Link>
              <Link
                to="/books"
                className="px-6 py-3.5 rounded-2xl text-sm font-bold text-white bg-indigo-600/60 hover:bg-indigo-600 border border-indigo-400/30 transition-all"
              >
                Explore Marketplace
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
