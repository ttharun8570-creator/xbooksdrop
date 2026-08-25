import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BookOpen, SlidersHorizontal, X, ArrowUpDown } from 'lucide-react';
import { booksApi } from '../api/booksApi';
import { categoriesApi } from '../api/categoriesApi';
import BookCard from '../components/books/BookCard';
import FilterSidebar from '../components/books/FilterSidebar';
import Pagination from '../components/common/Pagination';
import { BookCardSkeleton } from '../components/common/LoadingSpinner';

const BrowseBooks = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // State from URL
  const searchParam = searchParams.get('search') || '';
  const categoryParam = searchParams.get('category_id') || '';
  const conditionParam = searchParams.get('condition') || '';
  const minPriceParam = searchParams.get('min_price') || '';
  const maxPriceParam = searchParams.get('max_price') || '';
  const sortParam = searchParams.get('sort') || '';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);

  const [categories, setCategories] = useState([]);
  const [books, setBooks] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    limit: 12,
    totalBooks: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Fetch Categories once
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const data = await categoriesApi.getAll();
        setCategories(data);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    fetchCats();
  }, []);

  // Fetch Books whenever URL params change
  const fetchBooks = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        limit: 12,
        page: pageParam,
      };

      if (searchParam) params.search = searchParam;
      if (categoryParam) params.category_id = categoryParam;
      if (conditionParam) params.condition = conditionParam;
      if (minPriceParam) params.min_price = minPriceParam;
      if (maxPriceParam) params.max_price = maxPriceParam;
      if (sortParam) params.sort = sortParam;

      const data = await booksApi.getAll(params);
      setBooks(data.books || []);
      setPagination(data.pagination || {
        currentPage: pageParam,
        limit: 12,
        totalBooks: 0,
        totalPages: 1,
      });
    } catch (err) {
      console.error('Failed to load books:', err);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  }, [searchParam, categoryParam, conditionParam, minPriceParam, maxPriceParam, sortParam, pageParam]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const updateFilters = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    // Reset to page 1 on filter change
    if (key !== 'page') {
      newParams.delete('page');
    }
    setSearchParams(newParams);
  };

  const handleResetFilters = () => {
    setSearchParams({});
  };

  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeFilterCount = [
    searchParam,
    categoryParam,
    conditionParam,
    minPriceParam,
    maxPriceParam,
  ].filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-slate-200/80 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Browse College Textbooks
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Discover verified second-hand academic books from students across campus.
          </p>
        </div>

        {/* Mobile Filter Button */}
        <div className="flex items-center gap-3 lg:hidden">
          <button
            type="button"
            onClick={() => setIsMobileFilterOpen(true)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-bold shadow-xs hover:bg-slate-50"
          >
            <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Layout: Filters + Book Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Sidebar Filter */}
        <aside className="hidden lg:block lg:col-span-1 space-y-6">
          <FilterSidebar
            categories={categories}
            filters={{
              search: searchParam,
              category_id: categoryParam,
              condition: conditionParam,
              min_price: minPriceParam,
              max_price: maxPriceParam,
              sort: sortParam,
            }}
            onFilterChange={updateFilters}
            onResetFilters={handleResetFilters}
            totalResults={pagination.totalBooks}
          />
        </aside>

        {/* Mobile Filter Drawer */}
        {isMobileFilterOpen && (
          <div className="fixed inset-0 z-50 lg:hidden overflow-y-auto">
            <div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
              onClick={() => setIsMobileFilterOpen(false)}
            />
            <div className="relative min-h-screen bg-white max-w-sm ml-auto p-6 shadow-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                  <h3 className="font-bold text-slate-900 text-lg">Filter Books</h3>
                  <button
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <FilterSidebar
                  categories={categories}
                  filters={{
                    search: searchParam,
                    category_id: categoryParam,
                    condition: conditionParam,
                    min_price: minPriceParam,
                    max_price: maxPriceParam,
                    sort: sortParam,
                  }}
                  onFilterChange={updateFilters}
                  onResetFilters={handleResetFilters}
                  totalResults={pagination.totalBooks}
                />
              </div>
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="mt-6 w-full py-3 rounded-xl bg-indigo-600 text-white font-bold text-sm shadow-md"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}

        {/* Book Grid Content */}
        <main className="lg:col-span-3">
          {/* Active Filter Tags */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-6 p-3 bg-slate-50 rounded-2xl border border-slate-200/60">
              <span className="text-xs font-semibold text-slate-500">Active filters:</span>
              {searchParam && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-white border border-slate-200 text-slate-700 shadow-2xs">
                  Keyword: "{searchParam}"
                  <button onClick={() => updateFilters('search', '')}><X className="w-3 h-3 hover:text-rose-500" /></button>
                </span>
              )}
              {categoryParam && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-white border border-slate-200 text-slate-700 shadow-2xs">
                  Category: {categories.find((c) => String(c.category_id) === String(categoryParam))?.name || 'Selected'}
                  <button onClick={() => updateFilters('category_id', '')}><X className="w-3 h-3 hover:text-rose-500" /></button>
                </span>
              )}
              {conditionParam && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-white border border-slate-200 text-slate-700 shadow-2xs">
                  Condition: {conditionParam}
                  <button onClick={() => updateFilters('condition', '')}><X className="w-3 h-3 hover:text-rose-500" /></button>
                </span>
              )}
              {(minPriceParam || maxPriceParam) && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-white border border-slate-200 text-slate-700 shadow-2xs">
                  Price: ${minPriceParam || 0} - ${maxPriceParam || 'Any'}
                  <button onClick={() => { updateFilters('min_price', ''); updateFilters('max_price', ''); }}>
                    <X className="w-3 h-3 hover:text-rose-500" />
                  </button>
                </span>
              )}
              <button
                onClick={handleResetFilters}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 ml-auto"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {Array.from({ length: 6 }).map((_, idx) => (
                <BookCardSkeleton key={idx} />
              ))}
            </div>
          ) : books.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {books.map((book) => (
                  <BookCard key={book.book_id} book={book} />
                ))}
              </div>

              {/* Pagination */}
              <div className="mt-8">
                <Pagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  totalItems={pagination.totalBooks}
                  limit={pagination.limit}
                  onPageChange={handlePageChange}
                />
              </div>
            </>
          ) : (
            <div className="text-center py-20 px-4 bg-white rounded-3xl border border-dashed border-slate-200">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-800">No books found</h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1 mb-6">
                We couldn't find any books matching your current filters. Try changing or clearing filters.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default BrowseBooks;
