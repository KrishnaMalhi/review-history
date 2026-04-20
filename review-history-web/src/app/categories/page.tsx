'use client';

import { PublicLayout } from '@/components/layout';
import { useCategories } from '@/hooks/use-api';
import { Skeleton } from '@/components/ui';
import { Breadcrumbs } from '@/components/seo/breadcrumbs';
import { CategoryIcon } from '@/components/shared/category-icon';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function CategoriesPage() {
  const { data: categories, isLoading } = useCategories();

  return (
    <PublicLayout>
      <div className="relative overflow-hidden bg-surface min-h-screen">
        <div className="blob-green absolute -top-20 -right-20 h-60 w-60 opacity-30" />
        <div className="blob-orange absolute bottom-20 -left-10 h-48 w-48 opacity-20" />
        <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Categories' }]} />

          <div className="mb-10">
            <span className="inline-block rounded-full bg-primary-light px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-primary">
              Browse
            </span>
            <h1 className="mt-3 text-3xl font-bold text-foreground sm:text-4xl">
              All <span className="gradient-text-green">Categories</span>
            </h1>
            <p className="mt-2 text-muted">
              Browse reviews across different sectors and industries
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <Skeleton key={i} className="h-28 w-full rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {categories?.map((cat, i) => (
                <Link key={cat.id} href={`/search?category=${cat.key}`}>
                  <div className="card-hover group relative overflow-hidden flex items-center gap-5 rounded-xl border border-border bg-white p-6 cursor-pointer">
                    <div className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity ${i % 3 === 0 ? 'from-primary to-emerald-300' : i % 3 === 1 ? 'from-accent to-amber-300' : 'from-navy to-blue-400'}`} />
                    <span className={`relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl transition-transform group-hover:scale-110 ${i % 3 === 0 ? 'bg-primary-light' : i % 3 === 1 ? 'bg-accent-light' : 'bg-blue-50'}`}>
                      <CategoryIcon name={cat.icon} className={`h-7 w-7 ${i % 3 === 0 ? 'text-primary' : i % 3 === 1 ? 'text-accent' : 'text-navy-light'}`} />
                    </span>
                    <div className="relative min-w-0 flex-1">
                      <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">
                        {cat.name}
                      </h3>
                      <p className="mt-1 text-sm text-muted line-clamp-2">{cat.description}</p>
                    </div>
                    <ArrowRight className="relative h-5 w-5 shrink-0 text-muted opacity-0 transition-all group-hover:opacity-100 group-hover:text-primary group-hover:translate-x-1" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}
