import React, { useState } from 'react';
import { BookOpen } from 'lucide-react';
import { getImageUrl } from '../../utils/helpers';

const ImageWithFallback = ({
  src,
  alt = 'Book cover',
  className = '',
  aspectRatio = 'aspect-[3/4]',
  fallbackIconSize = 'w-10 h-10',
  ...props
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fullUrl = src ? getImageUrl(src) : null;

  if (!fullUrl || hasError) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-linear-to-br from-slate-100 to-slate-200 text-slate-400 select-none overflow-hidden ${aspectRatio} ${className}`}
      >
        <BookOpen className={`${fallbackIconSize} text-slate-300 stroke-[1.5] mb-1`} />
        <span className="text-[11px] font-medium text-slate-400">No Image</span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${aspectRatio} ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-slate-200 animate-pulse" />
      )}
      <img
        src={fullUrl}
        alt={alt}
        loading="lazy"
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        {...props}
      />
    </div>
  );
};

export default ImageWithFallback;
