const { withSentryConfig } = require('@sentry/nextjs')

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Supabase storage
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      // Specific Supabase project
      {
        protocol: 'https',
        hostname: 'ieqvhgqubvfruqfjggqf.supabase.co',
      },
      // Stripe
      {
        protocol: 'https',
        hostname: '*.stripe.com',
      },
      // Common image CDNs
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
    ],
  },
  experimental: {
    turbopackFileSystemCacheForDev: true,
    optimizePackageImports: ['lucide-react', 'recharts', 'date-fns', '@radix-ui/react-icons'],
  },
  // TypeScript checking disabled during build due to "Map maximum size exceeded" crash
  // caused by complex Supabase types (~70 tables). This is a known TypeScript limitation.
  // Type checking is done separately via `npm run typecheck` with increased memory.
  // See: https://github.com/microsoft/TypeScript/issues/53761
  typescript: {
    ignoreBuildErrors: true,
  },
  // Security headers for production
  async headers() {
    // Build CSP directives
    // In development, allow 'unsafe-eval' for hot reloading
    const isDev = process.env.NODE_ENV === 'development'

    const cspDirectives = [
      "default-src 'self'",
      // Scripts: self, inline (for Next.js), and trusted domains
      `script-src 'self' 'unsafe-inline' ${isDev ? "'unsafe-eval'" : ''} https://*.sentry.io https://*.stripe.com https://js.stripe.com`.trim(),
      // Styles: self and inline (for Tailwind/styled components)
      "style-src 'self' 'unsafe-inline'",
      // Images: self, data URIs, and common CDNs
      "img-src 'self' data: blob: https://*.supabase.co https://*.stripe.com",
      // Fonts: self and common font providers
      "font-src 'self' data:",
      // Connect: API endpoints and services
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.sentry.io https://api.stripe.com",
      // Frames: only allow Stripe checkout
      "frame-src 'self' https://*.stripe.com https://js.stripe.com",
      // Frame ancestors: prevent clickjacking
      "frame-ancestors 'self'",
      // Form actions: only to self
      "form-action 'self'",
      // Base URI: only self
      "base-uri 'self'",
      // Object src: none (block plugins)
      "object-src 'none'",
      // Upgrade insecure requests in production
      ...(isDev ? [] : ['upgrade-insecure-requests']),
    ]

    const contentSecurityPolicy = cspDirectives.join('; ')

    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Content-Security-Policy',
            value: contentSecurityPolicy,
          },
        ],
      },
    ];
  },
};

// Sentry configuration options
const sentryWebpackPluginOptions = {
  // Suppresses source map uploading logs during build
  silent: true,

  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Hides source maps from generated client bundles
  hideSourceMaps: true,

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors (does not yet work with turbopack)
  automaticVercelMonitors: false,
}

// Only wrap with Sentry if DSN is configured (skip in development without DSN)
const finalConfig = process.env.NEXT_PUBLIC_SENTRY_DSN
  ? withSentryConfig(nextConfig, sentryWebpackPluginOptions)
  : nextConfig

module.exports = finalConfig
