import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { AuthPage } from '../components/AuthPage';
import { FormField } from '../components/FormField';
import { LoadingSpinner } from '../components/LoadingSpinner';

const registerSchema = z.object({
  fullName: z.string().min(2, 'שם מלא חייב להכיל לפחות 2 תווים'),
  email: z.string().email('מייל לא חוקי'),
  password: z.string().min(6, 'סיסמה חייבת להכיל לפחות 6 תווים'),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const Register: React.FC = () => {
  const { isAuthenticated, register: registerUser } = useAuth();
  const navigate = useNavigate();
  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });
  const [isLoading, setIsLoading] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setMessage(null);

    try {
      await registerUser(data.fullName, data.email, data.password);
      navigate('/dashboard');
    } catch (error: any) {
      const text = error.response?.data?.message || 'הרשמה נכשלה';
      setError('email', { message: text });
      setMessage(text);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthPage
      title="הרשמה"
      footer={
        <>
          כבר רשום?{' '}
          <Link to="/login" className="inline-link">
            התחבר כאן
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          label="שם מלא"
          name="fullName"
          placeholder="ישראל ישראלי"
          register={registerField('fullName')}
          error={errors.fullName?.message}
        />

        <FormField
          label="אימייל"
          name="email"
          type="email"
          placeholder="test@example.com"
          register={registerField('email')}
          error={errors.email?.message}
        />

        <FormField
          label="סיסמה"
          name="password"
          type="password"
          placeholder="123456"
          register={registerField('password')}
          error={errors.password?.message}
        />

        {message ? <p className="text-sm text-red-500">{message}</p> : null}

        {isLoading ? (
          <LoadingSpinner label="Creating your account..." />
        ) : (
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            הרשם
          </button>
        )}
      </form>
    </AuthPage>
  );
};
