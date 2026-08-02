import React from 'react';

type LoadingSpinnerProps = {
  label?: string;
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ label = 'Loading...' }) => {
  return (
    <div className="flex items-center justify-center py-8" aria-live="polite">
      <div className="flex items-center gap-3 text-gray-600">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
        <span>{label}</span>
      </div>
    </div>
  );
};
