import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import './framer-theme.css';

/* The two fonts the CRM uses, self-hosted (no request to a font CDN). */
const ibmPlexSans = localFont({
  src: [
    { path: './fonts/ibm-plex-sans-latin-400-normal.woff2', weight: '400' },
    { path: './fonts/ibm-plex-sans-latin-500-normal.woff2', weight: '500' },
    { path: './fonts/ibm-plex-sans-latin-600-normal.woff2', weight: '600' },
    { path: './fonts/ibm-plex-sans-latin-700-normal.woff2', weight: '700' },
  ],
  display: 'swap',
  variable: '--ff-body',
});

const chivo = localFont({
  src: './fonts/chivo-latin-500-normal.woff2',
  weight: '500',
  display: 'swap',
  variable: '--ff-accent',
});

export const metadata: Metadata = {
  title: { template: '%s | KeyForCars CRM', default: 'KeyForCars CRM' },
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl" className={`${ibmPlexSans.variable} ${chivo.variable}`}>
      <body>{children}</body>
    </html>
  );
}
