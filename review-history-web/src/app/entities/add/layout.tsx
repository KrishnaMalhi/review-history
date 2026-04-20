import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Add Entity',
  description: 'Add a business, landlord, doctor, or service provider to Review History.',
};

export default function AddEntityLayout({ children }: { children: React.ReactNode }) {
  return children;
}
