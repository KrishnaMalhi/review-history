'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/lib/auth-context';
import { adminLoginSchema, type AdminLoginInput } from '@/lib/validators';
import { Button, Input, Card, CardContent } from '@/components/ui';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminLoginInput>({
    resolver: zodResolver(adminLoginSchema),
  });

  const onSubmit = async (data: AdminLoginInput) => {
    setError('');
    setLoading(true);
    try {
      await login(data.email, data.password);
      router.replace('/');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left - Branding panel */}
      <div className="hidden w-1/2 gradient-sidebar items-center justify-center lg:flex">
        <div className="max-w-md text-center px-8">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary shadow-xl shadow-primary/30">
            <svg className="h-8 w-8 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          </div>
          <h2 className="text-3xl font-bold text-white">ReviewHistory</h2>
          <p className="mt-3 text-gray-400">
            Admin panel for managing users, moderation, claims, categories, and platform integrity.
          </p>
          <div className="mt-8 flex items-center justify-center gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">10K+</p>
              <p className="text-xs text-gray-500">Reviews</p>
            </div>
            <div className="h-8 w-px bg-gray-700" />
            <div className="text-center">
              <p className="text-2xl font-bold text-accent">5K+</p>
              <p className="text-xs text-gray-500">Entities</p>
            </div>
            <div className="h-8 w-px bg-gray-700" />
            <div className="text-center">
              <p className="text-2xl font-bold text-star">50K+</p>
              <p className="text-xs text-gray-500">Users</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right - Login form */}
      <div className="flex flex-1 items-center justify-center bg-surface px-4">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl gradient-primary shadow-lg shadow-primary/20 lg:hidden">
              <svg className="h-7 w-7 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            </div>
            <h1 className="text-2xl font-bold text-foreground">Admin Login</h1>
            <p className="mt-1 text-sm text-muted">
              Sign in with your admin email and password
            </p>
          </div>

          <Card className="overflow-hidden">
            <div className="h-1 gradient-primary" />
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  label="Email"
                  type="email"
                  placeholder="admin@reviewhistory.pk"
                  autoComplete="email"
                  maxLength={255}
                  {...register('email')}
                  error={errors.email?.message}
                />

                <Input
                  label="Password"
                  type="password"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  maxLength={128}
                  {...register('password')}
                  error={errors.password?.message}
                />

                {error && (
                  <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600 ring-1 ring-red-200/50">{error}</p>
                )}

                <Button type="submit" loading={loading} className="w-full">
                  Login
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
