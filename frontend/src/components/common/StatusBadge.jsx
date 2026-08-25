import React from 'react';
import { CheckCircle2, Clock, XCircle, Tag, HelpCircle } from 'lucide-react';
import { formatStatus } from '../../utils/formatters';

const StatusBadge = ({ status, showIcon = true, size = 'md' }) => {
  const info = formatStatus(status);

  const getIcon = () => {
    switch (status?.toUpperCase()) {
      case 'APPROVED':
        return <CheckCircle2 className="w-3.5 h-3.5" />;
      case 'PENDING':
        return <Clock className="w-3.5 h-3.5" />;
      case 'REJECTED':
        return <XCircle className="w-3.5 h-3.5" />;
      case 'SOLD':
        return <Tag className="w-3.5 h-3.5" />;
      default:
        return <HelpCircle className="w-3.5 h-3.5" />;
    }
  };

  const sizeClasses = size === 'sm' 
    ? 'px-2 py-0.5 text-xs' 
    : size === 'lg' 
    ? 'px-3.5 py-1.5 text-sm font-semibold' 
    : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border shadow-xs transition-colors ${info.badgeClass} ${sizeClasses}`}
    >
      {showIcon && getIcon()}
      <span>{info.label}</span>
    </span>
  );
};

export default StatusBadge;
