import { PublicLayout } from '@/components/layout/public-layout';

export default function TermsPage() {
  return (
    <PublicLayout>
      <div className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900">Terms and Conditions</h1>
        <p className="mt-2 text-sm text-gray-500">Last updated: April 20, 2026</p>

        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5 text-sm text-gray-700 shadow-sm">
          <p>
            These Terms and Conditions govern your access to and use of ReviewHistory, including
            reviews, ratings, discussions, community tools, and business features.
          </p>
          <p className="mt-2">
            By using the platform, you agree to these terms. If you do not agree, you must stop
            using the service.
          </p>
        </div>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-gray-700">
          <section>
            <h2 className="text-lg font-semibold text-gray-900">1. Acceptance of Terms</h2>
            <p className="mt-2">
              You must be legally able to enter a binding agreement. If you use ReviewHistory on
              behalf of an organization, you represent that you have authority to bind that
              organization to these terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">2. User Accounts</h2>
            <p className="mt-2">
              You are responsible for keeping your login details secure and for all activity under
              your account. You must provide accurate information and keep profile details up to
              date.
            </p>
            <p className="mt-2">
              We may suspend or restrict accounts involved in abuse, fraud, impersonation,
              coordinated manipulation, or repeated policy violations.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">3. Reviews and Community Content</h2>
            <p className="mt-2">
              You may post reviews and discussion content only if it reflects your honest experience
              or viewpoint. You must not post content that is fake, deceptive, promotional without
              disclosure, defamatory, hateful, threatening, illegal, or privacy-invasive.
            </p>
            <p className="mt-2">
              You retain ownership of your content, but grant ReviewHistory a non-exclusive,
              worldwide license to host, display, moderate, analyze, and distribute that content for
              platform operation, trust and safety, research, and product improvement.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">4. Moderation and Enforcement</h2>
            <p className="mt-2">
              We use automated and manual moderation to enforce content policies. Content may be
              removed, limited, labeled, or escalated for review when it appears to violate policy
              or law.
            </p>
            <p className="mt-2">
              Moderation decisions may include warning, demotion, temporary restrictions, account
              suspension, or permanent ban depending on severity and repeated behavior.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">5. Business Profiles and Claims</h2>
            <p className="mt-2">
              Businesses and representatives may claim a profile through verification. Claiming a
              profile does not allow editing, suppressing, or removing legitimate user reviews.
            </p>
            <p className="mt-2">
              Business tools, response tools, and analytics may be changed, limited, or priced
              separately under additional commercial terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">6. Prohibited Conduct</h2>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>Posting fake, paid, coerced, or coordinated reviews</li>
              <li>Using multiple accounts to influence ratings or discussions</li>
              <li>Harassing, threatening, doxxing, or impersonating others</li>
              <li>Sharing private data without lawful basis or consent</li>
              <li>Attempting to evade bans or bypass trust and safety controls</li>
              <li>Scraping, bulk extraction, or reverse-engineering without permission</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">7. Intellectual Property</h2>
            <p className="mt-2">
              Platform code, branding, and design elements are owned by ReviewHistory or its
              licensors. You may not copy, reproduce, or republish platform assets beyond normal use
              without written permission.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">8. Trust Signals and Rankings</h2>
            <p className="mt-2">
              Rankings, trust indicators, and recommendation outputs are algorithmic and may change.
              We do not guarantee ranking position, visibility, or outcome for any profile or user.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">9. Disclaimer and Limitation of Liability</h2>
            <p className="mt-2">
              ReviewHistory provides a user-generated information service on an as-is and as-
              available basis. We do not guarantee uninterrupted service, absolute accuracy, or that
              content is complete and error-free.
            </p>
            <p className="mt-2">
              To the fullest extent allowed by law, ReviewHistory is not liable for indirect,
              incidental, consequential, or special damages resulting from use of the platform.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">10. Indemnity</h2>
            <p className="mt-2">
              You agree to indemnify and hold harmless ReviewHistory, its team, and partners from
              claims, losses, liabilities, and expenses resulting from your misuse of the platform,
              your content, or your violation of these terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">11. Termination</h2>
            <p className="mt-2">
              You may stop using the service at any time. We may terminate or suspend access with or
              without notice if necessary for policy, legal, or security reasons.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">12. Governing Law</h2>
            <p className="mt-2">
              These terms are governed by the laws of Pakistan. Disputes shall be resolved through
              the courts of Islamabad.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">13. Changes to These Terms</h2>
            <p className="mt-2">
              We may update these terms as the platform evolves. Material changes will be reflected
              by a new &quot;Last updated&quot; date. Continued use after changes means you accept the revised
              terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">14. Contact</h2>
            <p className="mt-2">
              For legal notices and terms inquiries, contact legal@reviewhistory.pk.
            </p>
          </section>
        </div>
      </div>
    </PublicLayout>
  );
}
