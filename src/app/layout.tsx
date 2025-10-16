import '@/styles/globals.css';

import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';

import { ClientProviders } from '@/app/providers';
import { FeatureFlagProvider, ThemeProvider } from '@/components/layout';
import { ClientErrorListener } from '@/components/layout/client-error-listener';
import { getServerFeatureFlags } from '@/config/flags';
import { THEME_STORAGE_KEY } from '@/config/theme';
import { APP_DESCRIPTION, APP_NAME, APP_TAGLINE } from '@/lib/constants';

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-sans',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: `${APP_NAME} — ${APP_TAGLINE}`,
  description: APP_DESCRIPTION,
  openGraph: {
    title: `${APP_NAME} · ${APP_TAGLINE}`,
    description: APP_DESCRIPTION,
    url: 'https://dsnext.dev',
    siteName: APP_NAME,
    images: [
      {
        url: '/og-image.svg',
        width: 1200,
        height: 630,
        alt: `${APP_NAME} open graph image`,
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${APP_NAME} — ${APP_TAGLINE}`,
    description: APP_DESCRIPTION,
    images: ['/og-image.svg'],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#e2e8f0' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
};

const themeInitializer = `
(() => {
  try {
    const storageKey = '${THEME_STORAGE_KEY}';
    const root = document.documentElement;
    const stored = window.localStorage.getItem(storageKey);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const resolve = (mode) => {
      if (mode === 'light' || mode === 'dark') return mode;
      if (mode === 'system') return prefersDark ? 'dark' : 'light';
      return 'dark';
    };
    const mode = stored ?? 'dark';
    const resolved = resolve(mode);
    root.classList.remove('light', 'dark');
    root.classList.add(resolved);
    root.dataset.theme = resolved;
  } catch (error) {
    // no-op
  }
})();
`;

export const revalidate = 60;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const featureFlags = getServerFeatureFlags();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-background font-sans text-foreground`}
      >
        <script dangerouslySetInnerHTML={{ __html: themeInitializer }} />
        <ThemeProvider>
          <FeatureFlagProvider initialFlags={featureFlags}>
            <ClientProviders>
              <ClientErrorListener />
              {children}
            </ClientProviders>
          </FeatureFlagProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
