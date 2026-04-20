import { PublicLayout } from '@/components/layout/public-layout';

export default function ReviewPolicyPage() {
  return (
    <PublicLayout>
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900">Content &amp; Review Policy</h1>
        <p className="mt-2 text-sm text-gray-500">Last updated: January 2025</p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-gray-700">
          <section>
            <h2 className="text-lg font-semibold text-gray-900">1. Review Standards</h2>
            <p className="mt-2">
              All reviews on Review History must be based on genuine, first-hand experiences.
              Reviews should be honest, fair, and provide useful information for other users.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">2. What Makes a Good Review</h2>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>Describe specific interactions and outcomes</li>
              <li>Include relevant details (timing, service quality, pricing)</li>
              <li>Be respectful — critique the service, not the person</li>
              <li>Use appropriate warning tags when applicable</li>
              <li>Update your review if circumstances change</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">3. Prohibited Content</h2>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li><strong>Fake reviews</strong> — reviews not based on genuine experiences</li>
              <li><strong>Incentivized reviews</strong> — reviews written for payment or benefits</li>
              <li><strong>Personal information</strong> — phone numbers, addresses, or identifying details of individuals</li>
              <li><strong>Hate speech</strong> — content targeting race, religion, gender, ethnicity, or disability</li>
              <li><strong>Threats &amp; harassment</strong> — threatening language or directed harassment</li>
              <li><strong>Spam</strong> — irrelevant content, advertisements, or repeated posts</li>
              <li><strong>Defamation</strong> — knowingly false statements intended to harm reputation</li>
              <li><strong>Competitor sabotage</strong> — negative reviews from competing businesses</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">4. Our Moderation Process</h2>
            <p className="mt-2">
              Reviews go through automated and community-driven quality checks. Our anti-fraud
              system detects suspicious patterns including:
            </p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>Burst reviews from new accounts</li>
              <li>Coordinated review campaigns</li>
              <li>Copy-paste content across multiple reviews</li>
              <li>Single-purpose accounts targeting one entity</li>
            </ul>
            <p className="mt-2">
              Flagged reviews are placed &quot;under verification&quot; and reviewed by our moderation
              team. Users can also report suspicious reviews using the Report button.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">5. Entity Owner Rights</h2>
            <p className="mt-2">
              Verified entity owners can respond publicly to reviews but cannot remove legitimate
              reviews. Owners may report reviews that violate our policies. All disputes are
              resolved by our moderation team with full audit trails.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">6. Trust Scores</h2>
            <p className="mt-2">
              Each entity receives a trust score (0–100) calculated from multiple factors:
              review ratings, volume, consistency, recency, owner responsiveness, and penalties
              for warnings, suspicious activity, or moderation actions. Trust scores are updated
              automatically as new data arrives.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">7. Enforcement</h2>
            <p className="mt-2">
              Violations may result in: review removal, review labeling, account suspension,
              or permanent ban. All moderation actions are recorded in an immutable audit log.
              Repeated violations result in escalating consequences.
            </p>
          </section>
        </div>
      </div>
    </PublicLayout>
  );
}
