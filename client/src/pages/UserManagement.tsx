import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Layout } from '../components/Layout';
import apiClient from '../api/client';
import type { User } from '../types';

type UserFormState = {
  fullName: string;
  email: string;
  password: string;
  role: 'admin' | 'teacher' | 'student';
};

const emptyForm: UserFormState = {
  fullName: '',
  email: '',
  password: '',
  role: 'student',
};

const normalizeUserRecord = (item: any): User => ({
  ...item,
  id: item?.id ?? item?._id ?? '',
  role: item?.role ?? 'student',
});

export const UserManagement: React.FC = () => {
  const { user } = useAuth();

  if (!user || user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [message, setMessage] = React.useState<string | null>(null);
  const [form, setForm] = React.useState<UserFormState>(emptyForm);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  const fetchUsers = React.useCallback(async () => {
    try {
      const response = await apiClient.get<any[]>('/users');
      const normalized = (response.data ?? []).map(normalizeUserRecord);
      setUsers(normalized);
      setMessage(null);
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async () => {
    if (!form.fullName.trim() || !form.email.trim()) {
      setMessage('שם מלא ואימייל נדרשים');
      return;
    }

    if (!editingId && form.password.trim().length < 6) {
      setMessage('הסיסמה חייבת להכיל לפחות 6 תווים');
      return;
    }

    try {
      setSaving(true);
      setMessage(null);

      const payload = {
        fullName: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password.trim(),
        role: form.role,
      };

      if (editingId) {
        await apiClient.put(`/users/${editingId}`, {
          ...payload,
          password: form.password.trim() || undefined,
        });
        setMessage('המשתמש עודכן בהצלחה');
      } else {
        await apiClient.post('/users', payload);
        setMessage('המשתמש נוצר בהצלחה');
      }

      resetForm();
      await fetchUsers();
    } catch (error: any) {
      setMessage(error.response?.data?.message || error.response?.data?.errors || 'הפעולה נכשלה');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id) {
      setMessage('לא ניתן למחוק משתמש ללא מזהה');
      return;
    }

    if (!window.confirm('האם למחוק את המשתמש הזה?')) {
      return;
    }

    try {
      await apiClient.delete(`/users/${id}`);
      setMessage('המשתמש נמחק');
      await fetchUsers();
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'מחיקה נכשלה');
    }
  };

  const handleEdit = (item: User) => {
    setEditingId(item.id || item._id || null);
    setForm({
      fullName: item.fullName,
      email: item.email,
      password: '',
      role: item.role,
    });
  };

  return (
    <Layout title="ניהול משתמשים" actions={<span className="text-gray-700">{user?.email}</span>}>
      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="text-2xl font-bold">משתמשים</h2>
        <p className="mt-2 text-gray-600">מנהל יכול ליצור, לערוך ולמחוק משתמשים, כולל מנהלי מערכת.</p>

        <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
          <h3 className="mb-3 text-lg font-semibold">{editingId ? 'עדכון משתמש' : 'הוספת משתמש חדש'}</h3>
          <div className="grid gap-3 md:grid-cols-2">
            <input
              value={form.fullName}
              onChange={(e) => setForm((current) => ({ ...current, fullName: e.target.value }))}
              placeholder="שם מלא"
              className="rounded border border-gray-300 px-3 py-2"
            />
            <input
              value={form.email}
              onChange={(e) => setForm((current) => ({ ...current, email: e.target.value }))}
              placeholder="אימייל"
              className="rounded border border-gray-300 px-3 py-2"
            />
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm((current) => ({ ...current, password: e.target.value }))}
              placeholder={editingId ? 'סיסמה חדשה (לא חובה)' : 'סיסמה'}
              className="rounded border border-gray-300 px-3 py-2"
            />
            <select
              value={form.role}
              onChange={(e) => setForm((current) => ({ ...current, role: e.target.value as UserFormState['role'] }))}
              className="rounded border border-gray-300 px-3 py-2"
            >
              <option value="admin">מנהל</option>
              <option value="teacher">מורה</option>
              <option value="student">תלמיד</option>
            </select>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={() => void handleSubmit()}
              className="rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-60"
              disabled={saving}
            >
              {saving ? 'שומר...' : editingId ? 'עדכון משתמש' : 'הוסף משתמש'}
            </button>
            {editingId ? (
              <button onClick={resetForm} className="rounded bg-gray-200 px-4 py-2 font-medium text-gray-800 hover:bg-gray-300">
                ביטול
              </button>
            ) : null}
          </div>
        </div>

        {message ? <p className="mt-4 text-sm text-red-600">{message}</p> : null}

        {loading ? (
          <p className="mt-6 text-gray-500">טוען משתמשים...</p>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full border text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-3 py-2 text-left">שם</th>
                  <th className="border px-3 py-2 text-left">אימייל</th>
                  <th className="border px-3 py-2 text-left">תפקיד</th>
                  <th className="border px-3 py-2 text-left">פעולות</th>
                </tr>
              </thead>
              <tbody>
                {users.map((item) => (
                  <tr key={item.id || item._id || item.email}>
                    <td className="border px-3 py-2">{item.fullName}</td>
                    <td className="border px-3 py-2">{item.email}</td>
                    <td className="border px-3 py-2">{item.role}</td>
                    <td className="border px-3 py-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="rounded bg-amber-500 px-3 py-1 text-white hover:bg-amber-600"
                        >
                          ערוך
                        </button>
                        <button
                          onClick={() => void handleDelete(item.id || item._id)}
                          className="rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700"
                        >
                          מחק
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
};
