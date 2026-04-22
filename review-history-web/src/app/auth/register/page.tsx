'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/lib/auth-context';
import { registerSchema, type RegisterInput } from '@/lib/validators';
import { Button, Input, Card, CardContent } from '@/components/ui';
import { PublicLayout } from '@/components/layout';
import Link from 'next/link';
import { getApiErrorMessage } from '@/lib/api-client';
import { FIELD_LIMITS } from '@shared/field-limits';

function sanitizePhoneInput(raw: string): string {
  let value = raw.replace(/[^\d+]/g, '');
  if (value.includes('+')) {
    value = `+${value.replace(/\+/g, '')}`;
  }
  return value.slice(0, FIELD_LIMITS.PHONE_INPUT);
}

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    setError('');
    setLoading(true);
    try {
      const result = await registerUser(data);
      const otpParam = result.otpCode ? `&otp=${encodeURIComponent(result.otpCode)}` : '';
      router.push(
        `/auth/verify?email=${encodeURIComponent(result.email)}&otpRequestId=${encodeURIComponent(result.otpRequestId)}${otpParam}`,
      );
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Registration failed.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-surface px-4 py-16">
        <div className="relative w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-foreground">Create Account</h1>
            <p className="mt-1 text-sm text-muted">Register and verify your email OTP</p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  label="Display Name"
                  placeholder="Your name"
                  maxLength={FIELD_LIMITS.DISPLAY_NAME}
                  {...register('displayName')}
                  error={errors.displayName?.message}
                />
                <Input
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  maxLength={FIELD_LIMITS.EMAIL}
                  {...register('email')}
                  error={errors.email?.message}
                />
                <Input
                  label="Phone"
                  placeholder="03001234567"
                  maxLength={FIELD_LIMITS.PHONE_INPUT}
                  inputMode="tel"
                  autoComplete="tel"
                  pattern="^(\+92|0)?3[0-9]{9}$"
                  {...register('phone', {
                    setValueAs: (value: unknown) => sanitizePhoneInput(String(value ?? '')),
                  })}
                  onInput={(e) => {
                    const input = e.currentTarget;
                    input.value = sanitizePhoneInput(input.value);
                  }}
                  error={errors.phone?.message}
                />
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-foreground">Password</span>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="At least 8 characters"
                      maxLength={FIELD_LIMITS.PASSWORD}
                      autoComplete="new-password"
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

                <label className="flex items-start gap-2 rounded-lg border border-border bg-surface/50 p-3 text-sm text-foreground">
                  <input type="checkbox" {...register('acceptLegal')} className="mt-0.5 rounded" />
                  <span>
                    I agree to the{' '}
                    <Link href="/terms" className="font-medium text-primary hover:underline" target="_blank">
                      Terms and Conditions
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="font-medium text-primary hover:underline" target="_blank">
                      Privacy Policy
                    </Link>
                    .
                    {errors.acceptLegal?.message && (
                      <span className="mt-1 block text-xs text-red-600">{errors.acceptLegal.message}</span>
                    )}
                  </span>
                </label>

                {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}

                <Button type="submit" loading={loading} className="w-full">
                  Register
                </Button>
              </form>

              <p className="mt-4 text-center text-sm text-muted">
                Already have an account?{' '}
                <Link href="/auth/login" className="text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </PublicLayout>
  );
}
