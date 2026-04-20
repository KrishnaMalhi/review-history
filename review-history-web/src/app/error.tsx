'use client';

import { PublicLayout } from '@/components/layout/public-layout';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <PublicLayout>
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <p className="text-5xl font-extrabold text-red-500">Oops</p>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">Something went wrong</h1>
        <p className="mt-2 max-w-md text-gray-500">
          An unexpected error occurred. Please try again or go back to the home page.
        </p>
        <div className="mt-6 flex gap-3">
          <button
            onClick={reset}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            Try Again
          </button>
          <a
            href="/"
            className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Go Home
          </a>
        </div>
      </div>
    </PublicLayout>
  );
}
