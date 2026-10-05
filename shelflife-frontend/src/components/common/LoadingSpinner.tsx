import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Loading...',
  className = '',
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
  };

  return (
    <div className={`flex flex-col items-center justify-center py-10 px-4 ${className}`}>
      <Loader2 className={`${sizeClasses[size]} text-[#1769AA] animate-spin`} />
      {message && (
        <p className="mt-2.5 text-xs text-slate-500 font-medium">
          {message}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;
