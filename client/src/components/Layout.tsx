import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

type LayoutProps = {
  title: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
};

export const Layout: React.FC<LayoutProps> = ({ title, actions, children }) => {
  const { user, logout } = useAuth();

  const navLinks = [
    { to: '/dashboard', label: 'בית' },
    { to: '/exams', label: 'מבחנים' },
    { to: '/results', label: 'תוצאות' },
    { to: '/statistics', label: 'סטטיסטיקה' },
    { to: '/profile', label: 'פרופיל' },
  ];

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand-wrap">
            <div className="logo-mark">S</div>
            <div>
              <div className="brand-kicker">SmartTest</div>
              <h1 className="brand-title">{title}</h1>
            </div>
          </div>

          <nav className="site-nav" aria-label="Main navigation">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="topbar-actions">
            {actions ? (
              <>
                {actions}
                <button className="header-button" type="button" onClick={handleLogout}>
                  יציאה
                </button>
              </>
            ) : (
              <>
                <span className="user-greeting">שלום, {user?.fullName || 'משתמש'}</span>
                <button className="header-button" type="button" onClick={handleLogout}>
                  יציאה
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="app-main">{children}</main>
    </div>
  );
};
