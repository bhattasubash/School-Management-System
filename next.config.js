/** @type {import('next').NextConfig} */

// Compute allowed origins for Next.js 14 Server Actions
const rawAppDomain = (process.env.NEXT_PUBLIC_APP_DOMAIN || 'localhost:3000').trim();
const cleanAppDomain = rawAppDomain.replace(/^https?:\/\//, '').split('/')[0];
const baseDomain = cleanAppDomain.split(':')[0];

const defaultAllowedOrigins = [
  'localhost:3000',
  '127.0.0.1:3000',
  cleanAppDomain,
];

// Add wildcard domain for multi-tenant subdomains (e.g. *.schoolerp.com)
if (baseDomain && baseDomain !== 'localhost' && baseDomain !== '127.0.0.1') {
  defaultAllowedOrigins.push(`*.${baseDomain}`);
}

// Add extra origins from environment (comma-separated list for custom domains or staging)
const extraAllowedOrigins = process.env.SERVER_ACTIONS_ALLOWED_ORIGINS
  ? process.env.SERVER_ACTIONS_ALLOWED_ORIGINS.split(',')
      .map((s) => s.trim().replace(/^https?:\/\//, '').split('/')[0])
      .filter(Boolean)
  : [];

const serverActionsAllowedOrigins = Array.from(
  new Set([...defaultAllowedOrigins, ...extraAllowedOrigins])
);

const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    serverActions: {
      allowedOrigins: serverActionsAllowedOrigins,
    },
    serverComponentsExternalPackages: [
      'bcryptjs',
      '@prisma/client',
      'ioredis',
      'bullmq',
      'razorpay',
    ],
  },
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = false;
    }
    return config;
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          {
            key: 'Content-Security-Policy',
            value:
              "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https: blob:; connect-src 'self' https://api.razorpay.com; frame-src 'self' https://api.razorpay.com;",
          },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '0' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
