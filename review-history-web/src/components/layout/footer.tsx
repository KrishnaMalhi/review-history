import Link from 'next/link';
import { Star } from 'lucide-react';

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-border gradient-hero text-white">
      {/* Decorative blobs */}
      <div className="blob-green absolute top-0 right-20 h-40 w-40 opacity-30" />
      <div className="blob-orange absolute bottom-0 left-10 h-32 w-32 opacity-20" />
      
      {/* Top accent divider */}
      <div className="section-divider" />
      
      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary shadow-lg shadow-primary/20">
                <Star className="h-4 w-4 fill-white text-white" />
              </div>
              <span className="text-lg font-bold">ReviewHistory</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Pakistan&apos;s first transparent review platform. Make informed decisions through
              honest, anonymous reviews.
            </p>
            {/* Social indicator */}
            <div className="mt-4 flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs text-gray-500">Live and growing</span>
            </div>
          </div>

          {/* For Consumers */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">For Consumers</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link href="/categories" className="text-sm text-gray-300 hover:text-white transition-colors">
                  Browse Categories
                </Link>
              </li>
              <li>
                <Link href="/search" className="text-sm text-gray-300 hover:text-white transition-colors">
                  Search Reviews
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm text-gray-300 hover:text-white transition-colors">
                  How It Works
                </Link>
              </li>
            </ul>
          </div>

          {/* For Businesses */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">For Businesses</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link href="/entities/add" className="text-sm text-gray-300 hover:text-white transition-colors">
                  Add Your Business
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm text-gray-300 hover:text-white transition-colors">
                  Claim Your Page
                </Link>
              </li>
              <li>
                <Link href="/review-policy" className="text-sm text-gray-300 hover:text-white transition-colors">
                  Review Guidelines
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Legal</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link href="/privacy" className="text-sm text-gray-300 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-gray-300 hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/review-policy" className="text-sm text-gray-300 hover:text-white transition-colors">
                  Content Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} ReviewHistory. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>Built with transparency</span>
            <Star className="h-3 w-3 fill-primary text-primary" />
            <span>in Pakistan</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
