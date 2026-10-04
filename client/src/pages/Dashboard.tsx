import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { StatCard } from '../components/StatCard';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const roleLabel = user?.role ? user.role.toUpperCase() : '—';

  return (
    <Layout title="SmartTest">
      <div className="page-stack">
        <section className="panel hero-panel dashboard-hero">
          <div className="hero-grid">
            <div>
              <div className="hero-badges">
                <span className="hero-badge">דשבורד</span>
                <span className="hero-badge hero-badge-alt">{roleLabel}</span>
              </div>
              <h2>ברוכים הבאים למערכת הבחינות</h2>
              <p>
                המערכת שלך מוכנה לנהל מבחנים, לעקוב אחר תוצאות ולספק חווית למידה חלקה,
                מקצועית ומסודרת.
              </p>
            </div>

            <div className="hero-metrics">
              <div className="mini-stat">
                <span>תפקיד</span>
                <strong>{roleLabel}</strong>
              </div>
              <div className="mini-stat">
                <span>אימייל</span>
                <strong>{user?.email || '—'}</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="stats-grid">
          <StatCard title="תפקיד" value={roleLabel} tone="blue" />
          <StatCard title="אימייל" value={user?.email} tone="green" />
          <StatCard title="מזהה משתמש" value={user?.id} tone="purple" />
        </section>

        <section className="dashboard-grid">
          <div className="panel action-panel">
            <h3>פעולות מהירות</h3>
            <div className="quick-actions">
              <Link to="/profile" className="primary-button small-button">
                עדכון פרופיל
              </Link>
              <Link to="/exams" className="success-button small-button">
                חיפוש מבחנים
              </Link>
              <Link to="/results" className="violet-button small-button">
                תוצאות
              </Link>
              <Link to="/statistics" className="cyan-button small-button">
                סטטיסטיקה
              </Link>
              {(user?.role === 'admin' || user?.role === 'teacher') ? (
                <Link to="/teacher/exams" className="dark-button small-button">
                  ניהול מבחנים
                </Link>
              ) : null}
              {user?.role === 'admin' ? (
                <Link to="/users" className="danger-button small-button">
                  ניהול משתמשים
                </Link>
              ) : null}
            </div>
          </div>

          <div className="panel insight-panel">
            <h3>סקירה כללית</h3>
            <ul className="activity-list">
              <li>
                <span className="dot blue" />
                <div>
                  <strong>מבחנים</strong>
                  <small>גישה מהירה לספר מבחנים פעילים</small>
                </div>
              </li>
              <li>
                <span className="dot green" />
                <div>
                  <strong>תוצאות</strong>
                  <small>מעקב אחרי ציונים והישגים</small>
                </div>
              </li>
              <li>
                <span className="dot purple" />
                <div>
                  <strong>סטטיסטיקה</strong>
                  <small>הבנת התקדמות וניהול יעיל</small>
                </div>
              </li>
            </ul>
          </div>
        </section>
      </div>
    </Layout>
  );
};
