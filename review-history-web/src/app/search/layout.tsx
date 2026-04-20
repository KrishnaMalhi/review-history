import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Search Entities',
  description: 'Search businesses, landlords, doctors, and services across Pakistan. Filter by category, city, and more.',
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
