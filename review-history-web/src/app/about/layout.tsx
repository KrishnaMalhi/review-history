import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About',
  description: "Learn about Review History — Pakistan's first entity-first review and trust platform.",
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
