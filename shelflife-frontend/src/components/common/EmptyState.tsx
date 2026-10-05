import React from 'react';
import { BookDashed } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No records found',
  message = 'There are no items matching this criteria.',
  icon,
  action,
  className = '',
}) => {
  return (
    <div
      className={`py-12 px-6 flex flex-col items-center justify-center text-center rounded-lg border border-dashed border-slate-200 bg-[#F7F9FB]/50 ${className}`}
    >
      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 mb-2.5">
        {icon || <BookDashed className="w-5 h-5 stroke-[1.5]" />}
      </div>
      <h3 className="text-xs font-semibold text-slate-700">{title}</h3>
      <p className="text-xs text-slate-500 mt-0.5 max-w-sm">{message}</p>
      {action && (
        <button
          onClick={action.onClick}
          type="button"
          className="mt-3 px-3.5 py-1.5 bg-[#1769AA] hover:bg-[#125488] text-white text-xs font-medium rounded-lg transition"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
