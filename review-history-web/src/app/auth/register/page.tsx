'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/lib/auth-context';
import { registerSchema, type RegisterInput } from '@/lib/validators';
import { Button, Input, Card, CardContent } from '@/components/ui';
import { PublicLayout } from '@/components/layout';
import Link from 'next/link';

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
      router.push(
        `/auth/verify?email=${encodeURIComponent(result.email)}&otpRequestId=${encodeURIComponent(result.otpRequestId)}`,
      );
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Registration failed.');
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
                  maxLength={100}
                  {...register('displayName')}
                  error={errors.displayName?.message}
                />
                <Input
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  maxLength={255}
                  {...register('email')}
                  error={errors.email?.message}
                />
                <Input
                  label="Phone"
                  placeholder="03001234567"
                  maxLength={20}
                  {...register('phone')}
                  error={errors.phone?.message}
                />
                <Input
                  label="Password"
                  type="password"
                  placeholder="At least 8 characters"
                  maxLength={128}
                  {...register('password')}
                  error={errors.password?.message}
                />

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
