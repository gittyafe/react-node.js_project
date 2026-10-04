import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/client';
import { Layout } from '../components/Layout';
import type { Exam } from '../types';

export const ExamsPage: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExams = async (term = '') => {
    try {
      setLoading(true);
      const response = await apiClient.get('/exams', { params: { search: term, page: 1, limit: 50 } });
      const payload = response.data?.value ?? response.data ?? [];
      setExams(Array.isArray(payload) ? payload : []);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load exams');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchExams(search);
  }, [search]);

  const subjectGroups = useMemo(() => {
    const grouped = new Map<string, Exam[]>();

    exams.forEach((exam) => {
      const subject = (exam.subject ?? 'General').trim() || 'General';
      const current = grouped.get(subject) ?? [];
      current.push(exam);
      grouped.set(subject, current);
    });

    return Array.from(grouped.entries()).sort(([first], [second]) => first.localeCompare(second));
  }, [exams]);

  const visibleGroups = subjectGroups
    .filter(([subject]) => selectedSubject === 'all' || subject === selectedSubject)
    .map(([subject, groupExams]) => [subject, groupExams.filter((exam) => selectedDifficulty === 'all' || (exam.difficulty ?? 'medium') === selectedDifficulty)] as [string, Exam[]])
    .filter(([, groupExams]) => groupExams.length > 0);

  return (
    <Layout title="מבחנים" actions={<Link to="/dashboard" className="header-button">דשבורד</Link>}>
      <div className="section-panel">
        <div className="page-header-row">
          <div>
            <p className="eyebrow">מבחנים</p>
            <h2>בחר מבחן לפי מקצוע ורמת קושי</h2>
          </div>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="חפש לפי שם או מקצוע..."
            className="search-input"
          />
        </div>

        <div className="filter-block">
          <div className="filter-title">מקצוע</div>
          <div className="filter-row">
            <button
              type="button"
              onClick={() => setSelectedSubject('all')}
              className={`filter-chip ${selectedSubject === 'all' ? 'active' : ''}`}
            >
              כל המקצועות
            </button>
            {subjectGroups.map(([subject]) => (
              <button
                key={subject}
                type="button"
                onClick={() => setSelectedSubject(subject)}
                className={`filter-chip ${selectedSubject === subject ? 'active' : ''}`}
              >
                {subject}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-block">
          <div className="filter-title">רמת קושי</div>
          <div className="filter-row">
            {(['all', 'easy', 'medium', 'hard'] as const).map((difficulty) => (
              <button
                key={difficulty}
                type="button"
                onClick={() => setSelectedDifficulty(difficulty)}
                className={`filter-chip difficulty ${selectedDifficulty === difficulty ? 'active' : ''}`}
              >
                {difficulty === 'all' ? 'הכול' : difficulty}
              </button>
            ))}
          </div>
        </div>

        {error ? <p className="field-error">{error}</p> : null}

        {loading ? (
          <p className="page-subtitle">טוען מבחנים...</p>
        ) : visibleGroups.length === 0 ? (
          <p className="page-subtitle">לא נמצאו מבחנים התואמים את החיפוש.</p>
        ) : (
          <div className="exam-group-stack">
            {visibleGroups.map(([subject, groupExams]) => (
              <div key={subject} className="exam-subject-group">
                <div className="subject-header">
                  <h3>{subject}</h3>
                  <span className="pill-count">{groupExams.length} מבחנים</span>
                </div>

                <div className="exam-grid">
                  {groupExams.map((exam) => (
                    <div key={exam._id ?? exam.id ?? exam.title} className="exam-card">
                      <div className="exam-card-header">
                        <h4>{exam.title}</h4>
                        <span className="pill-time">{exam.duration} דק'</span>
                      </div>

                      <div className="exam-meta">
                        <span>{subject}</span>
                        <span className="difficulty-tag">{exam.difficulty ?? 'medium'}</span>
                      </div>

                      <p>{exam.description || 'אין תיאור למבחן זה.'}</p>

                      <Link to={`/exams/${exam._id ?? exam.id}`} className="primary-button small-button">
                        צפה בפרטים
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};
