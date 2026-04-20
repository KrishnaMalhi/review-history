'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Shield, Landmark, ScrollText, FolderOpen, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AdminHeader } from '@/components/layout/admin-header';
import { ProtectedRoute } from '@/components/shared/protected-route';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/categories', label: 'Categories', icon: FolderOpen },
  { href: '/moderation', label: 'Moderation', icon: Shield },
  { href: '/reviews', label: 'Reviews', icon: MessageSquare },
  { href: '/claims', label: 'Claims', icon: Landmark },
  { href: '/users', label: 'Users', icon: Users },
  { href: '/audit', label: 'Audit Log', icon: ScrollText },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <ProtectedRoute roles={['admin', 'super_admin', 'moderator']}>
      <AdminHeader />
      <div className="flex min-h-[calc(100vh-4.5rem)]">
        {/* Sidebar */}
        <aside className="hidden w-60 shrink-0 border-r border-border/50 bg-white md:block">
          <div className="sticky top-[4.5rem] px-4 py-6">
            <p className="mb-4 px-3 text-[10px] font-bold uppercase tracking-widest text-muted">
              Navigation
            </p>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                      active
                        ? 'bg-primary-light text-primary shadow-sm shadow-primary/10'
                        : 'text-muted hover:bg-surface hover:text-foreground',
                    )}
                  >
                    <Icon className={cn('h-4.5 w-4.5', active && 'text-primary')} />
                    {item.label}
                    {active && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Content */}
        <main className="min-w-0 flex-1 bg-surface p-6 lg:p-8">{children}</main>
      </div>
    </ProtectedRoute>
  );
}
