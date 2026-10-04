import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { FormField } from './FormField';
import { LoadingSpinner } from './LoadingSpinner';

const loginSchema = z.object({
  email: z.string().email('המייל שהזנת אינו תקין'),
  password: z.string().min(6, 'הסיסמה חייבת להכיל לפחות 6 תווים'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginForm: React.FC = () => {
  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setMessage(null);

    try {
      await login(data.email, data.password);
      navigate('/dashboard');
    } catch (error: any) {
      const text = error.response?.data?.message || 'ההתחברות נכשלה';
      setError('email', { message: text });
      setMessage(text);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
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

      {message ? (
        <div className="form-message">
          <p>{message}</p>
          {message.includes('register') ? (
            <Link to="/register" className="inline-link">
              צור חשבון חדש
            </Link>
          ) : null}
        </div>
      ) : null}

      {isLoading ? (
        <LoadingSpinner label="מתחבר לחשבון..." />
      ) : (
        <button type="submit" className="primary-button full-width-button">
          התחבר
        </button>
      )}
    </form>
  );
};
