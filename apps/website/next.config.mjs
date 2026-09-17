import { createMDX } from "fumadocs-mdx/next";
import bundleAnalyzer from "@next/bundle-analyzer";
import { withSentryConfig } from "@sentry/nextjs";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const withMDX = createMDX();

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

/** @type {import('next').NextConfig} */
const config = {
  transpilePackages: [],
  reactStrictMode: true,
  // Disable compression for SSE streaming (proxied from bot API)
  compress: false,
  poweredByHeader: false,
  generateEtags: false,

  // Output standalone for self-hosted deployment (Docker/VPS)
  // Vercel uses its own infrastructure, so standalone is not needed there
  ...( { output: "standalone" } ),

  // Image optimization
  images: {
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 60,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.discordapp.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "media.discordapp.net",
        port: "",
        pathname: "/**",
      },
    ],
  },

  // Optimize package imports
  experimental: {
    optimizePackageImports: ["lucide-react", "react-icons"],
    // Enable Next.js 15 Cache Components and PPR (Requires Canary)
    // ppr: "incremental",
    // dynamicIO: true,
    // Enable client-side caching for better navigation performance
    staleTimes: {
      dynamic: 300, // Cache dynamic routes for 5 minutes
      static: 300, // Cache static routes for 5 minutes
    },
  },

  // Webpack cache optimization
  webpack: (config, { isServer, dev }) => {
    // Fallbacks for optional Web3 dynamic dependencies
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      accounts: false,
    };

    // Ignore benign Web3 optional dependency warnings
    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      { module: /@wagmi\/core/ },
      { module: /@reown\/appkit/ },
      { module: /ox/ },
      { message: /PackFileCacheStrategy/ },
      { message: /Critical dependency/ },
      { message: /Can't resolve 'accounts'/ },
    ];

    if (!isServer && !dev) {
      // Optimize chunk splitting to reduce large strings
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization.splitChunks,
          cacheGroups: {
            ...config.optimization.splitChunks?.cacheGroups,
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: "vendors",
              chunks: "all",
              priority: 10,
            },
          },
        },
      };
    }

    return config;
  },

  // Security and performance headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live https://assets.vercel.com https://*.googlesyndication.com https://*.doubleclick.net https://*.google.com https://nap5k.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: https: blob:",
              "font-src 'self' https://fonts.gstatic.com",
              "connect-src 'self' https: wss: data: blob:",
              "frame-src 'self' https://*.googlesyndication.com https://*.doubleclick.net https://*.google.com",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
        ],
      },
      {
        source: "/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

// Sentry configuration
const sentryWebpackPluginOptions = {
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
};

export default withSentryConfig(
  withBundleAnalyzer(withMDX(config)),
  sentryWebpackPluginOptions
);
