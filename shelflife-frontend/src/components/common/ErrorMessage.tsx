import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorMessageProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title = 'Unable to Load Data',
  message = 'A problem occurred while communicating with the library catalog server.',
  onRetry,
  className = '',
}) => {
  return (
    <div
      className={`p-4 rounded-lg bg-rose-50/60 border border-rose-200 text-rose-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${className}`}
      role="alert"
    >
      <div className="flex items-start space-x-2.5">
        <AlertTriangle className="w-4 h-4 text-[#C53030] flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-semibold text-[#C53030]">{title}</h4>
          <p className="text-xs text-rose-800 mt-0.5">{message}</p>
        </div>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          type="button"
          className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-md bg-white hover:bg-rose-50 text-rose-800 text-xs font-medium border border-rose-200 transition flex-shrink-0"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Retry</span>
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
