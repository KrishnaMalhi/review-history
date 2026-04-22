import { PublicLayout } from '@/components/layout/public-layout';

export default function PrivacyPolicyPage() {
  return (
    <PublicLayout>
      <div className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
        <p className="mt-2 text-sm text-gray-500">Last updated: April 20, 2026</p>

        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5 text-sm text-gray-700 shadow-sm">
          <p>
            This Privacy Policy explains what personal data we collect, how we use it, and what
            choices you have when using ReviewHistory.
          </p>
          <p className="mt-2">
            We designed this policy to support a transparent review ecosystem while protecting user
            identity, safety, and lawful rights.
          </p>
        </div>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-gray-700">
          <section>
            <h2 className="text-lg font-semibold text-gray-900">1. Information We Collect</h2>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>Account details such as phone number, email, display name, and profile settings</li>
              <li>Content you create such as reviews, ratings, comments, and support messages</li>
              <li>Device and usage data such as IP address, browser, timestamps, and interactions</li>
              <li>Security and trust signals used for abuse prevention and integrity monitoring</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">2. How We Use Your Information</h2>
            <p className="mt-2">
              We use personal data to provide platform services, maintain account security, prevent
              abuse, improve trust scoring, personalize your feed, and respond to legal obligations.
            </p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>Authentication, account recovery, and fraud prevention</li>
              <li>Publishing and moderating user-generated content</li>
              <li>Improving product quality, ranking relevance, and trust defenses</li>
              <li>Customer support, notices, and policy enforcement</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">3. Legal Bases for Processing</h2>
            <p className="mt-2">
              Depending on context, we process personal data based on contractual necessity,
              legitimate interests, consent, legal obligations, or protection of users and the
              public interest in trustworthy review information.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">4. Data Sharing and Disclosure</h2>
            <p className="mt-2">
              We do not sell your personal data. Public reviews and community content are visible to
              other users by design. We may share data with service providers, infrastructure
              vendors, and fraud/security partners under confidentiality obligations.
            </p>
            <p className="mt-2">
              We may disclose data when required by law, court order, or lawful government request,
              and when necessary to protect platform users, rights, and safety.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">5. Cookies and Similar Technologies</h2>
            <p className="mt-2">
              We use cookies and local storage for session management, security, preferences,
              analytics, and performance. You can control cookies through browser settings, but some
              platform features may not function correctly if disabled.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">6. Data Retention</h2>
            <p className="mt-2">
              We retain personal data only as long as necessary for service delivery, compliance,
              trust and safety investigations, dispute handling, and lawful recordkeeping. Public
              review content may be retained as part of platform history and integrity requirements.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">7. Security Measures</h2>
            <p className="mt-2">
              We use layered technical and organizational controls, including encryption in transit,
              access controls, monitoring, and abuse detection. No method is perfectly secure, but
              we continuously improve safeguards.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">8. Your Rights and Choices</h2>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>Access, update, or correct your account information</li>
              <li>Request deletion of account data subject to legal exceptions</li>
              <li>Object to certain processing or request processing restrictions</li>
              <li>Request export of data where technically feasible</li>
              <li>Control communication preferences and notification settings</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">9. International Data Transfers</h2>
            <p className="mt-2">
              Where infrastructure or partners operate across jurisdictions, your data may be
              processed in countries other than your own with appropriate safeguards and contractual
              protections.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">10. Children&apos;s Privacy</h2>
            <p className="mt-2">
              ReviewHistory is not intended for children under the legally required age in your
              jurisdiction. If we learn that unauthorized child data was provided, we will take
              reasonable steps to delete it.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">11. Policy Updates</h2>
            <p className="mt-2">
              We may revise this Privacy Policy from time to time. Material changes are indicated by
              updating the &quot;Last updated&quot; date and, where appropriate, by additional notice.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">12. Contact</h2>
            <p className="mt-2">
              For privacy-related inquiries, contact us at privacy@reviewhistory.pk.
            </p>
          </section>
        </div>
      </div>
    </PublicLayout>
  );
}
