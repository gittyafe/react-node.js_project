import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiClient from '../api/client';
import { Layout } from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import type { Exam, Question } from '../types';

type QuestionFormState = {
  questionText: string;
  options: string;
  correctAnswer: string;
  points: number;
};

const emptyForm: QuestionFormState = {
  questionText: '',
  options: '',
  correctAnswer: '',
  points: 1,
};

export const QuestionManagerPage: React.FC = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [form, setForm] = useState<QuestionFormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!examId) return;

    try {
      setLoading(true);
      const [examResponse, questionsResponse] = await Promise.all([
        apiClient.get('/exams'),
        apiClient.get('/questions', { params: { examId } }),
      ]);

      const exams = Array.isArray(examResponse.data) ? examResponse.data : examResponse.data?.value ?? [];
      const currentExam = exams.find((item: Exam) => (item._id ?? item.id) === examId) ?? null;
      const currentQuestions = Array.isArray(questionsResponse.data) ? questionsResponse.data : questionsResponse.data?.value ?? [];

      setExam(currentExam);
      setQuestions(currentQuestions);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load exam questions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
  }, [examId]);

  const canManage = user?.role === 'admin' || user?.role === 'teacher';

  const submitQuestion = async () => {
    if (!examId || !form.questionText.trim() || !form.correctAnswer.trim()) {
      setError('Question text and correct answer are required');
      return;
    }

    const options = form.options
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    if (options.length < 2) {
      setError('Provide at least 2 answer options separated by commas');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      const payload = {
        examId,
        questionText: form.questionText,
        options,
        correctAnswer: form.correctAnswer,
        points: Number(form.points || 1),
      };

      if (editingId) {
        await apiClient.put(`/questions/${editingId}`, payload);
      } else {
        await apiClient.post('/questions', payload);
      }

      setForm(emptyForm);
      setEditingId(null);
      await fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save question');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;

    try {
      await apiClient.delete(`/questions/${id}`);
      await fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete question');
    }
  };

  const openEditor = (question: Question) => {
    setEditingId(question._id ?? question.id ?? null);
    setForm({
      questionText: question.questionText,
      options: question.options.join(', '),
      correctAnswer: question.correctAnswer ?? '',
      points: question.points ?? 1,
    });
  };

  const totalPoints = useMemo(() => questions.reduce((sum, item) => sum + (item.points ?? 0), 0), [questions]);

  return (
    <Layout
      title={exam ? `${exam.title}` : 'ניהול שאלות'}
      actions={
        <button onClick={() => navigate('/teacher/exams')} className="header-button">
          חזרה
        </button>
      }
    >
      <div className="question-manager-shell">
        <section className="question-manager-card question-form-card">
          <div className="question-manager-header">
            <div>
              <p className="eyebrow">מנהל בחינה</p>
              <h2>{exam ? `שאלות ל-${exam.title}` : 'ניהול שאלות'}</h2>
            </div>
            <div className="question-summary-pill">
              {totalPoints} נקודות סה"כ
            </div>
          </div>

          <p className="question-manager-subtitle">
            הוסף, ערוך ומחק שאלות לבחינה. אפשר להכניס תשובות מופרדות בפסיקים.
          </p>

          {error ? <p className="field-error question-error">{error}</p> : null}

          {!canManage ? (
            <p className="field-error question-error">רק מנהלים ומורים יכולים לנהל שאלות.</p>
          ) : (
            <div className="question-form-grid">
              <textarea
                value={form.questionText}
                onChange={(e) => setForm((current) => ({ ...current, questionText: e.target.value }))}
                placeholder="כתוב כאן את השאלה..."
                rows={4}
                className="question-field question-field-wide"
              />
              <input
                value={form.options}
                onChange={(e) => setForm((current) => ({ ...current, options: e.target.value }))}
                placeholder="אפשרויות מופרדות בפסיקים, למשל: תשובה א, תשובה ב, תשובה ג"
                className="question-field question-field-wide"
              />

              <input
                value={form.correctAnswer}
                onChange={(e) => setForm((current) => ({ ...current, correctAnswer: e.target.value }))}
                placeholder="תשובה נכונה"
                className="question-field"
              />

              <input
                type="number"
                min={1}
                value={form.points}
                onChange={(e) => setForm((current) => ({ ...current, points: Number(e.target.value || 1) }))}
                placeholder="נקודות"
                className="question-field"
              />

              <button
                onClick={() => void submitQuestion()}
                disabled={saving}
                className="primary-button full-width-button question-submit"
              >
                {saving ? 'שומר...' : editingId ? 'עדכון שאלה' : 'הוספת שאלה'}
              </button>
            </div>
          )}
        </section>

        <section className="question-manager-card">
          <div className="question-manager-header secondary-header">
            <div>
              <p className="eyebrow">שאלות</p>
              <h3>רשימת שאלות</h3>
            </div>
          </div>

          {loading ? (
            <p className="question-empty-state">טוען שאלות...</p>
          ) : questions.length === 0 ? (
            <p className="question-empty-state">עדיין לא נוספו שאלות לבחינה זו.</p>
          ) : (
            <div className="question-list">
              {questions.map((question, index) => (
                <div key={question._id ?? question.id ?? index} className="question-item">
                  <div className="question-item-main">
                    <span className="question-number">{index + 1}</span>
                    <div>
                      <p className="question-text">{question.questionText}</p>
                      <p className="question-meta">אפשרויות: {question.options.join(' | ')}</p>
                      <p className="question-answer">תשובה נכונה: {question.correctAnswer}</p>
                    </div>
                  </div>

                  <div className="question-actions">
                    <button onClick={() => openEditor(question)} className="ghost-button small-button question-action-button secondary-action">
                      עריכה
                    </button>
                    <button onClick={() => void handleDelete(question._id ?? question.id)} className="danger-button small-button question-action-button">
                      מחיקה
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
};
