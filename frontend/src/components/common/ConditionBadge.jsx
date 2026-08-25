import React from 'react';
import { formatCondition } from '../../utils/formatters';

const ConditionBadge = ({ condition, size = 'md' }) => {
  const info = formatCondition(condition);

  const sizeClasses = size === 'sm' 
    ? 'px-2 py-0.5 text-xs' 
    : size === 'lg' 
    ? 'px-3 py-1 text-sm font-semibold' 
    : 'px-2.5 py-0.5 text-xs font-semibold';

  return (
    <span
      title={info.description}
      className={`inline-flex items-center gap-1.5 rounded-md ${info.badgeClass} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${info.dotClass}`} />
      <span>{info.label}</span>
    </span>
  );
};

export default ConditionBadge;
