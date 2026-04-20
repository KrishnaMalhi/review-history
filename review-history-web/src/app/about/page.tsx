import { PublicLayout } from '@/components/layout/public-layout';
import { JsonLd } from '@/components/seo/json-ld';
import { Breadcrumbs } from '@/components/seo/breadcrumbs';

const faqs = [
  {
    question: 'What is Review History?',
    answer:
      'Review History is Pakistan\'s first entity-first review and trust platform. It helps you find honest, community-driven reviews about businesses, landlords, doctors, clinics, schools, and service providers.',
  },
  {
    question: 'Is it free to use?',
    answer:
      'Yes, Review History is completely free for consumers. You can search, read, and write reviews at no cost.',
  },
  {
    question: 'Are reviews anonymous?',
    answer:
      'Yes. While you need a verified phone number to submit reviews, your identity is never shown publicly. Display names are optional.',
  },
  {
    question: 'How does the trust score work?',
    answer:
      'Our trust scoring system analyzes review quality, voting patterns, and entity claim status to generate a 0-100 score that indicates how trustworthy an entity is based on community feedback.',
  },
  {
    question: 'Can business owners respond to reviews?',
    answer:
      'Yes. Business owners can claim their listing through a verification process and then respond to reviews publicly.',
  },
  {
    question: 'How do you prevent fake reviews?',
    answer:
      'We use a multi-layered anti-fraud system including device fingerprinting, behavioral analysis, community voting, and manual moderation to detect and remove fake reviews.',
  },
];

export default function AboutPage() {
  return (
    <PublicLayout>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: faq.answer,
            },
          })),
        }}
      />
      <div className="relative overflow-hidden bg-surface min-h-screen">
      <div className="blob-green absolute -top-20 right-10 h-48 w-48 opacity-25" />
      <div className="blob-navy absolute bottom-20 -left-10 h-40 w-40 opacity-20" />
      <div className="relative mx-auto max-w-3xl px-4 py-12">
        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'About' }]} />
        <span className="inline-block rounded-full bg-primary-light px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-primary">
          About
        </span>
        <h1 className="mt-3 text-3xl font-bold text-foreground sm:text-4xl">About <span className="gradient-text-green">ReviewHistory</span></h1>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-foreground/80">
          <p>
            <strong className="text-foreground">ReviewHistory</strong> is Pakistan&apos;s first entity-first review and trust
            platform. We believe every interaction with a business, clinic, school, landlord, or service
            provider leaves a trace — and that trace should be visible to future customers.
          </p>

          <section className="rounded-2xl border border-border/80 bg-white p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 gradient-primary" />
            <h2 className="text-lg font-bold text-foreground">Our Mission</h2>
            <p className="mt-2">
              To build a transparent, trustworthy network of reviews that helps Pakistanis make
              informed decisions. No more relying on word-of-mouth alone — our platform provides
              verified, community-driven insights about local businesses and services.
            </p>
          </section>

          <section className="rounded-2xl border border-border/80 bg-white p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 gradient-accent" />
            <h2 className="text-lg font-bold text-foreground">How It Works</h2>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>Search or add any business, clinic, school, or service provider</li>
              <li>Write honest reviews based on real experiences</li>
              <li>Vote on reviews to surface the most helpful ones</li>
              <li>Our trust scoring system identifies reliable entities</li>
              <li>Business owners can claim listings and respond to reviews</li>
            </ul>
          </section>

          <section className="rounded-2xl border border-border/80 bg-white p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 gradient-navy" />
            <h2 className="text-lg font-bold text-foreground">Anti-Fraud Commitment</h2>
            <p className="mt-2">
              We take review integrity seriously. Our multi-layered anti-fraud system detects and
              removes fake reviews, review-bombing, and incentivized content. Every review goes
              through automated and community-driven quality checks.
            </p>
          </section>

          <section className="rounded-2xl border border-border/80 bg-white p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 gradient-primary" />
            <h2 className="text-lg font-bold text-foreground">Contact</h2>
            <p className="mt-2">
              Have questions or feedback? Reach us at hello@reviewhistory.pk
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground">Frequently Asked Questions</h2>
            <dl className="mt-4 space-y-4">
              {faqs.map((faq, i) => (
                <div key={i} className="rounded-2xl border border-border/80 bg-white p-5 hover:shadow-md transition-shadow">
                  <dt className="font-semibold text-foreground">{faq.question}</dt>
                  <dd className="mt-1 text-muted">{faq.answer}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>
      </div>
      </div>
    </PublicLayout>
  );
}
