import { PublicLayout } from '@/components/layout/public-layout';

export default function PrivacyPolicyPage() {
  return (
    <PublicLayout>
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
        <p className="mt-2 text-sm text-gray-500">Last updated: January 2025</p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-gray-700">
          <section>
            <h2 className="text-lg font-semibold text-gray-900">1. Information We Collect</h2>
            <p className="mt-2">
              We collect your phone number for authentication, your display name, city, and any reviews
              or content you voluntarily submit to the platform.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">2. How We Use Your Information</h2>
            <p className="mt-2">
              Your information is used to provide our review platform services, verify your identity via OTP,
              display your reviews publicly (with your chosen display name), and improve our trust scoring system.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">3. Data Sharing</h2>
            <p className="mt-2">
              We do not sell your personal data. Reviews and ratings are publicly visible. We may share
              anonymized analytics data to improve services. Law enforcement requests are handled per
              Pakistani law.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">4. Data Retention</h2>
            <p className="mt-2">
              Your account data is retained as long as your account is active. Reviews are retained
              as part of the public record. You may request account deletion by contacting support.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">5. Security</h2>
            <p className="mt-2">
              We use industry-standard security measures including encrypted connections, secure
              password hashing, and JWT-based authentication.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">6. Contact</h2>
            <p className="mt-2">
              For privacy-related inquiries, contact us at privacy@reviewhistory.pk.
            </p>
          </section>
        </div>
      </div>
    </PublicLayout>
  );
}
