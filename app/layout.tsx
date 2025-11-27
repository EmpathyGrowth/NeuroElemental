import './globals.css';
import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/components/auth/auth-provider';
import { Navigation } from '@/components/navigation';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    default: 'NeuroElemental™ - Understand Your Energy, Transform Your Life',
    template: '%s | NeuroElemental™',
  },
  description: 'The first personality framework designed for how neurodivergent brains actually work. Energy-based, neurodivergent-informed, practical and ethical.',
  keywords: ['neurodivergent', 'personality framework', 'energy management', 'ADHD', 'Autism', 'burnout prevention'],
  authors: [{ name: 'Jannik Laursen' }],
  creator: 'Jannik Laursen',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://neuroelemental.com',
    siteName: 'NeuroElemental',
    title: 'NeuroElemental™ - Understand Your Energy, Transform Your Life',
    description: 'The first personality framework designed for how neurodivergent brains actually work.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'NeuroElemental Framework',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NeuroElemental™',
    description: 'The first personality framework designed for how neurodivergent brains actually work.',
    creator: '@neuroelemental',
    images: ['/twitter-image.jpg'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <Navigation />
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
