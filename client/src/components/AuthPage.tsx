import React from 'react';

type AuthPageProps = {
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export const AuthPage: React.FC<AuthPageProps> = ({ title, children, footer }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">{title}</h1>
        {children}
        {footer && <div className="text-center text-sm mt-4">{footer}</div>}
      </div>
    </div>
  );
};
