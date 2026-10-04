import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/client';
import { Layout } from '../components/Layout';
import { ScoreCard } from '../components/ScoreCard';
import { useAuth } from '../context/AuthContext';
import type { Result } from '../types';

export const StatisticsPage: React.FC = () => {
  const { user } = useAuth();
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/results');
        const payload = Array.isArray(response.data) ? response.data : response.data?.value ?? [];
        setResults(payload);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load statistics');
      } finally {
        setLoading(false);
      }
    };

    void fetchStats();
  }, []);

  const stats = useMemo(() => {
    if (!results.length) {
      return { totalAttempts: 0, average: 0, highest: 0, passRate: 0 };
    }

    const totalAttempts = results.length;
    const average = results.reduce((sum, item) => sum + (item.score ?? 0), 0) / totalAttempts;
    const highest = Math.max(...results.map((item) => item.score ?? 0));
    const passRate = (results.filter((item) => (item.score ?? 0) >= 50).length / totalAttempts) * 100;

    return {
      totalAttempts,
      average: Number(average.toFixed(1)),
      highest,
      passRate: Number(passRate.toFixed(1)),
    };
  }, [results]);

  const examGroups = useMemo(() => {
    const map = new Map<string, { count: number; total: number; highest: number }>();

    results.forEach((result) => {
      const key = result.examId ?? 'Unknown';
      const current = map.get(key) ?? { count: 0, total: 0, highest: 0 };
      current.count += 1;
      current.total += result.score ?? 0;
      current.highest = Math.max(current.highest, result.score ?? 0);
      map.set(key, current);
    });

    return [...map.entries()].map(([examId, values]) => ({ examId, average: Number((values.total / values.count).toFixed(1)), highest: values.highest, attempts: values.count }));
  }, [results]);

  return (
    <Layout
      title="סטטיסטיקה"
      actions={
        <Link to="/dashboard" className="header-button">
          דשבורד
        </Link>
      }
    >
      <div className="page-stack">
        <section className="stats-grid">
          <ScoreCard title="סה" value={stats.totalAttempts} tone="blue" />
          <ScoreCard title="ממוצע" value={`${stats.average}%`} tone="green" />
          <ScoreCard title="הכי גבוה" value={`${stats.highest}%`} tone="purple" />
          <ScoreCard title="אחוז עמידה" value={`${stats.passRate}%`} tone="amber" />
        </section>

        <div className="section-panel stats-panel">
          <div className="page-header-row">
            <div>
              <p className="eyebrow">סטטיסטיקה</p>
              <h2>ביצועים לפי מבחן</h2>
            </div>
          </div>

          {error ? <p className="field-error">{error}</p> : null}

          {loading ? (
            <p className="page-subtitle">טוען נתונים...</p>
          ) : examGroups.length === 0 ? (
            <div className="empty-state">
              <strong>אין נתוני מבחנים עדיין</strong>
              <p>ברגע שיוגשו מבחנים, הנתונים יופיעו כאן.</p>
            </div>
          ) : (
            <div className="stats-table-wrap">
              <table className="stats-table">
                <thead>
                  <tr>
                    <th>מבחן</th>
                    <th>ניסיונות</th>
                    <th>ממוצע</th>
                    <th>הכי גבוה</th>
                  </tr>
                </thead>
                <tbody>
                  {examGroups.map((item) => (
                    <tr key={item.examId}>
                      <td>{item.examId}</td>
                      <td>{item.attempts}</td>
                      <td>{item.average}%</td>
                      <td>{item.highest}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {user?.role === 'student' ? (
          <div className="section-panel info-panel">
            <p>סטודנטים יכולים לראות את התוצאות האישיות שלהם דרך דף התוצאות.</p>
          </div>
        ) : null}
      </div>
    </Layout>
  );
};
