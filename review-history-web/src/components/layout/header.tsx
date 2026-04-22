'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { Search, Menu, X, Bell, User, LogOut, FileText, Shield, Landmark, Star } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useNotifications } from '@/hooks/use-api';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/utils';

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const { data: notifData } = useNotifications(
    isAuthenticated ? { page: 1, pageSize: 5 } : undefined,
    { refetchInterval: isAuthenticated ? 30000 : false, enabled: isAuthenticated },
  );
  const unreadCount = notifData?.unreadCount ?? 0;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin' || user?.role === 'moderator';
  const adminAppUrl = process.env.NEXT_PUBLIC_ADMIN_APP_URL || 'http://localhost:5001';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-sm">
      {/* Top accent bar */}
      <div className="h-1 gradient-primary" />
      {/* Top bar */}
      <div className="border-b border-border/50">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary shadow-md shadow-primary/20 transition-transform group-hover:scale-105">
              <Star className="h-5 w-5 fill-white text-white" />
            </div>
            <span className="hidden text-xl font-bold sm:block">
              <span className="text-secondary">Review</span><span className="text-primary">History</span>
            </span>
          </Link>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="mx-4 flex flex-1 max-w-2xl">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for a company, landlord, doctor..."
                className="w-full rounded-full border border-border bg-surface py-2.5 pl-10 pr-4 text-sm placeholder:text-muted transition-all focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:shadow-md"
              />
            </div>
          </form>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex">
            <Link
              href="/categories"
              className="rounded-lg px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-surface hover:text-foreground"
            >
              Categories
            </Link>
            <Link
              href="/feed"
              className="rounded-lg px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-surface hover:text-foreground"
            >
              Feed
            </Link>
            <Link
              href="/community"
              className="rounded-lg px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-surface hover:text-foreground"
            >
              Community
            </Link>
            <Link
              href="/discussions"
              className="rounded-lg px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-surface hover:text-foreground"
            >
              Discussions
            </Link>
            <Link
              href="/blogs"
              className="rounded-lg px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-surface hover:text-foreground"
            >
              Blogs
            </Link>
            <Link
              href="/entities/add"
              className="rounded-lg px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-surface hover:text-foreground"
            >
              Add Listing
            </Link>
            {isAuthenticated ? (
              <>
                {/* Notification bell */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => setNotifOpen((v) => !v)}
                    className="relative rounded-lg p-2 text-foreground/70 transition-colors hover:bg-surface hover:text-foreground"
                  >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>
                  {notifOpen && (
                    <div className="absolute right-0 mt-2 w-80 rounded-xl border border-border bg-white shadow-xl">
                      <div className="flex items-center justify-between border-b border-border px-4 py-3">
                        <span className="text-sm font-bold text-foreground">Notifications</span>
                        <Link
                          href="/dashboard/notification"
                          onClick={() => setNotifOpen(false)}
                          className="text-xs font-semibold text-primary hover:underline"
                        >
                          View all
                        </Link>
                      </div>
                      <div className="max-h-72 overflow-y-auto">
                        {notifData?.data?.length ? (
                          notifData.data.map((n) => (
                            <div
                              key={n.id}
                              className={cn(
                                'border-b border-border/50 px-4 py-3 text-sm',
                                !n.readAt && 'bg-primary-light',
                              )}
                            >
                              <p className="text-foreground/80">{n.message}</p>
                              <p className="mt-0.5 text-xs text-muted">
                                {formatRelativeTime(n.createdAt)}
                              </p>
                            </div>
                          ))
                        ) : (
                          <p className="px-4 py-8 text-center text-sm text-muted">
                            No notifications yet
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User menu */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen((v) => !v)}
                    className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-surface"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {user?.displayName?.[0] || 'U'}
                    </div>
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-52 rounded-xl border border-border bg-white py-1 shadow-xl">
                      <div className="border-b border-border px-4 py-3">
                        <p className="text-sm font-semibold text-foreground">{user?.displayName || 'User'}</p>
                        <p className="text-xs text-muted">{user?.phone}</p>
                      </div>
                      <Link
                        href="/dashboard/profile"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground/80 hover:bg-surface"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User className="h-4 w-4" /> Profile
                      </Link>
                      <Link
                        href="/dashboard/reviews"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground/80 hover:bg-surface"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <FileText className="h-4 w-4" /> My Reviews
                      </Link>
                      <Link
                        href="/dashboard/claims"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground/80 hover:bg-surface"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Landmark className="h-4 w-4" /> My Claims
                      </Link>
                      {isAdmin && (
                        <>
                          <div className="my-1 border-t border-border" />
                          <Link
                            href={adminAppUrl}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-primary hover:bg-primary-light"
                            onClick={() => setUserMenuOpen(false)}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <Shield className="h-4 w-4" /> Admin Panel
                          </Link>
                        </>
                      )}
                      <div className="my-1 border-t border-border" />
                      <button
                        onClick={() => { logout(); setUserMenuOpen(false); }}
                        className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4" /> Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 ml-2">
                <Link href="/auth/login">
                  <Button variant="outline" size="sm">Log In</Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            className="rounded-lg p-2 text-foreground/70 md:hidden"
            onClick={() => setMobileMenuOpen((v) => !v)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="border-t border-border bg-white px-4 py-3 md:hidden">
          <Link
            href="/categories"
            className="block rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/80"
            onClick={() => setMobileMenuOpen(false)}
          >
            Categories
          </Link>
          <Link
            href="/feed"
            className="block rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/80"
            onClick={() => setMobileMenuOpen(false)}
          >
            Feed
          </Link>
          <Link
            href="/community"
            className="block rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/80"
            onClick={() => setMobileMenuOpen(false)}
          >
            Community
          </Link>
          <Link
            href="/discussions"
            className="block rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/80"
            onClick={() => setMobileMenuOpen(false)}
          >
            Discussions
          </Link>
          <Link
            href="/blogs"
            className="block rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/80"
            onClick={() => setMobileMenuOpen(false)}
          >
            Blogs
          </Link>
          <Link
            href="/entities/add"
            className="block rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/80"
            onClick={() => setMobileMenuOpen(false)}
          >
            Add Listing
          </Link>
          {isAuthenticated ? (
            <>
              <Link
                href="/dashboard/reviews"
                className="block rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/80"
                onClick={() => setMobileMenuOpen(false)}
              >
                My Reviews
              </Link>
              <Link
                href="/dashboard/claims"
                className="block rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/80"
                onClick={() => setMobileMenuOpen(false)}
              >
                My Claims
              </Link>
              <Link
                href="/dashboard/profile"
                className="block rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/80"
                onClick={() => setMobileMenuOpen(false)}
              >
                Profile
              </Link>
              <Link
                href="/dashboard/notification"
                className="block rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/80"
                onClick={() => setMobileMenuOpen(false)}
              >
                Notifications
                {unreadCount > 0 && (
                  <span className="ml-2 rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </Link>
              {isAdmin && (
                <Link
                  href={adminAppUrl}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                  target="_blank"
                  rel="noreferrer"
                >
                  Admin Panel
                </Link>
              )}
              <button
                onClick={() => { logout(); setMobileMenuOpen(false); }}
                className="block w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-600"
              >
                Logout
              </button>
            </>
          ) : (
            <div className="mt-2 flex gap-2">
              <Link href="/auth/login" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full" size="sm">Log In</Button>
              </Link>
              <Link href="/auth/register" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full" size="sm">Sign Up</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
