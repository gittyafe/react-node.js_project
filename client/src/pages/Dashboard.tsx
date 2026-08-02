import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { StatCard } from '../components/StatCard';

export const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleLabel = user?.role ? user.role.toUpperCase() : '—';

  return (
    <Layout
      title="Online Exam System"
      actions={
        <>
          <span className="text-gray-700">Welcome, {user?.fullName}</span>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Logout
          </button>
        </>
      }
    >
      <div className="space-y-6">
        <section className="rounded-lg bg-white p-6 shadow">
          <h2 className="text-2xl font-bold">Dashboard</h2>
          <p className="mt-2 text-gray-600">You are signed in and ready to continue.</p>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <StatCard title="Role" value={roleLabel} tone="blue" />
          <StatCard title="Email" value={user?.email} tone="green" />
          <StatCard title="User ID" value={user?.id} tone="purple" />
        </section>

        <section className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-lg font-semibold">Quick actions</h3>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link to="/profile" className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
              Edit profile
            </Link>
            {user?.role === 'admin' ? (
              <Link to="/users" className="rounded bg-gray-800 px-4 py-2 text-white hover:bg-gray-900">
                Manage users
              </Link>
            ) : null}
          </div>
        </section>
      </div>
    </Layout>
  );
};
