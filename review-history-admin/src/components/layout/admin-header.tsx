'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { LogOut, Shield, Star } from 'lucide-react';

export function AdminHeader() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-sm">
      <div className="h-0.5 gradient-primary" />
      <div className="flex h-16 items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary shadow-md shadow-primary/20 transition-transform group-hover:scale-105">
            <Star className="h-5 w-5 fill-white text-white" />
          </div>
          <span className="text-lg font-bold">
            <span className="text-secondary">Review</span><span className="text-primary">History</span>
          </span>
          <span className="ml-1 flex items-center gap-1 rounded-full bg-accent-light px-2.5 py-0.5 text-xs font-semibold text-accent">
            <Shield className="h-3 w-3" />
            Admin
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full gradient-primary text-sm font-semibold text-white">
              {user?.displayName?.[0] || 'A'}
            </div>
            <span className="text-sm font-medium text-foreground">
              {user?.displayName || user?.phone || 'Admin'}
            </span>
          </div>
          <button
            onClick={() => logout()}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-muted hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
