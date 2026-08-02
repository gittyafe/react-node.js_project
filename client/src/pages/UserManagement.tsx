import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Layout } from '../components/Layout';
import apiClient from '../api/client';
import type { User } from '../types';

export const UserManagement: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [message, setMessage] = React.useState<string | null>(null);

  const fetchUsers = React.useCallback(async () => {
    try {
      const response = await apiClient.get<User[]>('/users');
      setUsers(response.data);
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

  const handleDelete = async (id: string) => {
    try {
      await apiClient.delete(`/users/${id}`);
      setMessage('User deleted');
      void fetchUsers();
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Deletion failed');
    }
  };

  return (
    <Layout title="User management" actions={<span className="text-gray-700">{user?.email}</span>}>
      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="text-2xl font-bold">Users</h2>
        <p className="mt-2 text-gray-600">Admin can view and remove users from the system.</p>

        {message ? <p className="mt-4 text-sm text-red-600">{message}</p> : null}

        {loading ? (
          <p className="mt-6 text-gray-500">Loading users...</p>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full border text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-3 py-2 text-left">Name</th>
                  <th className="border px-3 py-2 text-left">Email</th>
                  <th className="border px-3 py-2 text-left">Role</th>
                  <th className="border px-3 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((item) => (
                  <tr key={item.id}>
                    <td className="border px-3 py-2">{item.fullName}</td>
                    <td className="border px-3 py-2">{item.email}</td>
                    <td className="border px-3 py-2">{item.role}</td>
                    <td className="border px-3 py-2">
                      <button
                        onClick={() => void handleDelete(item.id)}
                        className="rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700"
                      >
                        Delete
                      </button>
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
