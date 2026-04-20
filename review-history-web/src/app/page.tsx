'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Search, Shield, Eye, Star, TrendingUp, Users, ArrowRight, CheckCircle, Sparkles, Zap } from 'lucide-react';
import { PublicLayout } from '@/components/layout';
import { Button, Card, CardContent } from '@/components/ui';
import { useCategories } from '@/hooks/use-api';
import { CategoryIcon } from '@/components/shared/category-icon';
import Link from 'next/link';

const features = [
  {
    icon: Shield,
    title: 'Anonymous & Safe',
    description: 'Your identity is fully protected. Share your honest experience without fear of retaliation.',
    color: 'from-primary to-emerald-400',
    bg: 'bg-primary-light',
    iconColor: 'text-primary',
  },
  {
    icon: Eye,
    title: 'Verified Reviews',
    description: 'Our trust scoring system ensures every review is authentic, traceable, and reliable.',
    color: 'from-navy to-blue-500',
    bg: 'bg-blue-50',
    iconColor: 'text-navy-light',
  },
  {
    icon: TrendingUp,
    title: 'Trust Scores',
    description: 'AI-powered trust scores help you identify the most reliable businesses instantly.',
    color: 'from-accent to-amber-400',
    bg: 'bg-accent-light',
    iconColor: 'text-accent',
  },
  {
    icon: Users,
    title: 'Community Driven',
    description: 'Upvote helpful reviews, flag suspicious content, and build a trusted community.',
    color: 'from-purple-500 to-pink-500',
    bg: 'bg-purple-50',
    iconColor: 'text-purple-600',
  },
];

const stats = [
  { value: '10K+', label: 'Reviews', icon: Star, color: 'text-star' },
  { value: '5K+', label: 'Businesses Listed', icon: Zap, color: 'text-accent' },
  { value: '50K+', label: 'Monthly Users', icon: Users, color: 'text-primary' },
  { value: '99%', label: 'Uptime', icon: Shield, color: 'text-navy-light' },
];

