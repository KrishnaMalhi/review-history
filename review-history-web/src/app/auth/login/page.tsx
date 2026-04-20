'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/lib/auth-context';
import { loginSchema, type LoginInput } from '@/lib/validators';
import { Button, Input, Card, CardContent } from '@/components/ui';
import { PublicLayout } from '@/components/layout';
import Link from 'next/link';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
        router.push(
          `/auth/verify?email=${encodeURIComponent(result.email)}&otpRequestId=${encodeURIComponent(result.otpRequestId)}${reason}`,
        );
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Login failed.');
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
                <Input
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  maxLength={255}
                  {...register('email')}
                  error={errors.email?.message}
                />
                <Input
                  label="Password"
                  type="password"
                  placeholder="Enter password"
                  maxLength={128}
                  {...register('password')}
                  error={errors.password?.message}
                />

                {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}

                <Button type="submit" loading={loading} className="w-full">
                  Continue
                </Button>
              </form>

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
