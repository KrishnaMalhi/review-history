'use client';

import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, Button, Input } from '@/components/ui';
import { PublicLayout } from '@/components/layout';
import { apiPost, getApiErrorMessage } from '@/lib/api-client';
import { resetPasswordSchema, type ResetPasswordInput } from '@/lib/validators';
import { FIELD_LIMITS } from '@shared/field-limits';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const otpRequestId = searchParams.get('otpRequestId') || '';
  const email = searchParams.get('email') || '';
  const otpPreview = searchParams.get('otp') || '';

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const step = useMemo(() => (resetToken ? 'reset' : 'verify'), [resetToken]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordInput) => {
    setError('');
    setLoading(true);
    try {
      let token = resetToken;
      if (!token) {
        const verify = await apiPost<{ resetToken: string }>('/auth/verify-reset-otp', {
          otpRequestId,
          code: data.code,
        });
        token = verify.resetToken;
        setResetToken(token);
      }

      await apiPost('/auth/reset-password', {
        resetToken: token,
        newPassword: data.newPassword,
      });
      router.push('/auth/login?reset=success');
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Unable to reset password.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <div className="flex flex-1 items-center justify-center bg-surface px-4 py-16">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-foreground">Reset Password</h1>
            <p className="mt-1 text-sm text-muted">
              {step === 'verify'
                ? `Enter OTP sent to ${email || 'your email'} and set your new password.`
                : 'Set your new password.'}
            </p>
            {step === 'verify' && otpPreview && (
              <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
                Dev OTP: <span className="font-semibold">{otpPreview}</span>
              </p>
            )}
          </div>

          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {!resetToken && (
                  <Input
                    label="OTP Code"
                    placeholder="000000"
                    maxLength={FIELD_LIMITS.OTP_CODE}
                    inputMode="numeric"
                    {...register('code')}
                    error={errors.code?.message}
                  />
                )}

                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-foreground">New Password</span>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      maxLength={FIELD_LIMITS.PASSWORD}
                      autoComplete="new-password"
                      placeholder="At least 8 characters"
                      {...register('newPassword')}
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
                  {errors.newPassword?.message && <p className="mt-1 text-sm text-red-600">{errors.newPassword.message}</p>}
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-foreground">Confirm Password</span>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      maxLength={FIELD_LIMITS.PASSWORD}
                      autoComplete="new-password"
                      placeholder="Re-enter password"
                      {...register('confirmPassword')}
                      className="block w-full rounded-xl border border-border bg-white px-3.5 py-2.5 pr-10 text-sm placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted hover:bg-surface hover:text-foreground"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword?.message && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                  )}
                </label>

                {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}

                <Button type="submit" loading={loading} className="w-full">
                  Reset Password
                </Button>
              </form>

              <p className="mt-4 text-center text-sm text-muted">
                <Link href="/auth/login" className="text-primary hover:underline">
                  Back to login
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </PublicLayout>
  );
}
