import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';
import { Layout } from '../components/Layout';
import { FormField } from '../components/FormField';
import { LoadingSpinner } from '../components/LoadingSpinner';

const profileSchema = z.object({
  fullName: z.string().min(2, 'שם מלא חייב להכיל לפחות 2 תווים'),
  email: z.string().email('מייל לא חוקי'),
  password: z.string().min(6, 'סיסמה חייבת להכיל לפחות 6 תווים').optional().or(z.literal('')),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export const Profile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.fullName || '',
      email: user?.email || '',
      password: '',
    },
  });

  React.useEffect(() => {
    reset({
      fullName: user?.fullName || '',
      email: user?.email || '',
      password: '',
    });
  }, [reset, user]);

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    setMessage(null);
    setSuccess(null);

    try {
      const payload = {
        fullName: data.fullName,
        email: data.email,
        password: data.password || undefined,
      };

      await updateProfile(payload);
      setSuccess('הפרופיל עודכן בהצלחה');
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'עדכון הפרופיל נכשל');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout title="Profile" actions={<span className="text-gray-700">{user?.email}</span>}>
      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="text-2xl font-bold">My profile</h2>
        <p className="mt-2 text-gray-600">Update your personal details and password.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <FormField
            label="שם מלא"
            name="fullName"
            placeholder="שם מלא"
            register={register('fullName')}
            error={errors.fullName?.message}
          />

          <FormField
            label="אימייל"
            name="email"
            type="email"
            placeholder="email@example.com"
            register={register('email')}
            error={errors.email?.message}
          />

          <FormField
            label="סיסמה חדשה"
            name="password"
            type="password"
            placeholder="השאר ריק כדי שלא לשנות"
            register={register('password')}
            error={errors.password?.message}
          />

          {message ? <p className="text-sm text-red-500">{message}</p> : null}
          {success ? <p className="text-sm text-green-600">{success}</p> : null}

          {isLoading ? (
            <LoadingSpinner label="Saving profile..." />
          ) : (
            <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
              Save changes
            </button>
          )}
        </form>
      </div>
    </Layout>
  );
};
