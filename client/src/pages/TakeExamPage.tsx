import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiClient from '../api/client';
import { Layout } from '../components/Layout';
import { QuestionCard } from '../components/QuestionCard';
import { useAuth } from '../context/AuthContext';
import { useExamTimer } from '../hooks/useExamTimer';
import type { Exam, Question } from '../types';

export const TakeExamPage: React.FC = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    const studentId = user?.id ?? (user as any)?._id;

    if (!examId || !studentId) {
      setError('You must be logged in to submit the exam');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        studentId,
        examId,
        answers: Object.entries(selectedAnswers).map(([questionId, answer]) => ({ questionId, answer })),
      };

      await apiClient.post('/results', payload);
      navigate('/results');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit exam');
    } finally {
      setSubmitting(false);
    }
  };

  const timer = useExamTimer(exam?.duration ?? 1, handleSubmit);

  useEffect(() => {
    const load = async () => {
      if (!examId) return;

      try {
        setLoading(true);
        const [examResponse, questionsResponse] = await Promise.all([
          apiClient.get(`/exams/${examId}`),
          apiClient.get('/questions', { params: { examId } }),
        ]);

        const currentExam = examResponse.data ?? null;
        const nextQuestions = questionsResponse.data?.value ?? questionsResponse.data ?? [];

        setExam(currentExam);
        setQuestions(Array.isArray(nextQuestions) ? nextQuestions : []);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load exam');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [examId]);

  const answeredCount = useMemo(() => Object.keys(selectedAnswers).length, [selectedAnswers]);

  if (loading) {
    return (
      <Layout title="מבחן">
        <div className="section-panel loading-panel">טוען מבחן...</div>
      </Layout>
    );
  }

  if (!exam) {
    return (
      <Layout title="מבחן">
        <div className="section-panel error-panel">המבחן לא נמצא.</div>
      </Layout>
    );
  }

  return (
    <Layout
      title={exam.title}
      actions={
        <div className="timer-pill">
          ⏱️ {timer.formatted}
        </div>
      }
    >
      <div className="exam-page-shell">
        <div className="section-panel exam-header-card">
          <div className="exam-header-row">
            <div>
              <p className="eyebrow">מבחן נוכחי</p>
              <h2>{exam.title}</h2>
            </div>
            <span className="difficulty-tag exam-difficulty">{exam.difficulty ?? 'ביניים'}</span>
          </div>

          <div className="exam-summary-row">
            <span>מקצוע: {exam.subject || 'כללי'}</span>
            <span>משך: {exam.duration} דקות</span>
            <span>שאלות: {questions.length}</span>
          </div>

          <div className="progress-wrap">
            <div className="progress-label-row">
              <span>התקדמות</span>
              <strong>{answeredCount} / {questions.length}</strong>
            </div>
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${questions.length ? (answeredCount / questions.length) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>

        {error ? <p className="field-error exam-error">{error}</p> : null}

        <div className="exam-question-list">
          {questions.map((question, index) => (
            <QuestionCard
              key={question._id ?? question.id ?? index}
              question={question}
              index={index}
              selectedAnswer={selectedAnswers[question._id ?? question.id ?? String(index)]}
              onSelect={(questionId, answer) => setSelectedAnswers((current) => ({ ...current, [questionId]: answer }))}
            />
          ))}
        </div>

        <div className="submit-row">
          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={submitting}
            className="primary-button full-width-button"
          >
            {submitting ? 'שולח תשובות...' : 'שלח מבחן'}
          </button>
        </div>
      </div>
    </Layout>
  );
};
