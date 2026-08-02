import React from 'react';

type LayoutProps = {
  title: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
};

export const Layout: React.FC<LayoutProps> = ({ title, actions, children }) => {
  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">{title}</h1>
          {actions && <div className="flex items-center gap-4">{actions}</div>}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6">{children}</main>
    </div>
  );
};
