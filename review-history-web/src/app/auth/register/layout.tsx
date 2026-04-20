import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Register',
  description: 'Create your ReviewHistory account and verify your email.',
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}