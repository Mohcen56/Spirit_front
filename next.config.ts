import {withSentryConfig} from '@sentry/nextjs';
import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Cloudflare R2 Storage (production)
      {
        protocol: 'https',
        hostname: 'f7ac1437b17c329ca5dcbd482f634410.r2.cloudflarestorage.com',
        pathname: '/**',
      },
      // Local Django backend (development only)
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/media/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8000',
        pathname: '/media/**',
      },
    ],
  },

  // Webpack config to exclude Prisma and other Node.js modules
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Exclude Prisma and OpenTelemetry (not needed in frontend)
      config.resolve.alias = {
        ...config.resolve.alias,
        '@prisma/instrumentation': false,
        '@opentelemetry/instrumentation': false,
      };

      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        http: false,
        https: false,
        zlib: false,
        path: false,
        os: false,
      };
    }

    // Ignore Prisma warnings
    config.ignoreWarnings = [
      { module: /@prisma\/instrumentation/ },
      { module: /@opentelemetry\/instrumentation/ },
    ];

    return config;
  },
};

const withBundleAnalyzer = bundleAnalyzer({ 
  enabled: process.env.ANALYZE === 'true',
});

export default withSentryConfig(withBundleAnalyzer(nextConfig), {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "mohcen",

  project: "javascript-nextjs",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: "/monitoring",

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
  // See the following for more information:
  // https://docs.sentry.io/product/crons/
  // https://vercel.com/docs/cron-jobs
  automaticVercelMonitors: true,
});