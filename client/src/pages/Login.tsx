import React from 'react';
import { LoginForm } from '../components/LoginForm';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AuthPage } from '../components/AuthPage';

export const Login: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <AuthPage
      title="התחברות"
      footer={
        <>
          אין לך חשבון?{' '}
          <Link to="/register" className="inline-link">
            הירשם כאן
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthPage>
  );
};
