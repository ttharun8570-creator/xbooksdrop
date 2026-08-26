/**
 * Format numerical price to localized currency string (Indian Rupee ₹)
 */
export const formatPrice = (price, currency = '₹') => {
  const num = Number(price);
  if (isNaN(num)) return `${currency}0.00`;
  return `${currency}${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

/**
 * Format ISO date string to human readable format
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  } catch {
    return dateString;
  }
};

/**
 * Format condition enum to readable string and color scheme
 */
export const formatCondition = (condition) => {
  switch (condition?.toUpperCase()) {
    case 'NEW':
      return {
        label: 'Brand New',
        badgeClass: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20',
        dotClass: 'bg-emerald-500',
        description: 'Unused, pristine condition with no markings or wear.'
      };
    case 'LIKE_NEW':
      return {
        label: 'Like New',
        badgeClass: 'bg-cyan-50 text-cyan-700 ring-1 ring-cyan-600/20',
        dotClass: 'bg-cyan-500',
        description: 'Barely used, crisp pages, very light or no spine wear.'
      };
    case 'GOOD':
      return {
        label: 'Good',
        badgeClass: 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/20',
        dotClass: 'bg-blue-500',
        description: 'Clean overall with some highlighting or minor shelf wear.'
      };
    case 'FAIR':
      return {
        label: 'Fair',
        badgeClass: 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20',
        dotClass: 'bg-amber-500',
        description: 'Readable and complete with noticeable wear or markings.'
      };
    default:
      return {
        label: condition || 'Unknown',
        badgeClass: 'bg-slate-50 text-slate-700 ring-1 ring-slate-600/20',
        dotClass: 'bg-slate-400',
        description: ''
      };
  }
};

/**
 * Format status enum to badge configuration
 */
export const formatStatus = (status) => {
  switch (status?.toUpperCase()) {
    case 'APPROVED':
      return {
        label: 'Approved',
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dotClass: 'bg-emerald-500',
        iconName: 'CheckCircle'
      };
    case 'PENDING':
      return {
        label: 'Pending Review',
        badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
        dotClass: 'bg-amber-500 animate-pulse',
        iconName: 'Clock'
      };
    case 'REJECTED':
      return {
        label: 'Rejected',
        badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
        dotClass: 'bg-rose-500',
        iconName: 'XCircle'
      };
    case 'SOLD':
      return {
        label: 'Sold',
        badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
        dotClass: 'bg-slate-500',
        iconName: 'Tag'
      };
    default:
      return {
        label: status || 'Unknown',
        badgeClass: 'bg-slate-50 text-slate-700 border-slate-200',
        dotClass: 'bg-slate-400',
        iconName: 'HelpCircle'
      };
  }
};
