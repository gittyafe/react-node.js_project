import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/client';
import { Layout } from '../components/Layout';
import { ScoreCard } from '../components/ScoreCard';
import { useAuth } from '../context/AuthContext';
import type { Result } from '../types';

export const ResultsPage: React.FC = () => {
  const { user } = useAuth();
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      const studentId = user?.id ?? (user as any)?._id;
      if (!studentId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await apiClient.get('/results', { params: { studentId } });
        const payload = Array.isArray(response.data) ? response.data : response.data?.value ?? [];
        setResults(payload);
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load results');
      } finally {
        setLoading(false);
      }
    };

    void fetchResults();
  }, [user?.id]);

  const bestScore = useMemo(() => results.reduce((max, result) => Math.max(max, result.score ?? 0), 0), [results]);
  const averageScore = useMemo(() => {
    if (results.length === 0) return 0;
    return Math.round((results.reduce((sum, result) => sum + (result.score ?? 0), 0) / results.length) * 10) / 10;
  }, [results]);

  return (
    <Layout
      title="תוצאות"
      actions={
        <Link to="/dashboard" className="header-button">
          דשבורד
        </Link>
      }
    >
      <div className="results-page-shell">
        <section className="stats-grid results-stats-grid">
          <ScoreCard title="סה" value={results.length} tone="blue" />
          <ScoreCard title="הציון הכי גבוה" value={bestScore} tone="green" />
          <ScoreCard title="ממוצע" value={`${averageScore}`} tone="purple" />
        </section>

        <div className="section-panel results-panel">
          <div className="page-header-row">
            <div>
              <p className="eyebrow">תוצאות</p>
              <h2>ההגשות שלי</h2>
            </div>
            <Link to="/exams" className="primary-button small-button">
              חזרה למבחנים
            </Link>
          </div>

          {error ? <p className="field-error">{error}</p> : null}

          {loading ? (
            <p className="page-subtitle">טוען תוצאות...</p>
          ) : results.length === 0 ? (
            <div className="empty-state">
              <strong>עדיין אין תוצאות</strong>
              <p>התחל מבחן כדי לראות פה את הציונים וההתקדמות.</p>
            </div>
          ) : (
            <div className="result-list">
              {results.map((result) => (
                <div key={result._id ?? result.id ?? `${result.studentId}-${result.examId}-${result.createdAt}`} className="result-card">
                  <div className="result-main">
                    <div>
                      <p className="result-label">מבחן</p>
                      <h3>{result.examId}</h3>
                    </div>
                    <div className="score-badge">
                      {result.score}
                    </div>
                  </div>

                  <div className="result-meta">
                    <span>
                      נשלח: {result.submittedAt ? new Date(result.submittedAt).toLocaleString() : result.createdAt ? new Date(result.createdAt).toLocaleString() : 'לא ידוע'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};
