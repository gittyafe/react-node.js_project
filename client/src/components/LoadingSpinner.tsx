import React from 'react';

type LoadingSpinnerProps = {
  label?: string;
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ label = 'Loading...' }) => {
  return (
    <div className="loading-state" aria-live="polite" role="status">
      <div className="loading-spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
};
