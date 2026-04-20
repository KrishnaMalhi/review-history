import { PublicLayout } from '@/components/layout/public-layout';

export default function TermsPage() {
  return (
    <PublicLayout>
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
        <p className="mt-2 text-sm text-gray-500">Last updated: January 2025</p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-gray-700">
          <section>
            <h2 className="text-lg font-semibold text-gray-900">1. Acceptance of Terms</h2>
            <p className="mt-2">
              By accessing Review History, you agree to these terms. If you do not agree, please do
              not use the platform.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">2. User Accounts</h2>
            <p className="mt-2">
              You must provide a valid Pakistani phone number to create an account. You are responsible
              for maintaining the security of your account and all activity under it.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">3. Content Guidelines</h2>
            <p className="mt-2">
              Reviews must be honest, based on genuine experiences. Fake reviews, spam, hate speech,
              defamation, and illegal content are strictly prohibited. We reserve the right to remove
              content that violates these guidelines.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">4. Entity Claims</h2>
            <p className="mt-2">
              Business owners may claim their entity listings through our verification process.
              Approved claims grant additional management privileges but do not allow removal of
              legitimate reviews.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">5. Prohibited Conduct</h2>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>Submitting fraudulent or incentivized reviews</li>
              <li>Creating multiple accounts to manipulate ratings</li>
              <li>Harassing other users or entity owners</li>
              <li>Attempting to bypass our anti-fraud systems</li>
              <li>Scraping or data-mining the platform</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">6. Limitation of Liability</h2>
            <p className="mt-2">
              Review History provides a platform for user-generated reviews. We do not guarantee
              the accuracy of reviews and are not liable for decisions made based on review content.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">7. Governing Law</h2>
            <p className="mt-2">
              These terms are governed by the laws of Pakistan. Disputes shall be resolved through
              the courts of Islamabad.
            </p>
          </section>
        </div>
      </div>
    </PublicLayout>
  );
}
