import React from 'react';

type AuthPageProps = {
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export const AuthPage: React.FC<AuthPageProps> = ({ title, children, footer }) => {
  return (
    <div className="auth-shell">
      <div className="auth-layout">
        <aside className="auth-side-panel" aria-label="מטרות המערכת">
          <div className="auth-side-top">
            <span className="auth-badge">SmartTest</span>
            <span className="auth-mini-tag">Assessment Suite</span>
          </div>

          <h2>מערכת בחינות חכמה</h2>
          <p>
            ניהול מבחנים, מעקב אחרי תוצאות, וחוויית למידה מסודרת לכל משתמש.
          </p>

          <div className="auth-side-features">
            <div className="feature-pill">
              <span>✓</span>
              ניהול מבחנים בזמן אמת
            </div>
            <div className="feature-pill">
              <span>✓</span>
              תוצאות אוטומטיות
            </div>
            <div className="feature-pill">
              <span>✓</span>
              מעקב אישי ומתקדם
            </div>
          </div>
        </aside>

        <div className="auth-card">
          <div className="auth-card-glow" aria-hidden="true" />
          <div className="auth-header">
            <span className="auth-badge">SmartTest</span>
            <h1>{title}</h1>
          </div>
          {children}
          {footer && <div className="auth-footer">{footer}</div>}
        </div>
      </div>
    </div>
  );
};
