import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import apiClient from '../api/client';
import { Layout } from '../components/Layout';
import type { Exam, Question } from '../types';

export const ExamDetailsPage: React.FC = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!examId) return;

    const load = async () => {
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
        setError(err.response?.data?.message || 'Failed to load exam details');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [examId]);

  if (loading) {
    return <Layout title="Exam details"><div className="rounded bg-white p-6 shadow">Loading...</div></Layout>;
  }

  if (error || !exam) {
    return (
      <Layout title="Exam details" actions={<Link to="/exams">Back to exams</Link>}>
        <div className="rounded bg-white p-6 shadow">
          <p className="text-red-600">{error || 'Exam not found.'}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title={exam.title}
      actions={
        <button onClick={() => navigate(`/take-exam/${examId}`)} className="rounded bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700">
          Start exam
        </button>
      }
    >
      <div className="space-y-6">
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900">{exam.title}</h2>
          <p className="mt-2 text-gray-600">{exam.description || 'No extra description provided.'}</p>
          <div className="mt-4 flex flex-wrap gap-3 text-sm text-gray-700">
            <span className="rounded-full bg-blue-100 px-3 py-1">Subject: {exam.subject || 'General'}</span>
            <span className="rounded-full bg-amber-100 px-3 py-1">Difficulty: {exam.difficulty || 'medium'}</span>
            <span className="rounded-full bg-violet-100 px-3 py-1">Duration: {exam.duration} minutes</span>
            <span className="rounded-full bg-emerald-100 px-3 py-1">Questions: {questions.length}</span>
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-xl font-semibold">Preview</h3>
          {questions.length === 0 ? (
            <p className="text-gray-500">No questions created for this exam yet.</p>
          ) : (
            <ol className="space-y-4">
              {questions.map((question, index) => (
                <li key={question._id ?? question.id ?? index} className="rounded border border-gray-200 p-4">
                  <p className="font-medium text-gray-800">{index + 1}. {question.questionText}</p>
                  <p className="mt-2 text-sm text-gray-500">Choices: {question.options.join(' | ')}</p>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </Layout>
  );
};
