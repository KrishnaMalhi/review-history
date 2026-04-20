import Link from 'next/link';
import { PublicLayout } from '@/components/layout/public-layout';

export default function NotFound() {
  return (
    <PublicLayout>
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <p className="text-7xl font-extrabold text-blue-600">404</p>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">Page Not Found</h1>
        <p className="mt-2 text-gray-500">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="mt-6 flex gap-3">
          <Link
            href="/"
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            Go Home
          </Link>
          <Link
            href="/search"
            className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Search Entities
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
}