export default function HomePage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const { data: categories } = useCategories();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <PublicLayout>
      {/* Hero - Immersive gradient with floating elements */}
      <section className="relative overflow-hidden gradient-hero px-4 py-24 sm:py-32">
        {/* Decorative blobs */}
        <div className="blob-green absolute -top-32 -right-32 h-96 w-96 opacity-60" />
        <div className="blob-orange absolute -bottom-20 -left-20 h-72 w-72 opacity-50" />
        <div className="blob-green absolute top-1/2 left-1/4 h-48 w-48 opacity-30 animate-float" />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.3) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full glass px-5 py-2.5 text-sm text-white/90 animate-slide-up">
            <Sparkles className="h-4 w-4 text-star" />
            Pakistan&apos;s #1 Transparent Review Platform
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-7xl animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Every review tells a{' '}
            <span className="gradient-text-green">real story</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-300/90 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            Read and share honest reviews about landlords, businesses, doctors, schools, and
            more. Make better decisions with trusted community insights.
          </p>

          <form
            onSubmit={handleSearch}
            className="mx-auto mt-10 flex max-w-xl gap-0 overflow-hidden rounded-full bg-white shadow-2xl shadow-black/30 ring-1 ring-white/20 animate-slide-up"
            style={{ animationDelay: '0.3s' }}
          >
            <div className="relative flex-1">
              <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for a company or category..."
                className="w-full border-0 bg-transparent py-4.5 pl-13 pr-4 text-foreground placeholder:text-muted focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="m-1.5 rounded-full gradient-primary px-7 font-semibold text-white transition-all hover:shadow-lg hover:shadow-primary/30 active:scale-95"
            >
              Search
            </button>
          </form>

          {/* Quick links */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-sm text-gray-400 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <span>Popular:</span>
            {['Landlords', 'Doctors', 'Schools', 'Restaurants'].map((item) => (
              <Link
                key={item}
                href={`/search?q=${item.toLowerCase()}`}
                className="rounded-full glass px-4 py-1.5 text-gray-200 transition-all hover:bg-primary/20 hover:text-primary hover:shadow-lg hover:shadow-primary/10"
              >
                {item}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Gradient divider */}
      <div className="section-divider" />

      {/* Stats bar */}
      <section className="bg-white">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 px-4 py-10 sm:grid-cols-4 sm:py-14">
          {stats.map((stat) => (
            <div key={stat.label} className="group text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-surface transition-transform group-hover:scale-110">
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <p className="text-3xl font-extrabold text-foreground">{stat.value}</p>
              <p className="mt-1 text-sm font-medium text-muted">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories - Rich colored cards */}
      {categories && categories.length > 0 && (
        <section className="relative overflow-hidden bg-surface px-4 py-16 sm:py-20">
          <div className="blob-navy absolute -top-20 -right-20 h-60 w-60 opacity-40" />
          <div className="blob-orange absolute bottom-0 left-10 h-40 w-40 opacity-30" />
          <div className="relative mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="mb-10 text-center">
              <span className="inline-block rounded-full bg-primary-light px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-primary">
                Categories
              </span>
              <h2 className="mt-3 text-3xl font-bold text-foreground sm:text-4xl">
                Explore by <span className="gradient-text-green">Category</span>
              </h2>
              <p className="mt-2 text-muted">
                Find reviews across different sectors and industries
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {categories.map((cat, i) => (
                <Link key={cat.id} href={`/search?category=${cat.key}`}>
                  <div className="card-hover group relative overflow-hidden rounded-xl border border-border bg-white p-5 cursor-pointer">
                    <div className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity ${i % 3 === 0 ? 'from-primary to-emerald-300' : i % 3 === 1 ? 'from-accent to-amber-300' : 'from-navy to-blue-400'}`} />
                    <div className="relative flex items-center gap-4">
                      <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-110 ${i % 3 === 0 ? 'bg-primary-light' : i % 3 === 1 ? 'bg-accent-light' : 'bg-blue-50'}`}>
                        <CategoryIcon name={cat.icon} className={`h-6 w-6 ${i % 3 === 0 ? 'text-primary' : i % 3 === 1 ? 'text-accent' : 'text-navy-light'}`} />
                      </span>
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">{cat.name}</p>
                        <p className="text-xs text-muted truncate">{cat.description}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link href="/categories">
                <Button variant="outline" size="lg">
                  View All Categories <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Features - Colorful modern cards */}
      <section className="relative overflow-hidden bg-white px-4 py-16 sm:py-20">
        <div className="blob-green absolute top-20 -right-10 h-48 w-48 opacity-30" />
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <span className="inline-block rounded-full bg-accent-light px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-accent">
              Why us
            </span>
            <h2 className="mt-3 text-3xl font-bold text-foreground sm:text-4xl">
              Why people trust <span className="gradient-text-accent">ReviewHistory</span>
            </h2>
            <p className="mt-2 text-muted">
              Built for transparency, powered by community
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div key={f.title} className="card-hover group rounded-2xl border border-border bg-white p-6 text-center">
                <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl ${f.bg} transition-transform group-hover:scale-110`}>
                  <f.icon className={`h-8 w-8 ${f.iconColor}`} />
                </div>
                <h3 className="text-lg font-bold text-foreground">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{f.description}</p>
                <div className={`mx-auto mt-4 h-1 w-12 rounded-full bg-gradient-to-r ${f.color} opacity-0 transition-opacity group-hover:opacity-100`} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works - With connecting lines and navy bg */}
      <section className="gradient-navy px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-5xl sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <span className="inline-block rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-primary">
              How it works
            </span>
            <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">Three simple steps</h2>
            <p className="mt-2 text-gray-400">Share your experience and help others decide</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { step: '1', title: 'Search', desc: 'Find the business, landlord, or professional you want to review.', icon: Search, gradient: 'gradient-primary' },
              { step: '2', title: 'Review', desc: 'Share your honest experience with star ratings and detailed feedback.', icon: Star, gradient: 'gradient-accent' },
              { step: '3', title: 'Impact', desc: 'Help others make informed decisions with your trusted review.', icon: TrendingUp, gradient: 'gradient-primary' },
            ].map((item) => (
              <div key={item.step} className="group relative text-center">
                <div className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl ${item.gradient} text-white shadow-lg transition-transform group-hover:scale-110`}>
                  <item.icon className="h-7 w-7" />
                </div>
                <span className="text-sm font-bold text-primary">Step {item.step}</span>
                <h3 className="mt-1 text-xl font-bold text-white">{item.title}</h3>
                <p className="mt-2 text-sm text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA - Bold gradient with floating elements */}
      <section className="relative overflow-hidden gradient-primary px-4 py-16 sm:py-20">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        <div className="blob-orange absolute -top-10 -right-10 h-40 w-40 opacity-30" />
        <div className="relative mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Have an experience to share?
          </h2>
          <p className="mt-3 text-lg text-white/80">
            Your review helps thousands make better decisions. Join our growing community of honest reviewers.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/search">
              <Button variant="secondary" size="lg" className="shadow-xl shadow-black/20">
                Write a Review <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/entities/add">
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                Add a Business
              </Button>
            </Link>
          </div>
          <div className="mt-6 flex items-center justify-center gap-4 text-sm text-white/70">
            <span className="flex items-center gap-1"><CheckCircle className="h-4 w-4" /> Free forever</span>
            <span className="flex items-center gap-1"><CheckCircle className="h-4 w-4" /> Anonymous</span>
            <span className="flex items-center gap-1"><CheckCircle className="h-4 w-4" /> Verified</span>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
