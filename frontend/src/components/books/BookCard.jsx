import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, MapPin, Calendar } from 'lucide-react';
import ImageWithFallback from '../common/ImageWithFallback';
import ConditionBadge from '../common/ConditionBadge';
import StatusBadge from '../common/StatusBadge';
import { formatPrice } from '../../utils/formatters';

const BookCard = ({
  book,
  showStatus = false,
  actions = null,
}) => {
  const {
    book_id,
    title,
    author,
    price,
    condition,
    category_name,
    image_url,
    edition,
    publication_year,
    status,
    seller_college,
  } = book;

  return (
    <div className="group flex flex-col bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-indigo-200/70 transition-all duration-300 overflow-hidden">
      {/* Cover Image Container */}
      <Link to={`/books/${book_id}`} className="relative block overflow-hidden bg-slate-100">
        <ImageWithFallback
          src={image_url}
          alt={title}
          aspectRatio="aspect-[4/3] sm:aspect-[3/4]"
          className="group-hover:scale-105 transition-transform duration-500"
        />

        {/* Condition Tag */}
        <div className="absolute top-3 left-3 z-10">
          <ConditionBadge condition={condition} size="sm" />
        </div>

        {/* Status Tag (if enabled) */}
        {showStatus && status && (
          <div className="absolute top-3 right-3 z-10">
            <StatusBadge status={status} size="sm" />
          </div>
        )}

        {/* Category Pill */}
        {category_name && (
          <div className="absolute bottom-3 left-3 z-10">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-900/80 text-white backdrop-blur-xs shadow-xs">
              {category_name}
            </span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between">
        <div>
          {/* Title */}
          <Link to={`/books/${book_id}`}>
            <h3 className="text-base font-bold text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
              {title}
            </h3>
          </Link>

          {/* Author */}
          {author && (
            <p className="text-xs font-medium text-slate-500 mt-0.5 line-clamp-1">
              by <span className="text-slate-700 font-semibold">{author}</span>
            </p>
          )}

          {/* Meta specs (Edition / Year / College) */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2.5 text-xs text-slate-500">
            {edition && (
              <span className="inline-flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                {edition}
              </span>
            )}
            {publication_year && (
              <span className="inline-flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {publication_year}
              </span>
            )}
            {seller_college && (
              <span className="inline-flex items-center gap-1 truncate max-w-[150px]" title={seller_college}>
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{seller_college}</span>
              </span>
            )}
          </div>
        </div>

        {/* Price & Action / Footer */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block font-medium">Price</span>
            <span className="text-lg font-black text-indigo-600">
              {formatPrice(price)}
            </span>
          </div>

          <Link
            to={`/books/${book_id}`}
            className="inline-flex items-center justify-center px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-indigo-600 hover:text-white transition-all shadow-2xs group-hover:bg-indigo-600 group-hover:text-white"
          >
            View Details
          </Link>
        </div>

        {/* Custom Actions Slot (e.g. for My Books edit/delete) */}
        {actions && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookCard;
