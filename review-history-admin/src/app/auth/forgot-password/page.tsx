'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, Button, Input } from '@/components/ui';
import { apiPost, getApiErrorMessage } from '@/lib/api-client';
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/lib/validators';
import { FIELD_LIMITS } from '@shared/field-limits';

export default function AdminForgotPasswordPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setError('');
    setLoading(true);
    try {
      const response = await apiPost<{ otpRequestId: string; email: string; otpCode?: string }>('/auth/forgot-password', {
        email: data.email,
        adminOnly: true,
      });
      const otp = response.otpCode ? `&otp=${encodeURIComponent(response.otpCode)}` : '';
      router.push(
        `/auth/reset-password?email=${encodeURIComponent(response.email)}&otpRequestId=${encodeURIComponent(response.otpRequestId)}${otp}`,
      );
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Failed to request password reset OTP.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-foreground">Admin Password Reset</h1>
          <p className="mt-1 text-sm text-muted">Request OTP on your admin email.</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Admin Email"
                type="email"
                placeholder="admin@reviewhistory.pk"
                maxLength={FIELD_LIMITS.EMAIL}
                {...register('email')}
                error={errors.email?.message}
              />
              {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}
              <Button type="submit" loading={loading} className="w-full">
                Send OTP
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
  );
}
