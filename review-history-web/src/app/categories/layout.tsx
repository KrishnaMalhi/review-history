import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Categories',
  description: 'Browse review categories: landlords, doctors, mechanics, businesses, and more across Pakistan.',
};

export default function CategoriesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
