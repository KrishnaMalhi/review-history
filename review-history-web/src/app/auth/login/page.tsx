'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/lib/auth-context';
import { loginSchema, type LoginInput } from '@/lib/validators';
import { Button, Input, Card, CardContent } from '@/components/ui';
import { PublicLayout } from '@/components/layout';
import Link from 'next/link';
import { getApiErrorMessage } from '@/lib/api-client';
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
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setError('');
    setLoading(true);
    try {
      const result = await login(data.email, data.password);
      if (result.requiresVerification) {
        const reason = result.loginReason ? `&reason=${encodeURIComponent(result.loginReason)}` : '';
        const otp = result.otpCode ? `&otp=${encodeURIComponent(result.otpCode)}` : '';
        router.push(
          `/auth/verify?email=${encodeURIComponent(result.email)}&otpRequestId=${encodeURIComponent(result.otpRequestId)}${reason}${otp}`,
        );
      } else {
        router.push('/feed');
      }
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Login failed.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-surface px-4 py-16">
        <div className="blob-green absolute -top-20 -right-20 h-60 w-60 opacity-30" />
        <div className="blob-orange absolute bottom-10 -left-10 h-48 w-48 opacity-20" />
        <div className="relative w-full max-w-sm">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-foreground">Sign In</h1>
            <p className="mt-1 text-sm text-muted">Login with email and password</p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {reason === 'session_expired' && (
                  <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                    Your session expired. Please log in again.
                  </p>
                )}
                {reset === 'success' && (
                  <p className="rounded-lg bg-green-50 p-3 text-sm text-green-800">
                    Password reset successful. You can now log in.
                  </p>
                )}
                <Input
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  maxLength={FIELD_LIMITS.EMAIL}
                  {...register('email')}
                  error={errors.email?.message}
                />
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-foreground">Password</span>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter password"
                      maxLength={FIELD_LIMITS.PASSWORD}
                      autoComplete="current-password"
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

                {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}

                <Button type="submit" loading={loading} className="w-full">
                  Continue
                </Button>
              </form>

              <p className="mt-3 text-center text-sm text-muted">
                <Link href="/auth/forgot-password" className="text-primary hover:underline">
                  Forgot password?
                </Link>
              </p>

              <p className="mt-4 text-center text-sm text-muted">
                New user?{' '}
                <Link href="/auth/register" className="text-primary hover:underline">
                  Create account
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </PublicLayout>
  );
}
