'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/lib/auth-context';
import { otpSchema, type OtpInput } from '@/lib/validators';
import { Button, Input, Card, CardContent } from '@/components/ui';
import { PublicLayout } from '@/components/layout';
import { getApiErrorMessage } from '@/lib/api-client';
import { FIELD_LIMITS } from '@shared/field-limits';

function VerifyForm() {
  const { verifyEmailOtp, requestEmailOtp } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const reason = searchParams.get('reason');
  const initialOtp = searchParams.get('otp') || '';
  const [otpRequestId, setOtpRequestId] = useState(searchParams.get('otpRequestId') || '');
  const [otpPreview, setOtpPreview] = useState(initialOtp);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(60);

  useEffect(() => {
    if (!email || !otpRequestId) {
      router.replace('/auth/login');
    }
  }, [email, otpRequestId, router]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OtpInput>({
    resolver: zodResolver(otpSchema),
  });

  const onSubmit = async (data: OtpInput) => {
    setError('');
    setLoading(true);
    try {
      await verifyEmailOtp(otpRequestId, data.code);
      router.push('/feed');
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Invalid code. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = useCallback(async () => {
    try {
      const result = await requestEmailOtp(email);
      setOtpRequestId(result.otpRequestId);
      setOtpPreview(result.otpCode || '');
      setCooldown(result.cooldownSeconds || 60);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Failed to resend OTP.'));
    }
  }, [email, requestEmailOtp]);

  if (!email || !otpRequestId) return null;

  return (
    <PublicLayout>
      <div className="flex flex-1 items-center justify-center bg-surface px-4 py-16">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-foreground">Verify your email</h1>
            {reason === 'email_not_verified' && (
              <p className="mt-1 text-xs text-amber-700">Email verification is required before login.</p>
            )}
            <p className="mt-1 text-sm text-muted">
              Enter the 6-digit OTP sent to <span className="font-medium text-foreground">{email}</span>
            </p>
            {otpPreview && (
              <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
                Dev OTP: <span className="font-semibold">{otpPreview}</span>
              </p>
            )}
          </div>

          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  label="Verification Code"
                  placeholder="000000"
                  maxLength={FIELD_LIMITS.OTP_CODE}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  {...register('code')}
                  error={errors.code?.message}
                />

                {error && (
                  <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>
                )}

                <Button type="submit" loading={loading} className="w-full">
                  Verify & Continue
                </Button>
              </form>

              <div className="mt-4 text-center">
                {cooldown > 0 ? (
                  <p className="text-sm text-muted">Resend code in {cooldown}s</p>
                ) : (
                  <button
                    onClick={handleResend}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    Resend Code
                  </button>
                )}
              </div>

              <button
                onClick={() => router.back()}
                className="mt-2 block w-full text-center text-sm text-muted hover:text-foreground"
              >
                Back
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </PublicLayout>
  );
}

export default function VerifyPage() {
  return (
    <Suspense>
      <VerifyForm />
    </Suspense>
  );
}
