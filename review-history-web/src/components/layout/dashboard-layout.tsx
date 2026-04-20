'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileText, Landmark, Bookmark, User, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { ProtectedRoute } from '@/components/shared/protected-route';

const navItems = [
  { href: '/dashboard/reviews', label: 'My Reviews', icon: FileText },
  { href: '/dashboard/claims', label: 'My Claims', icon: Landmark },
  { href: '/dashboard/saved', label: 'Saved Entities', icon: Bookmark },
  { href: '/dashboard/profile', label: 'Profile', icon: User },
  { href: '/dashboard/notification', label: 'Notifications', icon: Bell },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <ProtectedRoute>
      <Header />
      <div className="bg-surface min-h-screen">
        <div className="mx-auto flex max-w-7xl gap-6 px-4 py-8">
          {/* Sidebar */}
          <aside className="hidden w-56 shrink-0 md:block">
            <nav className="sticky top-24 space-y-1 rounded-xl border border-border bg-white p-3 shadow-sm">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                      active
                        ? 'bg-primary-light text-primary-dark'
                        : 'text-muted hover:bg-surface hover:text-foreground',
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </aside>

          {/* Content */}
          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </div>
      <Footer />
    </ProtectedRoute>
  );
}
