import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/lib/providers";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://reviewhistory.pk';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Review History — Pakistan's Trusted Review Platform",
    template: '%s | Review History',
  },
  description:
    'Honest, anonymous reviews for businesses, landlords, doctors, and more across Pakistan.',
  keywords: ['reviews', 'Pakistan', 'trust', 'business reviews', 'landlord reviews', 'doctor reviews', 'anonymous reviews'],
  openGraph: {
    type: 'website',
    locale: 'en_PK',
    siteName: 'Review History',
    title: "Review History — Pakistan's Trusted Review Platform",
    description: 'Honest, anonymous reviews for businesses, landlords, doctors, and more across Pakistan.',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Review History — Pakistan's Trusted Review Platform",
    description: 'Honest, anonymous reviews for businesses, landlords, doctors, and more across Pakistan.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Review History',
              url: SITE_URL,
              logo: `${SITE_URL}/logo.png`,
              description:
                'Pakistan\'s trusted entity-first review and trust platform for businesses, landlords, doctors, and more.',
              contactPoint: {
                '@type': 'ContactPoint',
                email: 'hello@reviewhistory.pk',
                contactType: 'customer service',
                availableLanguage: ['English', 'Urdu'],
              },
              sameAs: [],
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Review History',
              url: SITE_URL,
              potentialAction: {
                '@type': 'SearchAction',
                target: {
                  '@type': 'EntryPoint',
                  urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
                },
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
