import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { Suspense } from "react";
import Script from "next/script";
import { inter, playfair } from './fonts';
import { Breadcrumbs } from './components/Breadcrumbs';

export const metadata: Metadata = {
  title: "Slow Cinema Club",
  description: "An online hub for cinephiles who love to dive deep into the artistry of arthouse and experimental cinema.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://slowcinemaclub.com',
    siteName: 'Slow Cinema Club',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Slow Cinema Club - Arthouse & Experimental Film Analysis'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Slow Cinema Club',
    description: 'An online hub for cinephiles who love to dive deep into the artistry of arthouse and experimental cinema.',
    images: ['/og-image.jpg']
  },
  alternates: {
    canonical: 'https://slowcinemaclub.com'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  }
};

function Navigation() {
  return (
    <nav className="container mx-auto px-6 py-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-medium tracking-tight" prefetch={false}>
              SLOW CINEMA CLUB
            </Link>
            <div className="hidden md:block h-6 w-px bg-muted-foreground/20" />
            <div className="hidden md:block">
              <Suspense fallback={<div className="h-4 w-32" />}>
                <Breadcrumbs />
              </Suspense>
            </div>
          </div>
        </div>
        <div className="hidden md:flex space-x-8">
          <Link href="/reviews" className="hover:underline" prefetch>Reviews</Link>
          <Link href="/articles" className="hover:underline" prefetch>Articles</Link>
          <Link href="/lists" className="hover:underline" prefetch>Lists</Link>
        </div>
      </div>
    </nav>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${playfair.variable}`}>
      <head>
        <Script src="https://scripts.simpleanalyticscdn.com/latest.js" data-collect-dnt="true" />
        <Script
          id="schema-org"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Slow Cinema Club',
              description: 'An online hub for cinephiles who love to dive deep into the artistry of arthouse and experimental cinema.',
              url: 'https://slowcinemaclub.com',
              potentialAction: {
                '@type': 'SearchAction',
                target: 'https://slowcinemaclub.com/search?q={search_term_string}',
                'query-input': 'required name=search_term_string'
              }
            })
          }}
        />
        <noscript>
          {/* eslint-disable @next/next/no-img-element */}
          <img
            src="https://queue.simpleanalyticscdn.com/noscript.gif"
            alt=""
            referrerPolicy="no-referrer-when-downgrade"
            data-collect-dnt="true"
          />
        </noscript>
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-muted bg-background/80 backdrop-blur-sm">
          <Suspense fallback={<div className="h-16" />}>
            <Navigation />
          </Suspense>
        </header>
        <main className="container mx-auto px-6 pt-24 pb-16">
          {children}
        </main>
      </body>
    </html>
  );
}
