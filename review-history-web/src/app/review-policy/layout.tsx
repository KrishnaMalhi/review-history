import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Review Policy',
  description: 'Content and review policy for Review History — standards, prohibited content, and moderation process.',
};

export default function ReviewPolicyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
