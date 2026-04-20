import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login',
  description: 'Sign in to Review History Admin Panel.',
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children;
}
