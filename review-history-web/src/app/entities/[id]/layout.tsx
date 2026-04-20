import type { Metadata } from 'next';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

async function fetchEntity(id: string) {
  try {
    const res = await fetch(`${API_URL}/entities/${id}`, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? json;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const entity = await fetchEntity(id);

  if (!entity) {
    return { title: 'Entity Not Found' };
  }

  const title = entity.name || 'Entity';
  const rating = entity.averageRating ? `${entity.averageRating.toFixed(1)}/5` : 'No ratings';
  const reviews = entity.reviewCount ?? 0;
  const description = `${title} — ${rating} (${reviews} review${reviews !== 1 ? 's' : ''}). Read honest reviews on Review History.`;

  return {
    title,
    description,
    openGraph: {
      title: `${title} | Review History`,
      description,
      type: 'profile',
    },
    twitter: {
      card: 'summary',
      title: `${title} | Review History`,
      description,
    },
  };
}

export default function EntityLayout({ children }: { children: React.ReactNode }) {
  return children;
}
