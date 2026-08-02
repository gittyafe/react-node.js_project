import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { FormField } from './FormField';
import { LoadingSpinner } from './LoadingSpinner';

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
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
      const text = error.response?.data?.message || 'Login failed';
      setError('email', { message: text });
      setMessage(text);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField
        label="Email"
        name="email"
        type="email"
        placeholder="test@example.com"
        register={registerField('email')}
        error={errors.email?.message}
      />

      <FormField
        label="Password"
        name="password"
        type="password"
        placeholder="123456"
        register={registerField('password')}
        error={errors.password?.message}
      />

      {message ? (
        <div className="space-y-2">
          <p className="text-sm text-red-500">{message}</p>
          {message.includes('register') ? (
            <Link to="/register" className="text-sm font-medium text-blue-600 hover:underline">
              Create an account
            </Link>
          ) : null}
        </div>
      ) : null}

      {isLoading ? (
        <LoadingSpinner label="Signing you in..." />
      ) : (
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Login
        </button>
      )}
    </form>
  );
};
