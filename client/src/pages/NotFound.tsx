import React from 'react';
import { Link } from 'react-router-dom';

export const NotFound: React.FC = () => {
  return (
    <div className="empty-state-shell">
      <div className="empty-state-card">
        <span className="empty-state-badge">404</span>
        <h1>עמוד לא נמצא</h1>
        <p>הדף שאתה מחפש לא קיים או הועבר.</p>
        <div className="quick-actions">
          <Link to="/dashboard" className="primary-button">
            חזרה לדשבורד
          </Link>
          <Link to="/login" className="ghost-button">
            להתחברות
          </Link>
        </div>
      </div>
    </div>
  );
};
