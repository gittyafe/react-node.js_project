import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { Layout } from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import type { Exam } from '../types';

type ExamFormState = {
  title: string;
  subject: string;
  difficulty: 'easy' | 'medium' | 'hard';
  description: string;
  duration: number;
};

const examSubjects = ['Mathematics', 'Science', 'History', 'English', 'Computer Science', 'Business', 'Art', 'General'];
const examDifficulties: ExamFormState['difficulty'][] = ['easy', 'medium', 'hard'];

const emptyForm: ExamFormState = {
  title: '',
  subject: '',
  difficulty: 'medium',
  description: '',
  duration: 30,
};

export const ExamManagementPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ExamFormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadExams = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/exams');
      const payload = Array.isArray(response.data) ? response.data : response.data?.value ?? [];
      setExams(payload);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load exams');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadExams();
  }, []);

  const submit = async () => {
    if (!form.title.trim()) {
      setError('Exam title is required');
      return;
    }

    const subject = form.subject.trim();
    if (!subject) {
      setError('Exam subject is required');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      if (editingId) {
        await apiClient.put(`/exams/${editingId}`, { ...form, subject, difficulty: form.difficulty, duration: Number(form.duration) });
      } else {
        await apiClient.post('/exams', { ...form, subject, difficulty: form.difficulty, duration: Number(form.duration) });
      }

      setForm(emptyForm);
      setEditingId(null);
      await loadExams();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save exam');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;

    try {
      await apiClient.delete(`/exams/${id}`);
      await loadExams();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete exam');
    }
  };

  const openEditor = (exam: Exam) => {
    setEditingId(exam._id ?? exam.id ?? null);
    setForm({
      title: exam.title,
      subject: exam.subject ?? '',
      difficulty: exam.difficulty ?? 'medium',
      description: exam.description ?? '',
      duration: exam.duration,
    });
  };

  const isTeacherAllowed = user?.role === 'admin' || user?.role === 'teacher';

  return (
    <Layout
      title="Exam management"
      actions={
        <button onClick={() => navigate('/dashboard')} className="rounded bg-gray-800 px-3 py-2 text-white hover:bg-gray-900">
          Dashboard
        </button>
      }
    >
      <div className="space-y-6">
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900">Manage exams</h2>
          <p className="mt-2 text-gray-600">Create, edit and manage exams and questions.</p>

          {error ? <p className="mt-4 text-red-600">{error}</p> : null}

          {!isTeacherAllowed ? (
            <p className="mt-4 text-red-600">You do not have permission to manage exams.</p>
          ) : (
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <input
                value={form.title}
                onChange={(e) => setForm((current) => ({ ...current, title: e.target.value }))}
                placeholder="Exam title"
                className="rounded border border-gray-300 px-3 py-2"
              />
              <input
                value={form.subject}
                onChange={(e) => setForm((current) => ({ ...current, subject: e.target.value }))}
                placeholder="Subject"
                list="exam-subjects"
                className="rounded border border-gray-300 px-3 py-2"
              />
              <select
                value={form.difficulty}
                onChange={(e) => setForm((current) => ({ ...current, difficulty: e.target.value as ExamFormState['difficulty'] }))}
                className="rounded border border-gray-300 px-3 py-2"
              >
                {examDifficulties.map((difficulty) => (
                  <option key={difficulty} value={difficulty}>
                    {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                  </option>
                ))}
              </select>
              <input
                value={form.duration}
                onChange={(e) => setForm((current) => ({ ...current, duration: Number(e.target.value || 30) }))}
                type="number"
                min={5}
                placeholder="Duration"
                className="rounded border border-gray-300 px-3 py-2"
              />
              <button
                onClick={() => void submit()}
                disabled={saving}
                className="rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {saving ? 'Saving...' : editingId ? 'Update exam' : 'Create exam'}
              </button>
              <datalist id="exam-subjects">
                {examSubjects.map((subject) => (
                  <option key={subject} value={subject} />
                ))}
              </datalist>
              <textarea
                value={form.description}
                onChange={(e) => setForm((current) => ({ ...current, description: e.target.value }))}
                placeholder="Exam description"
                className="md:col-span-3 rounded border border-gray-300 px-3 py-2"
                rows={3}
              />
            </div>
          )}
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-xl font-semibold text-gray-900">Current exams</h3>
          {loading ? (
            <p className="text-gray-500">Loading exams...</p>
          ) : exams.length === 0 ? (
            <p className="text-gray-500">No exams found.</p>
          ) : (
            <div className="space-y-3">
              {exams.map((exam) => (
                <div key={exam._id ?? exam.id} className="flex flex-col gap-3 rounded border border-gray-200 p-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-lg font-semibold text-gray-900">{exam.title}</p>
                    <p className="text-xs font-medium uppercase tracking-wide text-violet-700">{exam.subject || 'General'}</p>
                    <p className="text-xs font-semibold capitalize text-amber-700">Difficulty: {exam.difficulty || 'medium'}</p>
                    <p className="text-sm text-gray-600">{exam.description || 'No description'}</p>
                    <p className="mt-1 text-xs text-gray-500">Duration: {exam.duration} min</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openEditor(exam)} className="rounded bg-amber-500 px-3 py-2 text-white hover:bg-amber-600">
                      Edit
                    </button>
                    <button onClick={() => navigate(`/teacher/questions/${exam._id ?? exam.id}`)} className="rounded bg-violet-600 px-3 py-2 text-white hover:bg-violet-700">
                      Questions
                    </button>
                    <button onClick={() => void handleDelete(exam._id ?? exam.id)} className="rounded bg-red-600 px-3 py-2 text-white hover:bg-red-700">
                      Delete
                    </button>
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
