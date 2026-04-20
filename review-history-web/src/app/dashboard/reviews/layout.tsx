import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Reviews',
  description: 'View and manage your submitted reviews on Review History.',
};

export default function DashboardReviewsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
