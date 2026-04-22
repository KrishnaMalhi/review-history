'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/lib/auth-context';
import { adminLoginSchema, type AdminLoginInput } from '@/lib/validators';
import { Button, Input, Card, CardContent } from '@/components/ui';
import { Eye, EyeOff } from 'lucide-react';
import { getApiErrorMessage } from '@/lib/api-client';
import Link from 'next/link';
import { FIELD_LIMITS } from '@shared/field-limits';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const reason = searchParams.get('reason');
  const reset = searchParams.get('reset');

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
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Invalid email or password.'));
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
                {reason === 'session_expired' && (
                  <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800 ring-1 ring-amber-200/50">
                    Your admin session expired. Please log in again.
                  </p>
                )}
                {reset === 'success' && (
                  <p className="rounded-xl bg-green-50 p-3 text-sm text-green-800 ring-1 ring-green-200/50">
                    Password reset successful. You can now log in.
                  </p>
                )}
                <Input
                  label="Email"
                  type="email"
                  placeholder="admin@reviewhistory.pk"
                  autoComplete="email"
                  maxLength={FIELD_LIMITS.EMAIL}
                  {...register('email')}
                  error={errors.email?.message}
                />

                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-foreground">Password</span>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      maxLength={FIELD_LIMITS.PASSWORD}
                      {...register('password')}
                      className="block w-full rounded-xl border border-border bg-white px-3.5 py-2.5 pr-10 text-sm placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted hover:bg-surface hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password?.message && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
                </label>

                {error && (
                  <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600 ring-1 ring-red-200/50">{error}</p>
                )}

                <Button type="submit" loading={loading} className="w-full">
                  Login
                </Button>
              </form>
              <p className="mt-3 text-center text-sm text-muted">
                <Link href="/auth/forgot-password" className="text-primary hover:underline">
                  Forgot password?
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
